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

import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;

/**
 * Customize the Json Provider to control the way(s) our data
 * can be Serialized and DeSerialized
 * 
 * @author tnguyen
 */
public class JsonProviderCDS  extends JacksonJaxbJsonProvider {
    
	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JsonProviderCDS.class);

    public JsonProviderCDS() {
        
        logger.info("Config JsonProviderCDS with needed customized Serializers");
        
//        ObjectMapper mapper = new ObjectMapper();        
//        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
//        SimpleModule module = new SimpleModule();
//        
//        //-------------------------------------------
//        // ADD CUSTOM SERIALIZERS
//        //-------------------------------------------
//        logger.info("=========> register serializers");
//        module.addSerializer(Bundle.class, new BundleSerializer());
//        module.addSerializer(IResource.class, new IResourceSerializer());
//        
//        //-------------------------------------------
//        // ADD CUSTOM DESERIALIZER and
//        // REGISTER UNIQUE KEYs FOR each DESER CLASS TYPEs
//        //-------------------------------------------
//        logger.info("=========> register deserializers");
//        final String BUNDLE_KEY = "entry";
//        final String IRESOURCE_KEY = "text";        
//		ObjectDeserializer deserializer = new ObjectDeserializer();        
//        deserializer.register(BUNDLE_KEY, Bundle.class); 
//        deserializer.register(IRESOURCE_KEY, IResource.class);         
//		module.addDeserializer(Object.class, deserializer);
//        
//        //-----------------------------------------------------------
//        // REGISTER JACKSON MODULE with all sers/ders to MAPPER
//        //-----------------------------------------------------------
//        mapper.registerModule(module);
        ObjectMapper mapper = JsonUtils.getMapper();
        this._mapperConfig.setMapper(mapper);
        
    }

}
