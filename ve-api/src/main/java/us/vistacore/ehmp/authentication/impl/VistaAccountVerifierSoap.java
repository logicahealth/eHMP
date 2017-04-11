package us.vistacore.ehmp.authentication.impl;

import io.dropwizard.auth.AuthenticationException;

import java.util.concurrent.TimeUnit;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfiguration;
import us.vistacore.asm.VistaRpcClient;
import us.vistacore.asm.VistaRpcResponse;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authentication.VistaAccountVerifierI;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

public class VistaAccountVerifierSoap implements VistaAccountVerifierI {

    private long authenticationCacheCapacity;
    private long authenticationCacheMaxAgeInSeconds;
    private static Logger logger = LoggerFactory.getLogger(VistaAccountVerifierSoap.class);
    private Cache<String, AuthenticationInfo> authenticationCache;

    public VistaAccountVerifierSoap(ApsConfiguration apsConfig) {

        authenticationCacheCapacity = Long.parseLong(apsConfig.getAuthentCacheCapacity());
        authenticationCacheMaxAgeInSeconds = Long.parseLong(apsConfig.getAuthentCacheMaxAge());
        this.authenticationCache = CacheBuilder
                                        .newBuilder()
                                        .maximumSize(authenticationCacheCapacity)
                                        .expireAfterWrite(authenticationCacheMaxAgeInSeconds, TimeUnit.SECONDS)
                                        .build();
    }

    /**
     * This method will return the User object or null if the
     * authentication information does not exist.
     */
    @Override
    public User authenticate(VistaConfiguration vistaConfiguration, String accessCode, String verifyCode, String siteCode) throws AuthenticationException {
        logger.debug("Authenticating for accessCode=" + accessCode + " siteCode=" + siteCode);
        User user = userFromCache(accessCode, verifyCode, siteCode);
        if (user == null) {
            try {
                VistaRpcClient rpcClient = new VistaRpcClient(vistaConfiguration.getHost(), Integer.parseInt(vistaConfiguration.getPort()), accessCode, verifyCode);
                VistaRpcResponse response = rpcClient.getUserAttributes();
                user = new User(accessCode, verifyCode, siteCode, response.get(VistaRpcClient.USER_SITE_ID_ATTR), response.get(VistaRpcClient.CPRS_COR_TAB_ATTR), response.get(VistaRpcClient.CPRS_RPT_TAB_ATTR));
            } catch (Exception e) {
                logger.error("Error during authentication", e);
            }

            if (user != null) {
                AuthenticationInfo authInfo = new AuthenticationInfo(user);
                authenticationCache.put(authInfo.key(), authInfo);
                logger.debug("Authentication SUCCESS for accessCode=" + accessCode + " siteCode=" + siteCode);
            } else {
                logger.debug("Authentication FAILURE for accessCode=" + accessCode + " siteCode=" + siteCode);
            }
        }
        return user;
    }

    private User userFromCache(String accessCode, String verifyCode, String siteCode) {
        AuthenticationInfo authenticationInfo = authenticationCache.getIfPresent(AuthenticationInfo.key(accessCode, siteCode));
        if (authenticationInfo != null && StringUtils.equals(authenticationInfo.getUser().getVerifyCode(), verifyCode)) {
            logger.debug("Authentication SUCCESS for accessCode=" + accessCode + " siteCode=" + siteCode + " from cache");
            return authenticationInfo.getUser();
        } else {
            return null;
        }
    }

    /**
     * Clear the cache.
     */
    public void clearCache() {
        logger.debug("Clear cache for ALL users");
        authenticationCache.invalidateAll();
    }

    public void clearCachedUser(String username, String siteCode) {
        logger.debug("Clear cached user username=" + username + " siteCode=" + siteCode);
        authenticationCache.invalidate(AuthenticationInfo.key(username, siteCode));
    }
}
