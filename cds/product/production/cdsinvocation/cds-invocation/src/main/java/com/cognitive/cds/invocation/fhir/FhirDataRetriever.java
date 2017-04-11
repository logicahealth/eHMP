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
import java.io.InputStream;
import java.util.List;

import javax.ws.rs.core.Response;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.cxf.helpers.IOUtils;
import org.apache.cxf.jaxrs.client.WebClient;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.util.FhirUtils;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.base.resource.ResourceMetadataMap;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.resource.Bundle.Entry;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.parser.IParser;

/**
 * (1) retrieves all required FHIR data (2) and bundle all data to single atom
 * result for return.
 * 
 * @author tnguyen
 */
public class FhirDataRetriever implements IFhirDataRetriever {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory
            .getLogger(IFhirDataRetriever.class);

    private FhirClient fhirClient;
    
    /**
     * @return the fhirClient
     */
    public FhirClient getFhirClient() {
        return fhirClient;
    }

    /**
     * @param fhirClient
     *            the fhirClient to set
     */
    public void setFhirClient(FhirClient fhirClient) {
        this.fhirClient = fhirClient;
    }

    // =============================================================

    public FhirDataRetriever() {
    }

    /**
     * Create a WebClient session per given authentication attributes.
     * 
     * @return
     * @throws com.cognitive.cds.invocation.exceptions.DataRetrievalException
     */
    // public WebClient getClient(String path, String query) throws IOException,
    // DataRetrievalException {
    public WebClient getClient() throws DataRetrievalException {
        try {
            WebClient client = fhirClient.getClient();
            client.resetQuery();
            return client;
        } catch (IOException e) {
            logger.error("Error on Authentication, Error on Exception= " + e.getMessage(), e);
            throw new DataRetrievalException("Exception on request", e);
        }
    }

    /**
     * Create a Bundle of resources per given queries info.
     * 
     * @param queries
     * @return
     * @throws com.cognitive.cds.invocation.exceptions.DataRetrievalException
     * @throws IOException
     */
    @Override
    public Bundle getFhirData(List<String> queries)
            throws DataRetrievalException {

        Bundle finalBundle = new Bundle();

        // ====================================================
        // PREP finalBundle ATTRIBUTES
        // ====================================================
        java.util.UUID uuid = java.util.UUID.randomUUID();
        finalBundle.setId(new IdDt(uuid.toString()));
        finalBundle.setBase(fhirClient.getBaseURL());
        // finalBundle.setTotal(0); //Total is only valid on search and history
        // bundles!
        finalBundle.setType(BundleTypeEnum.COLLECTION);

        ResourceMetadataMap theMap = new ResourceMetadataMap();
        finalBundle.setResourceMetadata(theMap);
        // Update and Author Name?
        // finalBundle.getUpdated().setTimeZone(TimeZone.getDefault());
        // finalBundle.getAuthorName().setValue("CDS Invocation");

        // ====================================================
        if (!queries.isEmpty()) {
            // ====================================================
            // LOOP THRU LIST OF ALL REQUESTs, get response, and add to
            // single
            // atom
            // for return
            // ====================================================

            // PREP Fhir context for parser
            FhirContext hapiFhirCtx = FhirUtils.getContext();
            IParser p = FhirUtils.newJsonParser();

            for (String query : queries) {

                try {
                    Response response = getFhirData(getClient(), query);

                    if (response.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
                        InputStream in = (InputStream) response.getEntity();

                        // -----------------------------------------
                        // READ IN FHIR DATA from a source.
                        // Parse engine determine by bundle or single
                        // resource.
                        // -----------------------------------------
                        try {
                            // FUTURE: Consider reworking this logic now
                            // that HAPI has a common parse point.
                            String text = IOUtils.toString(in, "UTF-8");
                            IResource rsc = p.parseResource(text);
                            if (rsc instanceof Bundle) {
                                addResources(hapiFhirCtx, (Bundle) rsc, finalBundle);
                            } else {
                                addSingleResource(hapiFhirCtx, rsc, finalBundle);

                            }
                        } catch (Exception e) {
                            logger.error("INVALID FHIR FORMAT of INCOMING DATA.\n" + e.getMessage(),
                                    " Query = " + query, e);
                            throw e;
                        }
                    } else {
                        logger.error("Error on request " + fhirClient.getBaseURL() + "/" + query +
                                " code ="+ response.getStatusInfo().getStatusCode());
                        throw new DataRetrievalException("Error on request, status code = "
                                + response.getStatusInfo().getStatusCode(), fhirClient.getBaseURL() + query);
                    }
                } catch (DataRetrievalException e) {
                    throw e;

                } catch (Exception e) {
                    logger.error("Error on request " + fhirClient.getBaseURL() + "/" 
                            + query + " Exception= "
                            + e.getMessage(), e);
                    throw new DataRetrievalException("Exception on request", query, e);
                }
            }
        }
        return finalBundle;
    }

    /**
     * Retrieve fhir data from client /url.
     * 
     * @param client
     * @param url
     * @return
     * @throws java.io.IOException
     */
    public Response getFhirData(WebClient client, String url)
            throws IOException {

        String path;
        String query = "";
        // + fhirClient.getAuthBean().getAuthenticationQuery();
        
        url = url.trim();
        if (!url.startsWith("/")) {
            url = "/" + url;
        }
        int qIndex = url.indexOf("?");
        if (qIndex >=0) {
            query = url.substring(qIndex+1);
            path = url.substring(0, qIndex);
        }
        else {
            path = url;
        }
        path = "/fhir" + path;
        
        client.replacePath(path);
        if (query.length() > 0) {
            client.query(StringEscapeUtils.unescapeHtml4( query ));
        }
        
        // Get resource data via existing RDK client
        Response response = client.accept("application/json")
                .type("application/json").get();
        
        return response;
    }

    /**
     * Given a bundle of fhir resources (bundleIN), of N resource(s), extract
     * each individual resource and add to a preexisting bundle (bundleOut).
     * 
     * @param fhirContext
     * @param bundleIn
     * @param bundleOut
     */
    public void addResources(FhirContext fhirContext, Bundle bundleIn,
            Bundle bundleOut) {

        // ---------------------------------
        // LOOP THROUGH ALL ENTRIES
        // extract each Entry and add to to the new resource
        // ---------------------------------
        List<Entry> entries = bundleIn.getEntry();

        for (Entry e : entries) {

            bundleOut.getEntry().add(e);

            // Total is only valid on search and history bundles!
            // if (bundleOut.getTotal() == 0)
            // bundleOut.setTotal(1);
            // else
            // bundleOut.setTotal(bundleOut.getTotal() + 1);
            //
            // logger.info("ADDING: "+ resource.getText().getDiv().toString());
        }
    }

    /**
     * Adding a single fhir resource to an existing fhir bundle object.
     * 
     * @param fhirContext
     * @param resourceIn
     * @param bundleOut
     */
    public void addSingleResource(FhirContext fhirContext,
            IResource resourceIn, Bundle bundleOut) {

        logger.info("RESOURCE NAME: " + resourceIn.getResourceName());
        logger.info(resourceIn.getResourceMetadata().toString());

        bundleOut.addEntry().setResource(resourceIn);

        // bundleOut.setTotal(bundleOut.getEntry().size()); //Total is only
        // valid on search and history bundles!

        // logger.info("ADDING: " + resourceIn.getText().getDiv().toString());

    }

}
