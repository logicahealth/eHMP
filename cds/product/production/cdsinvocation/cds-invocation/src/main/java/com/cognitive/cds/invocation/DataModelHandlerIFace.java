package com.cognitive.cds.invocation;

import java.util.List;
import java.util.Properties;

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
	public String buildDataModel(InvocationMode mode, List<String> queries,Context ctx, Properties parameters, Object dataModel, boolean validate) throws DataRetrievalException, DataValidationException; 

	/**
	 * Translate a list of results
	 * 
	 * @param results
	 * @param resultBundleOut
	 */
	public void translateResults(List<Result> results, ResultBundle resultBundleOut);
}
