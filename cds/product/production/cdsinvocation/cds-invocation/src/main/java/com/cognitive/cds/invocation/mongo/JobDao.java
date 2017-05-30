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

import com.cognitive.cds.invocation.execution.model.Job;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class JobDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory
            .getLogger(JobDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    /**
     * Call to fetch the Job info from the db
     * 
     * @param name
     * @return
     */
    public Job loadJobInfo(String name) {
        Job job = null;
        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("schedule");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase(: " + e1.toString(),e1);
            return job;
		}
        MongoCollection<Document> collection = database.getCollection("cdsjobs");
        logger.info("Job Count: " + collection.count());
        Document filter = new Document();
        filter.put("name", name);
        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                job = (Job) JsonUtils.getMapper().readValue(json, Job.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return job;
    }

    //
    // /**
    // * Delete the job
    // *
    // * @param jobId
    // * @return
    // */
    /**
     * Save job info up to Job server.
     * 
     * @param jobId
     * @param job
     */
    public void saveJobInfo(String jobId, Job job) {

        if (job.getName() == null || job.getName().isEmpty()) {
            job.setName(jobId);
        }
        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("schedule");
            ObjectMapper mapper = new ObjectMapper();
            String objectJson = mapper.writeValueAsString(job);
            logger.info("=====> Job json to write: " + objectJson);
            Document filter = new Document();
            filter.put("_id",
                    new org.bson.types.ObjectId((String) job.get_id()));
            // filter.put("name", jobId);
            Document doc = Document.parse(objectJson);
            doc.remove("_id");
            database.getCollection("cdsjobs").findOneAndReplace(filter, doc);
        } catch (Exception e) {
            logger.error("=======> Job Update Exception: " + e.toString(),e);
        }
    }
    //
    // /**
    // * Create the job per jobId.
    // *
    // * @param jobId
    // * @param job
    // */
}
