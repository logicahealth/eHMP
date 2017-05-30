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

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.cognitive.cds.invocation.engineplugins.MockEngine;
import com.cognitive.cds.invocation.model.EngineInfo;
import com.cognitive.cds.invocation.model.EngineInstanceState;

public class EngineInfoDaoTest {

    private static MongoDbDao mongoDbDao;
    private static EngineInfoDao engineInfoDao;
    private static final Logger LOGGER = LoggerFactory.getLogger(EngineInfoDaoTest.class);
   
    String engineName = "EngineOne";
    String engineType = "MockEngine";
    String engineName2 = "OpenCDSDb";
    String engineType2 = "OpenCDS";
    String engineHost = "IP      ";
    String enginePort = "8080";
    String engineHost2 = "99.99.99.99";
    String enginePort2 = "9999";

    @BeforeClass
    public static void beforeClass() {
	try {
	    ApplicationContext context = new ClassPathXmlApplicationContext(
		    "classpath:mongodb-dao-context.xml");
	    mongoDbDao = (MongoDbDao) context.getBean("mongoDbDao");
	    engineInfoDao = new EngineInfoDao();
	    engineInfoDao.setMongoDbDao(mongoDbDao);
	    engineInfoDao.setCacheEngines(false);
	} catch (Exception e) {
	    LOGGER.error("Error loading connection properties.  Cannot connect to MongoDB");
	}
    }

    @Ignore("a service integration test")
    @Test
    public void testFetchEngine() {

	EngineInfo engine = null;

	engine = engineInfoDao.lookupEngine(engineName);
	if (engine == null) {
	    try {
		EngineInfo engineInfo = createEngineInfo(engineName, engineType);
		engineInfoDao.createEngine(engineInfo);
		engine = engineInfoDao.lookupEngine(engineName);
	    } catch (Exception e) {
		// ignore errors on create
	    }
	}
	Assert.assertTrue(engine != null);
    }

    @Ignore("a service integration test")
    @Test
    public void testFetchEngine1() {

	EngineInfo engine = null;

	engine = engineInfoDao.lookupEngine(engineName2);
	if (engine == null) {
	    try {
		EngineInfo engineInfo = createEngineInfo(engineName2,
			engineType2);
		engineInfoDao.createEngine(engineInfo);
		engine = engineInfoDao.lookupEngine(engineName2);
	    } catch (Exception e) {
		// ignore errors on create
	    }
	}
	Assert.assertTrue(engine != null);
    }

    private EngineInfo createEngineInfo(String name, String type) {
	EngineInfo engineInfo = new EngineInfo();
	engineInfo.setName(name);
	engineInfo.setType(type);
	engineInfo.setEnvironment("Name: " + name + " type: " + type);
	engineInfo.setEngine(new MockEngine());
	return engineInfo;
    }

    private EngineInstanceState createEngineInstanceState(String name, String type, String host, String port) {
	EngineInstanceState engineState = new EngineInstanceState();
	engineState.setName(name);
	engineState.setType(type);
	engineState.setTime(new Timestamp(Calendar.getInstance().getTime().getTime()));
	engineState.setHost(host);
	engineState.setPort(port);
	engineState.setStatus(false);
	return engineState;
    }

    @Ignore("a service integration test")
    @Test
    public void testUpdateEngineInstanceState() {

        // Change dao to return the updated state?
	EngineInstanceState engineState = createEngineInstanceState(engineName, engineType, engineHost, enginePort);
	try {

	    // EngineOne, MockEngine, IP      , 8080, false
	    engineInfoDao.updateEngineInstanceState(engineState);

	    // EngineOne, OpenCDS, IP      , 8080, true
	    engineState.setStatus(true);
	    engineState.setType(engineType2);
	    engineInfoDao.updateEngineInstanceState(engineState);

	    // EngineOne, OpenCDS, 99.99.99.99, 8080, true
	    engineState.setHost(engineHost2);
	    engineInfoDao.updateEngineInstanceState(engineState);

	    // EngineOne, OpenCDS, IP      , 9999, false
	    engineState.setHost(engineHost);
	    engineState.setHost(enginePort2);
	    engineState.setStatus(false);
	    engineInfoDao.updateEngineInstanceState(engineState);

	    // OpenCDSDb, MockEngine, IP      , 9999, true
	    engineState.setType(engineType);
	    engineState.setHost(engineName2);
	    engineState.setHost(engineHost);
	    engineState.setHost(enginePort2);
	    engineState.setStatus(true);
	    engineInfoDao.updateEngineInstanceState(engineState);

	    Assert.assertTrue(true);
	} catch (Exception e) {
	    // ignore errors on create
	    Assert.assertTrue(false);
	}
    }

    @Ignore("a service integration test")
    @Test
    public void testgetActiveEngines() {

	// Change dao to return the updated state?
    ArrayList<EngineInstanceState> engines1 = null;
    ArrayList<EngineInstanceState> engines2 = null;
	try {
	    engines1 = engineInfoDao.getActiveEngines(engineType);
	    engines2 = engineInfoDao.getActiveEngines(engineType2);
	} catch (Exception e) {
	    // ignore errors on create
	    Assert.assertTrue(false);
	}
	Assert.assertTrue(engines1.size() == 1 && engines2.size() == 2);
    }
}
