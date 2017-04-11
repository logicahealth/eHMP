package us.vistacore.ehmp.resources;

import io.dropwizard.auth.Auth;

import com.google.common.base.Throwables;
import com.google.gson.JsonElement;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.netflix.hystrix.exception.HystrixRuntimeException;

import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.command.StatusCommand;
import us.vistacore.ehmp.command.SyncCommand;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.webapi.JsonResponseMessage;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("admin")
public class AdminResource {

    private HmpConfiguration hmpConfiguration;
    private JdsConfiguration jdsConfiguration;

    public AdminResource(HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration) {
        this.hmpConfiguration = hmpConfiguration;
        this.jdsConfiguration = jdsConfiguration;
    }

    /**
     * Subscribes to a patient and synchronizes patient data. A successful response is not returned until all patient
     * data is synchronized.
     *
     * This interaction is idempotent, and can be use for patients which are already synchronized.
     *
     * @param pid the pid of the patient to sync
     * @return a successful syncstatus, or error message
     */
    @PUT
    @Path("/sync/{pid}")
    public Response sync(@Auth User user,
    					 @PathParam("pid") String pid) {
        JsonElement syncResult = null;
        try {
            syncResult = new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid).execute();
        } catch (HystrixBadRequestException e) {
            return Response.status(Response.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(e.getMessage() + System.lineSeparator() + Throwables.getStackTraceAsString(e)).build();
        } catch (HystrixRuntimeException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).type(MediaType.APPLICATION_JSON).entity(e.getMessage() + System.lineSeparator() + Throwables.getStackTraceAsString(e)).build();
        }
        return Response.status(Response.Status.CREATED).type(MediaType.APPLICATION_JSON).entity(syncResult.toString()).build();
    }

    /**
     * Unsubscribes to a patient and clears patient data. A successful response is not returned until all patient data
     * is cleared.
     *
     * This interaction is idempotent, and can be use for patients which are not yet subscribed.
     *
     * @param pid the pid of the patient to unsync
     * @return a successful response message, or error message
     */
    @DELETE
    @Path("/sync/{pid}")
    public Response unsync(@Auth User user,
    					   @PathParam("pid") String pid) {
        try {
            new SyncCommand(user, this.hmpConfiguration, this.jdsConfiguration, pid, true).execute();
        } catch (HystrixBadRequestException e) {
            return Response.status(Response.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(e.getMessage()).build();
        } catch (HystrixRuntimeException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).type(MediaType.APPLICATION_JSON).entity(e.getMessage()).build();
        }
        return Response.ok().type(MediaType.APPLICATION_JSON).entity(new JsonResponseMessage(Response.Status.OK, "pid " + pid + " unsynced.").toJson()).build();
    }

    /**
     * Returns the sync status of a patient
     *
     * @param pid the pid of the patient
     * @return a successful response message, or error message
     */
    @GET
    @Path("/sync/{pid}")
    public Response syncStatus(@Auth User user,
    						   @PathParam("pid") String pid) {
        JsonElement syncStatus = new StatusCommand(this.jdsConfiguration, StatusCommand.JdsStatusType.PID, pid).execute();
        if (syncStatus == null) {
            return Response.status(Response.Status.NOT_FOUND).type(MediaType.APPLICATION_JSON).entity(new JsonResponseMessage(Response.Status.NOT_FOUND, "pid " + pid + " is unsynced.").toJson()).build();
        } else {
            return Response.ok().type(MediaType.APPLICATION_JSON).entity(syncStatus.toString()).build();
        }
    }

    /**
     * Returns the sync status of the operational data collections.
     * If operational sync is complete, then the response status will be OK (200), otherwise 202 (ACCEPTED).
     *
     * @return a successful response message, or error message
     */
    @GET
    @Path("/sync/operational")
    public Response operationalSyncStatus(@Auth User user) {
        JsonElement status = new StatusCommand(this.jdsConfiguration, StatusCommand.JdsStatusType.OPERATIONAL).execute();
        if (StatusCommand.isOperationalSyncComplete(status)) {
            return Response.ok().type(MediaType.APPLICATION_JSON).entity(status.toString()).build();
        } else {
            return Response.status(Response.Status.ACCEPTED).type(MediaType.APPLICATION_JSON).entity(status.toString()).build();
        }
    }

}
