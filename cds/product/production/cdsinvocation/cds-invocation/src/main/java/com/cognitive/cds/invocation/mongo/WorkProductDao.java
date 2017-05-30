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
import java.util.Iterator;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductAssignment;
import com.cognitive.cds.invocation.workproduct.model.WorkProductWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;

/**
 *
 * @author Jeremy Fox
 */
public class WorkProductDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WorkProductDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    public String saveWorkProduct(WorkProduct workProduct) throws JsonProcessingException {

        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("work");
            ObjectId id = new ObjectId();

            workProduct.setId(id.toHexString()); // same id as the wrapper class

            WorkProductWrapper wpw = new WorkProductWrapper();
            wpw.setWorkproduct(workProduct);

            String objectJson = JsonUtils.getMapper().writeValueAsString(wpw);

            logger.info("=====> WorkProductWrapper json to write: " + objectJson);
            Document doc = Document.parse(objectJson);
            doc.put("_id", new ObjectId(id.toHexString()));
            database.getCollection("work").insertOne(doc);

            return id.toHexString();

        } catch (Exception e) {
            logger.error("=======> WorkProduct Insert Exception: " + e.toString(),e);
        }

        return null;

    }

    public WorkProductWrapper getWorkProduct(String id) {
        WorkProductWrapper wpw = null;

        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("work");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return wpw;
		}
        MongoCollection<Document> collection = database.getCollection("work");

        Document filter = new Document();
        filter.put("_id", new ObjectId(id));

        Document obj = collection.find(filter).first();

        if (obj != null) {
            try {
                String json = obj.toJson();
                wpw = (WorkProductWrapper) JsonUtils.getMapper().readValue(json, WorkProductWrapper.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return wpw;
    }

    public boolean insertAssignment(WorkProductAssignment workProductAssignment) throws JsonProcessingException {

        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("work");
            ObjectMapper mapper = new ObjectMapper();

            ObjectId id = new ObjectId(workProductAssignment.getWorkProductId());

            logger.info("=====> insertAssignment " + id.toHexString());

            String objectJson = mapper.writeValueAsString(workProductAssignment);
            logger.info("=====> WorkProductWrapper json to write: " + objectJson);
            Document assignmentDoc = Document.parse(objectJson);

            DBObject listItem = new BasicDBObject("assignments", new BasicDBObject(assignmentDoc));

            BasicDBObject query = new BasicDBObject("_id", id);
            BasicDBObject update = new BasicDBObject("$push", listItem);

            Document response = database.getCollection("work").findOneAndUpdate(query, update);
            if (response != null)
                return true;
            else
                return false;
        } catch (Exception e) {
            logger.error("=======> WorkProduct Assignment Exception: " + e.toString(),e);
        }
        return false;
    }

    public DeleteResult deleteWorkProduct(String id) throws JsonProcessingException {
    	DeleteResult result = DeleteResult.unacknowledged();
    	try {
    		MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("work");
    		MongoCollection<Document> collection = database.getCollection("work");

    		BasicDBObject query = new BasicDBObject();
    		query.append("_id", new ObjectId(id));

    		result = collection.deleteOne(query);
    	} catch (CDSDBConnectionException e) {
    		// TODO Auto-generated catch block
    		e.printStackTrace();
    	}
    	return result;
    }

    public UpdateResult updateWorkProduct(WorkProduct wp) throws JsonProcessingException {
        UpdateResult result = null;
        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("work");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return result;
		}
        MongoCollection<Document> collection = database.getCollection("work");

        Document filter = new Document();
        if(wp.getId() == null)
         return null;
        else
            filter.put("_id", new ObjectId(wp.getId()));

        Document obj = collection.find(filter).first();

        if (obj != null) {
            try {
                String objectJson = JsonUtils.getMapper().writeValueAsString(wp);
                Document doc = Document.parse(objectJson);
                result = collection.updateOne(filter, new Document("$set", new Document("workproduct", doc)));
               
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return result;
    }
    /*
     * This method updates an existing work product assignment. Looks for the work product id and user id and replaces it with the new assignment.
     * @param wpa is the new work product assignment to be assigned to the work product id.
     */
    public UpdateResult updateWorkProductAssignment(WorkProductAssignment wpa) throws JsonProcessingException {
        UpdateResult result = null;

        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("work");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return result;
		}
        MongoCollection<Document> collection = database.getCollection("work");
        WorkProductWrapper wpw;
        Document filter = new Document();
        if(wpa.getUser() == null)
            return null;
        else
            filter.put("_id", new ObjectId(wpa.getWorkProductId()));

        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                wpw = (WorkProductWrapper) JsonUtils.getMapper().readValue(json, WorkProductWrapper.class);
                Iterator<WorkProductAssignment> iterator = wpw.getAssignments().iterator();
                // remove if there is an existing work product assignment with the same user id and work product id.
                while ( iterator.hasNext()) {
                    WorkProductAssignment workProductAssignment = (WorkProductAssignment) iterator.next();
                    if( workProductAssignment.getUser().getId().equalsIgnoreCase(wpa.getUser().getId()) && 
                        workProductAssignment.getWorkProductId().equalsIgnoreCase(wpa.getWorkProductId())){
                        iterator.remove();
                    }
                }
                // add the new work product assignment
                wpw.getAssignments().add(wpa);
                String objectJson = JsonUtils.getMapper().writeValueAsString(wpw);
                Document doc = Document.parse(objectJson);
                doc.put("_id", new ObjectId(wpa.getWorkProductId()));
                result = database.getCollection("work").replaceOne(filter, doc);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return result;
    }
    /*
     * This method deletes an existing work product assignment
     * @param workProductId is the work product id assigned to the user/provider
     * @param  userId is the provider id this work product is assigned to
     * @returns UpdateResult object if it was deleted or null if it's not
     */
    public UpdateResult deleteWorkProductAssignment(String workProductId, String userId) {
        UpdateResult result = null;
      
        WorkProductWrapper wpw;
        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("work");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return result;
		}
        MongoCollection<Document> collection = database.getCollection("work");

        Document filter = new Document();
        filter.put("_id", new ObjectId(workProductId));

        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                wpw = (WorkProductWrapper) JsonUtils.getMapper().readValue(json, WorkProductWrapper.class);
                Iterator<WorkProductAssignment> iterator = wpw.getAssignments().iterator();
                while ( iterator.hasNext()) {
                    WorkProductAssignment workProductAssignment = (WorkProductAssignment) iterator.next();
                    // find the assignment and remove it from the workproduct assignments list
                    if( workProductAssignment.getUser().getId().equalsIgnoreCase(userId) && 
                        workProductAssignment.getWorkProductId().equalsIgnoreCase(workProductId)){
                        iterator.remove();
                    }
                }
                String objectJson = JsonUtils.getMapper().writeValueAsString(wpw);
                Document doc = Document.parse(objectJson);
                doc.put("_id", new ObjectId(workProductId));
                // Update the work product.
                result = database.getCollection("work").replaceOne(filter, doc);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return result;
    }
}
