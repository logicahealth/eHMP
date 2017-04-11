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

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.model.IntentMapping;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

/**
 *
 * @author Tadesse Sefer
 */
public class IntentMappingDao {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(IntentMappingDao.class);

	private boolean cacheIntents; // Any life time for cache?
	private MongoDbDao mongoDbDao;
	private ObjectMapper mapper = new ObjectMapper();

	public MongoDbDao getMongoDbDao() {
		return mongoDbDao;
	}

	public void setMongoDbDao(MongoDbDao mongoDbDao) {
		this.mongoDbDao = mongoDbDao;
	}

	public boolean isCacheIntents() {
		return cacheIntents;
	}

	public void setCacheIntents(boolean cacheIntents) {
		this.cacheIntents = cacheIntents;
	}

	private HashMap<String, IntentMapping> cache = new HashMap<String, IntentMapping>();

	public String createIntent(IntentMapping intentMapping) throws JsonProcessingException {
		mongoDbDao.setDatabase("intent");
		try {
			ObjectId id = new ObjectId();
			String json = mapper.writeValueAsString(intentMapping);
			Document doc = Document.parse(json);
			doc.put("_id", id);
			mongoDbDao.getCollection("cdsintent").insertOne(doc);

			return id.toHexString();

		} catch (Exception e) {
			logger.error("=======> intentMapping Insert Exception: " + e.toString());
		}
		return null;
	}

	public IntentMapping getIntent(String intentName) {
		IntentMapping im = null;

		if (cache.containsKey(intentName)) {
			return cache.get(intentName);
		}

		mongoDbDao.setDatabase("intent");
		MongoCollection<Document> collection = mongoDbDao.getCollection("cdsintent");

		Document filter = new Document();
		filter.put("name", intentName);

		Document obj = collection.find(filter).first();

		if (obj != null) {
			try {
				String json = obj.toJson();
				im = mapper.readValue(json, IntentMapping.class);
				im.setId(im.get_id().toHexString());
			} catch (IOException e) {
				logger.error("========> Deserialize: " + e.toString());
			}
		}
		if (cacheIntents == true && im != null) {
			cache.put(intentName, im);
		}
		return im;
	}

	public List<IntentMapping> getAll() {
		List<IntentMapping> intentList = new ArrayList<IntentMapping>();
		mongoDbDao.setDatabase("intent");
		MongoCollection<Document> collection = mongoDbDao.getCollection("cdsintent");
		FindIterable<Document> docs = collection.find();
		for (Iterator iterator = docs.iterator(); iterator.hasNext();) {
			Document obj = (Document) iterator.next();
			try {
				String json = obj.toJson();
				IntentMapping im = mapper.readValue(json, IntentMapping.class);
				im.setId(im.get_id().toHexString());
				// we do not need the _id if we set id
				im.set_id(null);
				intentList.add(im);
				if (cacheIntents == true && im != null) {
					cache.put(im.getName(), im);
				}
			} catch (IOException e) {
				logger.error("========> Deserialize: " + e.toString());
			}
		}

		return intentList;
	}

	public DeleteResult deleteIntent(String intentName) throws JsonProcessingException {
		MongoClient mongo = mongoDbDao.getMongoClient();
		MongoDatabase db = mongo.getDatabase("intent");
		MongoCollection<Document> collection = db.getCollection("cdsintent");

		BasicDBObject query = new BasicDBObject();
		query.append("name", intentName);

		DeleteResult result = collection.deleteOne(query);
		return result;
	}

	public Document updateIntentMapping(IntentMapping im) throws JsonProcessingException {
		MongoClient mongo = mongoDbDao.getMongoClient();
		MongoDatabase db = mongo.getDatabase("intent");
		MongoCollection<Document> collection = db.getCollection("cdsintent");

		Document filter = new Document();
		if (im.get_id() != null) {
			filter.put("_id", im.get_id());
		} else if (im.getId() != null && !im.getId().isEmpty()) {
			filter.put("_id", new ObjectId(im.getId()));
		} else {
			return null;
		}
		Document obj = collection.find(filter).first();
		Document result = null;

		if (obj != null) {
			try {
				String objectJson = mapper.writeValueAsString(im);
				Document doc = Document.parse(objectJson);
				doc.put("_id", im.get_id());

				result = collection.findOneAndReplace(filter, doc);
				if (cache.containsKey(im.getName())) {
					cache.put(im.getName(), im);
				}

			} catch (IOException e) {
				logger.error("========> Deserialize: " + e.toString());
			}
		}
		return result;
	}

}
