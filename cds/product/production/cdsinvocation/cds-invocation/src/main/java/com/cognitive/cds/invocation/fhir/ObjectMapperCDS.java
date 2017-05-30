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
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cognitive.cds.invocation.fhir;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;

/**
 * 
 * @author tnguyen
 * @deprecated Customization control should be done at the JsonProvider level.
 * @see JsonProviderCDS.java
 */
@Deprecated
public class ObjectMapperCDS extends ObjectMapper {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ObjectMapperCDS.class);
    
    public ObjectMapperCDS() {
        
        super();
        
        logger.info("===> IN ObjectMapperCDS");
        
		this.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleModule module = new SimpleModule();
        
        //ADDING various serializers 
        module.addSerializer(Bundle.class, new com.cognitive.cds.invocation.fhir.BundleSerializer());
        module.addSerializer(IResource.class, new com.cognitive.cds.invocation.fhir.IResourceSerializer());
        
        //ADDING various deserializer? 
        
        
        this.registerModule(module);
        
    }
    
    
}
