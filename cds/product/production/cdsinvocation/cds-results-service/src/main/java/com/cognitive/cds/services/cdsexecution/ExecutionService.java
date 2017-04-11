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
package com.cognitive.cds.services.cdsexecution;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang3.StringUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.CDSInvocationIFace;
import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;
import com.cognitive.cds.invocation.execution.model.ExecutionFault;
import com.cognitive.cds.invocation.execution.model.ExecutionRequest;
import com.cognitive.cds.invocation.execution.model.ExecutionResult;
import com.cognitive.cds.invocation.execution.model.Job;
import com.cognitive.cds.invocation.execution.model.JobSummary;
import com.cognitive.cds.invocation.execution.model.SubjectListReference;
import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;
import com.cognitive.cds.invocation.model.Subject;
import com.cognitive.cds.invocation.mongo.JobDao;
import com.cognitive.cds.invocation.workproduct.model.InvocationInfo;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductAssignment;
import com.cognitive.cds.services.cdsexecution.workproduct.WorkProductManagementIFace;
import com.cognitive.cds.services.cdsexecution.workproduct.WorkProductPackagerIFace;
import com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider;

/**
 * This nested call is used to hold the general context of the execution This
 * includes all the input and output structures.
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 10-Mar-2015 9:10:43 AM
 */
@Path("/core")
public class ExecutionService implements ExecutionIface {

    private class ExecutionContext {
        public ExecutionRequest request;
        public ExecutionResult result;

        public ExecutionContext(ExecutionRequest request, ExecutionResult result) {
            this.request = request;
            this.result = result;

        }
    }

    private static final Logger logger = LoggerFactory.getLogger(ExecutionService.class);

    private CDSInvocationIFace cdsInvoker;

    private Map<String, Job> jobs = new HashMap<String, Job>();

    // The URL used for fetching jobs (e.g. http://localhost:3007)
    private String jobServerURL;

    // We abstract the types of subjects - Since patient Lists are only
    // one type of manage list that rule sets might be applied to
    // for example vendors is another set.
    private Map<String, SubjectFetcherIface> subjectListFetchers;

    private WorkProductManagementIFace workProductManagement;

    private WorkProductPackagerIFace workProductPackager;
    
    private JobDao jobDao;

    public ExecutionService() {

    }
    /**
     * REST Interface to trigger rules invocation (wraps execute rules)
     * 
     * @param request
     * @param context
     * @return
     */
    
    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/executeRules")
    public ExecutionResult executeRulesREST(ExecutionRequest request, @javax.ws.rs.core.Context MessageContext context) {
        ExecutionResult result = executeRules(request);
        // Set the http response code
        HttpServletResponse response = context.getHttpServletResponse();
        setResponseCode(response, result.getStatus().getCode());
        try {
            response.flushBuffer();
        } catch (Exception e) {
        }
        return result;
    }
    
    
    /**
     * Prepare an execution context per request info, and issue appropriate
     * rules processing call for all patients given in request.
     *
     * @param request
     * @return
     */
    public ExecutionResult executeRules(ExecutionRequest request) {
        // From the request we grab the following info
        // The Invocation context, General context
        //

        ExecutionResult exeResult = new ExecutionResult();

        // We use an Execution context so that nested calls can access fault
        // tracking structures
        ExecutionContext exeCtx = new ExecutionContext(request, exeResult);

        // TODO Deal with User Credentials for now we will configure that data
        // We need a way to retain RDK credentials between various calls

        // fetcher with system credentials

        // Validate Input
        if (inputInvalid(exeCtx)) {
            return exeResult;
        }

        InvocationTarget target = request.getTarget();
        // Make sure the Invocation Type is Background
        target.setType(InvocationType.Background);
        // Right now we are only working in Normal mode (No provision has been
        // made for raw mode)
        target.setMode(InvocationMode.Normal);

        // Start timing/metric
        long start = Calendar.getInstance().getTime().getTime();
        String callId;
        if (request.getJobId() == null || request.getJobId().isEmpty()) {
            callId = "UnnamedJob:" + start;
        } else {
            callId = request.getJobId() + ":" + start;
        }
        // Create a common metric name when multiple intents are use
        String metricInvokeId = StringUtils.join(target.getIntentsSet(), ',');

        ArrayList<CallMetrics> metrics = new ArrayList<>(1);

        CallMetrics startMetric = new CallMetrics();
        startMetric.setCallId(callId);
        startMetric.setType("Job");
        startMetric.setContext(request.getBaseContext());
        startMetric.setEvent("begin");
        startMetric.setInvocationType(target.getType());
        startMetric.setOrigin(this.getClass().getSimpleName());
        startMetric.setInvocation(metricInvokeId);
        startMetric.setTime(new Timestamp(start));
        metrics.add(startMetric);

        cdsInvoker.sendMetricsToCollectors(metrics);
        metrics.clear();

        // Send a Execution Start Message

        Set<String> subjectList = buildSubjectList(exeCtx);

        // Build the starting context
        Context callContext = new Context(request.getBaseContext());

        // Loop the list of patients
        Iterator<String> itr = subjectList.iterator();
        int subjectCnt = 0;
        // Count of the actual results produced
        int resultCnt = 0;
        //
        while (itr.hasNext()) {
            String subjectId = itr.next();

            // We are using a normal mode call which should fetch the data
            // required

            // Setup the CDSInvoker and call
            try {
                // Swap the context to a new subject
                callContext.setSubject(new Subject(subjectId));

                ResultBundle invokerResult = cdsInvoker.invoke(target, callContext, null, null);

                // Process the results (If no error) - We may want to revisit
                // this.
                if (invokerResult.getStatus().getCode().equals(InvocationConstants.StatusCodes.SUCCESS.getCode())) {
                    // Call was Successful
                    List<Result> results = invokerResult.getResults();
                    if (results != null) {
                        Iterator<Result> resultItr = results.iterator();

                        // Loop the results

                        // The expectation is that each result is a single out
                        // going result
                        int cnt = 0;
                        while (resultItr.hasNext()) {
                            Result result = resultItr.next();
                            cnt++;
                            // Convert each result
                            WorkProduct wp = workProductPackager.convertToWorkProduct(result, callContext, cnt);
                            if (wp != null) {

                                // Add Invocation specific info

                                InvocationInfo invocationInfo = new InvocationInfo();
                                invocationInfo.setTargetInfo(target);
                                invocationInfo.setCallId(result.getCallId());
                                invocationInfo.setGeneratedBy(result.getGeneratedBy());
                                wp.setInvocationInfo(invocationInfo);

                                // Save the work product and get the Id
                                String id = workProductManagement.storeWorkProduct(wp);
                                if (id != null) {
                                    // Assign the work product to the Context's
                                    // user
                                    resultCnt++;

                                    WorkProductAssignment wpa = new WorkProductAssignment();
                                    wpa.setWorkProductType(wp.getType());
                                    wpa.setReadStatus(false);
                                    wpa.setUser(request.getBaseContext().getUser());
                                    wpa.setWorkProductId(id);
                                    wpa.setExpirationDate(wp.getExpirationDate());
                                    wpa.setPriority(wp.getPriority());
                                    if (!workProductManagement.assignWorkProduct(wpa, false)) {
                                        logger.debug("Workproduct assignment rejected: " + wpa.toJsonString());
                                    }
                                } else {
                                    logger.warn("Failed to store work product");
                                }
                            } else {
                                logger.info("Result was not convertable Type =  " + result.getType() + ", Body = " + result.getBody());
                            }

                        }
                    }
                }
                // Ok Handle Errors and Status info
                if (invokerResult.getFaultInfo() != null) {
                    if (!invokerResult.getFaultInfo().isEmpty()) {
                        ExecutionFault exeFlt = new ExecutionFault();
                        exeFlt.setFaultInfo(invokerResult.getFaultInfo());
                        exeFlt.setContext(callContext);
                        exeFlt.setStatus(invokerResult.getStatus());
                        exeFlt.setTarget(target);
                        exeResult.getFaults().add(exeFlt);
                    }
                }
                subjectCnt++;

            } catch (Exception exp) {
                // We should log the exception and the record it
                logger.error("Error on processing rules on Subject " + subjectId, exp);
                ExecutionFault exeFlt = new ExecutionFault();
                ArrayList<FaultInfo> flts = new ArrayList<>(1);
                flts.add(new FaultInfo(exp.toString()));
                exeFlt.setFaultInfo(flts);
                exeFlt.setContext(callContext);
                exeFlt.setStatus(StatusCode.SYSTEM_ERROR);
                exeFlt.setTarget(target);
                exeResult.getFaults().add(exeFlt);
            }

        }

        // Update results
        exeResult.setTotalSubjectsProcessed(subjectCnt);
        // End Timing Metric
        long end = Calendar.getInstance().getTime().getTime();
        exeResult.setTotalRuntme(end - start);
        exeResult.setTotalResults(resultCnt);
        exeResult.setStartTime(new Date(start));
        exeResult.setEndTime(new Date(end));

        CallMetrics endMetric = new CallMetrics();
        endMetric.setCallId(callId);
        endMetric.setType("Job");
        endMetric.setContext(request.getBaseContext());
        endMetric.setEvent("end");
        endMetric.setInvocationType(target.getType());
        endMetric.setOrigin(this.getClass().getSimpleName());
        endMetric.setInvocation(metricInvokeId);
        endMetric.setTime(new Timestamp(end));
        metrics.add(endMetric);

        CallMetrics summaryMetric = new CallMetrics();
        summaryMetric.setCallId(callId);
        summaryMetric.setType("Job");
        summaryMetric.setContext(request.getBaseContext());
        summaryMetric.setEvent("end");
        summaryMetric.setInvocationType(target.getType());
        summaryMetric.setOrigin(this.getClass().getSimpleName());
        summaryMetric.setInvocation(metricInvokeId);
        summaryMetric.setTime(new Timestamp(end));
        summaryMetric.getTimings().put("total", new Long(end - start));
        summaryMetric.setTotalResults(resultCnt);
        metrics.add(summaryMetric);

        cdsInvoker.sendMetricsToCollectors(metrics);

        return exeResult;
    }

    /**
     * Execute the job per jobName.
     * 
     * @api {post} cds-results-service/core/executeRulesJob/?jobname Execute the
     *      job name
     * @apiName executeRulesJob
     * @param jobName
     * @return The resulting execution status
     */
    @Override
    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/executeRulesJob/{jobnameorid}")
    public ExecutionResult executeRulesJob(@PathParam("jobnameorid") String jobName, @javax.ws.rs.core.Context MessageContext context) {
        // Look up the job info and delegate to execute rules
        ExecutionResult result = null;
        boolean builtIn = true;
        logger.debug("Execute job " + jobName);
        // Lookup the job info and make the request
        Job request = jobs.get(jobName);
        // Is the job built in ?
        if (request == null) {
            logger.debug("Load job " + jobName);
            request = this.loadJobInfo(jobName);
            logger.debug("Loaded job " + jobName);
            builtIn = false;
        }
        // Check if the job really expects
        if (request != null) {
            if (request.isDisabled() == false) {
                logger.debug("Run job " + jobName);
                result = this.executeRules(request.getExecution());
                // Updqte the job information
                request.setLastRun(new Date(System.currentTimeMillis()));
                request.setLastExecutionResult(result);
                if (builtIn) {
                    jobs.put(jobName, request);
                } else {
                    saveJobInfo(jobName, request);
                }
            }

        } else {
            result = new ExecutionResult();

            ArrayList<ExecutionFault> faults = new ArrayList<>();
            ExecutionFault exeFlt = new ExecutionFault();
            exeFlt.getFaultInfo().add(new FaultInfo("Job name " + jobName + " not found"));
            faults.add(new ExecutionFault());
            result.getFaults().add(exeFlt);
            // Ok Setup the error state
            result.setStatus(StatusCode.INVALID_INPUT_DATA);

        }

        // Set the http response code
        HttpServletResponse response = context.getHttpServletResponse();
        setResponseCode(response, result.getStatus().getCode());
        try {
            response.flushBuffer();
        } catch (Exception e) {
        }

        return result;
    }

    public void finalize() throws Throwable {

    }

    public CDSInvocationIFace getCdsInvoker() {
        return cdsInvoker;
    }

    public Map<String, Job> getJobs() {
        return jobs;
    }

    public String getJobServerURL() {
        return jobServerURL;
    }

    // For now we operate of the internal map
    // @Override
    public Job getRulesJob(String jobName) {
        Job out = jobs.get(jobName);
        return out;
    }

    // @Override
    public List<JobSummary> getRulesJobs() {
        LinkedList<JobSummary> out = new LinkedList<>();
        Iterator<String> jobKeyItr = jobs.keySet().iterator();
        while (jobKeyItr.hasNext()) {
            String jobName = jobKeyItr.next();
            Job job = jobs.get(jobName);
            JobSummary jobSum = new JobSummary();
            jobSum.setName(jobName);
            jobSum.setLastRun(job.getLastRun());
            jobSum.setDescription(job.getDescription());
            out.add(jobSum);
        }

        // Sort the output to be nice
        Collections.sort(out, new Comparator<JobSummary>() {
            public int compare(JobSummary l1, JobSummary l2) {
                return l1.getName().compareTo(l2.getName());
            }
        });
        return out;

    }

    /**
     * @return the subjectListFetchers
     */
    public Map<String, SubjectFetcherIface> getSubjectListFetchers() {
        return subjectListFetchers;
    }

    /**
     * @return the workProductManagement
     */
    public WorkProductManagementIFace getWorkProductManagement() {
        return workProductManagement;
    }

    /**
     * @return the workProductPackager
     */
    public WorkProductPackagerIFace getWorkProductPackager() {
        return workProductPackager;
    }

    public void setCdsInvoker(CDSInvocationIFace cdsInvoker) {
        this.cdsInvoker = cdsInvoker;
    }

    public void setJobs(Map<String, Job> jobs) {
        this.jobs = jobs;
    }

    public void setJobServerURL(String jobServerURL) {
        this.jobServerURL = jobServerURL;
    }

    // @Override
    public Job setRulesJob(String jobName, Job request) {
        Job out = null;
        if (jobs.containsKey(jobName)) {
            out = jobs.get(jobName);
            out.setDescription(request.getDescription());
            out.setExecution(request.getExecution());
        } else {
            out = request;
            jobs.put(jobName, request);
        }
        return out;
    }

    /**
     * @param subjectListFetchers
     *            the subjectListFetchers to set
     */
    public void setSubjectListFetchers(Map<String, SubjectFetcherIface> subjectListFetchers) {
        this.subjectListFetchers = subjectListFetchers;
    }

    /**
     * @param workProductManagement
     *            the workProductManagement to set
     */
    public void setWorkProductManagement(WorkProductManagementIFace workProductManagement) {
        this.workProductManagement = workProductManagement;
    }

    /**
     * @param workProductPackager
     *            the workProductPackager to set
     */
    public void setWorkProductPackager(WorkProductPackagerIFace workProductPackager) {
        this.workProductPackager = workProductPackager;
    }

    /**
     * Help function that defaults to the base Context
     * 
     * @param msg
     * @param exeCtx
     * @param status
     */
    private void addFault(String msg, ExecutionContext exeCtx, StatusCode status) {

        addFault(msg, exeCtx, status, exeCtx.request.getBaseContext());
    }

    /**
     * Add the fault
     * 
     * @param msg
     * @param exeCtx
     * @param status
     * @param ctx
     */
    private void addFault(String msg, ExecutionContext exeCtx, StatusCode status, Context ctx) {
        FaultInfo faultInfo = new FaultInfo();
        faultInfo.setFault(msg);
        ExecutionFault fault = new ExecutionFault(exeCtx.request.getTarget(), exeCtx.request.getBaseContext(), status, faultInfo);

        exeCtx.result.getFaults().add(fault);

        // Update Status entire
        if (exeCtx.result.getStatus().equals(StatusCode.SUCCESS)) {
            exeCtx.result.setStatus(status);
        } else if (!exeCtx.result.getStatus().equals(status)) {
            exeCtx.result.setStatus(StatusCode.MULTIPLE_FAULTS);
        }
    }

    /**
     * Build the list of subjects per the execution context.
     * 
     * @param exeCtx
     * @return
     */
    private Set<String> buildSubjectList(ExecutionContext exeCtx) {
        logger.debug("Building subject List");
        // Build the list of patients
        Set<String> subjectList = new HashSet<>();

        if (exeCtx.request.getSubjectListReferences() != null) {
            logger.debug("Resolving Subject List references");
            // Resolve the SubjectListRef
            Iterator<SubjectListReference> itr = exeCtx.request.getSubjectListReferences().iterator();
            while (itr.hasNext()) {
                SubjectListReference ref = itr.next();
                resolveSubjectListReference(ref, subjectList, exeCtx);
            }
        }
        // Add on the explicit subjects
        if (exeCtx.request.getSubjectIds() != null) {
            subjectList.addAll(exeCtx.request.getSubjectIds());
        }
        return subjectList;
    }

    /**
     * Check if context data is valid. Checks: 1) the target can't be null. AND
     * 2) base context can't be null. Though when base context is given, context
     * user can't be null.
     * 
     * @param exeCtx
     * @return
     */
    private boolean inputInvalid(ExecutionContext exeCtx) {
        if (exeCtx.request.getTarget() == null) {
            // Some target is required
            addFault("Request Target is null", exeCtx, StatusCode.INVALID_INPUT_DATA);
        }
        if (exeCtx.request.getBaseContext() == null) {
            // Some Context is required

            addFault("Request Context is null", exeCtx, StatusCode.INVALID_INPUT_DATA);
        } else {
            if (exeCtx.request.getBaseContext().getUser() == null) {
                addFault("User is null", exeCtx, StatusCode.INVALID_INPUT_DATA);
            }
        }
        return false;
    }

    /**
     * Pull the job info from Job server.
     * 
     * @param jobId
     * @return
     */
    protected Job loadJobInfo(String jobId) {
        logger.debug("Loading job " + jobId);

        if (jobDao != null)
            return jobDao.loadJobInfo(jobId);

        Job job = null;
        try {

            Client client1 = ClientBuilder.newClient();
            if (logger.isDebugEnabled()) {
                logger.debug("Client = " + client1.toString());
                logger.debug("jobServerURL = " + jobServerURL);
                logger.debug("Job Id = " + jobId);
            }
            // Make sure we are using Jackson
            client1.register(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

            List<Object> providers = new ArrayList<Object>();
            providers.add(new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider());

            logger.debug("Fetching job " + jobId + " from " + jobServerURL);

            Response res = client1.target(jobServerURL).path(jobId).request("application/json").get();
            if (res != null) {
                if (res.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
                    JobProductWrapper wrapper = res.readEntity(JobProductWrapper.class);
                    job = wrapper.payload.get(0);
                    // String test = res.readEntity(String.class);
                    // logger.info(test);
                } else {
                    String msg = res.readEntity(String.class);
                    logger.warn("Failed to load Job - Http Status Code " + res.getStatus() + " - " + msg);
                }
            } else {
                logger.warn("Failed to load Job - Null result");
            }
        } catch (Throwable e) {
            logger.error("Error looking up job", e);
        }
        return job;
    }

    /**
     * Delete the job
     * 
     * @param jobId
     * @return
     */
    protected boolean deleteJob(String jobId) {
        boolean deleted = false;
        Response out = null;
        Client client1 = ClientBuilder.newClient();
        JacksonJsonProvider provider = new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider();
        client1.register(provider);

        out = client1.target(jobServerURL).path(jobId).request("application/json").delete();
        if (out.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
            deleted = true;
            String resp = out.readEntity(String.class);
            logger.debug(resp);
        } else {
            String msg = out.readEntity(String.class);
            logger.warn("Failed to delete Job - Http Status Code " + out.getStatus() + " - " + msg);
        }
        return deleted;
    }

    /**
     * Save job info up to Job server.
     * 
     * @param jobId
     * @param job
     */
    protected void saveJobInfo(String jobId, Job job) {

        if (jobDao != null) {
            jobDao.saveJobInfo(jobId, job);
            return;
        }
        
        Response out = null;
        Client client1 = ClientBuilder.newClient();
        if (job.getName() == null || job.getName().isEmpty()) {
            job.setName(jobId);
        }
        // Make sure we are using Jackson
        JacksonJsonProvider provider = new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider();
        client1.register(provider);

        out = client1.target(jobServerURL).request("application/json").put(Entity.entity(job, MediaType.APPLICATION_JSON), Response.class);

        if (out.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
            String resp = out.readEntity(String.class);
            logger.debug(resp);
        } else {
            String msg = out.readEntity(String.class);
            logger.warn("Failed to update Job - Http Status Code " + out.getStatus() + " - " + msg);
        }
    }

    /**
     * Create the job per jobId.
     * 
     * @param jobId
     * @param job
     */
    protected void createJob(String jobId, Job job) {
        Response out = null;
        Client client1 = ClientBuilder.newClient();
        if (job.getName() == null || job.getName().isEmpty()) {
            job.setName(jobId);
        }
        // Make sure we are using Jackson
        JacksonJsonProvider provider = new com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider();
        client1.register(provider);

        out = client1.target(jobServerURL).request("application/json").post(Entity.entity(job, MediaType.APPLICATION_JSON), Response.class);

        if (out.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
            String resp = out.readEntity(String.class);
            logger.debug(resp);
        } else {
            String msg = out.readEntity(String.class);
            logger.warn("Failed to update Job - Http Status Code " + out.getStatus() + " - " + msg);
        }
    }

    /**
     * 
     * @param ref
     * @param subjectSet
     * @param exeCtx
     */
    private void resolveSubjectListReference(SubjectListReference ref, Set<String> subjectSet, ExecutionContext exeCtx) {
        String key = ref.getType().toString();
        if (subjectListFetchers.containsKey(key)) {
            // Ok we grab the data fetcher and ask it for the list
            SubjectFetcherIface fetcher = subjectListFetchers.get(key);
            // Call the fetcher
            try {
                fetcher.fetchSubject(ref.getId(), subjectSet);
            } catch (Exception exp) {
                // Log the Exception and add Exception to execution result
                saveException("resolve subject list reference (" + ref.toString() + ")", exp, exeCtx, StatusCode.INVALID_INPUT_DATA);
            }
        } else {
            // Add Fault of unknown subject type
            addFault("Unknown subject type [" + key + "]", exeCtx, StatusCode.INVALID_INPUT_DATA);
        }
    }

    /**
     * 
     * @param context
     * @param exp
     * @param exeCtx
     * @param cd
     */
    private void saveException(String context, Exception exp, ExecutionContext exeCtx, StatusCode cd) {
        logger.error("Exception trying to " + context, exp);

        addFault("Exception trying to " + context + " (" + exp.getMessage() + ")", exeCtx, cd);
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

    /**
     * @return the jobDao
     */
    public JobDao getJobDao() {
        return jobDao;
    }

    /**
     * @param jobDao the jobDao to set
     */
    public void setJobDao(JobDao jobDao) {
        this.jobDao = jobDao;
    }
}
