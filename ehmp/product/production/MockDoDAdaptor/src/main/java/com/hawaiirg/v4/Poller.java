package com.hawaiirg.v4;

import com.google.gson.Gson;
import com.hawaiirg.service.MockDoDAdaptorService;
import org.apache.commons.lang.StringUtils;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.LinkedHashMap;
import java.util.Map;

@Path("poller")
public class Poller {

    private static final MockDoDAdaptorService mockService = new MockDoDAdaptorService();

    @GET
    @Path("{queryId}")
    @Produces(MediaType.TEXT_PLAIN)
    public String poller(@PathParam("queryId") String queryId) {

        Gson gson = new Gson();

        Map<String, Object> resp = new LinkedHashMap<>();

        if (StringUtils.isBlank(queryId))
        {
            resp.put("error", "Missing queryid parameter");

            return gson.toJson(resp);
        }

        return gson.toJson(mockService.poller(queryId, "4"));
    }
}
