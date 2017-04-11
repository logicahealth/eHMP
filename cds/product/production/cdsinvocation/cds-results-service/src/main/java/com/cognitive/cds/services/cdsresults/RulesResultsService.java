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
package com.cognitive.cds.services.cdsresults;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import ca.uhn.fhir.model.api.IResource;

import com.cognitive.cds.invocation.CDSInvocationIFace;
import com.cognitive.cds.invocation.CDSInvoker;
import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.services.cdsexecution.workproduct.producers.FHIRWorkProductProducerIFace;
import com.cognitive.cds.services.cdsresults.model.CDSResult;
import com.cognitive.cds.services.cdsresults.model.CDSResultBundle;
import com.cognitive.cds.services.cdsresults.model.Info;
import com.cognitive.cds.services.cdsresults.model.InvocationRequest;
import com.cognitive.cds.services.cdsresults.model.Status;

/**
 * @author Jerry Goodnough, Tadesse Sefer
 * @version 1.0
 * @created 11-Dec-2014 9:10:43 AM
 */
public class RulesResultsService implements RulesResultsIface {
    
   
    private static final Logger logger = LoggerFactory.getLogger(RulesResultsService.class);
    private static final String status = "RUNNING";
    private Map<String, FHIRWorkProductProducerIFace> fhirArtifactMap;

    CDSInvocationIFace cdsInvoker;

    public RulesResultsService() {

    }

    public RulesResultsService(CDSInvoker cdsInvoker) {
        this.cdsInvoker = cdsInvoker;

    }

    public CDSInvocationIFace getCdsInvoker() {
        return cdsInvoker;
    }

    public Map<String, FHIRWorkProductProducerIFace> getFhirArtifactMap() {
        return fhirArtifactMap;
    }
    
    @Override
    @GET
    @Path("/healthcheck")
    @Produces("text/plain")
    public String ping() {
        return "Status = " + status ;
    }

    /**
     * Current list of status codes: <br>
     * 0 - Success <br>
     * 1 – Use not recognized <br>
     * 2 – General Rules processing failure  <br>
     * 3 – Invalid Input Data <br>
     * 4 - Invalid Output Data <br>
     * 5 - Rules Engine is not available<br>
     *
     * @api {post} /cds-results-service/rest/invokeRulesForPatient Invoke Rule
     *      for a patient
     * @apiParamExample {json} Request-Example: { "context": { "patientId" :
     *                  "9E7A:100816", "userId" : "1", "siteId" : "1" },
     *                  "reason":"providerInteractiveAdvice" }
     * @apiName invokeRulesForPatient
     * @apiGroup RulesResultsService
     * @param request
     * @return
     */
    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/invokeRulesForPatient")
    public CDSResultBundle invokeRulesForPatient(InvocationRequest request, @javax.ws.rs.core.Context MessageContext context) {
        InvocationTarget target = new InvocationTarget();
        StatusCode statusCode = StatusCode.SUCCESS;
        String errorMessage = null;
        target.setType(InvocationType.Direct);
        // We now use normal calling mode and not raw mode
        target.setMode(InvocationMode.Normal);

        List<String> intents = new ArrayList<>();
        List<String> statusList = new ArrayList<>();

        // Currently the reason is a direct intent
        // TODO: Deal with User Credentials
        intents.add(request.getReason());
        target.setIntentsSet(intents);

        CDSResultBundle resultBundle = new CDSResultBundle();

        // Check for valid Request (i.e. required parameters, valid credentials)
        boolean validRequest = checkRequestForErrors(request, statusList);

        if (validRequest) {

            ResultBundle invokerResult = null;
            // if(vprJson != null && !vprJson.equals("") && isValide(vprJson,
            // statusList)){

            com.cognitive.cds.invocation.model.Context ctx = buildContext(request.getContext());

            // We now call in normal mode with should handle all data build
            // internally
            invokerResult = cdsInvoker.invoke(target, ctx, null, null);

            if (invokerResult.getResults() != null && !invokerResult.getResults().isEmpty()) { // Success
                statusCode=StatusCode.SUCCESS;
                errorMessage = InvocationConstants.StatusCodes.SUCCESS.getMessage();
                statusList.add(errorMessage);
                resultBundle = transformInvokerResultBundle(invokerResult, ctx);
            } else if (invokerResult.getFaultInfo() == null) {
                statusCode = StatusCode.SYSTEM_ERROR;
                // System error, nothing came from the invocation framework

                errorMessage = InvocationConstants.StatusCodes.SYSTEM_ERROR.getMessage();
                statusList.add(errorMessage);
            } else { // error came in
            	statusCode =invokerResult.getStatus();
                
                for (com.cognitive.cds.invocation.model.FaultInfo info : invokerResult.getFaultInfo()) {
                    statusList.add(info.getFault());
                }
            }
        }

        resultBundle.setStatus(prepStatusObject(statusCode.getCode(), statusList));
        if (logger.isDebugEnabled()) {

            try {
                logger.debug("Execution finished - " + resultBundle.toJsonString());
            } catch (IOException e) {
                logger.error("Error reporting exection finished", e);
            }
        }
        HttpServletResponse response = context.getHttpServletResponse();
        setResponseCode(response, statusCode.getCode());
        try {
            response.flushBuffer();
        } catch (Exception e) {
        }

        return resultBundle;
    }

    private void setResponseCode(HttpServletResponse response, String code) {
        if (StatusCode.AUTHENICATION_ERROR.getCode().equals(code)) {
            response.setStatus(401);
        }
        if (StatusCode.INVALID_INPUT_DATA.getCode().equals(code) || StatusCode.USE_NOT_RECOGNIZED.getCode().equals(code)) {
            response.setStatus(400);
        }
        if (StatusCode.RULES_ENGINE_NOT_AVAILABLE.getCode().equals(code) || StatusCode.DATA_SERVER_NOT_AVAILABLE.getCode().equals(code)) {
            response.setStatus(503);
        }
        if (StatusCode.SYSTEM_ERROR.getCode().equals(code) || StatusCode.MULTIPLE_FAULTS.getCode().equals(code)) {
            response.setStatus(500);
        }
    }

    public void setCdsInvoker(CDSInvocationIFace cdsInvoker) {
        this.cdsInvoker = cdsInvoker;
    }

    @Required
    public void setFhirArtifactMap(Map<String, FHIRWorkProductProducerIFace> fhirArtifactMap) {
        this.fhirArtifactMap = fhirArtifactMap;
    }

    private com.cognitive.cds.invocation.model.Context buildContext(com.cognitive.cds.services.cdsresults.model.Context requestContext) {

        com.cognitive.cds.invocation.model.Context invocationContext = new com.cognitive.cds.invocation.model.Context();
        com.cognitive.cds.invocation.model.Subject subject = new com.cognitive.cds.invocation.model.Subject();
        com.cognitive.cds.invocation.model.User user = new com.cognitive.cds.invocation.model.User();
        com.cognitive.cds.invocation.model.Location location = new com.cognitive.cds.invocation.model.Location();
        com.cognitive.cds.invocation.model.Specialty specialty = new com.cognitive.cds.invocation.model.Specialty();

        subject.setId(requestContext.getPatientId());
        subject.setType("Patient");
        subject.setCodeSystem("Site:Patient");

        user.setId(requestContext.getUserId());
        user.setType("Provider");
        user.setCodeSystem("Site:UserId");

        // Location (Code System and scope is still undefined)
        location.setId(requestContext.getLocation());

        // Specialty (Code System and scope is still undefined)
        specialty.setId(requestContext.getSpecialty());

        invocationContext.setSpecialty(specialty);
        invocationContext.setSubject(subject);
        invocationContext.setUser(user);
        invocationContext.setLocation(location);

        return invocationContext;
    }

    private Status prepStatusObject(String statusCode, List<String> statusDetails) {
        Status s = new Status();
        s.setCode(statusCode);
        List<Info> infoList = new ArrayList<>();

        Iterator<String> iter = statusDetails.iterator();
        while (iter.hasNext()) {
            Info i = new Info();
            i.setText((String) iter.next());
            infoList.add(i);
        }
        s.setInfo(infoList);

        return s;
    }

    private CDSResultBundle transformInvokerResultBundle(ResultBundle invokerResult, com.cognitive.cds.invocation.model.Context ctx) {
        CDSResultBundle resultBundle = new CDSResultBundle();
        List<CDSResult> cdsResults = new ArrayList<>();
        List<Result> results = invokerResult.getResults();

        if (results != null) {

            int id = 0;
            for (Iterator<Result> iterator = results.iterator(); iterator.hasNext();) {
                Result result = iterator.next();
                // For now we project all results type in the service the same
                // way
                if (fhirArtifactMap.containsKey(result.getType())) {
                    id++;

        
                    // Deserialzie the FHIR Resource
                    IResource rsc = (IResource) result.getBody();
                    
                    FHIRWorkProductProducerIFace handler = fhirArtifactMap.get(result.getType());

                    // We delgate artifact creation to the mapped hanlder
                    CDSResult cdsResult = handler.createCDSResult(result, rsc, ctx, id);

                    cdsResults.add(cdsResult);
                }
            }
        }

        resultBundle.setResults(cdsResults);
        return resultBundle;
    }

    /**
     * Check that all required parameters are given.
     *
     * @param request
     *            , true if Request is valid. false if REquest is not valid.
     * @return
     */
    protected boolean checkRequestForErrors(InvocationRequest request, List<String> statusList) {
        String errorMessage = null;
        if (request.getContext() == null) {
            errorMessage = InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getMessage() + " - check for Context parameter.";
            statusList.add(errorMessage);
            logger.error(errorMessage);
            return false;
        } else if (request.getContext().getPatientId().equals("")) {
            errorMessage = InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getMessage() + " - check for PatientId parameter.";
            statusList.add(errorMessage);
            logger.error(errorMessage);
            return false;
        } else if (request.getReason().equals("")) {
            errorMessage = InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getMessage() + " - check for Reason parameter.";
            statusList.add(errorMessage);
            logger.error(errorMessage);
            return false;
        }

        else {
            return true;
        }
    }

}
