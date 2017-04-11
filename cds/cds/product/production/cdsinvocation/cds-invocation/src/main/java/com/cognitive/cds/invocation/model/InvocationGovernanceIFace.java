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

import java.util.List;
import java.util.Properties;

public interface InvocationGovernanceIFace {

	/**
	 * Apply Governance policies to the Rules being executed. This provides a
	 * hook point were the list of rule to be run may be altered (Rules added,
	 * Altered, removed). Implementations of this interface are expected to uses
	 * the current context and invocation frame to dynamically build up the set
	 * of rules to rum. In addition it is the responsibility if this component
	 * to merge in any InvocationTarget Invocations if appropriate.
	 * 
	 * 
	 * This implementation if this interface are expected to resolve the final intent mapping based on context of the request. 
	 * 
	 * Some possible example implementations of this interface are:
	 * 
	 * 
	 * 
	 * @param mappings
	 * @param invocationTarget
	 * @param context
	 * @param parameters
	 * @return A List of the InvocationMappings to do
	 */
	List<InvocationMapping> apply(List<InvocationMapping> mappings, InvocationTarget invocationTarget,
			Context context, Properties parameters, String intent, IntentMapping mapping);

}
