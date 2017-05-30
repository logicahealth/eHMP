/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
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
package com.cognitive.cds.services.cdsinteractive;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;

import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.util.FhirUtils;

/**
 *
 * Generic Raw Service for interactive invocation of reasoning
 *
 * @author Tnguyen
 * @version 1.0
 * @created 4/27/2015
 */
public class MockInvokeService implements MockInvokeIface {

	 private static final Logger LOGGER = LoggerFactory.getLogger(MockInvokeService.class);

    public MockInvokeService() {

    }

    /**
     * TODO: change deser to populate InvokeServiceReq with correct objects.
     * 
     * @param req
     * @param context
     * @return
     */
    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/mockinvoke")
    public ResultBundle mockInvokeRules(InvokeServiceReq req, @javax.ws.rs.core.Context MessageContext context) {

        ResultBundle invokerResult = null;

        Object dataModel = req.getDataModel();
        Properties props = req.getParameters();

        // checking Properties deser result.
        if (props != null) {
            LOGGER.info("PROPS SIZE = " + props.size());
            IResource p1 = (IResource) props.get("temperature");
            if (p1 != null)
                LOGGER.info(p1.getResourceName());
        }

        // checking dataModel
        if (dataModel != null) {
            if (dataModel.getClass().isAssignableFrom(Bundle.class)) {
                LOGGER.info("=====> mockInvokeRules: FOUND BUNDLE ");

            } else if (dataModel.getClass().isAssignableFrom(IResource.class)) {
                LOGGER.info("=====> mockInvokeRules: FOUND IRESOURCE ");
            }
        }

        try {
            // dataModel should be valid HAPI FHIR Bundle.
            invokerResult = buildRealResultBundle(dataModel);

        } catch (IOException ex) {
            LOGGER.error( ex.getMessage());
        }

        return invokerResult;
    }

    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/mockbundle")
    public ResultBundle mockInvokeBundle(Object dataModel) {

        ResultBundle invokerResult = null;

        LOGGER.info("IN mockInvokeBundle");

        try {

            LOGGER.info(dataModel.getClass().getName());

            // CHECK if Serialized incoming BUndle json to Bundle object
            // correctly.
            if (dataModel.getClass().isAssignableFrom(Bundle.class)) {
                LOGGER.info("=====> mockInvokeBundle: FOUND BUNDLE ");
            }

            // dataModel should be valid HAPI FHIR Bundle.
            invokerResult = buildResultBundle(dataModel);

        } catch (IOException ex) {
        	 LOGGER.error(ex.getMessage());
        }

        return invokerResult;
    }

    private ResultBundle buildRealResultBundle(Object data) throws IOException {

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result class
        // -------------------------------------------
        ResultBundle rb = new ResultBundle();
        List<Result> results = new LinkedList<Result>();

        results.add(new Result("Test2", "A Test Result 2", data, "JUNIT", "Called"));

        rb.setStatus(StatusCode.SUCCESS);
        rb.setResults(results);

        return rb;
    }

    private ResultBundle buildResultBundle(Object data) throws IOException {

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body", within the Result class
        // -------------------------------------------
        ResultBundle rb = new ResultBundle();
        List<Result> results = new LinkedList<Result>();
        URL url = this.getClass().getClassLoader().getResource("sampleObservations.json");
        byte[] b = null;
        try {
            b = Files.readAllBytes(Paths.get(url.toURI()));
        } catch (URISyntaxException ex) {
            LOGGER.error(ex.getMessage());
        }

        Bundle bundle = (Bundle) FhirUtils.newJsonParser().parseResource(new String(b, "UTF-8"));

        results.add(new Result("Test2", "A Test Result 2", bundle, "JUNIT", "Called"));

        rb.setStatus(StatusCode.SUCCESS);
        rb.setResults(results);

        return rb;
    }

    /**
     * This service forces a fixed json of ResultBundle with a Bundle object in
     * "body" node as a response.
     * 
     * @return
     */
    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/mockinvokesimple")
    public ResultBundle mockInvokeSimple(String data) {

        ResultBundle invokerResult = null;

        LOGGER.info("IN mockInvokeSimple with data=" + data);

        try {
            invokerResult = setupResultsBundle2_WithBundleBody(false);

        } catch (IOException ex) {
            LOGGER.error(ex.getMessage());
        }

        return invokerResult;
    }

    private ResultBundle setupResultsBundle2_WithBundleBody(boolean wantSimple) throws IOException {
        ResultBundle out = new ResultBundle();
        List<Result> results = new LinkedList<>();

        // -------------------------------------------
        // READ in the Fhir Bundle so can insert it as an Object type
        // to attribute "body".
        // -------------------------------------------
        URL url = this.getClass().getClassLoader().getResource("sampleObservations.json");
        byte[] b = null;
        try {
            b = Files.readAllBytes(Paths.get(url.toURI()));
        } catch (URISyntaxException ex) {
            LOGGER.error(ex.getMessage());
        }

        LOGGER.info("=====> creating a Bundle object ");
        FhirContext hapiFhirCtx = new FhirContext();
        hapiFhirCtx = FhirContext.forDstu2();
        Bundle bundle = (Bundle) hapiFhirCtx.newJsonParser().parseResource(new String(b, "UTF-8"));

        results.add(new Result("Test2", "A Test Result 2", bundle, "JUNIT", "Called"));

        out.setStatus(StatusCode.SUCCESS);
        out.setResults(results);

        return out;
    }

}
