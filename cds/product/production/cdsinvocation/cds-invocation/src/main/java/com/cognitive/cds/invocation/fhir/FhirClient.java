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
package com.cognitive.cds.invocation.fhir;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;


/**
 * Base Authentication object
 * 
 * @author tnguyen
 *
 *         Todo:
 * 
 *         1) Investigate WebClient/Client caching
 */
public class FhirClient {

    private static FhirClient fhirClient;// = new FhirClient();
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(FhirClient.class);
    private String authURL;
    private String baseURL;
    private WebClient webClient;

    public FhirClient() {
    }

    @PostConstruct
    private void init() throws IOException {
        fhirClient = this;
        webClient = getClient();
    }

    /* Static 'instance' method */
    public static FhirClient getInstance() {
        return fhirClient;
    }

    public String getAuthURL() {
        return authURL;
    }

    public void setAuthURL(String authURL) {
        this.authURL = authURL;
    }

    public String getBaseURL() {
        return baseURL;
    }

    public void setBaseURL(String baseURL) {
        this.baseURL = baseURL;
    }


    // ===========================================================

    /**
     * getClient() - Create and return an authenticated WebClient object per context configured
     * 
     * @return
     * @throws IOException
     */
    public WebClient getClient() throws IOException {

        Response response;
        
        //-----------------------------------------------------------------------------------
        // If the webClient was already cfg and initialized, refresh the RDK session (if can't then Auth a new RDK session)
        // else, cfg, initialize and Authenticate a new RDK session.
        //-----------------------------------------------------------------------------------
        if (this.webClient != null) {
        	
            // Check to see if cn refresh the existing RDK session.
            // Note that refresh only works agaisnt a current valid RDK session.
            // So check to see if refresh return is valid (200), if not, then initiate a POST Auth

            logger.info("Refreshing RDK client");
            response = this.webClient.get();
            int status = response.getStatus();
            
            if (status != 200) {
                logger.info("RDK session timed out so initiate a new RDK session");
                this.webClient = createWebClient();
            }
            
        } else {
        	
            logger.info("Creating inital WebClient");
            this.webClient = createWebClient();
        
        }
        return this.webClient;
    }

    public void updateClient(WebClient client) {
        this.webClient = client;
    }
    
    /**
     * createWebClient
     * 
     * Synchronized because WebClient is not thread safe as per documentation.
     * 
     * http://cxf.apache.org/docs/jax-rs-client-api.html
     * 
     * @return
     * @throws IOException
     */
    private synchronized WebClient createWebClient() throws IOException {
    	
    	Response response;
    	List<Object> providers = new ArrayList<Object>();
        providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

        WebClient client = WebClient.create(this.baseURL, providers);

        // MAINTAIN SESSION for multi request using same session(cookie)
        WebClient
                .getConfig(client)
                .getRequestContext()
                .put(org.apache.cxf.message.Message.MAINTAIN_SESSION, Boolean.TRUE);

        response = client.path(authURL)
                .accept(MediaType.APPLICATION_JSON)
                .type(MediaType.APPLICATION_JSON)
                .header("Authorization", "CDS")
                .post(null);
        // check response
        int status = response.getStatus();
        if (status != 200) {
            throw new IOException("WebClient creation, authentication failed, status code: " + status );
        }
        
        logger.info("Create WebClient - created and authenticated");
        
        client.replaceHeader("Authorization", "Bearer " + response.getHeaderString("X-Set-JWT"));
        logger.info("CSRF Bearer set: " + response.getHeaderString("X-Set-JWT"));
        
        return client;
    }
}
