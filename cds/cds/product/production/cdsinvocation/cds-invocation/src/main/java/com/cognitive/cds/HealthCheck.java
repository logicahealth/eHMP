/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
package com.cognitive.cds;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;
import org.apache.cxf.jaxrs.utils.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.model.EngineInstanceState;
import com.cognitive.cds.invocation.mongo.EngineInfoDao;
import com.cognitive.cds.invocation.mongo.IntentMappingDao;
import com.cognitive.cds.invocation.mongo.MongoDbDao;


/**
 * @author Dan Williams
 * @version 1.0
 * @created 11-Sep-2016 9:10:43 AM
 */
public class HealthCheck {
    
    private static final Logger logger = LoggerFactory.getLogger(HealthCheck.class);
    private IntentMappingDao intentLookup;
    private EngineInfoDao engineInfoDao;
    private MongoDbDao mongodb;
    private String crsServer;
    private String rdkBaseURL;
    private String rdkAuthURL;


    private HealthCheck() {
    }

    public void setCrsServer(String crsServer) {
        this.crsServer = crsServer;
        logger.info("Setting crsServer: " + crsServer);
    }

    public void setIntentLookup(IntentMappingDao intentLookup) {
        this.intentLookup = intentLookup;
        logger.info("Setting intentLookup: " + intentLookup);
    }

    public void setMongoDb(MongoDbDao mongodb) {
        this.mongodb = mongodb;
        logger.info("Setting mongodb: " + mongodb);
    }

    public void setRdkBaseURL(String rdkBaseURL) {
        this.rdkBaseURL = rdkBaseURL;
        logger.info("Setting rdkBaseURL: " + rdkBaseURL);
    }

    public void setRdkAuthURL(String rdkAuthURL) {
        this.rdkAuthURL = rdkAuthURL;
        logger.info("Setting rdkAuthURL: " + rdkAuthURL);
    }

    public void setEngineInfoDao(EngineInfoDao engineInfoDao) {
		this.engineInfoDao = engineInfoDao;
	}

    public String healthCheck(String service) {
        if ("RulesResultsService".equals(service)) {
            return rulesHealthCheck();
        }
        return metricsHealthCheck();
    }
    
    
    private String rulesHealthCheck() {
        boolean system = false;
        String intents = "[]";
        String openCdsStatus = "Non-applicable (mongo)";
        
        String mongoDbStatus = mongoHealth();

        if (mongoDbStatus == null) {
            intents = getIntents();
        }
        
        if (mongoDbStatus == null) {
            openCdsStatus = openCDSHealthCheck();
        }
       
        String rdkStatus = rdkHealth();

        String crsStatus = crsHealth();
        

        if (mongoDbStatus == null && openCdsStatus == null && rdkStatus == null && crsStatus == null) {
            system = true;
        }
        
// What the output data will look like:
//        {"data": {
//            "cdsResultsService": {
//                "healthy": true,                                             // value based on all other checks
//                "type": "service",
//                "subsystems": {
//                    "mongoDb": {                                            // opens connection, reads intents collection
//                        "healthy": true, 
//                        "intents: [ intentName1, intentName2 ]       // names retrieved from intents collection
//                    },
//                    "openCds": {                                         // pings http://host:port/opencds-decision-support-service
//                       "healthy": true
//                    },
//                    "rdk": {                                                  // calls rdk health check?
//                        "healthy": true
//                    },
//                    "crs": {                                                    //  pings crs service http:/host:port
//                        "healthy": true
//                    }
//              } 
//        }
//
        
        StringBuffer buffer = new StringBuffer();
        buffer.append("{\"data\": {\"cdsRulesResultsService\": {\"healthy\":");
        buffer.append(system);
        buffer.append(",\"type\": \"service\",\"subsystems\": {\"mongoDb\": {\"healthy\": ");
        buffer.append(getStatus(mongoDbStatus));
        buffer.append(",\"intents\": ");
        buffer.append(intents);
        buffer.append("},\"openCds\": {\"healthy\": ");
        buffer.append(getStatus(openCdsStatus));
        buffer.append("},\"rdk\": {\"healthy\": ");
        buffer.append(getStatus(rdkStatus));
        buffer.append("},\"crs\": {\"healthy\": ");
        buffer.append(getStatus(crsStatus));
        buffer.append("}}}}}");
        return buffer.toString();
        
//        "{\"data\": {" +
//                   "\"cdsRulesResultsService\": {" +
//                       "\"healthy\":" + system + "," +
//                       "\"type\": \"service\"," +
//                       "\"subsystems\": {" +
//                           "\"mongoDb\": {" +
//                               "\"healthy\": " + getStatus(mongoDbStatus) + "," +
//                               "\"intents\": " + intents + 
//                           "}," +
//                           "\"openCds\": {" +
//                               "\"healthy\": " + getStatus(openCdsStatus) +
//                           "}," +
//                           "\"rdk\": {" +
//                               "\"healthy\": " + getStatus(rdkStatus) +
//                           "}," +
//                           "\"crs\": {" +
//                               "\"healthy\": " + getStatus(crsStatus) +
//                           "}" +
//                       "}" +
//                   "}" +
//               "}" +
//           "}";
    }
     
    private String metricsHealthCheck() {
        boolean system = false;
        
        String mongoDbStatus = mongoHealth();

        if (mongoDbStatus == null) {
            system = true;
        } 
        StringBuilder buffer = new StringBuilder();
        buffer.append("{\"data\": {\"cdsMetricsCollectionService\": {\"healthy\":");
        buffer.append(system);
        buffer.append(",\"type\": \"service\",\"subsystems\": {\"mongoDb\": {\"healthy\": ");
        buffer.append(getStatus(mongoDbStatus));
        buffer.append("}}}}}");
        return buffer.toString();
        
//        return "{" +
//                    "\"data\": {" +
//                        "\"cdsMetricsCollectionService\": {" +
//                            "\"healthy\":" + system + "," +
//                            "\"type\": \"service\"," +
//                            "\"subsystems\": {" +
//                                "\"mongoDb\": {" +
//                                    "\"healthy\": " + getStatus(mongoDbStatus) +
//                                "}" +
//                            "}" +
//                        "}" +
//                    "}" +
//                "}";
    }
    
    private String getStatus(String status) {
        String result = "true";
        if (status != null) {
            result = "false, \"error\": \"" + status + "\"";
        }
        return result;
    }

    private String crsHealth() {
    	// check crs
    	String status = null;
    	try {
    		Response response;
    		WebClient client = createWebClient(crsServer);
    		response = client.get();

    		// check response
    		int responseStatus = response.getStatus();
    		if (responseStatus != 200) {
    			status = "CRS Server unavailable, response: " + responseStatus;
    		}
    	}
    	catch (Exception e) {
    		status = "CRS Server unavilable, error: " + e.toString();
    		logger.error(e.getLocalizedMessage(), e);
    	}
    	return status;
    }

    protected String mongoHealth() {
        // check mongoDb
        String status = null;
        try {
            status = mongodb.healthCheck();
        }
        catch (Exception e) {
            status = e.toString();
        }
        logger.info("mongoDbStatus: " + status);
        return status;
    }

    protected String getIntents() {
        StringBuilder buffer = new StringBuilder();
        try {
            Map<String,String> intentList = intentLookup.healthCheck();
            intentList.forEach( (name, value) -> {
            	buffer.append("\t{\"").append(name).append("\" : ")
            		.append(value).append("},\n");
            });
            if(buffer.length()>0) {
            	//Remove the last ",\n"
            	return "[\n"+buffer.substring(0, buffer.length()-2) +"\n\t]";
            }
            // Otherwise return an empty buffer
            return "[ ]";
        }
        catch (Exception e) {
            logger.error("intentsStatus: " + e.getLocalizedMessage(),e);
            return "[\""+e.getLocalizedMessage()+"\" : \""+ExceptionUtils.getStackTrace(e)+"\"]";
        }
    }

    private String openCDSHealthCheck() {
        String status = null;
        try {
          List<EngineInstanceState> activeEngines = engineInfoDao.getActiveEngines("OpenCDS");
          for (EngineInstanceState engine : activeEngines) {
            WebClient client = createWebClient("http://" + engine.getHost() + ":" + engine.getPort());
              Response response = client.path("/opencds-decision-support-service")
                      .accept(MediaType.TEXT_HTML).type(MediaType.TEXT_HTML)
                      .get();
              int responseStatus = response.getStatus();
              if (responseStatus != 200) {
                  if (status != null) {
                      status += ", ";
                  }
                  status += "Connection to OpenCDS failed, " + responseStatus + ", " + engine.getName();
              }	
          }
        }
        catch (Exception e) {
            logger.debug(e.getMessage());
            status = e.getMessage();
        }
        logger.info("openCdsStatus: " +  status);
        return status;
    }

    private String rdkHealth() {
        // check rdk
        String status = null;
        try {
            Response response;
            WebClient client = createWebClient(this.rdkBaseURL);
            response = client.path(this.rdkAuthURL)
                    .accept(MediaType.APPLICATION_JSON).type(MediaType.APPLICATION_JSON)
                    .header("Authorization", "CDS")
                    .post(null);

            // check response
            int responseStatus = response.getStatus();
            if (responseStatus != 200) {
                status = "Authentication failed, status code: " + responseStatus;
            }
        }
        catch (Exception e) {
            status = "Authentication failed, status code: " + e.toString();
        }
        logger.info("rdkStatus: " + status);
        return status;
    }

    /**
     * createWebClient
     * @return
     * @throws IOException
     */
    private WebClient createWebClient(String url) throws IOException {
    	List<Object> providers = new ArrayList<Object>();
    	providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());
    	WebClient client = WebClient.create(url, providers);

    	// Healthcheck - Do not MAINTAIN SESSION for multiple requests using same session
    	WebClient
    	.getConfig(client)
    	.getRequestContext()
    	.put(org.apache.cxf.message.Message.MAINTAIN_SESSION, Boolean.FALSE);

    	logger.info("Create WebClient - HealthCheck client created");
        return client;
    }

}
