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
package com.cognitive.cds.invocation.model;

import java.util.Properties;

/**
 * Definition af a specific rule - Generally each engine type will use the
 * properties to map the expected rule behavior and the specific engines plugins
 * should document their specific property requirements
 * 
 * For example the openCDS Engine use the following properties
 * 
 *  KEY_RULE_SCOPING_ENTITY_ID  = "scopingEntityId";
 *  KEY_RULE_BUSINESS_ID  = "businessId";
 *  KEY_RULE_VERSION  = "version";
 *  KEY_INFO_MODEL_VERSION = "INFO_MODEL_VERSION";
 *  KEY_INFO_MODEL_BUSINESS_ID ="INFO_MODEL_BUSINESS_ID";
 *  KEY_INFO_MODEL_ENTITY_ID ="INFO_MODEL_ENTITY_ID";
 *
 *	
 * @author jgoodnough
 *
 * Todo:  
 * 1) Update the documentation here to provide better examples and a table representation.
 */
public class Rule extends Base {
	private Properties properties;
	private String id;

	public Properties getProperties() {
		return properties;
	}

	public void setProperties(Properties properties) {
		this.properties = properties;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

}
