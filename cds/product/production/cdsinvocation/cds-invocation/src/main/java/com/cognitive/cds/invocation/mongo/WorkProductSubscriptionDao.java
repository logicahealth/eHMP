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
package com.cognitive.cds.invocation.mongo;

import java.io.IOException;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.invocation.workproduct.model.WorkProductSubscription;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.mongodb.BasicDBObject;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

/**
 *
 * @author Jeremy Fox
 */
public class WorkProductSubscriptionDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EngineInfoDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    /**
     * Call the server to fetch the engine
     * 
     * @param user
     * @return
     */
    public WorkProductSubscription getWorkProductSubscription(String user) {
        WorkProductSubscription wps = null;

        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("work");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return wps;
		}
        MongoCollection<Document> collection = database.getCollection("subscriptions");
        logger.info("Subscription Count: " + collection.count()); // max of one
                                                                  // per user...
        Document filter = new Document();
        filter.put("user", user);
        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                wps = (WorkProductSubscription) JsonUtils.getMapper().readValue(json, WorkProductSubscription.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        } // else {
          // return defaulted response, or simply return null, which means
          // "all".
        // }
        return wps;
    }

    public String insertWorkProductSubscription(WorkProductSubscription wps) throws JsonProcessingException {
        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("work");
            ObjectId id = new ObjectId();
            String objectJson = JsonUtils.getMapper().writeValueAsString(wps);
            Document doc = Document.parse(objectJson);
            doc.put("_id", new ObjectId(id.toHexString()));
            database.getCollection("subscriptions").insertOne(doc);

            return id.toHexString();

        } catch (Exception e) {
            logger.error("=======> WorkProductSubscription Insert Exception: " + e.toString(),e);
        }

        return null;
    }

    public String deleteWorkProductSubscription(WorkProductSubscription wps) throws JsonProcessingException {
    	DeleteResult result = DeleteResult.unacknowledged();
    	
    	try {
    		MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("work");
    		MongoCollection<Document> collection = database.getCollection("subscriptions");

    		BasicDBObject query = new BasicDBObject();
    		query.append("user", wps.getUser());

    		result = collection.deleteOne(query);
    	} catch (CDSDBConnectionException e) {
            logger.error("=======> WorkProductSubscription Delete Exception: " + e.toString(),e);
    	}

    	return result.toString();
    }

}
