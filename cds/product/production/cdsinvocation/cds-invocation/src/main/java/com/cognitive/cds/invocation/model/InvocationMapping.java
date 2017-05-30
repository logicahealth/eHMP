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

/**
 * The Invocation Mapping is used to define a linked set of invocations to a specific engine that map rely on a common set of data.
 * For the purposes of failure a single invocation mapping can be considered a single unit in terms of data requirements.
 * 
 * @author Jerry Goodnough
 */
import java.util.List;

import org.springframework.beans.factory.annotation.Required;

import com.cognitive.cds.invocation.execution.model.Prerequisite;

public class InvocationMapping extends Base {

	private static String defaultDataFormat = "application/json+fhir";

	private String dataFormat;
	private List<String> dataQueries;
	private List<Prerequisite> prerequisites;
	
	private Boolean crsResolverRequired;

    private String engineName;

    private String name;
	private List<Rule> rules;
	private boolean validateDataModel = false;
	public InvocationMapping() {

	}
	/**
	 * The data format that this mapping uses. This is a an optional element
	 * that is assumed either be transparent in Raw mode or the Normalized model
	 * otherwise.
	 * 
	 * @return the dataFormat
	 */
	public String getDataFormat() {
		if (dataFormat == null) {
			return defaultDataFormat;
		}
		return dataFormat;
	}

	/**
	 * The list of precompiled data queries that are used the DataModelHandler
	 * to load the data required to execute this invocation.
	 * 
	 * @see com.cognitive.cds.invocation.DataModelHandlerIFace
	 * @return the dataQueries
	 */
	public List<String> getDataQueries() {
		return dataQueries;
	}

	/**
	 * The name of the engine which handles this invocation. This name binds to
	 * a specific engine plug-in type which may represent one or more reasoning
	 * engines depending on the implementation and configuration of the specific
	 * engine.
	 * 
	 * @return the engineName
	 */
	public String getEngineName() {
		return engineName;
	}

	/**
	 * An Optional Name for the mapping
	 * 
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 * A List of Rules to invoke.
	 * 
	 * @return the rule to use
	 */
	public List<Rule> getRules() {
		return rules;
	}

	/**
	 * Determines if data model validation should be run on this invocation
	 * @return true if data model validation should run.
	 */
	public boolean isValidateDataModel() {
        return validateDataModel;
    }

	/**
	 * Optional data format - Assumed normative is not present
	 * 
	 * @param dataFormat
	 *            the dataFormat to set
	 */
	public void setDataFormat(String dataFormat) {
		this.dataFormat = dataFormat;
	}

	/**
	 * Optional list of data queries to be made
	 * 
	 * @param dataQueries
	 *            the dataQueries to set
	 */
	public void setDataQueries(List<String> dataQueries) {
		this.dataQueries = dataQueries;
	}

	/**
	 * The Engine name to use.
	 * 
	 * @param engineName
	 *            the engineName to use.
	 */
	@Required
	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}

	/**
	 * An optional name for this mapping
	 * 
	 * @param name
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * The rules to run for this Mapping
	 * 
	 * @param rules
	 *            the rules to use
	 */
	@Required
	public void setRules(List<Rule> rules) {
		this.rules = rules;
	}
	/**
	 * Enable of Disable data model validation
	 * @param validateDataModel
	 */

	public void setValidateDataModel(boolean validateDataModel) {
        this.validateDataModel = validateDataModel;
    }
	
	public List<Prerequisite> getPrerequisites() {
		return prerequisites;
	}
	public void setPrerequisites(List<Prerequisite> prerequisites) {
		this.prerequisites = prerequisites;
	}
	public Boolean getCrsResolverRequired() {
		return crsResolverRequired;
	}
	public void setCrsResolverRequired(Boolean crsResolverRequired) {
		this.crsResolverRequired = crsResolverRequired;
	}
	
}
