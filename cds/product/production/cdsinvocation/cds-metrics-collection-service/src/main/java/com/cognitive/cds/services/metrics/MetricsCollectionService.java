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
package com.cognitive.cds.services.metrics;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.mongo.MongoDbDao;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.services.metrics.model.CDSResponseStatus;
import com.cognitive.cds.services.metrics.model.Info;
import com.cognitive.cds.services.metrics.model.MetricsUpdate;
import com.cognitive.cds.services.metrics.model.Status;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoDatabase;

/**
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:43 AM
 */
public class MetricsCollectionService implements MetricsCollectionServiceIface {

    private static final Logger LOGGER = LoggerFactory.getLogger(MetricsCollectionService.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
        LOGGER.info("MetricsCollectionService.mongoDbDao: " + mongoDbDao);
    }

    public MetricsCollectionService() {
    }

    public void finalize() throws Throwable {
    }

    @Override
    public CDSResponseStatus updateMetrics(MetricsUpdate request) {

        CDSResponseStatus resultBundle = new CDSResponseStatus();
        resultBundle.setStatus(saveAllMetrics(request.getMetrics()));

        return resultBundle;
    }

    protected String getMissingDataElement(CallMetrics metricIn) {
        if (metricIn.getContext().getSubject() == null) {
            return "Subject null";
        }
        if (metricIn.getCallId() == null) {
            return "callIs is null";
        }
        if (metricIn.getCallId().isEmpty()) {
            return "callId is empty";
        }
        if (metricIn.getType() == null) {
            return "type is null";
        }
        if (metricIn.getType().isEmpty()) {
            return "type is empty";
        }
        if (metricIn.getTime() == null) {
            return "time is null";
        }
        return "unknown";
    }

    public Status saveAllMetrics(List<CallMetrics> metricsList) {

        Status status;
        String statuscode = "0";
        List<String> statDetailList = new ArrayList<>();

        // ---------------------------------------------------
        // LOOP through all metrics in request
        // (1) prep a CallMetrics object for each incoming metric.
        // (2) issue a call to Metrics DB write service for that CallMetrics
        // object.
        // ---------------------------------------------------
        Iterator<CallMetrics> iter = metricsList.iterator();

        while (iter.hasNext()) {

            // CallMetrics metric = new CallMetrics();
            CallMetrics metricIn = iter.next();

            // CHECK REQUIRED incoming attributes
            if ((metricIn.getContext().getSubject() == null)
                    || ((metricIn.getCallId() == null) || metricIn.getCallId()
                            .isEmpty())
                    || ((metricIn.getType() == null) || metricIn.getType()
                            .isEmpty()) || (metricIn.getTime() == null)) {
                statuscode = "1";
                String missing = getMissingDataElement(metricIn);
                statDetailList.add("Metrics Id=" + metricIn.getCallId()
                        + " missing or has invalid parameters. (" + missing
                        + ")");
                break;
            }

            // metric.setCallId(metricIn.getCallId());
            // metric.setEvent(metricIn.getEvent());
            // metric.setInvocation(metricIn.getInvocation());
            // metric.setType(metricIn.getType());
            // metric.setContext(metricIn.getContext());
            // metric.setTime(metricIn.getTime());
            // Optional elements
            // metric.setTimings(metricIn.getTimings());
            // metric.setTotalResults(metricIn.getTotalResults());
            // metric.setOrigin(metricIn.getOrigin());
            try {
                this.writeToMetricsDb(metricIn);
                statDetailList.add("Metrics Id=" + metricIn.getCallId()
                        + " saved successfully.");

            } catch (IOException | CDSDBConnectionException ex) {
                statuscode = "1";
                statDetailList.add("Metrics Id=" + metricIn.getCallId()
                        + " failed saving.");
                LOGGER.error(ex.getMessage(), ex);
            }
        }
        status = prepStatusObject(statuscode, statDetailList);
        return status;
    }

    /**
     * Prepare a Status object with given status code and all relevant details.
     * 
     * @param statusCode
     * @param statusDetails
     * @return
     */
    public Status prepStatusObject(String statusCode, List<String> statusDetails) {

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

    public void writeToMetricsDb(CallMetrics metric) throws IOException,
            JsonMappingException, JsonGenerationException, CDSDBConnectionException {
        // --------------------------------------
        // parse Object to Json,
        // then can send to metric DB
        // --------------------------------------
        ObjectMapper mapper = new ObjectMapper();
        String toSend = mapper.writeValueAsString(metric);

        LOGGER.info("MetricsCollectionService.writeToMetricsDb: " + mongoDbDao);

        Document callMetricBson = Document.parse(toSend);
		MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("metric");
		database.getCollection("metrics").insertOne(callMetricBson);
    }

}
