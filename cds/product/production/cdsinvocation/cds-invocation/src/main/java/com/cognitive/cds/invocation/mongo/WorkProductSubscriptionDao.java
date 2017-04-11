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
package com.cognitive.cds.invocation.mongo;

import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductSubscription;
import com.cognitive.cds.invocation.workproduct.model.WorkProductWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

import java.io.IOException;

import org.bson.Document;
import org.bson.types.ObjectId;

/**
 *
 * @author Jeremy Fox
 */
public class WorkProductSubscriptionDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EngineInfoDao.class);

    private boolean cacheWorkProducts;
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

        mongoDbDao.setDatabase("work");
        MongoCollection<Document> collection = mongoDbDao.getCollection("subscriptions");
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
                logger.error("========> Deserialize: " + e.toString());
            }
        } // else {
          // return defaulted response, or simply return null, which means
          // "all".
        // }
        return wps;
    }

    public String insertWorkProductSubscription(WorkProductSubscription wps) throws JsonProcessingException {

        mongoDbDao.setDatabase("work");
        ObjectMapper mapper = new ObjectMapper();

        try {
            ObjectId id = new ObjectId();
            String objectJson = JsonUtils.getMapper().writeValueAsString(wps);
            Document doc = Document.parse(objectJson);
            doc.put("_id", new ObjectId(id.toHexString()));
            mongoDbDao.getCollection("subscriptions").insertOne(doc);

            return id.toHexString();

        } catch (Exception e) {
            logger.error("=======> WorkProductSubscription Insert Exception: " + e.toString());
        }

        return null;
    }

    public String deleteWorkProductSubscription(WorkProductSubscription wps) throws JsonProcessingException {

        mongoDbDao.setDatabase("work");
        MongoClient mongo = mongoDbDao.getMongoClient();
        MongoDatabase db = mongo.getDatabase("work");
        MongoCollection<Document> collection = db.getCollection("subscriptions");

        BasicDBObject query = new BasicDBObject();
        query.append("user", wps.getUser());

        DeleteResult result = collection.deleteOne(query);

        return result.toString();
    }

}
