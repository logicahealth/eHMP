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
package com.cognitive.cds.invocation;

import com.cognitive.cds.invocation.model.EngineInstanceState;
import com.cognitive.cds.invocation.mongo.EngineInfoDao;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author jeremy
 */
public class EngineInstanceStateManager implements EngineInstanceStateManagementIFace {

	private static final Logger logger = LoggerFactory.getLogger(EngineInstanceStateManager.class);
	private EngineInfoDao engineInfoDao;

	@Override
	public List<EngineInstanceState> getActiveEngineInstancesByType(String type) {
		List<EngineInstanceState> activeEngines = engineInfoDao.getActiveEngines(type);
		return activeEngines;
	}

	@Override
	public boolean updateEngineInstanceState(EngineInstanceState engineInstanceState) {

		try {
			return engineInfoDao.updateEngineInstanceState(engineInstanceState);
		} catch (JsonProcessingException ex) {
			logger.error("JsonProcessingException updating engine instance state.", ex);
			return false;
		}
	}

	/**
	 * @return the engineInfoDao
	 */
	public EngineInfoDao getEngineInfoDao() {
		return this.engineInfoDao;
	}

	/**
	 * @param engineInfoDao the engineInfoDao to set
	 */
	public void setEngineInfoDao(EngineInfoDao engineInfoDao) {
		this.engineInfoDao = engineInfoDao;
	}

}
