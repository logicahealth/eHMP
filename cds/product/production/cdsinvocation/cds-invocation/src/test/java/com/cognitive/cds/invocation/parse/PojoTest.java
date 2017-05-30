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
package com.cognitive.cds.invocation.parse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.LinkedList;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 *
 * @author tnguyen
 */
public class PojoTest {

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PojoTest.class);

    ObjectMapper mapper = new ObjectMapper();

    @Test
    public void testPojo() throws IOException {
        
        Pojo pojo = new Pojo("myId", "{\"foo\":18}");

        String output = mapper.writeValueAsString(pojo);
        assertEquals(output, "{\"id\":\"myId\",\"json\":{\"foo\":18}}");

        Pojo deserialized = mapper.readValue(output, Pojo.class);
        assertEquals(deserialized.json.toString(), "{\"foo\":18}");
        // deserialized.json == {"foo":18}
    }

    @Test
    public void testPojoWrapper() throws IOException {
        LinkedList<Pojo> pj = new LinkedList<Pojo>();
        Pojo pojo = new Pojo("myId", "{\"foo\":18}");
        pj.add(pojo);
        
        PojoWrapper pojoW = new PojoWrapper("myWrapperId");
        pojoW.setPojo(pj);
        pojoW.setComment("my wrapper comment");  //should not show up in serialized output since it's specified as @JsonIgnore

        String output = mapper.writeValueAsString(pojoW);
        assertEquals(output, "{\"wrapperId\":\"myWrapperId\",\"pojo\":[{\"id\":\"myId\",\"json\":{\"foo\":18}}]}");
        logger.info("FOUND: "+ output);

        PojoWrapper deserialized = mapper.readValue(output, PojoWrapper.class);
        assertEquals(deserialized.getPojo().get(0).json.toString(), "{\"foo\":18}");
    }

}
