package com.hawaiirg.v4;

import com.google.gson.Gson;
import com.hawaiirg.service.MockDoDAdaptorService;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.LinkedHashMap;
import java.util.Map;

@Path("query")
public class Query {

    private static final Logger LOGGER =
            Logger.getLogger(Query.class.getName());

    private static final MockDoDAdaptorService mockService = new MockDoDAdaptorService();

    @GET
    @Path("{user}/{edipi}/{loinc}")
    @Produces(MediaType.APPLICATION_JSON)

    public String query(@PathParam("user") String user,
                        @PathParam("edipi") String edipi,
                        @PathParam("loinc") String loinc) {

        Gson gson = new Gson();

        Map<String, Object> resp = new LinkedHashMap<>();

        if (StringUtils.isBlank(user)) {
            resp.put("error", "missing user");
            return gson.toJson(resp);
        } else if (StringUtils.isBlank(edipi)) {
            resp.put("error", "missing edipi");
            return gson.toJson(resp);
        } else if (StringUtils.isBlank(loinc)) {
            resp.put("error", "missing loinc");
            return gson.toJson(resp);
        }

        LOGGER.debug(String.format("patientid: %s, loinc: %s", edipi, loinc));

        resp.put("queryID", mockService.query(edipi, loinc));

        return gson.toJson(resp);
    }
}
