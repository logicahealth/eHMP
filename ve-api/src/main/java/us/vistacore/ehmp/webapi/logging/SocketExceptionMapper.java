package us.vistacore.ehmp.webapi.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.net.SocketException;

/**
 * An ExceptionMapper for intercepting SocketExceptions and reporting that
 * the service is unavailable.
 */
@Provider
public class SocketExceptionMapper implements ExceptionMapper<SocketException> {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    public SocketExceptionMapper() {
    }

    public Response toResponse(SocketException e) {
        // Log the message including the stack trace
        logger.error("SocketException caught: recursive stack trace messages are: " + LogUtility.getRecursiveExceptionMessage(e), e);

        // Build an error Response
        StringBuilder sb = new StringBuilder();
        sb.append("The service is not available. Please try again later.");
        if (e.getMessage() != null) {
            sb.append(" Message is: ");
            sb.append(e.getMessage());
        }
        // Return a service unavailable status code (503) and message
        return Response.status(Status.SERVICE_UNAVAILABLE)
                .entity(sb.toString())
                .build();
    }
}
