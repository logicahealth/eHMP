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
package com.cognitive.cds.invocation.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.InvocationType;

/**
 * This class captures the intent of the invocation. This includes the rules
 * being invoked, the mode of operation (e.g. RAW, Normal etc), the type of
 * invocation, and other execution related concepts.
 * 
 * The set of intents are in effect the purpose of the specific reasoning
 * request. Each intent will be bound at runtime to define the set of queries
 * and rules to evaluate. Each intent is assume to be evaluated separately and
 * may involving reasoning that occurs across multiple engine types.
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 */
public class InvocationTarget extends Base {

	/**
	 * Allows the caller to request detailed validation of the data models being used.
	 */
	public boolean dataModelValidationEnabled = false;

	/**
	 * The List of Intents (Names of a IntentMapping objects)
	 */
	public List<String> intentsSet = new ArrayList<>();

    /**
	 * The Mode of data handling during execution
	 * 
	 * @see InvocationMode
	 */
	public InvocationMode mode = InvocationMode.Normal;
	/**
	 * This is the time at which the rules engines should consider the reasoning
	 * as happening. If null then the invocation is occurring in realtime.
	 */
	public Date perceivedExecutionTime;

	/**
	 * The Type of Invocation
	 * 
	 * @see InvocationType
	 */
	public InvocationType type = InvocationType.Direct;

	/**
	 * A List of supplemental Invocations that should be applied to all intents
	 * 
	 * @see InvocationMapping
	 */
	private List<InvocationMapping> supplementalMappings;

	/**
	 * Base Constructor
	 */
	public InvocationTarget() {

	}

	public List<String> getIntentsSet() {
		return intentsSet;
	}

	/**
	 * Get the invocation data handling mode
	 * 
	 * @see InvocationMode
	 * @return The Invocation Mode
	 */
	public InvocationMode getMode() {
		return mode;
	}

	/**
	 * The time at which the rules evaluation should be perceived as occurring.
	 * If null then the invocation is occurring in realtime.
	 * 
	 * @return The time at which the rules evaluation should be perceived as
	 *         occurring.
	 */
	public Date getPerceivedExecutionTime() {
		return perceivedExecutionTime;
	}

	/**
	 * Returns the supplemental invocations to add to the base intents This list
	 * is used too assign additional rules to be run. These rules are run for
	 * each intent.
	 * 
	 * @return the supplementalMappings
	 */
	public List<InvocationMapping> getSupplementalMappings() {
		return supplementalMappings;
	}

	/**
	 * The Type of invocation
	 * 
	 * @see InvocationType
	 * @return
	 */
	public InvocationType getType() {
		return type;
	}
	
	/**
	 * Is data model validation requested?
	 * 
	 * @return true if data model validation shoul;d be used
	 */

	public boolean isDataModelValidationEnabled() {
        return dataModelValidationEnabled;
    }

	/**
	 * Allows data model validation to be requested. 
	 * @param dataModelValidationEnabled True if data model validation is requested
	 */
	public void setDataModelValidationEnabled(boolean dataModelValidationEnabled) {
        this.dataModelValidationEnabled = dataModelValidationEnabled;
    }

	/**
	 * Set the List of intents
	 * 
	 * @param intentsSet
	 */
	public void setIntentsSet(List<String> intentsSet) {
		this.intentsSet = intentsSet;
	}

	/**
	 * Set the Data Handing Mode
	 * 
	 * @param newVal
	 */
	public void setMode(InvocationMode newVal) {
		mode = newVal;
	}

	/**
	 * Set a time at which the rules evaluation should be perceived as
	 * occurring.
	 * 
	 * @param perceivedExecutionTime
	 */
	public void setPerceivedExecutionTime(Date perceivedExecutionTime) {
		this.perceivedExecutionTime = perceivedExecutionTime;
	}
    /**
	 * Set Supplemental Mappings that should occur on every intent. This is used
	 * to provide an external escape mechanism to add additional rules for
	 * processing.
	 * 
	 * @param supplementalMappings
	 *            the supplementalMappings to set
	 */
	public void setSupplementalMappings(List<InvocationMapping> supplementalMappings) {
		this.supplementalMappings = supplementalMappings;
	}

    /**
	 * Set the Invocation Type
	 * 
	 * @see InvocationType
	 * @param type
	 */
	public void setType(InvocationType type) {
		this.type = type;
	}

}
