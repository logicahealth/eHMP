/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.invocation;

import java.util.List;
import java.util.Map;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.exceptions.DataValidationException;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;

/**
 * Interface used to build a data model.
 * 
 * @author jgoodnough
 *
 */
public interface DataModelHandlerIFace {
	
	/**
	 * Build a data model based 
	 * 
	 * @param queries
	 * @param ctx
	 * @param parameters
	 * @param dataModel
	 * @return A Data Model
	 * @throws DataRetrievalException
	 * 
	 * Todo:
	 * 
	 * 1) Investigate changing the return contract from String to an Object or Serializable
	 * 2) Change the input data model to an Object or Serializable
	 */
	public String buildDataModel(InvocationMode mode, List<String> queries,Context ctx, Map<String, Object> parameters, Object dataModel, boolean validate) throws DataRetrievalException, DataValidationException; 

	/**
	 * Translate a list of results
	 * 
	 * @param results
	 * @param resultBundleOut
	 */
	public void translateResults(List<Result> results, ResultBundle resultBundleOut);
}
