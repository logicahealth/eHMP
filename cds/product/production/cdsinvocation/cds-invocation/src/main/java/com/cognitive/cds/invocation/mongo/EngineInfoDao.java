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
import java.util.ArrayList;
import java.util.HashMap;

import org.bson.Document;
import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.model.EngineInfo;
import com.cognitive.cds.invocation.model.EngineInstanceState;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.FindOneAndReplaceOptions;

/**
 *
 * @author Dan Williams
 *
 */
public class EngineInfoDao {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EngineInfoDao.class);

	private boolean cacheEngines;       // Any life time for cache?
	private MongoDbDao mongoDbDao;
	private ObjectMapper mapper = new ObjectMapper();

	public MongoDbDao getMongoDbDao() {
		return mongoDbDao;
	}

	public void setMongoDbDao(MongoDbDao mongoDbDao) {
		this.mongoDbDao = mongoDbDao;
	}

	public boolean isCacheEngines() {
		return cacheEngines;
	}

	public void setCacheEngines(boolean cacheEngines) {
		this.cacheEngines = cacheEngines;
	}

	private HashMap<String, EngineInfo> cache = new HashMap<String, EngineInfo>();

	public EngineInfo lookupEngine(String name) {

		EngineInfo engine = null;
		if (cache.containsKey(name)) {
			engine = cache.get(name);
		} else {
			engine = fetchEngine(name);
			if (cacheEngines == true && engine != null) {
				cache.put(name, engine);
			}
		}
		return engine;
	}

	/**
	 * Call the server to fetch the engine
	 *
	 * @param name
	 * @return
	 */
	protected EngineInfo fetchEngine(String name) {
		EngineInfo engine = null;

		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("engine");
		} catch (CDSDBConnectionException e1) {
			logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
			return engine;
		}
		MongoCollection<Document> collection = database.getCollection("engines");
		logger.info("Engines Count: " + collection.count());

		Document filter = new Document();
		filter.put("name", name);
		Document eng = collection.find(filter).first();

		if (eng != null) {
			try {
				String json = eng.toJson();
				engine = (EngineInfo) JsonUtils.getMapper().readValue(json, EngineInfo.class);
				engine.setId(engine.get_id().toHexString());

			} catch (IOException e) {
				logger.error("========> Deserialize: " + e.toString(),e);
			}
		}
		return engine;
	}

	public String createEngine(EngineInfo engineInfo) throws JsonProcessingException {

		try {
			MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("engine");
			ObjectId id = new ObjectId();
			String json = mapper.writeValueAsString(engineInfo);
			Document doc = Document.parse(json);
			doc.put("_id", id);
			database.getCollection("engines").insertOne(doc);

			return id.toHexString();

		} catch (Exception e) {
			logger.error("=======> intentMapping Insert Exception: " + e.toString(),e);
		}
		return null;
	}

	public boolean updateEngineInstanceState(EngineInstanceState engineInstanceState) 
			throws JsonProcessingException {

		try {
			MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("engine");
			String json = mapper.writeValueAsString(engineInstanceState);
			logger.debug("=====> engineInstanceState json to write: " + json);
			Document filter = new Document();
			filter.put("name", engineInstanceState.getName());
			filter.put("type", engineInstanceState.getType());
			filter.put("host", engineInstanceState.getHost());
			filter.put("port", engineInstanceState.getPort());
			Document doc = Document.parse(json);
			FindOneAndReplaceOptions options = new FindOneAndReplaceOptions();
			options.upsert(true);
			doc.remove("_id");
			database.getCollection("instance").findOneAndReplace(filter, doc, options);
			logger.debug("=====> engineInstanceState " + doc.toJson());
			return true;

		} catch (Exception e) {
			logger.error("=======> EngineInstanceState - Insert/Update Exception EngineInstanceState: " + e.toString(),e);
			return false;
		}
	}

	public ArrayList<EngineInstanceState> getActiveEngines(String type) {

		ArrayList<EngineInstanceState> engines = new ArrayList<EngineInstanceState>();
		MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("engine");
		} catch (CDSDBConnectionException e1) {
			logger.error("=======> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
			return engines;
		}
		MongoCollection<Document> collection = database.getCollection("instance");
		logger.debug("Total engine instance count: " + collection.count());

		Document filter = new Document();
		filter.put("type", type);
		filter.put("status", true);
		FindIterable<Document> actives = collection.find(filter);
		for (Document document : actives) {
			try {
				String json = document.toJson();
				EngineInstanceState eng = (EngineInstanceState) JsonUtils.getMapper().readValue(json, EngineInstanceState.class);
				engines.add(eng);
			} catch (Exception e) {
				logger.error("=======> EngineState - intentMapping Insert Exception EngineState: " + e.toString(),e);
			}
		}
		logger.debug("Total active engine instance count: " + engines.size() + " of type: " + type);
		return engines;
	}

}
