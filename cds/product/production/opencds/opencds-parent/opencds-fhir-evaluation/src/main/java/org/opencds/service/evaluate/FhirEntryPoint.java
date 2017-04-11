/**
 * Copyright 2011, 2012 OpenCDS.org
 *	Licensed under the Apache License, Version 2.0 (the "License");
 *	you may not use this file except in compliance with the License.
 *	You may obtain a copy of the License at
 *
 *		http://www.apache.org/licenses/LICENSE-2.0
 *
 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 *	
 */

package org.opencds.service.evaluate;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.config.api.ss.EntryPoint;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.Bundle;
import ca.uhn.fhir.parser.IParser;

/**
 * @author Tadesse Sefer
 * @author Jerry Goodnough
 *
 */
public class FhirEntryPoint implements EntryPoint<Bundle>, Cloneable {

	private static Log log = LogFactory.getLog(FhirEntryPoint.class);
	
	private final FhirContext ctx;
	
	public FhirEntryPoint() {
	    ctx = new FhirContext();
	}
    
	@Override
	public Bundle buildInput(String inputPayloadString) {
		log.debug("starting fhirInboundPayloadProcessor");
		Bundle  bundle = null;

		try {
			IParser jsonParser = ctx.newJsonParser();
			bundle = jsonParser.parseBundle(inputPayloadString);
			
		} catch (Exception e) {
			log.error("Error unmarshalling",e);
			System.out.println(e.getMessage());
			e.printStackTrace();
			throw new OpenCDSRuntimeException(e.getMessage(), e);	
		}
		
		log.debug("finished FhirInboundPayloadProcessor");
		
		return bundle;
	}

}
