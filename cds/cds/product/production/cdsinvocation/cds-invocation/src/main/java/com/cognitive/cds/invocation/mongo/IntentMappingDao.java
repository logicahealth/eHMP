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
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.Block;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

/**
 *
 * @author Tadesse Sefer
 */
public class IntentMappingDao {

	private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(IntentMappingDao.class);
	
	private static final String TABLE = "intent";
	private static final String COLLECTION = "cdsintent";

	private MongoDbDao mongoDbDao;
	private boolean deployDefaultIntents;

	public MongoDbDao getMongoDbDao() {
		return mongoDbDao;
	}

	public void setMongoDbDao(MongoDbDao mongoDbDao) {
		this.mongoDbDao = mongoDbDao;
	}

	public boolean isDeployDefaultIntents() {
		return deployDefaultIntents;
	}

	public void setDeployDefaultIntents(boolean deployDefaultIntents) {
		this.deployDefaultIntents = deployDefaultIntents;
	}


	public String createIntent(IntentMapping intentMapping) throws JsonProcessingException {
		ObjectMapper mapper = new ObjectMapper();
		try {
			MongoDatabase database = mongoDbDao.getMongoClient().getDatabase(TABLE);
			ObjectId id = new ObjectId();
			String json = mapper.writeValueAsString(intentMapping);
			Document doc = Document.parse(json);
			doc.put("_id", id);
			database.getCollection(COLLECTION).insertOne(doc);
			return id.toHexString();

		} catch (Exception e) {
			LOGGER.error("=======> intentMapping Insert Exception: " + e.toString(),e);
		}
		return null;
	}

	public IntentMapping getIntent(String intentName) {
		IntentMapping im = null;

		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase(TABLE);
		} catch (CDSDBConnectionException e1) {
			LOGGER.error("========> mongoDbDao.getMongoClient(): " + e1.toString(),e1);
			return im;
		}
		MongoCollection<Document> collection = database.getCollection(COLLECTION);

		Document filter = new Document();
		filter.put("name", intentName);

		Document document = collection.find(filter).first();

		if (document != null) {
			try {
				ObjectMapper mapper = new ObjectMapper();
				String json = document.toJson();
				im = mapper.readValue(json, IntentMapping.class);
			} catch (IOException e) {
				LOGGER.error("========> Deserialize: " + e.toString(),e);
			}
		}
		return im;
	}

	public List<IntentMapping> getAll() {
		List<IntentMapping> intentList = new ArrayList<>();
		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase(TABLE);
		} catch (CDSDBConnectionException e) {
			LOGGER.error("========> Error retrieving MongoDB connection: " + e.toString(),e);
			return intentList;
		}
		MongoCollection<Document> collection = database.getCollection(COLLECTION);
		ObjectMapper mapper = new ObjectMapper();
		collection.find().forEach( (Block<Document>) document -> {
			String json = document.toJson();
			try {
				IntentMapping im = mapper.readValue(json, IntentMapping.class);
				intentList.add(im);
			} catch (Exception e) {
				LOGGER.error("========> Error mapping Document : " + json,e);
			}
		});

		return intentList;
	}

	public DeleteResult deleteIntent(String intentName) {
		DeleteResult result = DeleteResult.unacknowledged(); //Default delete was unsuccessful
		try {
			MongoDatabase database = mongoDbDao.getMongoClient().getDatabase(TABLE);
			MongoCollection<Document> collection = database.getCollection(COLLECTION);

			BasicDBObject query = new BasicDBObject();
			query.append("name", intentName);

			result = collection.deleteOne(query);
		} catch (CDSDBConnectionException e) {
			LOGGER.error("========> Error retrieving MongoDB connection: " + e.toString(),e);
		}
		return result;
	}

	public Document updateIntentMapping(IntentMapping im) throws JsonProcessingException {
		Document result = null;
		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase(TABLE);
		} catch (CDSDBConnectionException e1) {
			LOGGER.error("========> getMongoClient().getDatabase: " + e1.toString(),e1);
			return result;
		}
		MongoCollection<Document> collection = database.getCollection(COLLECTION);

		Document filter = new Document();
		if (im.get_id() != null) {
			filter.put("_id", im.get_id());
		} else if (im.getId() != null && !im.getId().isEmpty()) {
			filter.put("_id", new ObjectId(im.getId()));
		} else {
			return null;
		}
		Document obj = collection.find(filter).first();

		if (obj != null) {
			try {
				ObjectMapper mapper = new ObjectMapper();
				String objectJson = mapper.writeValueAsString(im);
				Document doc = Document.parse(objectJson);
				doc.put("_id", im.get_id());

				result = collection.findOneAndReplace(filter, doc);

			} catch (IOException e) {
				LOGGER.error("========> Deserialize: " + e.toString());
			}
		}
		return result;
	}
	
	
	@PostConstruct
	public void init() throws URISyntaxException {
		LOGGER.debug("\n*****************\n\t Invoking PostConstruct on IntentMappingDao");
		if(deployDefaultIntents) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				URL intentsJson = getClass().getClassLoader().getResource("intents.json");
				LOGGER.debug("\n****************** intents.json - "+intentsJson.toURI().getPath()+"\n");
				InputStream is = getClass().getClassLoader().getResourceAsStream("intents.json");
				IntentMapping[] intents = mapper.readValue(is, IntentMapping[].class);

				MongoDatabase database = mongoDbDao.getMongoClient().getDatabase(TABLE);
				MongoCollection<Document> collection = database.getCollection(COLLECTION);

				for(IntentMapping intent : intents) {
					Document filter = new Document();
					// Intent unique id is the name
					filter.put("name", intent.getName());

					Document deployedIntent = collection.find(filter).first();
					if(deployedIntent==null) {
						intent.set_id(new ObjectId());
						String objectJson = mapper.writeValueAsString(intent);
						Document doc = Document.parse(objectJson);
						collection.insertOne(doc);
						LOGGER.debug("\n*****************\n\t Deploying default intent : "+intent.getName());
					}
				}
			} catch (IOException | CDSDBConnectionException e) {
				LOGGER.error("Failed to initialize intent!", e);;
			}
		}
	}
	

	public Map<String, String> healthCheck() {
		Map<String, String> intentMap = new HashMap<>();
		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase(TABLE);
		} catch (CDSDBConnectionException e) {
			LOGGER.error("========> Error retrieving MongoDB connection: " + e.getLocalizedMessage(),e);
			intentMap.put(e.getLocalizedMessage().replaceAll("\"", "\\\\\"").replaceAll("\\n", " "),"\"\"");
			return intentMap;
		}
		MongoCollection<Document> collection = database.getCollection(COLLECTION);
		ObjectMapper mapper = new ObjectMapper();
		collection.find().forEach( (Block<Document>) document -> {
			String json = document.toJson();
			try {
				IntentMapping im = mapper.readValue(json, IntentMapping.class);
				intentMap.put(im.getName(), json);
			} catch (Exception e) {
				LOGGER.error("========> Error mapping Document : " + json,e);
				intentMap.put(e.getLocalizedMessage().replaceAll("\"", "\\\\\"").replaceAll("\\n", " "),"\"\"");
			}
		});

		return intentMap;
	}

}
