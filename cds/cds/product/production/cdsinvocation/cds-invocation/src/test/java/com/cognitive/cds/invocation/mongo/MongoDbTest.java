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

import org.bson.Document;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

/**
 * These are Integration tests. You can uncomment these tests to verify locally,
 * but do not leave active as a bootstrapping issue may cause them to fail.
 * 
 * @author sschechter
 *
 */
public class MongoDbTest {

	private MongoCollection<Document> collection;
	private static ApplicationContext context;
	private static MongoDbDao mongoDbDao;
	private static final Logger LOGGER = LoggerFactory.getLogger(MongoDbTest.class);

	
	@BeforeClass
	public static void beforeClass() {
		try {
			context = new ClassPathXmlApplicationContext("classpath:mongodb-dao-context.xml");
			mongoDbDao = (MongoDbDao)context.getBean("mongoDbDao");
		} catch (Exception e) {
			LOGGER.error("Error loading connection properties.  Cannot connect to MongoDB");
		}
	}

	// Commenting the main test case out due to bootstrapping issue. This test
	// needs to be run after Mongo has been seeded
//	@Test
	public void testConnection() throws CDSDBConnectionException {

		// Definitions are hard coded. A value should always be present
		 MongoDatabase mongodb = mongoDbDao.getMongoClient().getDatabase("metric");
		 MongoCollection<Document> collection = mongodb.getCollection("definitions");

		LOGGER.info("Definitions Count: " + collection.count());

		// A collection of size 0 means the Mongo instance in this environment
		// has not been seeded correctly
		Assert.assertTrue(collection.count() > 0);
	}

	// @Test
	public void testObservationAndCallMetricsCount() throws CDSDBConnectionException {

		// Definitions are hard coded. A value should always be present
		MongoDatabase mongodb = mongoDbDao.getMongoClient().getDatabase("metric");
		MongoCollection<Document> collection = mongodb.getCollection("observation");

		LOGGER.info("Observation Count: " + collection.count());

		// A collection of size 0 means the Mongo instance in this environment
		// has not been seeded correctly
		Assert.assertTrue(collection.count() > 0);

		collection = mongodb.getCollection("callMetric");

		// logger.log(Level.INFO, "CallMetric Count: " + collection.count());

		collection = mongodb.getCollection("metrics");

		LOGGER.info("metrics Count: " + collection.count());
	}

	// @Test
	// Comment this out for now because it creates groups without deleteing them
	public void testCreateGroup() throws CDSDBConnectionException {
		MongoDatabase mongodb = mongoDbDao.getMongoClient().getDatabase("metric");
		collection = mongodb.getCollection("groups");

		MongoCursor<Document> cursor = collection.find().iterator();
		try {
			while (cursor.hasNext()) {
				System.out.println(cursor.next().toJson());
			}
		} finally {
			cursor.close();
		}

		long count = collection.count();
		String group = "{\"name\": \"Mongo Group Test\",\"description\": \"Create Group Test\",\"metricList\": [\"SessionCount\",\"Execution_Begin\",\"Summary_HandlingResults\",\"Summary_TotalResults\"]}";

		Document d = Document.parse(group);

		collection.insertOne(d);
		collection = mongodb.getCollection("groups");

		Assert.assertTrue(collection.count() == count + 1);

		// BsonObjectId objectId = new BsonObjectId(value);
		// for(Document d : collection.find().iterator()){
		// System.err.println(d.get("name"));
		// System.err.println(d.get("description"));
		// }
	}
}
