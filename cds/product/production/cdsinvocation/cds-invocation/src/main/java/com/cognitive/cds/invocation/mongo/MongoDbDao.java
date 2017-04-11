package com.cognitive.cds.invocation.mongo;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.bson.Document;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

/**
 * A data access object which allows access to MongoDB
 * 
 * @author sschechter
 */
public class MongoDbDao {

	private MongoDatabase mongoDb;
	private String dbName;
    MongoClient mongoClient;
	private static Logger logger = Logger.getLogger(MongoDbDao.class.getName());

	public MongoDbDao(String mongoDbUrl) {
			MongoClientURI connectionString = new MongoClientURI(
					mongoDbUrl);
			mongoClient = new MongoClient(connectionString);
	}

    /**
     * Sets name and gets the database
     * 
     * @param dbName name of database to connect to
     */
    public void setDatabase(String dbName) {
        this.dbName = dbName;
        this.mongoDb = mongoClient.getDatabase(dbName);
    }

	/**
     * @return the dbName
     */
    public String getDbName() {
        return dbName;
    }

    /**
	 * Gets a Mongo collection. It is up to the caller to
	 * 
	 * @param collectionName
	 *            The name of the collection to return
	 * @return
	 */
	public MongoCollection<Document> getCollection(String collectionName) {
		return mongoDb.getCollection(collectionName);
	}

	/**
	 * Gets a Mongo collection as a list and automatically deserializes the
	 * result into the calling type Please note that this function has not been
	 * sufficiently tested and may need to be modified for your needs
	 * 
	 * @param collectionName
	 *            The name of the collection
	 * @param type
	 *            The class type of the collection
	 * @return
	 */
	public List<Class<?>> getCollection(String collectionName, Class<?> type) {
		ArrayList<Class<?>> list = new ArrayList<Class<?>>();
		MongoCursor<Document> cursor = getCollection(collectionName).find().iterator();

		String json;
		ObjectMapper mapper = new ObjectMapper().configure(
				DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		// SimpleDateFormat format = new
		// SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		// mapper.setDateFormat(format);

		try {
			while (cursor.hasNext()) {
				json = cursor.next().toJson();
				System.out.println(json);
				Class<?> c = (Class<?>) mapper.readValue(json, type);
				list.add(c);
			}
		} catch (IOException e) {
			logger.log(Level.SEVERE, null, e);
		} finally {
			cursor.close();
		}
		return list;
	}

	/**
	 * A generic method for writing an object of any type to an existing
	 * collection Please note that this function has not been sufficiently
	 * tested and may need to be modified for your needs
	 * 
	 * @param collectionName
	 * @param object
	 * @return true if this method finished without any Exceptions
	 */
	public boolean writeObjectToCollection(String collectionName, Object object) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			String objectJson = mapper.writeValueAsString(object);
			logger.log(Level.FINEST, objectJson);
			Document mongoObject = Document.parse(objectJson);
			getCollection(collectionName).insertOne(mongoObject);
		} catch (IOException e) {
			logger.log(Level.SEVERE, null, e);
			return false;
		}
		return true;
	}

    public MongoClient getMongoClient() {
        return mongoClient;
    }

    public void setMongoClient(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
    }
	
	

//	/**
//	 * Ensures the client connection gets closed during garbage collection
//	 */
//	@Override
//	public void finalize() throws Throwable {
//		mongoClient.close();
//		super.finalize();
//	}
}
