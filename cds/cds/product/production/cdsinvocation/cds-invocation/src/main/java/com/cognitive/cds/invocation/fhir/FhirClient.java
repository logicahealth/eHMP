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
import java.util.concurrent.locks.ReentrantLock;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;


/**
 * A RDK client for FHIR objects that provides thread safe
 * authenticated connections.
 * 
 * @author tnguyen
 *
 */
public class FhirClient {

    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(FhirClient.class);
    private String authURL;
    private String baseURL;
    
    // Singular instance of WebClient used to spawn others for thread safety
    private volatile WebClient webClient;
    
    // Used to guarantee webClient is not initialized multiple times in succession
    private final ReentrantLock lock = new ReentrantLock();


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
        if (webClient != null) {
        	
            // Check to see if cn refresh the existing RDK session.
            // Note that refresh only works against a current valid RDK session.
            // So check to see if refresh return is valid (200), if not, then initiate a POST Auth        	
            LOGGER.info("Refreshing RDK client");
            response = webClient.get();
            int status = response.getStatus();
            
            if (status == 401) {
                LOGGER.info("RDK session timed out so initiate a new RDK session");
                createWebClient();
            }
            
        } else {
            LOGGER.info("Creating inital WebClient");
            createWebClient();
        }
        
        // Return a thread safe client
        boolean inheritHeaders = true;
        WebClient client = WebClient.fromClient(webClient, inheritHeaders);
        return client;
    }

    
    /**
     * createWebClient
     * 
     * http://cxf.apache.org/docs/jax-rs-client-api.html
     * 
     * @return
     * @throws IOException
     */
    private void createWebClient() throws IOException {
    	
    	Response response;
    	List<Object> providers = new ArrayList<Object>();
        providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

        lock.lock();
        try {
        	// Check to see if initialization is still necessary
        	if( webClient == null || webClient.get().getStatus() != 200 ) {
        		
                WebClient client = WebClient.create(this.baseURL, providers);

                // MAINTAIN SESSION for multi request using same session(cookie)
                WebClient
                        .getConfig(client)
                        .getRequestContext()
                        .put(org.apache.cxf.message.Message.MAINTAIN_SESSION, Boolean.TRUE);

                response = client.path(authURL)
                        .accept(MediaType.APPLICATION_JSON).type(MediaType.APPLICATION_JSON)
                        .header("Authorization", "CDS")
                        .post(null);
                
                // check response
                int status = response.getStatus();
                if (status != 200) {
                	webClient = null;
                    throw new IOException("WebClient creation, authentication failed, status code: " + status );
                }
                
                LOGGER.info("Create WebClient - created and authenticated");
                
                // Set this webClient to the authorized client.
                client.replacePath("/");
                webClient = client.replaceHeader("Authorization", "Bearer " + response.getHeaderString("X-Set-JWT"));
                
                LOGGER.info("CSRF Bearer set: " + response.getHeaderString("X-Set-JWT"));        
        		
        	}
        }
        finally {
        	lock.unlock();
        }
    }
}
