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
package com.cognitive.cds.engine.agent;

import com.cognitive.cds.engine.agent.event.EngineAgentEvent;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

/**
 *
 * @author jeremy
 */
@Component
public class EngineAgentEventListener implements ApplicationListener<EngineAgentEvent> {

	private static final Logger logger = LoggerFactory.getLogger(EngineAgentEventListener.class);

	//defaulting to 3 minutes to keep things simple.
	private int retryTime = 180000;

	@Autowired
	private TaskScheduler taskScheduler;
	@Autowired
	private EngineAgent engineAgent;

	@Override
	public void onApplicationEvent(EngineAgentEvent event) {

		EngineAgentEvent engineAgentEvent = (EngineAgentEvent) event;

		if (engineAgentEvent.getSuccessMessage() != null) {
			logger.info("engine agent success event received: " + engineAgentEvent.getSuccessMessage());
		}

		if (engineAgentEvent.getErrorMessage() != null) {
			//schedule retry...
			logger.info("engine agent error event receieved - attempting to " + "schedule retry.");

			Runnable task = new Runnable() {
				public void run() {
					logger.info("attempting scheduled event registration retry...");
					engineAgent.attemptEngineRegistration();
				}
			};
			//try again in 3 minutes...
			taskScheduler.schedule(task, new Date(System.currentTimeMillis() + getRetryTime()));

		}

	}

	/**
	 * @return the retryTime
	 */
	public int getRetryTime() {
		return retryTime;
	}

	/**
	 * @param retryTime the retryTime to set
	 */
	public void setRetryTime(int retryTime) {
		this.retryTime = retryTime;
	}

}
