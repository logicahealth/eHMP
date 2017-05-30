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
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.cxf.jaxrs.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

public class EngineAgent {

	private static final Logger logger = LoggerFactory.getLogger(EngineAgent.class);

	@Autowired
	private ApplicationEventPublisher publisher;

	private Message message;
	private WebClient jsonWebClient;

	/**
	 * @return the message
	 */
	public Message getMessage() {
		return message;
	}

	/**
	 * @param message the message to set
	 */
	public void setMessage(Message message) {
		this.message = message;
	}

	/**
	 * @return the jsonWebClient
	 */
	public WebClient getJsonWebClient() {
		return jsonWebClient;
	}

	/**
	 * @param jsonWebClient the jsonWebClient to set
	 */
	public void setJsonWebClient(WebClient jsonWebClient) {
		this.jsonWebClient = jsonWebClient;
	}

	@PostConstruct
	protected void attemptEngineRegistration() {

		logger.info("attempting to register engine instance.");
		try {
			//Interestingly enough, this needs both of these to be set.
			jsonWebClient.accept(MediaType.APPLICATION_JSON_TYPE).type(MediaType.APPLICATION_JSON_TYPE);
			message.setStatus(true); // just set as 'active' for now...
			Response response = jsonWebClient.put(message);

			if (response.getStatus() == 200 || response.getStatus() == 201) {
				logger.info("engine registration successful - code: " + response.getStatus());
				publisher.publishEvent(new EngineAgentEvent(this, "success status: " + response.getStatus(), null));
			} else {
				logger.info("engine registration not successful - code: " + response.getStatus());
				publisher.publishEvent(new EngineAgentEvent(this, null, "error status: " + response.getStatus()));
			}
		} catch (Exception e) {
			logger.error("an exception occurred during registration attempt" + e.getLocalizedMessage());
			publisher.publishEvent(new EngineAgentEvent(this, null, "error: " + e.getLocalizedMessage()));
		}
	}

	@PreDestroy
	public void attemptEngineDeregistration() {
		//FUTURE:  determine whether we should update the record or fully delete
		logger.info("attempting to de-register engine instance.");
		try {
			jsonWebClient.accept(MediaType.APPLICATION_JSON_TYPE).type(MediaType.APPLICATION_JSON_TYPE);
			message.setStatus(false); // just set as 'inactive'...
			Response response = jsonWebClient.put(message);

			if (response.getStatus() == 200 || response.getStatus() == 201) {
				logger.info("engine de-registration successful - " + "code: " + response.getStatus());
				publisher.publishEvent(new EngineAgentEvent(this, "success status: " + response.getStatus(), null));
			} else {
				logger.info("engine de-registration not successful - code: " + response.getStatus());
				/* 
				 no events need to be published here as the system as if
				 we are here, the system is shutting down whether we like it
				 or not.  This is just an attempt at gracefully 
				 de-registering this instance.
				 */
			}
		} catch (Exception e) {
			logger.error("an exception occurred during de-registration attempt" + e.getLocalizedMessage());
			/* 
			 no events need to be published here as the system as if
			 we are here, the system is shutting down whether we like it
			 or not.  This is just an attempt at gracefully 
			 de-registering this instance.
			 */
		}
	}
}
