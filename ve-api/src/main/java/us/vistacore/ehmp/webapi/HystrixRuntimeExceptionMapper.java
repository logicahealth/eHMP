package us.vistacore.ehmp.webapi;

import com.netflix.hystrix.exception.HystrixRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class HystrixRuntimeExceptionMapper implements ExceptionMapper<HystrixRuntimeException> {
    private static final Logger LOGGER = LoggerFactory.getLogger(HystrixRuntimeExceptionMapper.class);

    @Override
    public Response toResponse(HystrixRuntimeException exception) {
        LOGGER.warn("Error executing command", exception);

        if (HystrixRuntimeException.FailureType.TIMEOUT.equals(exception.getFailureType())) {
            return Response.serverError()
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new JsonResponseMessage(Response.Status.INTERNAL_SERVER_ERROR, exception.getImplementingClass().getName() + " took too long to process.").toJson())
                    .build();
        }
        return Response.serverError().build();
    }
}
