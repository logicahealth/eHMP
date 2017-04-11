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
package com.cognitivemedicine.metricsservice.client;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.RdkTimeoutException;

/**
 * Unit test for simple App.
 */
public class MetricsServiceClientTest extends TestCase {
	private Logger logger = Logger.getLogger(MetricsServiceClient.class
			.getName());

	/**
	 * Create the test case
	 *
	 * @param testName
	 *            name of the test case
	 */
	public MetricsServiceClientTest(String testName) {
		super(testName);
	}

	/**
	 * @return the suite of tests being tested
	 */
	public static Test suite() {
		return new TestSuite(MetricsServiceClientTest.class);
	}

	public void testCrudDashboards() throws RdkTimeoutException {
		MetricsServiceClient client = new MetricsServiceClient(
				"http://localhost:8888/resource", "metrics");

		// TEST CREATE
		Dashboard newDashboard = new Dashboard();
		newDashboard.setDescription("Dashboard for unit test");
		newDashboard.setName("Test Dashboard");
		newDashboard.setUserId("testuser");

		newDashboard = client.createDashboard(newDashboard);

		assertTrue("No Id found for new definition", newDashboard != null
				&& newDashboard.get_id() != null
				&& newDashboard.get_id().length() > 0);

		// TEST RETRIEVE
		List<Dashboard> dashboards = client.getDashboards("testuser");

		assertTrue("defintion size is < 1",
				dashboards != null && dashboards.size() > 0);

		for (Dashboard m : dashboards) {
			if (m.get_id().equals(newDashboard.get_id())) {
				assertTrue(m.getName().equals(newDashboard.getName()));
				assertTrue(m.getDescription().equals(
						newDashboard.getDescription()));
				assertTrue(m.getUserId().equals(newDashboard.getUserId()));
			}
		}

		// TEST UPDATE
		newDashboard.setDescription("This is an updated description");
		String retVal = client.updateDashboard(newDashboard);
		logger.log(Level.INFO, "getMetricDefinitionsResponse: \n" + retVal);

		newDashboard = client.getDashboard(newDashboard.get_id());
		assertTrue(newDashboard.getDescription().equals(
				"This is an updated description"));

		// TEST DELETE
		String deleteStatus = client.deleteDashboard(newDashboard.get_id());
		logger.log(Level.INFO, "getMetricDefinitionsResponse: \n"
				+ deleteStatus);
		assertTrue(deleteStatus != null && deleteStatus.length() > 0);

		dashboards = client.getDashboards("testuser");

		boolean idFound = false;
		for (Dashboard m : dashboards) {
			if (m.get_id().equals(newDashboard.get_id())) {
				idFound = true;
				break;
			}
		}
		assertFalse("Dashboard Id found: dashboard was not properly deleted",
				idFound);
	}

	public void testCrudDefinition() throws RdkTimeoutException {
		MetricsServiceClient client = new MetricsServiceClient(
				"http://localhost:8888/resource", "metrics");

		// TEST CREATE
		Metric newDefinition = new Metric();
		newDefinition.setDescription("Definition for unit test");
		newDefinition.setName("Test Definition");
		newDefinition.setUpdateInterval(1000);

		newDefinition = client.createDefinition(newDefinition);

		assertTrue("No Id found for new definition", newDefinition != null
				&& newDefinition.get_id() != null
				&& newDefinition.get_id().length() > 0);

		// TEST RETRIEVE
		// newDefinition.set_id(newDefId);

		List<Metric> definitions = client.getMetricDefinitions();

		assertTrue("defintion size is < 1",
				definitions != null && definitions.size() > 0);

		for (Metric m : definitions) {
			if (m.get_id().equals(newDefinition.get_id())) {
				assertTrue(m.getName().equals(newDefinition.getName()));
				assertTrue(m.getDescription().equals(
						newDefinition.getDescription()));
			}
		}

		// TEST UPDATE

		// TEST DELETE
		String deleteStatus = client.deleteDefinition(newDefinition.get_id());
		logger.log(Level.INFO, "getMetricDefinitionsResponse: \n"
				+ deleteStatus);
		assertTrue(deleteStatus != null && deleteStatus.length() > 0);

		definitions = client.getMetricDefinitions();
		// assertTrue("defintion size is < 1", definitions != null &&
		// definitions.size() > 0);

		boolean idFound = false;
		for (Metric m : definitions) {
			if (m.get_id().equals(newDefinition.get_id())) {
				idFound = true;
				break;
			}
		}
		assertFalse("Definition Id found: definition was not properly deleted",
				idFound);
	}

	public void testCrudGroups() throws RdkTimeoutException {
		MetricsServiceClient client = new MetricsServiceClient(
				"http://localhost:8888/resource", "metrics");

		// TEST CREATE
		MetricGroup newGroup = new MetricGroup();
		newGroup.setDescription("Group for unit test");
		newGroup.setName("Test Group");

		newGroup = client.createMetricGroup(newGroup);

		assertTrue("No Id found for new definition", newGroup != null
				&& newGroup.get_id() != null && newGroup.get_id().length() > 0);

		// TEST RETRIEVE
		List<MetricGroup> groups = client.getMetricGroups();

		assertTrue("groups size is < 1", groups != null && groups.size() > 0);

		for (MetricGroup g : groups) {
			if (g.get_id().equals(newGroup.get_id())) {
				assertTrue(g.getName().equals(newGroup.getName()));
				assertTrue(g.getDescription().equals(newGroup.getDescription()));
			}
		}

		// TEST UPDATE - TODO not supported yet
		// newGroup.setDescription("This is an updated description");
		// String retVal = client.updateMetricGroup(newGroup);
		// logger.log(Level.INFO, "getMetricDefinitionsResponse: \n" + retVal);
		//
		// assertTrue(newGroup.getDescription().equals("This is an updated description"));

		// TEST DELETE
		String deleteStatus = client.deleteMetricGroup(newGroup.get_id());
		logger.log(Level.INFO, "getMetricDefinitionsResponse: \n"
				+ deleteStatus);
		assertTrue(deleteStatus != null && deleteStatus.length() > 0);

		groups = client.getMetricGroups();

		boolean idFound = false;
		for (MetricGroup m : groups) {
			if (m.get_id().equals(newGroup.get_id())) {
				idFound = true;
				break;
			}
		}
		assertFalse("Dashboard Id found: dashboard was not properly deleted",
				idFound);
	}

	// /**
	// */
	// public void testApp()
	// {
	// MetricsServiceClient client = new
	// MetricsServiceClient("http://localhost:8888/resource/metrics");
	// client.getRoles();
	// client.getUserRoles();
	// client.getMetricDefinitions();
	// client.getMetricGroups();
	// client.getDashboards();
	//
	// client.getDashboard("1");
	//
	// // client.deleteMetricGroup(metricGroupId)
	//
	// Metric metric = new Metric();
	//
	//
	// Dashboard dashboard = new Dashboard();
	// dashboard.setName("Scotts Dashboard");
	// dashboard.setCategory("It Metrics");
	// dashboard.setDescription("This is Scotts Dashboard");
	// dashboard.setUserId("1");
	//
	// dashboard = client.createDashboard(dashboard);
	// System.err.println("new Dash ID " + dashboard.get_id());
	// dashboard.setDescription("Scotts Updated Dashboard");
	//
	// client.updateDashboard(dashboard);
	//
	// client.deleteDashboard("1");
	//
	//
	// MetricGroup group = new MetricGroup();
	// group.setName("Scotts Group");
	// // group.setMetricList();
	// assertTrue( true );
	//
	//
	// }

}
