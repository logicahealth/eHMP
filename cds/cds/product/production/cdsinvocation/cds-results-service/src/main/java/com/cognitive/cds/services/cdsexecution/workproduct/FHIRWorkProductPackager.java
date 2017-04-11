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
package com.cognitive.cds.services.cdsexecution.workproduct;

import java.util.Date;
import java.util.Map;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.parser.IParser;

import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.workproduct.model.Payload;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.services.cdsexecution.workproduct.producers.FHIRWorkProductProducerIFace;

/**
 * Handle Json based FHIR artifacts
 * @author jgoodnough
 *
 */
public class FHIRWorkProductPackager implements WorkProductPackagerIFace {

	private static IParser fhirJsonParser;
	private static FhirContext hapiFhirCtx;

	/**
	 * Initialize FHIR parser
	 */
	static
	{
	    hapiFhirCtx = new FhirContext();
	    //Use DSTU2
	    hapiFhirCtx = FhirContext.forDstu2();
	    fhirJsonParser = hapiFhirCtx.newJsonParser();
	}

	private Map<String,FHIRWorkProductProducerIFace> handlerMap;
	@Override
	public WorkProduct convertToWorkProduct(Result result, Context ctx, int idInBundle) {
		// Ok the body of each work product
		WorkProduct wpOut = null;
		if (handlerMap.containsKey(result.getType()))
		{
			wpOut = new WorkProduct();
			wpOut.setGenerationDate(new Date(System.currentTimeMillis()));

			Object fhirJson = result.getBody();
			//Encode the FHIR Resource and add as payload
			wpOut.getPayload().add(new Payload("FHIR-"+result.getType(),fhirJson));
			//Deserialzie the FHIR Resource
			IResource rsc = (IResource)fhirJson;
			FHIRWorkProductProducerIFace handler = handlerMap.get(result.getType());
			if (handler.handleWorkProduct(result, wpOut, rsc, ctx, idInBundle) == false)
			{
				//Ok we have an error
			}
		}
		return wpOut;
	}
	
	public Map<String, FHIRWorkProductProducerIFace> getHandlerMap() {
		return handlerMap;
	}
	
	public void setHandlerMap(Map<String, FHIRWorkProductProducerIFace> handlerMap) {
		this.handlerMap = handlerMap;
	}
}
