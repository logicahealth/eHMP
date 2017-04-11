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

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import java.io.IOException;
import java.util.Set;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.execution.model.PatientList;
import com.cognitive.cds.invocation.fhir.FhirClient;
import com.cognitive.cds.invocation.mongo.PatientListDao;

/**
 * 
 * @author jgoodnough
 *
 */
public class PatientListFetcher implements SubjectFetcherIface {

    private static final Logger logger = LoggerFactory
            .getLogger(PatientListFetcher.class);

    private String subjectListServerURL;

    private PatientListDao patientLookup;
    
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

    /**
     * Create a WebClient session per given authentication attributes.
     * 
     * @param authBean
     * @return
     * @throws IOException
     */
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

    @Override
    public void fetchSubject(String listId, Set<String> ids) throws Exception {

        if (patientLookup != null) {

            logger.debug("Fetching list " + listId + " using PatientListDao: "
                    + patientLookup);

            PatientList patientList = patientLookup.loadPatientList(listId);

            if (patientList != null) {

                // Process the results
                String[] patients = patientList.getPatients();
                if (patients != null) {
                    logger.debug("list = " + listId + ", length = "
                            + patients.length);
                    for (int i = 0; i < patients.length; i++) {
                        ids.add(patients[i]);
                    }
                }
            } else {
                logger.debug("Patient lookup returned null for list = "
                        + listId);
            }
            return;
        }

        // if no DAO, do it the old way...

        WebClient client1 = this.getClient();

        logger.debug("Fetching list " + listId + " from "
                + subjectListServerURL);

        // We allow Id to be simple (and we assume name, or qualified by query
        // parameter (e.g. name or id)

        String idType = "name";
        if (listId.contains(":")) {
            String[] elements = listId.split(":");

            idType = elements[0];
            listId = elements[1];
        }
        client1.reset();

        Response res = client1.path(subjectListServerURL).path("list")
                .query(idType, listId).accept(MediaType.APPLICATION_JSON).get();

        if (res.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
            // String test = res.readEntity(String.class);
            // logger.info(test);

            // String entry = res.readEntity(String.class);
            // logger.debug(entry);

            // Deserialize the Result
            PatientListWrapper plw = res.readEntity(PatientListWrapper.class);

            // Process the results
            String[] patients = plw.getPayload().getPatients();
            if (patients != null) {
                logger.debug("list = " + listId + ", length = "
                        + patients.length);
                if (patients.length > 0) {
                    for (int i = 0; i < patients.length; i++) {
                        ids.add(patients[i]);
                    }
                }
            } else {
                logger.debug("Null list of patients for list = " + listId);
            }

        } else {
            String msg = res.readEntity(String.class);
            String msgOut = "Failed to Load the Patient List - Http Status Code "
                    + res.getStatus() + " - " + msg;
            logger.warn(msgOut);
            throw new SubjectDataFetchException(msgOut);

        }

    }


    /**
     * @return the subjectListServerURL
     */
    public String getSubjectListServerURL() {
        return subjectListServerURL;
    }


    /**
     * @param subjectListServerURL
     *            the subjectListServerURL to set
     */
    public void setSubjectListServerURL(String subjectListServerURL) {

        if (subjectListServerURL.endsWith("/")) {
            subjectListServerURL = subjectListServerURL.substring(0,
                    subjectListServerURL.length() - 1);
        }

        this.subjectListServerURL = subjectListServerURL;
    }

    /**
     * @return the patientListDao
     */
    public PatientListDao getPatientLookup() {
        return patientLookup;
    }

    /**
     * @param patientListDao
     *            the patientListDao to set
     */
    public void setPatientLookup(PatientListDao patientListDao) {
        this.patientLookup = patientListDao;
    }

}
