package us.vistacore.ehmp.util;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;
import static us.vistacore.ehmp.util.UrlUtils.fixHttps;

import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.DecisionInfo;
import us.vistacore.ehmp.authorization.Obligation;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.authorization.PEPUser;
import us.vistacore.ehmp.command.JdsCommand;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.model.demographics.PatientSelect;
import us.vistacore.ehmp.model.demographics.VPRPatientSelectRpcOutput;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.netflix.hystrix.exception.HystrixBadRequestException;

import java.util.List;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AuthorizationUtils {

    // This is a utility class that should never be instantiated.
    private AuthorizationUtils() { }

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthorizationUtils.class);

    protected static DecisionInfo authorize(PEP pep, List<PatientSelect> patients, boolean ack, User user) {
        int sensitiveIds = 0;
        PEPUser pepUser = initPEPUser(user);

        if (isNullish(patients)) {
            return pep.authorize(null, ack, pepUser);
        }

        LOGGER.debug("authorize:  before looping through list of patients");
//        System.out.println("authorize:  before looping through list of patients");
        for (PatientSelect p : patients) {
            if (NullChecker.isNotNullish(p.getUid())) {
                LOGGER.debug("authorize:  found p.uid: " + p.getUid());
//                System.out.println("authorize:  found p.uid: " + p.getUid());
                
                String uid = p.getUid().replaceAll("pt-select", "patient");
                LOGGER.debug("authorize:  Calling pep.authorize for uid: " + uid);
//                System.out.println("authorize:  Calling pep.authorize for uid: " + uid);

                DecisionInfo decision = pep.authorize(uid, ack, pepUser);
    
                if (decision.getBreakGlassStatus() == DecisionInfo.BreakGlassStatus.SUCCESSFUL
                        || decision.getBreakGlassStatus() == DecisionInfo.BreakGlassStatus.ATTEMPTED) {
                    sensitiveIds++;
                }
    
                if (decision.getDecisionValue() != DecisionInfo.Value.PERMIT) {
                    return decision;
                }
            }
        }

        if (sensitiveIds > 0) {
            return DecisionInfo.permit(DecisionInfo.BreakGlassStatus.SUCCESSFUL);
        }
        return DecisionInfo.defaultInstance();
    }

    public static DecisionInfo authorize(PEP pep, JdsConfiguration jdsConfiguration, String pid, boolean ack, User user) {
        LOGGER.debug("authorize:  Entered method pid: " + pid);
//        System.out.println("authorize:  Entered method pid: " + pid);
        try {
            JsonElement patientData = new JdsCommand(jdsConfiguration, pid, VprDomain.PATIENT_SELECT).execute();
            LOGGER.debug("authorize:  Found patients: " + ((patientData==null) ? "null" : patientData.toString()));
//            System.out.println("authorize:  Found patients: " + ((patientData==null) ? "null" : patientData.toString()));
            VPRPatientSelectRpcOutput patientSelectRpcOutput = new GsonBuilder().create().fromJson(patientData, VPRPatientSelectRpcOutput.class);
            if ((patientSelectRpcOutput != null) &&
                (patientSelectRpcOutput.getData() != null) &&
                (NullChecker.isNotNullish(patientSelectRpcOutput.getData().getItems()))) {
                List<PatientSelect> patients = patientSelectRpcOutput.getData().getItems();
                LOGGER.debug("authorize:  alling authorize for the set of patients.");
//                System.out.println("authorize:  alling authorize for the set of patients.");
                return authorize(pep, patients, ack, user);
            }
            else {
                String errorMessage = "Patient did not exist in the database.";
                LOGGER.warn("AuthorizationUtils.authorize: " + errorMessage);
//                System.out.println("AuthorizationUtils.authorize: " + errorMessage);
                return pep.authorize(null, ack, initPEPUser(user));
            }
        } catch (IllegalArgumentException | HystrixBadRequestException e) {
            // pid is not a valid pid (i.e., a non-uid or null was passed.)
            LOGGER.warn("AuthorizationUtils.authorize: Invalid pid: " + pid);
//            System.out.println("AuthorizationUtils.authorize: Invalid pid: " + pid);
            return pep.authorize(null, ack, initPEPUser(user));
        }
    }

    private static PEPUser initPEPUser(User user) {
        PEPUser pepUser = new PEPUser();

        pepUser.setAccessCode(user.getAccessCode());
        pepUser.setCprsCorTabAccess(user.getCprsCorTabAccess());
        pepUser.setCprsRptTabAccess(user.getCprsRptTabAccess());
        pepUser.setSiteCode(user.getSiteCode());
        pepUser.setVerifyCode(user.getVerifyCode());

        return pepUser;
    }

    public static Status decisionToStatusCode(DecisionInfo d) {
        switch (d.getDecisionValue()) {
            case PERMIT:
                return Response.Status.OK;
            case DENY:
                return Response.Status.FORBIDDEN;
            case WARN:
                return Response.Status.TEMPORARY_REDIRECT;
            case ERROR:
            default:
                return Response.Status.BAD_REQUEST;
        }
    }

    public static Obligation getObligation(String obligationText, UriInfo uriInfo) {
        Obligation obligation = new Obligation(obligationText, fixHttps(uriInfo.getRequestUri().toString()));
        return obligation;
    }

}
