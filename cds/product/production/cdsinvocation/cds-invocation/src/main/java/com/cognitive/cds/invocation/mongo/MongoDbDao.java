package com.cognitive.cds.invocation.mongo;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.MongoSocketOpenException;
import com.mongodb.ServerAddress;

/**
 * A data access object which allows access to MongoDB
 * 
 * @author sschechter
 */
public class MongoDbDao {

	private static final Logger LOG = LoggerFactory.getLogger(MongoDbDao.class);
	private static String mongo_host;
	private static int mongo_port;
	private static String mongo_username;
	private static String mongo_password;
	private static int mongo_connectionsPerHost;

	
    private static volatile MongoClient MONGOCLIENTPOOL;
    private static AtomicReference<String> LOCK = new AtomicReference<>();

    
	public MongoClient getMongoClient() throws CDSDBConnectionException {
		if(MONGOCLIENTPOOL==null) {
			synchronized(LOCK) {
				if(MONGOCLIENTPOOL==null) {
					initializeMongoClientPool();
				}
			}
		}
		return MONGOCLIENTPOOL;
	}
	
	private void initializeMongoClientPool() throws CDSDBConnectionException {
		MongoClientOptions options = MongoClientOptions.builder()
										.sslEnabled(true)
										.sslInvalidHostNameAllowed(true)
										.connectionsPerHost(mongo_connectionsPerHost)
										.build();
		ServerAddress serverAddress = new ServerAddress(mongo_host,mongo_port);
		// This version of Mongo 3.0.6 is using by default ScramSha1
		MongoCredential credential = MongoCredential.createScramSha1Credential(mongo_username, "admin", mongo_password.toCharArray());
		List<MongoCredential> credentials = Arrays.asList(new MongoCredential[]{credential});
		try {
			MONGOCLIENTPOOL = new MongoClient(serverAddress,credentials,options);
		}
		catch(MongoSocketOpenException e) {
			MONGOCLIENTPOOL.close();
			MONGOCLIENTPOOL = null;
			LOG.error(e.getLocalizedMessage(),e);
			throw new CDSDBConnectionException(e);
		}
	}

	
	
	/***********************************/
	/**** SETTERS **********************/
	public static void setMongo_host(String mongo_host) {
		MongoDbDao.mongo_host = mongo_host;
	}

	public static void setMongo_port(String mongo_port) {
		MongoDbDao.mongo_port = Integer.parseInt(mongo_port);
	}

	public static void setMongo_username(String mongo_username) {
		MongoDbDao.mongo_username = mongo_username;
	}

	public static void setMongo_password(String mongo_password) {
		MongoDbDao.mongo_password = mongo_password;
	}

	public static void setMongo_connectionsPerHost(String mongo_connectionsPerHost) {
		MongoDbDao.mongo_connectionsPerHost = Integer.parseInt(mongo_connectionsPerHost);
	}
}
