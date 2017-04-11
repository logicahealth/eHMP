package us.vistacore.ehmp.authorization;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfigurationDispenser;
import us.vistacore.asm.VistaRpcClient;
import us.vistacore.asm.VistaRpcResponse;

import com.axiomatics.sdk.connections.PDPConnection;
import com.axiomatics.sdk.context.XacmlObjectStateException;
import com.axiomatics.sdk.context.XacmlRequestBuilder;
import com.axiomatics.sdk.utility.XMLUtility;
import com.axiomatics.xacml.Constants;
import com.axiomatics.xacml.reqresp.Advice;
import com.axiomatics.xacml.reqresp.Request;
import com.axiomatics.xacml.reqresp.Result;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.netflix.hystrix.exception.HystrixBadRequestException;

import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PEP {

    private Cache<String, AuthorizationAttributes> authorizationCache;

    private static Logger logger = LoggerFactory.getLogger(PEP.class);

    private PDPConnection pdpConn;
    private VistaRpcClient rpcClient;
    private VistaConfigurationDispenser vistaConfigurations;

    public PEP(PDPConnection pdpConn, VistaConfigurationDispenser vistaConfigurations, ApsConfiguration apsConfig) {
        logger.info("PEP: PDP Connection type: " + pdpConn.getClass().getName());
        this.pdpConn = pdpConn;
        this.vistaConfigurations = vistaConfigurations;
        this.authorizationCache = CacheBuilder.newBuilder()
                .maximumSize(Long.parseLong(apsConfig.getAuthentCacheCapacity()))
                .expireAfterWrite(Long.parseLong(apsConfig.getAuthentCacheMaxAge()), TimeUnit.SECONDS)
                .build();
    }

    public PEP(PDPConnection pdpConn, VistaConfigurationDispenser vistaConfigurations, ApsConfiguration apsConfig, Cache<String, AuthorizationAttributes> authorizationCache) {
        logger.info("PEP: PDP Connection type: " + pdpConn.getClass().getName());
        this.pdpConn = pdpConn;
        this.vistaConfigurations = vistaConfigurations;
        this.authorizationCache = authorizationCache;
    }

    public DecisionInfo authorize(String uid, boolean ack, PEPUser user) {
        if (user == null) {
            String errorMessage = "User null in request";
            logger.warn("PEP.authorize: " + errorMessage);
            return DecisionInfo.error(errorMessage);
        }
        logger.debug("PEP.authorize: user " + user.getAccessCode() + ";" + user.getSiteCode() + " is requesting access for patient " + uid);

        String dfn = null;
        String sitecode = null;
        try {
            String[] uidParts = uid.split(":");
            dfn = uidParts[4];
            sitecode = uidParts[3];
        } catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
            sitecode = user.getSiteCode();
        }
        logger.debug("PEP.authorize: ...therefore the dfn is " + dfn + ", and the sitecode is " + sitecode + ".");

        XacmlRequestBuilder builder = new XacmlRequestBuilder(3);
        Request request = null;
        Result result = null;

        String responseMessage = null;

        AuthorizationAttributes authorizationAttributes = null;

        try {
            rpcClient = vistaConfigurations.getRpcClient(user, sitecode);

            //
            // Subject Attributes
            //
            builder.addSubjectAttribute(Constants.SUBJECT_ID, user.getAccessCode());
            builder.addSubjectAttribute("sitecode", user.getSiteCode());

            builder.addSubjectAttribute(VistaRpcClient.CPRS_COR_TAB_ATTR, user.getCprsCorTabAccess());
            builder.addSubjectAttribute(VistaRpcClient.CPRS_RPT_TAB_ATTR, user.getCprsRptTabAccess());

            //
            // Resource Attributes
            //
            if (dfn != null) {
                builder.addResourceAttribute(Constants.RESOURCE_ID, uid);

                authorizationAttributes = getAuthorizationAttributesFromCache(uid);

                if (authorizationAttributes == null) {
                    VistaRpcResponse response = rpcClient.getPatientAttributes(dfn);
                    authorizationAttributes = new AuthorizationAttributes(uid, response.get("sensitive"), response.get("mayAccess"), response.get("logAccess"), response.get("text"));
                    authorizationCache.put(authorizationAttributes.key(), authorizationAttributes);
                }

                builder.addResourceAttribute("sensitive", authorizationAttributes.getSensitive());
                builder.addResourceAttribute("mayAccess", authorizationAttributes.getMayAccess());
                builder.addResourceAttribute("logAccess", authorizationAttributes.getLogAccess());
                responseMessage = authorizationAttributes.getBreakGlassText();
            }

            //
            // Action Attributes
            //
            builder.addActionAttribute(Constants.ACTION_ID, "read");
            builder.addActionAttribute("warnAcknowledged", Boolean.toString(ack));

            request = builder.buildRequest();
            logger.trace("PEP.authorize: Sending XACML Authorization Request: " + XMLUtility.requestToString(request));
        } catch (XacmlObjectStateException e) {
            String errorMessage = "Error building XACML Request";
            logger.warn(errorMessage, e);
            return DecisionInfo.error(errorMessage);
        }

        try {
            result = new PDPAuthorizationCommand(pdpConn, request).execute();
        } catch (HystrixBadRequestException e) {
            logger.warn("PEP.authorize: " + e.getMessage());
            return DecisionInfo.error(e.getMessage());
        }

        switch (result.getDecision()) {
            case Result.DECISION_DENY:
                logger.debug("PEP.authorize: Received DENY decision (code " + result.getDecision() + ") from the PDP.");
                break;
            case Result.DECISION_PERMIT:
                logger.debug("PEP.authorize: Received PERMIT decision (code " + result.getDecision() + ") from the PDP.");
                if ((authorizationAttributes != null) && (authorizationAttributes.getLogAccess() != null) && (authorizationAttributes.getLogAccess().equals("true"))) {
                    rpcClient.logPatientAccess(dfn);
                }
                break;
            default:
                logger.warn("PEP.authorize: Received an unexpected decision code (code " + result.getDecision() + ") from the PDP.");
        }

        // Check for advice
        for (Advice a : result.getAdvice()) {
            logger.debug("PEP.authorize: Received advice with id = \"" + a.getId() + "\".");
            // Check for the advice indicating that "break glass" scenario
            // applies.
            if ((a.getId() != null) && a.getId().equals("breakglass")) {
                // Make sure the Result's decision value is "deny",
                // because otherwise the "break glass" use case doesn't
                // actually apply.
                if (result.getDecision() == Result.DECISION_DENY) {
                    DecisionInfo.BreakGlassStatus status = ack ? DecisionInfo.BreakGlassStatus.SUCCESSFUL : DecisionInfo.BreakGlassStatus.ATTEMPTED;
                    return DecisionInfo.warn(responseMessage, status);
                } else {
                    String errorMessage = "Attempted to apply the \"Break Glass\" warning Advice to a decision other than \"Deny\".";
                    logger.warn("PEP.authorize: " + errorMessage);
                    return DecisionInfo.error(errorMessage);
                }
            }
        }

        DecisionInfo decision = DecisionInfo.deny();
        if (result.getDecision() == Result.DECISION_PERMIT) {
            if (ack) {
                decision = DecisionInfo.permit(DecisionInfo.BreakGlassStatus.SUCCESSFUL);
            } else {
                decision = DecisionInfo.permit();
            }
        }
        return decision;
    }

    private AuthorizationAttributes getAuthorizationAttributesFromCache(String patientId) {
        AuthorizationAttributes authorizationAttributes = authorizationCache.getIfPresent(AuthorizationAttributes.key(patientId));
        if (authorizationAttributes != null) {
            logger.debug("PEP.getAuthorizationAttributesFromCache: Authorization from cache SUCCESS for patientId=" + patientId);
            return authorizationAttributes;
        } else {
            logger.debug("PEP.getAuthorizationAttributesFromCache: Authorization from cache FAILED for patientId=" + patientId);
            return null;
        }
    }

    /**
     * Clear the cache.
     */
    public void clearCache() {
        logger.debug("PEP.clearCache: entering method.");
        authorizationCache.invalidateAll();
    }

    public void clearCachedUser(String patientId) {
        logger.debug("PEP.clearCachedUser: entering method for patient=" + patientId);
        authorizationCache.invalidate(AuthorizationAttributes.key(patientId));
    }

}
