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

import java.net.Socket;
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

	// ignore pool, make a new connection using given options
	public String healthCheck() throws CDSDBConnectionException {
		String error = null;
		MongoClient client = getMongoClient();
		try(Socket socket = client.getMongoClientOptions().getSocketFactory().createSocket();) {	
			socket.connect(client.getAddress().getSocketAddress(), 500);
		}
		catch(Exception e) {
			error = e.getLocalizedMessage();
		}
		return error;
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
