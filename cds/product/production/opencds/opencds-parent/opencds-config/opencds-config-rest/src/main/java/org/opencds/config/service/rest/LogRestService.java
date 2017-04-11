package org.opencds.config.service.rest;

import java.util.Date;
import java.util.Enumeration;
import java.util.Map.Entry;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

public class LogRestService {
    private static final String ROOT = "root";
    
    @GET
    @Path("/log/{logger}/{level}")
    public Response rootLogLevel(@PathParam("logger") String loggerId, @PathParam("level") String requestedLevel) {
        Logger logger;
        if (loggerId.equalsIgnoreCase(ROOT)) {
            logger = LogManager.getRootLogger();
        } else {
            logger = LogManager.getLogger(loggerId);
        }
        Level oldLevel = logger.getLevel();
        Level newLevel = Level.toLevel(requestedLevel);
        logger.setLevel(newLevel);
        return Response.ok().entity("Log level for logger '" + loggerId + "' changed from '" + oldLevel.toString() + "' to '" + newLevel.toString() + "'; " + new Date() + "\r\n").build();
    }
    
    @GET
    @Path("log/loggers")
    public Response getLoggers() {
        Enumeration<?> loggers = LogManager.getCurrentLoggers();
        SortedMap<String, String> allLoggers = new TreeMap<>();
        if (loggers != null) {
            while (loggers.hasMoreElements()) {
                Logger logger = (Logger) loggers.nextElement();
                if (logger.getLevel() != null) {
                    allLoggers.put(logger.getName(), logger.getLevel().toString());
                }
            }
        }
        StringBuilder response = new StringBuilder("Enabled Loggers:\n");
        for (Entry<String, String> enabledLogger : allLoggers.entrySet()) {
            response.append(enabledLogger.getKey()).append("=").append(enabledLogger.getValue()).append("\r\n");
        }
        return Response.ok().entity(response.toString()).build();
    }
    
}
