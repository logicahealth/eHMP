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
package com.cognitive.cds.invocation.crs;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.base.resource.BaseOperationOutcome;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.resource.ValueSet;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationResult;

import com.cognitive.cds.invocation.crs.model.Binding;
import com.cognitive.cds.invocation.crs.model.LabSparqlResults;
import com.cognitive.cds.invocation.crs.model.orderables.LabOrderableSparqlResult;
import com.cognitive.cds.invocation.execution.model.Coding;
import com.cognitive.cds.invocation.execution.model.Prerequisite;
import com.cognitive.cds.invocation.util.FhirUtils;

/**
 * Test Support Classes that retrieve CRS SPARQL queries
 *  
 * @author dwilliams
 *
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:crs-context-test.xml" })
public class PrerequisitesTest {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PrerequisitesTest.class);

    @Autowired
    @Qualifier("crsResolver")
    CRSResolver resolver;
    
    @Ignore // it's an integration test.
    @Test
    public void testLabOrderableSparqlQuery() throws IOException {
    	Prerequisite prereq = new Prerequisite();
    	Coding coding =  new Coding();
        coding.setCode("415301001");
        prereq.setCoding(coding);
        prereq.setRemediationQuery("orderable.sparql");
  
        // Rheumatoid Factor enterprise snomed code.
        LabOrderableSparqlResult result = resolver.executeOrderableQuery("9E7A", prereq);
        assertTrue(result.getResults().getBindings().get(0).getSiteOrderCode().getValue().equalsIgnoreCase("urn:va:oi:252"));  
        
        // C Reactive Protein snomed code.
        coding.setCode("55235003");
        LabOrderableSparqlResult result1 = resolver.executeOrderableQuery("9E7A", prereq);
        assertTrue(result1.getResults().getBindings().get(0).getSiteOrderCode().getValue().equalsIgnoreCase("urn:va:oi:239"));  
    }
    
    @Ignore // it's an integration test.
    @Test
    public void testLabResultSparqlQuery() throws IOException {
    	Prerequisite prereq = new Prerequisite();
        prereq.setValueSetQuery("valueSet.sparql");
        Coding coding =  new Coding();
        coding.setCode("415301001");
        prereq.setCoding(coding);
  
        // Rheumatoid Factor enterprise snomed code.
        LabSparqlResults result1 = resolver.executeLabResultQuery("9E7A", prereq);
        
        List<Binding> binding1 = result1.getResults().getBindings();
        for (Iterator<Binding> iterator = binding1.iterator(); iterator.hasNext();) {
			Binding binding = (Binding) iterator.next();
			 System.out.println(binding.getCode().getValue());  
		}
        
        ValueSet vs1 = resolver.convertToValueSet(result1, prereq);
        validateFHIRResource((IResource) vs1);
        
        // CRP
        coding.setCode("55235003");
        LabSparqlResults result2 = resolver.executeLabResultQuery("9E7A", prereq);
        
        List<Binding> binding2 = result2.getResults().getBindings();
        for (Iterator<Binding> iterator = binding2.iterator(); iterator.hasNext();) {
			Binding binding = (Binding) iterator.next();
			 System.out.println(binding.getCode().getValue());  
		}
        ValueSet vs2 = resolver.convertToValueSet(result2, prereq);
        validateFHIRResource((IResource) vs2);
        
    }
    
    private Bundle createBundleWithOneResource(IResource rsc) {
        Bundle bundle = new Bundle();
        java.util.UUID uuid = java.util.UUID.randomUUID();
        bundle.setId(new IdDt(uuid.toString()));
        bundle.setType(BundleTypeEnum.COLLECTION);
        bundle.setBase("");
        bundle.addEntry().setResource(rsc);
        return bundle;
    }
    
    private void validateFHIRResource (IResource rsc) {
    
        Bundle bundleOut = createBundleWithOneResource(rsc);

        // PARSE AND CHECK FINAL BUNDLE
        IParser parser = FhirUtils.newJsonParser().setPrettyPrint(true);

        String outstr = parser.encodeResourceToString(bundleOut);
        log.info("\n\nNEW BUNDLE AFTER BUNDLE(2):\n" + outstr);
        
        // --------------------------
        // Setup the schema for validating
        // --------------------------
        FhirValidator val = FhirUtils.getContext().newValidator();
        val.setValidateAgainstStandardSchema(true);
        val.setValidateAgainstStandardSchematron(true);

        // -----------------------------------
        // Parsing & Validating a Bundle json
        // -----------------------------------
        Bundle bundle = (Bundle) parser.parseResource(outstr);
        assertNotNull("Bundle should not be null", bundle);

        ValidationResult validationResult = val.validateWithResult(bundleOut);

        log.info("....... VALIDATING: Total Issues = " + validationResult.getOperationOutcome().getIssue().size() + ".................\n");
        for (BaseOperationOutcome.BaseIssue issue : validationResult.getOperationOutcome().getIssue()) {
            log.error(issue.getDetailsElement().getValueAsString());
        }
        log.info(".....................................................\n");
        assertTrue("Parsed & Validated: ", validationResult.isSuccessful());
    }
}
