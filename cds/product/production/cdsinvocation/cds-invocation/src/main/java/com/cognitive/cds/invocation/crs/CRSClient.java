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
package com.cognitive.cds.invocation.crs;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.cxf.jaxrs.client.WebClient;

public class CRSClient {

    private static CRSClient crsClient;// = new CRSClient();
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CRSClient.class);
    private String crsServer;
    private String queryPath;
    private WebClient webClient;

    public CRSClient() {
    }

    @PostConstruct
    private void init() throws IOException {
        crsClient = this;
        webClient = getClient();
    }

    /* Static 'instance' method */
    public static CRSClient getInstance() {
        return crsClient;
    }

    public String getCRSServer() {
        return crsServer;
    }

    public void setCRSServer(String crsServer) {
        this.crsServer = crsServer;
    }

    public String getQueryPath() {
        return queryPath;
    }

    public void setQueryPath(String queryPath) {
        this.queryPath = queryPath;
    }

    // ===========================================================

    /**
     * getClient() - Create and return an authenticated WebClient object per context configured
     * 
     * @return
     * @throws IOException
     */
    public WebClient getClient() throws IOException {

        if (this.webClient == null) {
            try {
                logger.info("Creating inital WebClient");
                this.webClient = createWebClient();
            }
            catch (Exception e) {
                logger.info("CRS - No WebClient - Create failed");
                throw new IOException("CRS - No WebClient - Create failed");
            }
        }
        return this.webClient;
    }

    public void updateClient(WebClient client) {
        this.webClient = client;
    }
    
    /**
     * createWebClient
     * 
     * WebClient is not thread safe as per documentation.
     * 
     * http://cxf.apache.org/docs/jax-rs-client-api.html
     * 
     * @return
     * @throws IOException
     */
    private WebClient createWebClient() throws IOException {
        
        List<Object> providers = new ArrayList<Object>();
        providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());
        boolean theadSafe = true;
        
        WebClient client = WebClient.create(this.crsServer, providers, theadSafe);

        // MAINTAIN SESSION for multiple requests using same session
        WebClient
                .getConfig(client)
                .getRequestContext()
                .put(org.apache.cxf.message.Message.MAINTAIN_SESSION, Boolean.TRUE);

        logger.info("Create WebClient - CRS client created");
        return client;
    }
}
