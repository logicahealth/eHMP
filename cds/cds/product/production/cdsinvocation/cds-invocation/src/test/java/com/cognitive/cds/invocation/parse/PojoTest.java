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
