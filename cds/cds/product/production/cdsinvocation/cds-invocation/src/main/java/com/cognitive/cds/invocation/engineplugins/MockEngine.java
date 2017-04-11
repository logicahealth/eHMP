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
package com.cognitive.cds.invocation.engineplugins;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;

import org.springframework.core.io.Resource;

import com.cognitive.cds.invocation.CDSEnginePlugInIFace;
import com.cognitive.cds.invocation.EngineInstanceStateManagementIFace;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.model.StatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This Mock engine class is used to simulate the calling of a rules processing engine. It is mainly useful for test
 * scenarios.
 *
 * @author Jerry Goodnough
 *
 */
public class MockEngine implements CDSEnginePlugInIFace {

	private static final Logger logger = LoggerFactory.getLogger(MockEngine.class);

	/**
	 * This engine rule property may be used to set the time that a specific rule idles to simulate processing time. The
	 * unit used is milliseconds.
	 */
	public static String PROPERTY_DELAY = "delay";
	public static String RULE_ID = "id";

	private final String type = "MockEngine";

	private ResultBuilderIFace baseBundleBuilder;

	private ResultBundle baseBundle;

	private Map<String, Resource> resultsMap;

	public MockEngine() {
		baseBundle = new ResultBundle();
	}

	public ResultBuilderIFace getBaseBundleBuilder() {
		return baseBundleBuilder;
	}

	public void setBaseBundleBuilder(ResultBuilderIFace baseBundleBuilder) {
		this.baseBundleBuilder = baseBundleBuilder;
	}

	public void setBaseBundle(ResultBundle baseBundle) {
		this.baseBundle = baseBundle;
	}

	@PostConstruct
	public void init() {
		if (baseBundleBuilder != null) {
			baseBundle = baseBundleBuilder.build();
		}
	}

	@Override
	public ResultBundle invoke(List<Rule> rules, String data, String callId,
		EngineInstanceStateManagementIFace eism) {

		logger.debug("in invoke(...)");

		ResultBundle out = new ResultBundle();
		if (resultsMap != null && !resultsMap.isEmpty()) {
			ArrayList<Resource> resultResources = new ArrayList<>();
			for (Iterator<Rule> iterator = rules.iterator(); iterator.hasNext();) {
				Rule rule = iterator.next();
				if (resultsMap.containsKey(rule.getId())) {
					resultResources.add(resultsMap.get(rule.getId()));
				}
			}

		}

        // Ok now we use the baseBundle or the List.
		// We do a straight reference copy of the fault information
		if (baseBundle.getFaultInfo() != null) {
			out.setFaultInfo(baseBundle.getFaultInfo());
		} else {
			out.setFaultInfo(new LinkedList<FaultInfo>());
		}

		// Likewise we do a straight copy of the status
		if (baseBundle.getStatus() != null) {
			out.setStatus(baseBundle.getStatus());
		} else {
			StatusCode status = StatusCode.SUCCESS;
			out.setStatus(status);
		}

		// For the results we to copy each one and update the callId
		LinkedList<Result> results = new LinkedList<Result>();
		Iterator<Result> itrResult = baseBundle.getResults().listIterator();
		while (itrResult.hasNext()) {
			Result newResult = new Result(itrResult.next());
			newResult.setCallId(callId);
			results.add(newResult);
		}
		out.setResults(results);

		// Now we need to lookup the Rules and see if any delays are required
		Iterator<Rule> itrRule = rules.iterator();
		while (itrRule.hasNext()) {
			Rule rule = itrRule.next();
			String delay = rule.getProperties().getProperty("delay");
			if (delay != null) {
				try {
					long sleepTime = Long.parseLong(delay);
					TimeUnit.MILLISECONDS.sleep(sleepTime);
				} catch (InterruptedException e) {
					// Handle exception
				}
			}
		}
		return out;
	}

	public Map<String, Resource> getResultsMap() {
		return resultsMap;
	}

	public void setResultsMap(Map<String, Resource> resultsMap) {
		this.resultsMap = resultsMap;
	}

	@Override
	public void introduceData() {

		// FUTURE - Implemention stub for data driven CDS - Contract will
	}

	/**
	 * @return the bundle
	 */
	public ResultBundle getBaseBundle() {
		return baseBundle;
	}

	/**
	 * @param bundle the bundle to set
	 */
	public void setResultBundle(ResultBundle bundle) {
		this.baseBundle = bundle;
	}

	@Override
	public ResultBundle invokeRaw(List<Rule> rules, Object data, String callId,
		EngineInstanceStateManagementIFace eism) {

		return this.invoke(rules, data.toString(), callId, eism);
	}

}
