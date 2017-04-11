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
package com.cognitive.cds.invocation.fhir;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.parser.IParser;

import java.io.IOException;

import com.cognitive.cds.invocation.util.FhirUtils;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.HashMap;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

public class ObjectDeserializer extends StdDeserializer<Object> {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ObjectDeserializer.class);

    // the registry of unique field names to Class types
    private Map<String, Class<? extends Object>> registry = 
        registry = new HashMap<String, Class<? extends Object>>();

    //Constructor
    public ObjectDeserializer() {
        super(Object.class);
    }

    public void register(String uniqueProperty, Class<? extends Object> objectClass) {
        registry.put(uniqueProperty, objectClass);
    }

    @Override
    public Object deserialize(JsonParser jp, DeserializationContext ctxt)
        throws IOException, JsonProcessingException {

        logger.info("=====> IN OBJECT deserialize");

        Class<? extends Object> foundClass = null;

        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        ObjectNode obj = (ObjectNode) mapper.readTree(jp);

        //LOOP THROUGH UNTIL key value found to indicate type.
        Iterator<Entry<String, JsonNode>> elementsIterator = obj.fields();
        while (elementsIterator.hasNext()) {
            Entry<String, JsonNode> element = elementsIterator.next();
            String name = element.getKey();
            if (registry.containsKey(name)) {
                foundClass = registry.get(name);
                break;
            }
        }
        
        // GET STRING version of object so HAPI acan parse easily to an object.
        // HAPI parsing of object to correct HAPI class (Bundle or IResource)
        IParser parser = null;
        String s = mapper.writeValueAsString(obj);

        if ((foundClass != null) && foundClass.getSimpleName().equalsIgnoreCase("IResource") ) {
            // HAVE TO USE HAPI TO PARSE foundClass into a IResource object 

            logger.info("FOUND IRESOURCE OBJECT");
            parser = FhirUtils.newJsonParser();
            IResource iRes = parser.parseResource(s); 
            return iRes;
            
        } else {

            String msg = "No registered unique properties found for polymorphic deserialization";
            logger.info(msg);

            return obj;

        }
    }

}
