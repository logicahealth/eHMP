package us.vistacore.ehmp.webapi.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class RuntimeExceptionMapper implements ExceptionMapper<RuntimeException> {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    public RuntimeExceptionMapper() {
    }

    public Response toResponse(RuntimeException e) {
        // Handle WebApplicationException (subclass of RuntimeException) separately
        // by returning the response it contains
        if (e instanceof WebApplicationException) {
            return ((WebApplicationException) e).getResponse();
        }

        // Log the message including the stack trace
        logger.error("RuntimeException " + e.getClass().getName() + " caught: recursive stack trace messages are: " + LogUtility.getRecursiveExceptionMessage(e), e);

        // Build an error Response
        Response response = Response.serverError()
                            .entity("There was an error processing your request. The error has been logged.")
                            .build();

        // Return the response
        return response;
    }
}
