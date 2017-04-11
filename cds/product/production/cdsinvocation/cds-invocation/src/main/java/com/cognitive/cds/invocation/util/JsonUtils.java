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

package com.cognitive.cds.invocation.util;

import com.cognitive.cds.invocation.fhir.BundleSerializer;
import com.cognitive.cds.invocation.fhir.IResourceSerializer;
import com.cognitive.cds.invocation.fhir.ObjectDeserializer;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;

/**
 * Support Class for JSON
 * 
 * @author jgoodnough
 *
 */
public class JsonUtils {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JsonUtils.class);

    String ret = null;

    private static PrivateObjectMapper objectMapper;
    private static PrivateObjectMapper compactMapper;

    static {
        objectMapper = new PrivateObjectMapper();
        objectMapper.configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        objectMapper.lock();

        compactMapper = new PrivateObjectMapper();
        compactMapper.configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
        compactMapper.setSerializationInclusion(Include.NON_NULL);
        compactMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        SimpleModule module = new SimpleModule();

        // -------------------------------------------
        // ADD CUSTOM SERIALIZERS
        // -------------------------------------------
        logger.trace("=========> register serializers");
        module.addSerializer(Bundle.class, new BundleSerializer());
        module.addSerializer(IResource.class, new IResourceSerializer());

        // -------------------------------------------
        // ADD CUSTOM DESERIALIZER and
        // REGISTER UNIQUE KEYs FOR each DESER CLASS TYPEs
        // -------------------------------------------
        logger.trace("=========> register deserializers");
        // final String BUNDLE_KEY = "entry";
        final String IRESOURCE_KEY = "resourceType";
        ObjectDeserializer deserializer = new ObjectDeserializer();
        // deserializer.register(BUNDLE_KEY, Bundle.class);
        deserializer.register(IRESOURCE_KEY, IResource.class);
        module.addDeserializer(Object.class, deserializer);

        // -----------------------------------------------------------
        // REGISTER JACKSON MODULE with all sers/ders to MAPPER
        // -----------------------------------------------------------
        objectMapper.registerModule(module);
        compactMapper.registerModule(module);
    }

    static public ObjectMapper getMapper() {
        return objectMapper;
    }

    public static String toJsonString(Object obj) throws JsonProcessingException {
        return objectMapper.writeValueAsString(obj);
    }

    public static String toJsonStringCompact(Object obj) throws JsonProcessingException {
        return compactMapper.writeValueAsString(obj);
    }

}
