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

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.hl7.fhir.instance.model.IBase;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.parser.IParser;

import com.cognitive.cds.invocation.util.FhirUtils;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class IBaseDeserializer extends StdDeserializer<IBase> {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(IBaseDeserializer.class);

    // the registry of unique field names to Class types
    private Map<String, Class<? extends IBase>> registry = registry = new HashMap<String, Class<? extends IBase>>();

    // Constructor
    public IBaseDeserializer() {
        super(IBase.class);
    }

    public void register(String uniqueProperty, Class<? extends IBase> iBaseClass) {
        registry.put(uniqueProperty, iBaseClass);
    }

    @Override
    public IBase deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException, JsonProcessingException {

        System.out.println("=====> IN deserialize");

        Class<? extends IBase> foundClass = null;

        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        ObjectNode obj = (ObjectNode) mapper.readTree(jp);

        // LOOP THROUGH UNTIL key value found to indicate type.
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

        // USE HAPI TO PARSE obj into a BUNDLE object for return
        if (foundClass.isAssignableFrom(IResource.class)) {
            // HAVE TO USE HAPI TO PARSE foundClass into a IResource object ??

            System.out.println("FOUND IRESOURCE OBJECT");
            parser = FhirUtils.newJsonParser();
            IResource iRes = FhirUtils.newJsonParser().parseResource(s);

            return iRes;
        } else {

            // FOR NOW, return exception if no matching registered mapped class
            // is found.
            String msg = "No registered unique properties found for polymorphic deserialization";
            System.out.println(msg);

            // returning registered mapped class
            return mapper.treeToValue(obj, foundClass);

        }
    }

}
