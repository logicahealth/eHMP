package us.vistacore.ehmp.resources;

import us.vistacore.ehmp.audit.AuditLogger;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.DecisionInfo;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 */
public abstract class BaseVeResource {

    protected void logBreakGlass(User user,
                               HttpHeaders headers,
                               HttpServletRequest httpServletRequest,
                               UriInfo uriInfo,
                               String pid,
                               String domain,
                               Response response,
                               String responseMessage,
                               boolean ack,
                               DecisionInfo decision) {

        if (decision != null) {
            DecisionInfo.BreakGlassStatus breakGlassStatus = decision.getBreakGlassStatus();
            int responseMsgLength = responseMessage != null ? responseMessage.length() : 0;

            switch (breakGlassStatus) {
                case SUCCESSFUL:
                    AuditLogger.log(user, headers, httpServletRequest, uriInfo, response.getStatus(), responseMsgLength,
                            AuditLogger.LogCategory.AUDIT, "BREAKGLASS AUTHORIZED", pid, domain, ack);
                    break;
                case ATTEMPTED:
                    AuditLogger.log(user, headers, httpServletRequest, uriInfo, response.getStatus(), responseMsgLength,
                            AuditLogger.LogCategory.AUDIT, "BREAKGLASS WARNING", pid, domain, ack);
                    break;
                case NOT_APPLICABLE:
                default:
                    //do nothing
            }
        }
    }
}
