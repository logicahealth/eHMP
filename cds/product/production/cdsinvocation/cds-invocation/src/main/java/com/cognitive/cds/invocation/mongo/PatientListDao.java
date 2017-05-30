/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.invocation.mongo;

import java.io.IOException;

import org.bson.Document;

import com.cognitive.cds.invocation.execution.model.PatientList;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class PatientListDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory
            .getLogger(PatientListDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    /**
     * Call to fetch the PatientList
     * 
     * @param name
     * @return
     */
    public PatientList loadPatientList(String name) {
        PatientList patientList = null;

        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("patientlist");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return patientList;
		}
        MongoCollection<Document> collection = database.getCollection("patientlist");
        logger.info("Patientlist Count: " + collection.count());
        Document filter = new Document();
        filter.put("name", name);
        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                patientList = (PatientList) JsonUtils.getMapper().readValue(json, PatientList.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return patientList;
    }

    /**
     * Save PatientList.
     * 
     * @param name
     * @param patientList
     */
    public void savePatientList(String name, PatientList patientList) {

        if (patientList.getName() == null || patientList.getName().isEmpty()) {
            patientList.setName(name);
        }
        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("patientlist");
            ObjectMapper mapper = new ObjectMapper();
            String objectJson = mapper.writeValueAsString(patientList);
            logger.info("=====> patientList json to write: " + objectJson);
            Document filter = new Document();
            filter.put("_id", new org.bson.types.ObjectId((String) patientList.get_id()));
            // filter.put("name", name);
            Document doc = Document.parse(objectJson);
            doc.remove("_id");
            database.getCollection("patientlist").findOneAndReplace(filter, doc);
        } catch (Exception e) {
            logger.error("=======> PatientList Update Exception: " + e.toString(),e);
        }
    }
    // /**
    // * Create the patientList.
    // *
    // * @param name
    // * @param patientList
    // */
    //
    // /**
    // * Delete the PatientList
    // *
    // * @param name
    // * @return
    // */
}
