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
