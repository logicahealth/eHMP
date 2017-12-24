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

import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.parser.IParser;
import com.cognitive.cds.invocation.fhir.IResourceSerializer;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.util.FhirUtils;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author tnguyen
 */
public class CustomDeserializerTest {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CustomDeserializerTest.class);
    
    private static final String MYKEY = "mykey";

    private ObjectMapper mapper;

 
    /**
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        mapper = JsonUtils.getMapper();
        
        
    }
 
    /**
    * @throws java.lang.Exception
    */
    @After
    public void tearDown() throws Exception {
        mapper = null;
    }

    @Test
    public void serializeProps() throws JsonProcessingException, IOException {
        
        InvokeServiceReq req = new InvokeServiceReq();
        
        Map<String, Object> p = new HashMap<>();
        String key;
        Object value;
        
        //GET IRESOURCE
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations_Resource.json"));
        IResource res = FhirUtils.newJsonParser().parseResource(new String(b, "UTF-8"));
        
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleModule module = new SimpleModule();
        module.addSerializer(IResource.class, new IResourceSerializer());
        mapper.registerModule(module);
        
        String outstr = mapper.writeValueAsString(res);
        
        logger.info(outstr);
        
        key = "temperature";
        value = res;  // PUT IRESOURCE INTO parameters value

        p.put(key, value); 
        p.put("temp2", value);

        req.setParameters(p);
        
        String pOut = mapper.writeValueAsString(req);
        logger.info(pOut);
    }
    
    //=====================================================
    //  TEST JSON deser to BUNDLE object class
    //=====================================================
    /**
     * TESTING incoming BUNDLE json and deserializing to HAPI Bundle object class.
     * 
     * @throws JsonParseException
     * @throws IOException 
     */
    @Test
    public void deserialize_WithBundle_CreatesATestBundle() 
        throws JsonParseException, IOException 
    {
        logger.info("TESTING deserialize_WithBundle_CreatesATestBundle");
        
        //-------------------------------------------
        // READ in the Fhir Bundle Observation
        //-------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations.json"));
        //logger.info("PRE FOUND: \n"+ new String(b, "UTF-8"));
        
        //-------------------------------------------
        //     SETUP OBJECTMAPPER and custom deser
        // Reference setUp() for prep of ObjectMapper & registration
        //-------------------------------------------
        Object testObject = mapper.readValue(b, Object.class);

        //-------------------------------------------
        //      RE-PARSE to Bundle object to CHECK
        //-------------------------------------------
        IParser parser = FhirUtils.newJsonParser();
        String outstr = parser.encodeResourceToString((Bundle) testObject);
        logger.info(outstr);
        
        Bundle bundleOut = (Bundle) testObject;
        logger.info(bundleOut.getEntry().get(0).getResource().getResourceName());
        
        
        Assert.assertTrue(testObject.getClass().isAssignableFrom(Bundle.class));
    }
    
    
    //=====================================================
    //  TEST JSON deser to IRESOURCE object class
    //=====================================================
    @Test
    public void deserialize_WithIResource_CreatesATestIResource() 
        throws JsonParseException, IOException 
    {
        logger.info("TESTING deserialize_WithIResource_CreatesATestIResource");
        
        //-------------------------------------------
        // READ in the Fhir Bundle Observation
        //-------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "sampleObservations_Resource.json"));
        //logger.info("PRE FOUND: \n"+ new String(b, "UTF-8"));
        
        //-------------------------------------------
        //     SETUP OBJECTMAPPER and custom deser
        // Reference setUp() for prep of ObjectMapper & registration
        //-------------------------------------------
        Object testObject = mapper.readValue(b, Object.class);

        //-------------------------------------------
        //      RE-PARSE to Bundle object to CHECK
        //-------------------------------------------
        IParser parser = FhirUtils.newJsonParser();
        String outstr = parser.encodeResourceToString((IResource) testObject);
        logger.info(outstr);
        
        IResource resOut = (IResource) testObject;
        logger.info(resOut.getResourceName());
        logger.info(testObject.getClass().getName());
        
        
        Assert.assertTrue(testObject.getClass().isAssignableFrom(Observation.class));
        
    }
    
    
    
    
    
    //=====================================================
    //  TEST OBJECT that is non-BUNDLE and non-IRESOURCE
    //=====================================================
    
    //Mix of IRESOURCE and non-IRESOURCE data content.
    @Test
    public void deserialize_CommAndAdvice() 
        throws JsonParseException, IOException 
    {
        logger.info("TESTING deserialize_WithBundle_CreatesATestBundle");
        
        //-------------------------------------------
        // READ in
        //-------------------------------------------
        byte[] b = Files.readAllBytes(Paths.get("src/test/resources", "CommRequestAndAdvice.json"));
        
        //-------------------------------------------
        //     SETUP OBJECTMAPPER and custom deser
        // Reference setUp() for prep of ObjectMapper & registration
        //-------------------------------------------
        Object testObject = mapper.readValue(b, Object.class);

        Assert.assertTrue(testObject != null);
    }
    
    //=====================================================
    //  TEST specific OBJECT that is non-BUNDLE and non-IRESOURCE
    //=====================================================
    @Test
    public void deserialize_WithTestObject() 
        throws JsonParseException, IOException 
    {
        logger.info("TESTING deserialize_WithBundle_CreatesATestBundle");
        
        //-------------------------------------------
        // READ in the Fhir Bundle Observation
        //-------------------------------------------
        String testJson = "{\"common\": \"value\", \"" + MYKEY + "\": \"value\"}";
        
        logger.info("PRE FOUND: \n"+ testJson);
        
        //-------------------------------------------
        //     SETUP OBJECTMAPPER and custom deser
        //-------------------------------------------
        TestObject testObject = mapper.readValue(testJson, TestObject.class);
        
        Assert.assertTrue(testObject != null);
        
    }
    
    private static class TestObject  {
        private final String mykey = "value";
 
        public String getMykey() {
            return mykey;
        }

        private final String common = "value";
        
        public String getCommon() {
            return common;
        }

    }
 
    
public class InvokeServiceReq {

    private InvocationTarget target;
    private Context context;
    private Map<String, Object> parameters;
    private Object dataModel;

    public InvocationTarget getTarget() {
        return target;
    }

    public void setTarget(InvocationTarget target) {
        this.target = target;
    }

    public Context getContext() {
        return context;
    }

    public void setContext(Context context) {
        this.context = context;
    }

    

    public Map<String, Object> getParameters() {
		return parameters;
	}

	public void setParameters(Map<String, Object> parameters) {
		this.parameters = parameters;
	}

	public Object getDataModel() {
        return dataModel;
    }

    public void setDataModel(Object dataModel) {
        this.dataModel = dataModel;
    }
}

}


