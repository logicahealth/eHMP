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
