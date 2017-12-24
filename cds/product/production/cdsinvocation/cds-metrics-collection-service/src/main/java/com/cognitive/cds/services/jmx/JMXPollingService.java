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
package com.cognitive.cds.services.jmx;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import com.cognitive.cds.invocation.model.EngineInstanceState;
import com.cognitive.cds.invocation.mongo.EngineInfoDao;
import com.cognitive.cds.invocation.mongo.MongoDbDao;
import com.cognitive.cds.services.metrics.model.Observation;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoDatabase;

/**
 * Basic JMX Polling Service to pull metric data on an interval from another
 * system.
 * 
 * @author jfox
 */
@Component
public class JMXPollingService {
	
    private static final Logger LOGGER = LoggerFactory.getLogger(JMXPollingService.class);
    
	@Autowired
	private TaskScheduler taskScheduler;
    
    //The only engine type we're currently working with is OpenCDS.
    private static final String ENGINE_TYPE = "OpenCDS";
	
	private int port = PORT;
	private long period = 60000; // 1 minute in ms
	private MongoDbDao mongoDbDao;
	private EngineInfoDao engineInfoDao;
	
	private boolean dynamicRegistryEnabled = true;
	//mapping the dynamically configured engines by name to their scheduled future objects
	private ConcurrentHashMap<String, ScheduledFuture<?>> engineMap = new ConcurrentHashMap<String, ScheduledFuture<?>>();
	
	private  ArrayList<EngineInstanceState> hardwiredEngines = new ArrayList<EngineInstanceState>();
	
	public MongoDbDao getMongoDbDao() {
		return mongoDbDao;
	}

	public void setMongoDbDao(MongoDbDao mongoDbDao) {
		this.mongoDbDao = mongoDbDao;
	}
	
	public EngineInfoDao getEngineInfoDao() {
		return engineInfoDao;
	}

	public void setEngineInfoDao(EngineInfoDao engineInfoDao) {
		this.engineInfoDao = engineInfoDao;
	}
	
	public void setPort(int port) {
		this.port = port;
	}
	
	public void setDynamicRegistryEnabled(boolean dynamicRegistryEnabled) {
		this.dynamicRegistryEnabled = dynamicRegistryEnabled;
	}
	
	public void setEngines(ArrayList<EngineInstanceState> hardwiredEngines) {
		this.hardwiredEngines = hardwiredEngines;
	}
	
	public void setPeriod(int period) {
		this.period = period;
	}
	
	@PostConstruct
	public void init() throws Exception {
		
		LOGGER.info("JMXPollingService.init()");
		
		//first, init any manually configured pollers (if there are any)
		if(hardwiredEngines.size() > 0) {
			for (EngineInstanceState eis : hardwiredEngines) {
				LOGGER.info("adding poller for engine: " + eis.getName());;
				//not tracking the ScheduledFuture for these as we would need a restart to remove them anyways.
				taskScheduler.scheduleWithFixedDelay(new JMXPoller(eis.getHost(), eis.getName()), period);
			}
		}
		
		ArrayList<EngineInstanceState> instances = new ArrayList<EngineInstanceState>();
		if(dynamicRegistryEnabled) {
			instances.addAll(engineInfoDao.getActiveEngines(ENGINE_TYPE));
			LOGGER.info("dynamically configured instances to be polled: " + instances.size());
			
			//begin new engine check process
			taskScheduler.scheduleAtFixedRate(new Runnable() {
			    @Override
			    public void run() {
			    	updateEngineList();
			    }
			}, new Date(System.currentTimeMillis() + period), period);
			//end new engine check
			
		} else {
			LOGGER.info("dynamic engine registry polling is disabled");
		}
		
		for (EngineInstanceState eis : instances) {
			LOGGER.info("Adding Poller for engine name: " + eis.getName() + " at " + eis.getHost() + ":" + eis.getPort());
			ScheduledFuture<?> sf = taskScheduler.scheduleWithFixedDelay(new JMXPoller(eis.getHost(), eis.getName()), period);
			engineMap.put(eis.getName(), sf);
		}

		if(instances.size() == 0) {
			LOGGER.info("No configured engine instances were found for JMX Poller.");
		}
	}
	
	/**
	 * FUTURE:
	 * This is quick, but inelegant way to check for new engine instances.  This
	 * should be revisited and probably put into a centralized place in the future.
	 */
	public void updateEngineList() {
		
		LOGGER.info("Checking for new engine instances.");
		ArrayList<EngineInstanceState> updatedInstances = engineInfoDao.getActiveEngines(ENGINE_TYPE);
		//next, lets map these by name to make it easier to work with below...
		HashMap<String, EngineInstanceState> updatedEngineMap = new HashMap<String, EngineInstanceState>();		
		for (EngineInstanceState updatedInstance : updatedInstances) {
			updatedEngineMap.put(updatedInstance.getName(), updatedInstance);
		}
		
		for (String key : engineMap.keySet()) {
			if(updatedEngineMap.containsKey(key)) {
				//we have one for this engine already here...remove it from the list so we can see what's left.
				updatedEngineMap.remove(key);
			} else {
				//it's not on the list anymore.  Stop the poller and remove the entry.
				LOGGER.info("removing poller for engine: " + key);
				engineMap.get(key).cancel(true); //true means 'interrupt if running'.
				engineMap.remove(key);
			}
		}
		//add any that we were missing.
		for (String key : updatedEngineMap.keySet()) {
			LOGGER.info("adding poller for: " + key);
			
			ScheduledFuture<?> sf = taskScheduler.scheduleWithFixedDelay(new JMXPoller(updatedEngineMap.get(key).getHost(), updatedEngineMap.get(key).getName()), period);
			engineMap.put(key, sf);
		}

	}
	
	@PreDestroy
	public void cleanUp() throws Exception {
		LOGGER.info("JMXPollingService.cleanUp()");
	}
	
	private class JMXPoller implements Runnable {

		private JMXConnector jmxConnector;
		private JMXServiceURL serviceUrl;
		private MBeanServerConnection mbeanServerConn;
		
		private String host;
		private String origin;
		
		public JMXPoller(String host, String origin) {
			this.host = host;
			this.origin = origin;
		}
			    
		@Override
	    public void run() {
	    	
	    	try {
				serviceUrl = new JMXServiceURL("service:jmx:rmi:///jndi/rmi://" + host + ":" + port + "/jmxrmi");
				jmxConnector = JMXConnectorFactory.connect(serviceUrl, null);
				mbeanServerConn = jmxConnector.getMBeanServerConnection();
				
				Set<ObjectName> objectName = mbeanServerConn.queryNames(new ObjectName("org.drools.kbases:*"),null );

				Long sessionCount = 0L;
			    Iterator<ObjectName> iterator = objectName.iterator();
			    if(iterator.hasNext()) {
			    	ObjectName setElement = iterator.next();
			    	sessionCount = (Long)mbeanServerConn.getAttribute(setElement, "SessionCount");
			    	LOGGER.debug("SessionCount: " + sessionCount);
			    } else {
			    	LOGGER.debug("Nothing to log - is the Drools MBean enabled?");
			    }
				
			    Observation observation = new Observation();
			    observation.setName("SessionCount");
			    observation.setValue(sessionCount.doubleValue());
			    observation.setTime(new Timestamp(new Date().getTime()));
			    observation.setOrigin(origin);
				
				writeToMetricsDb(observation);
			
			} catch(Exception e) {
				LOGGER.warn("Error Retrieving Metrics via JMX : " + e.getMessage());
			} finally {
				if (jmxConnector != null) {
					try {
						jmxConnector.close();
					} catch (IOException ioe) {
						//not really important...
					}
					jmxConnector = null;
				}
			}
	    }
	}

	/**
	 * This is currently a duplication of what's in MetricsCollectionService.
	 * This method can be refactored into an appropriate place to share between
	 * both classes in the future.
	 * 
	 * @param metric
	 * @throws IOException
	 * @throws JsonMappingException
	 * @throws JsonGenerationException
	 */
    public void writeToMetricsDb(Observation observation) 
            throws IOException, JsonMappingException, JsonGenerationException
    {
        //--------------------------------------
        // parse Object to Json, 
        // then can send to metric DB
        //--------------------------------------
        ObjectMapper mapper = new ObjectMapper();
        String toSend = mapper.writeValueAsString(observation);
        
        LOGGER.info("==========> JMXPollingService.writeToMetricsDb: " + mongoDbDao);
        LOGGER.info("Observation and Origin: " + observation.getName() + " from " + observation.getOrigin());;
        
		try {
			Document callMetricBson = Document.parse(toSend);
			MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("metric");
			database.getCollection("observation").insertOne(callMetricBson);
		} catch (Exception e) {
	        LOGGER.info("==========> JMXPollingService.error: " + e.getLocalizedMessage(),e);
		}
    }
    
}
