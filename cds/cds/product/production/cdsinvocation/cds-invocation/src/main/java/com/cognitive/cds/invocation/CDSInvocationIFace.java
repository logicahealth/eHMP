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

import java.util.List;
import java.util.Properties;

import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Future;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.ResultBundle;

/**
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:40 AM
 */
public interface CDSInvocationIFace {

	/**
	 * Invoking reasoning.
	 * 
	 * This method is used to request reasoning is a particular context for a
	 * set of purposes. The actual binding of rules are executed, the data used,
	 * and the engines invoked is directly related to the nature of the request.
	 * 
	 * The determination of what rules and data are used is a combination of the
	 * reasons for invoking the reasoning and the context in which that
	 * reasoning is occurring.
	 * 
	 * Core to understanding how what reasoning is invoked is the notion of
	 * intent, which is used to abstract away from the exact binding of the
	 * reasoning to occur and focus on why the caller is using the service.
	 *
	 * So let us take the example of medication order validation. The intent of
	 * the reasoning evaluate if a purposed medication order. Rather then
	 * specifically call out explicitly all the rules required to verify the
	 * order, an intent called "MedicationOrderReview" is defined and used by
	 * the caller to make this required. The caller would then provide the
	 * purposed Order as a parameter, the invocation target would include the
	 * intent of "MediciationOrderReview", and the Context would provide the
	 * requesting provider and the subject for which the order is being placed
	 * as well as other specialty and location information as required. When
	 * this request for reasoning is received the intent
	 * ("MedicationOrderReview") resolved local configuration and repository to
	 * determine the data and execution requirements of that intent.
	 * 
	 * The resolution of a specific intent will result in one more Invocation
	 * Mappings. These mapping represent particular reasoning providers and data
	 * and required rules to execute in that context.
	 * 
	 * So to go back to our example a request for "MediciationOrderReview" might
	 * result in reasoning being directed to multiple source - One a check for
	 * Drug/Drug interactions provided by a third party service, Other being
	 * directed to a local rules engine to check the drug against the patients
	 * allergies and conditions, and a third source might be a inventory and
	 * financial reasoning system that would provide advice about costing and
	 * availability.
	 * 
	 * The principle of the interface is to attempt to simplify the callers
	 * requirements and handle the complexity in the actual implementations of
	 * this interface.
	 * 
	 * 
	 * In general there are three basic calling patterns
	 * 
	 *    Simple invocation that relies of the Queries embedded in the intent, Normalized data is used and action are base on static and run time configuration.
	 *    
	 *    Invocation that uses Raw mode to push all responsibility to the caller including direct knowledge of the configured implementation
	 *    
	 *    Invocation that passes parameters/input data and adds tp query based data models to call parameterized based reasoning
	 * 
	 * @param invocationTarget
	 *            The Invocation Target is used to determine the core reasoning
	 *            being requested
	 * @param context
	 *            The context provides the environment in which the reasoning is
	 *            occurring
	 * @param parameters
	 *            The parameters provide input to parameterized reasoning. Might also be used in guiding context and data queries
	 * @param dataModel
	 *            The data model define the data used for reasoning (in addition
	 *            to data queries embedded in the the intent)
	 */
	public ResultBundle invoke(InvocationTarget invocationTarget, Context context, Properties parameters,
			Object dataModel);

	/**
	 * Support optional
	 */
	public Future invokeDeferred();

	public ResultBundle retrieveResults();

	public void getAvailableRules();

	public void introduceData();

	/**
	 * Helper function to send metrics to the collection chain - Exposed so that
	 * the calling context may report other metrics to the same sources
	 * 
	 * @param metrics
	 */
	public void sendMetricsToCollectors(List<CallMetrics> metrics);
}
