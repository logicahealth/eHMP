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
package com.cognitive.cds.invocation.fhir;

import java.io.IOException;

import ca.uhn.fhir.model.api.IResource;

import com.cognitive.cds.invocation.util.FhirUtils;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;


public class IResourceSerializer extends JsonSerializer<IResource> {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(IResourceSerializer.class);

    
    @Override
    public Class<IResource> handledType() {
        return IResource.class;
    }
    
    @Override
    public void serialize(IResource value, JsonGenerator jgen, SerializerProvider provider)
        throws IOException, JsonProcessingException 
    {
        logger.info("IN IResourceSerializer SERIALIZER");
        
        //--------------------------------------------
        // USING HAPI to PARSE a RESOURCE to JSON string
        //--------------------------------------------
      
		String outstr = FhirUtils.newJsonParser().encodeResourceToString(value);
        
        jgen.writeRawValue(outstr);
        
        //logger.info("SER: \n" + outstr);
    }

}
