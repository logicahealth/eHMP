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

import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import ca.uhn.fhir.model.api.BaseElement;
import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.composite.CodeableConceptDt;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.composite.ContainedDt;
import ca.uhn.fhir.model.dstu2.composite.IdentifierDt;
import ca.uhn.fhir.model.dstu2.composite.PeriodDt;
import ca.uhn.fhir.model.dstu2.composite.QuantityDt;
import ca.uhn.fhir.model.dstu2.composite.RatioDt;
import ca.uhn.fhir.model.dstu2.composite.ResourceReferenceDt;
import ca.uhn.fhir.model.dstu2.composite.TimingDt;
import ca.uhn.fhir.model.dstu2.composite.TimingDt.Repeat;
import ca.uhn.fhir.model.dstu2.resource.Medication;
import ca.uhn.fhir.model.dstu2.resource.Medication.Product;
import ca.uhn.fhir.model.dstu2.resource.Medication.ProductIngredient;
import ca.uhn.fhir.model.dstu2.resource.MedicationAdministration;
import ca.uhn.fhir.model.dstu2.resource.MedicationAdministration.Dosage;
import ca.uhn.fhir.model.dstu2.resource.MedicationPrescription;
import ca.uhn.fhir.model.dstu2.resource.MedicationPrescription.Dispense;
import ca.uhn.fhir.model.dstu2.resource.MedicationPrescription.DosageInstruction;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.resource.Observation.Related;
import ca.uhn.fhir.model.dstu2.valueset.MedicationAdministrationStatusEnum;
import ca.uhn.fhir.model.dstu2.valueset.ObservationRelationshipTypeEnum;
import ca.uhn.fhir.model.dstu2.valueset.ObservationStatusEnum;
import ca.uhn.fhir.model.dstu2.valueset.TimingAbbreviationEnum;
import ca.uhn.fhir.model.dstu2.valueset.UnitsOfTimeEnum;
import ca.uhn.fhir.model.primitive.DateTimeDt;
import ca.uhn.fhir.model.primitive.DecimalDt;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.model.primitive.StringDt;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationResult;

import com.cognitive.cds.invocation.util.FhirUtils;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.Ignore;

/**
 * Test Support Class that create Prototypical FHIR objects
 * 
 * @author jgoodnough
 *
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:fhircontext-test.xml" })
public class FHIRPrototypesTest {

    private static final String RXNORM_URN = "urn:oid:2.16.840.1.1.113883.6.88";
    private static final String EXTENSION_BASE = "http://vistacore.us/fhir/extensions/";

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(FHIRPrototypesTest.class);

    /**
     * Create a Prototype of an IV administration
     * 
     * @throws JsonProcessingException
     */
    @Ignore
    @Test
    public void testMedicationAdminIV() throws JsonProcessingException {
        // The Core structure will be
        // Medication Administration
        // + --> Medication Main
        // + --> Medication 1
        // + --> Medication 2
        // + --> Prescription

        // Note: contained resource may not contain other resources so we create
        // the master list here to
        // pass to sub functions.
        MedicationAdministration medAdmin = new MedicationAdministration();

        List<IResource> theContainedResources = new ArrayList<>();
        ContainedDt theContained = new ContainedDt();
        theContained.setContainedResources(theContainedResources);
        medAdmin.setContained(theContained);

        Medication med = createMedicationIV(theContainedResources);
        medAdmin.setMedication(getContainedResourceRef(med));

        
        // Ok Fill out the prescription - Assuming info from the admin and
        // oerder
        MedicationPrescription prescription = new MedicationPrescription();
        DosageInstruction di = prescription.addDosageInstruction();
        TimingDt scheduledTiming = new TimingDt();
        Repeat repeat = new Repeat();
        repeat.setPeriod(480);
        repeat.setPeriodUnits(UnitsOfTimeEnum.MIN);
        scheduledTiming.setRepeat(repeat);
        //The following code is a hack work arround for a HAPI FHIR issue with timing Q8H is not supported - TID is eqv.
        //The documented sample of this resource should use the Q8H form
        scheduledTiming.setCode(TimingAbbreviationEnum.TID);
        //No clean way to set the timing to Q8H
        //scheduledTiming.setCode(theValue)
        addStringExtension(scheduledTiming, "medAdmin/scheduleName", "Q8H");
        addStringExtension(scheduledTiming, "medAdmin/scheduleType", "CONTINUOUS");

        di.setScheduled(scheduledTiming);
        di.getRoute().setText("IVPB");

        // Create an Idealized Rate - Not to sure this possible in from the real
        // data
        // Which might use 1 Unit over 1 Period as the ratio - A Totally
        // meaningless statement
        RatioDt rate = new RatioDt();
        // Push rate
        QuantityDt pushRate = new QuantityDt();
        pushRate.setUnits("MIN");
        pushRate.setValue(35);
        rate.setDenominator(pushRate);

        QuantityDt solutionSize = new QuantityDt();
        // 1004 = 100ML + ~ 4ML Morphine solution
        solutionSize.setValue(1004);
        solutionSize.setUnits("ML");
        rate.setNumerator(solutionSize);
        di.setRate(rate);
        // di.setDose(pushRate);
        // Note: In the javascript implementation SHALL have at least one of
        // dosage.quantity and dosage.rate

        prescription.setMedication(getContainedResourceRef(med));
        assignIdAndAdd(prescription, theContainedResources);
        prescription.getPatient().setReference("Patient/9E7A;8");
        
        IdentifierDt orderId = prescription.addIdentifier();
        orderId.setSystem("urn:oid:2.16.840.1.113883.6.233");
        orderId.setValue("urn:va:order:9E7A:8:11129");
        
        prescription.getPrescriber().setReference("Provider:/urn:va:user:9E7A:923");
        DateTimeDt dateOrdered = new DateTimeDt();
        dateOrdered.setValueAsString("1999-12-22T14:30:00");
        prescription.setDateWritten(dateOrdered );
        
        Dispense dispense = prescription.getDispense();
        PeriodDt validitityPeriod = dispense.getValidityPeriod();
        DateTimeDt validitityStart = new DateTimeDt();
        validitityStart.setValueAsString("1999-12-22T21:00:00");
        DateTimeDt validitityEnd = new DateTimeDt();
        validitityEnd.setValueAsString("2000-01-21T23:59:00");
        validitityPeriod.setStart(validitityStart);
        validitityPeriod.setEnd(validitityEnd);
        
        
        //Add some of the extensions
        addStringExtension(prescription, "perscription/orders/location", "5 WEST PSYCH");
        addStringExtension(prescription, "perscription/orders/locationUID", "urn:va:location:9E7A:66");
        //There may be a better mapping for the pharmacist
        addStringExtension(prescription, "perscription/orders/pharmacistName", "RADTECH,SEVENTEEN");
        addStringExtension(prescription, "perscription/orders/pharmacistUID", "urn:va:user:9E7A:11733");
        addStringExtension(prescription, "perscription/orders/predecessor", "urn:va:med:9E7A:8:11127");
          
        
        medAdmin.setPrescription(getContainedResourceRef(prescription));

        String summary = "MORPHINE SO4 15MG/ML INJ 50 MG in DEXTROSE 5% INJ,BAG,1000ML  (EXPIRED)\nINFUSE OVER 35 MIN. Q8H";
        medAdmin.setNote(summary);
        prescription.setNote(summary);
        String qname = "MORPHINE INJ in DEXTROSE 5% IN WATER INJ,SOLN";

        IdentifierDt uid = medAdmin.addIdentifier();
        uid.setSystem("urn:oid:2.16.840.1.113883.6.233");
        uid.setValue("urn:va:med:9E7A:8:11129");

        MedicationAdministrationStatusEnum status = MedicationAdministrationStatusEnum.COMPLETED;
        medAdmin.setStatus(status);
        medAdmin.getPatient().setReference("Patient/9E7A;8");

        // Do we have a mapping to this field or is it just stuffed?
        medAdmin.setWasNotGiven(false);
        // Either Reason given or not given is required - Based on the above
        CodeableConceptDt reasonGiven = new CodeableConceptDt();
        CodingDt reasonCd = reasonGiven.addCoding();
        reasonCd.setSystem("http://hl7.org/fhir/reason-medication-given");
        reasonCd.setCode("a");
        List<CodeableConceptDt> reasonGivenList = new ArrayList<>(1);
        reasonGivenList.add(reasonGiven);
        medAdmin.setReasonGiven(reasonGivenList);

        // Uses Overall Start / Stop

        PeriodDt effectiveTime = new PeriodDt();
        DateTimeDt overallStart = new DateTimeDt();
        overallStart.setValueAsString("1999-12-22T21:00:00");
        effectiveTime.setStart(overallStart);
        DateTimeDt overallEnd = new DateTimeDt();
        // Based on dubious source data
        overallEnd.setValueAsString("2000-01-21T23:59:00");
        effectiveTime.setEnd(overallEnd);
        medAdmin.setEffectiveTime(effectiveTime);

        addStringExtension(medAdmin, "medAdmin/vaType", "V");
        addStringExtension(medAdmin, "medAdmin/vaStatus", "EXPIRED");
        addStringExtension(medAdmin, "medAdmin/supply", "false");
        addStringExtension(medAdmin, "medAdmin/stampTime", "50 ML");
        addStringExtension(medAdmin, "medAdmin/localId", "70V;I");
        addStringExtension(medAdmin, "medAdmin/medStatus", "urn:sct:392521001");
        addStringExtension(medAdmin, "medAdmin/medStatusName", "historical");
        addStringExtension(medAdmin, "medAdmin/facilityCode", "998");
        addStringExtension(medAdmin, "medAdmin/facilityName", "ABILENE (CAA)");
        addStringExtension(medAdmin, "medAdmin/IMO", "false");

        // @formatter:off
        /*
         *      'dosages': [
         *          {
         *          'adminTimes': '05-13-21',      //This is a weird number
         *          'duration': 'INFUSE OVER 35 MIN.',
         *          'routeName': 'IVPB',
         *          'scheduleFreq': 480,
         *          'scheduleName': 'Q8H',
         *          'scheduleType': 'CONTINUOUS',
         *          'summary': 'MedicationDose{uid=\'\'}'
         *           }
         *       ]
         * 
         */
        // @formatter:on
        Dosage dosage = medAdmin.getDosage();
        dosage.setText("INFUSE OVER 35 MIN");
        CodeableConceptDt route = new CodeableConceptDt();
        route.setText("IVPB");
        dosage.setRoute(route);
        dosage.setRate(rate);
        // This is a weird element
        addStringExtension(dosage, "medAdmin/dosage/adminTimes", "05-13-21");
        addStringExtension(dosage, "medAdmin/dosage/duration", "INFUSE OVER 35 MIN");
        addStringExtension(dosage, "medAdmin/dosage/summary", "MedicationDose{uid=''}");

        logger.info("Reported Combinded JSON = " + JsonUtils.toJsonStringCompact(medAdmin));
        IParser xmlParser = FhirUtils.getContext().newXmlParser();
        String XMLVersion = xmlParser.encodeResourceToString(medAdmin);
        logger.info("Reportd Combinded XML = " + XMLVersion);
        FhirValidator validator = FhirUtils.getContext().newValidator();
        ValidationResult result = validator.validateWithResult(medAdmin);
        if (!result.isSuccessful()) {
            logger.error("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
            fail("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
        }
    }

    public Medication createMedicationIV(List<IResource> theContainedResources) {
        Medication med = new Medication();
        assignIdAndAdd(med, theContainedResources);
        med.setName("MORPH DRIP INJ");
        CodeableConceptDt code = new CodeableConceptDt();
        code.setText("MORPHINE");

        // From JDS Codings
        code.getCoding().add(createCoding(RXNORM_URN, "1232113", "1 ML Morphine Sulfate 15/MG/ML Prefilled Syringe"));
        med.setCode(code);

        Product product = new Product();

        Medication morphine = createMorphine(theContainedResources);
        ProductIngredient ingredient1 = new ProductIngredient();
        ingredient1.setItem(getContainedResourceRef(morphine));

        Medication dextrose = createDextrose(theContainedResources);
        ProductIngredient ingredient2 = new ProductIngredient();
        ingredient2.setItem(getContainedResourceRef(dextrose));

        List<ProductIngredient> productList = new ArrayList<>();
        productList.add(ingredient1);
        productList.add(ingredient2);
        product.setIngredient(productList);
        med.setProduct(product);

        addStringExtension(med, "med/medType", "urn:sct:105903003");
        addStringExtension(med, "med/kind", "Medication, Infusion");

        return med;
    }

    public Medication createMorphine(List<IResource> theContainedResources) {
        Medication med = new Medication();
        assignIdAndAdd(med, theContainedResources);

        // From product ingredient name
        med.setName("MORPH INJ");
        CodeableConceptDt code = new CodeableConceptDt();
        code.setText("MORPHINE");
        code.getCoding().add(createCoding(RXNORM_URN, "7052", "MORPHINE"));
        med.setCode(code);

        Product product = new Product();
        ProductIngredient ingredient1 = new ProductIngredient();
        ResourceReferenceDt rscRef = new ResourceReferenceDt();
        rscRef.setDisplay("MORPHINE SO4 15G/ML INJ 50MG");
        ingredient1.setItem(rscRef);
        List<ProductIngredient> productList = new ArrayList<>();
        productList.add(ingredient1);
        product.setIngredient(productList);
        med.setProduct(product);

        addStringExtension(med, "med/products/strength", "50 MG");
        addStringExtension(med, "med/products/drugClassCode", "urn:vadc:CN101");
        addStringExtension(med, "med/products/drugClassName", "OPIOID ANALGESICS");
        addStringExtension(med, "med/products/ingredientCode", "urn:va:vuid:4017530");
        addStringExtension(med, "med/products/ingredientRole", "urn:sct:418804003");
        addStringExtension(med, "med/products/suppliedCode", "urn:va:vuid:4000975");

        return med;
    }

    public Medication createDextrose(List<IResource> theContainedResources) {
        Medication med = new Medication();
        assignIdAndAdd(med, theContainedResources);
        med.setName("DEXTROSE 5% IN WATER INJ, SOLN");
        CodeableConceptDt code = new CodeableConceptDt();
        code.setText("DEXTROSE");
        code.getCoding().add(createCoding(RXNORM_URN, "4850", "DEXTROSE"));
        med.setCode(code);

        Product product = new Product();
        ProductIngredient ingredient1 = new ProductIngredient();
        ResourceReferenceDt rscRef = new ResourceReferenceDt();
        rscRef.setDisplay("DEXTROSE 5% INJ, BAG 1000ML");
        ingredient1.setItem(rscRef);
        List<ProductIngredient> productList = new ArrayList<>();
        productList.add(ingredient1);
        product.setIngredient(productList);
        med.setProduct(product);

        addStringExtension(med, "med/products/volume", "50 ML");
        addStringExtension(med, "med/products/drugClassCode", "urn:vadc:TN101");
        addStringExtension(med, "med/products/drugClassName", "IV SOLUTIONS WITHOUT ELECTROLYTES");
        addStringExtension(med, "med/products/ingredientCode", "urn:va:vuid:4017760");
        addStringExtension(med, "med/products/ingredientRole", "urn:sct:418297009");
        addStringExtension(med, "med/products/suppliedCode", "urn:va:vuid:4014924");

        return med;
    }

    /*
     * Create a Prototype Blood pressure observation The form of this
     * observation is an observation that is from the patients existing medical
     * record. Other forms such as used validation purposes can exist and will
     * have a reduced set of fields and will have a difference status.
     * 
     * Current FHIR Json Exemplar produced:
     * 
     * { "code" : { "coding" : [ { "code" : "55284-4", "display" :
     * "Blood pressure systolic/diastolic", "system" : "http://loinc.org" } ] },
     * "comments" : "Combined Blood pressure observation", "contained" : [ {
     * "code" : { "coding" : [ { "code" : "8480-6", "display" :
     * "Systolic Blood pressure", "system" : "http://loinc.org" } ] },
     * "comments" : "Systolic", "id" : "systolic", "identifier" : [ { "value" :
     * "systolic" } ], "issued" : "2015-06-18T10:03:00.234-07:00",
     * "resourceType" : "Observation", "status" : "final", "valueQuantity" : {
     * "units" : "mm[Hg]", "value" : 120.0 } }, { "code" : { "coding" : [ {
     * "code" : "8462-4", "display" : "Diastolic Blood pressure", "system" :
     * "http://loinc.org" } ] }, "comments" : "Diastolic", "id" : "diastolic",
     * "identifier" : [ { "value" : "diastolic" } ], "issued" :
     * "2015-06-18T10:03:00.234-07:00", "resourceType" : "Observation", "status"
     * : "final", "valueQuantity" : { "units" : "mm[Hg]", "value" : 60.0 } } ],
     * "issued" : "2015-06-18T10:03:00.234-07:00", "related" : [ { "target" : {
     * "reference" : "#systolic" }, "type" : "has-component" }, { "target" : {
     * "reference" : "#diastolic" }, "type" : "has-component" } ],
     * "resourceType" : "Observation", "status" : "final", "valueString" :
     * "120/60" }
     */
    @Ignore
    @Test
    public void testBPObsContained() throws JsonProcessingException {

        Date now = new Date(System.currentTimeMillis());

        Observation obsSystolic = this.createSystolicBPObservation(now, 120.0);
        obsSystolic.addIdentifier().setValue("systolic");
        obsSystolic.setId("systolic");

        logger.info("Reported Systolic = " + JsonUtils.toJsonStringCompact(obsSystolic));

        Observation obsDiastolic = this.createDiastolicBPObservation(now, 60.0);
        obsDiastolic.addIdentifier().setValue("diastolic");
        obsDiastolic.setId("diastolic");
        logger.info("Reported Diastolic = " + JsonUtils.toJsonStringCompact(obsDiastolic));

        Observation obsParent = this.createParentBPObservation(now, "120/60");

        Related obsc1 = new Related();
        ResourceReferenceDt ref1 = new ResourceReferenceDt();
        ref1.setReference("#systolic");
        obsc1.setTarget(ref1);
        obsc1.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc1);

        Related obsc2 = new Related();
        ResourceReferenceDt ref2 = new ResourceReferenceDt();
        ref2.setReference("#diastolic");
        obsc2.setTarget(ref2);
        obsc2.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc2);

        List<IResource> theContainedResources = new ArrayList<>(2);
        theContainedResources.add(obsSystolic);
        theContainedResources.add(obsDiastolic);

        obsParent.getContained().setContainedResources(theContainedResources);

        logger.info("Reported Combinded JSON = " + JsonUtils.toJsonStringCompact(obsParent));

        IParser xmlParser = FhirUtils.getContext().newXmlParser();
        String XMLVersion = xmlParser.encodeResourceToString(obsParent);
        logger.info("Reportd Combinded XML = " + XMLVersion);
        FhirValidator validator = FhirUtils.getContext().newValidator();
        ValidationResult result = validator.validateWithResult(obsParent);
        if (!result.isSuccessful()) {
            logger.error("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
            fail("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
        }
    }

    /**
     * Create Systolic BP OPbservation
     * 
     * @param now
     * @param value
     * @return
     */

    public Observation createSystolicBPObservation(Date now, double value) {
        Observation obsSystolic = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code = new CodeableConceptDt();
        CodingDt codeDt = new CodingDt();
        codeDt.setCode("8480-67");
        codeDt.setSystem("http://loinc.org");
        codeDt.setDisplay("Systolic Blood pressure");
        code.getCoding().add(codeDt);
        obsSystolic.setCode(code);
        obsSystolic.setStatus(ObservationStatusEnum.FINAL);

        // Useful: issued, value
        obsSystolic.setComments("Systolic");
        obsSystolic.setIssuedWithMillisPrecision(now);
        QuantityDt qdt = new QuantityDt();
        qdt.setUnits("mm[Hg]");
        DecimalDt theValue = new DecimalDt(value);
        qdt.setValue(theValue);
        obsSystolic.setValue(qdt);

        return obsSystolic;
    }

    /**
     * Create a Diasystolic Blood pressure observation
     * 
     * @return
     */
    public Observation createDiastolicBPObservation(Date now, double value) {

        Observation obsDiastolic = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code1 = new CodeableConceptDt();
        CodingDt codeDt1 = new CodingDt();
        codeDt1.setCode("8462-4");
        codeDt1.setSystem("http://loinc.org");
        codeDt1.setDisplay("Diastolic Blood pressure");
        code1.getCoding().add(codeDt1);
        obsDiastolic.setCode(code1);
        obsDiastolic.setStatus(ObservationStatusEnum.FINAL);

        // Useful: issued, value
        obsDiastolic.setComments("Diastolic");
        obsDiastolic.setIssuedWithMillisPrecision(now);
        QuantityDt qdt1 = new QuantityDt();
        qdt1.setUnits("mm[Hg]");
        DecimalDt theValue1 = new DecimalDt(value);
        qdt1.setValue(theValue1);
        obsDiastolic.setValue(qdt1);

        return obsDiastolic;
    }

    public Observation createParentBPObservation(Date now, String value) {
        Observation obsBP = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code = new CodeableConceptDt();
        CodingDt codeDt = new CodingDt();
        codeDt.setCode("55284-4");
        codeDt.setSystem("http://loinc.org");
        codeDt.setDisplay("Blood pressure systolic/diastolic");
        code.getCoding().add(codeDt);
        obsBP.setCode(code);
        obsBP.setStatus(ObservationStatusEnum.FINAL);

        // Useful: issued, value
        obsBP.setComments("Combined Blood pressure observation");
        obsBP.setIssuedWithMillisPrecision(now);
        StringDt theValue = new StringDt(value);
        obsBP.setValue(theValue);

        return obsBP;
    }

    /**
     * Tests a minimal example as might be used by Validation. The form of this
     * observation is an observation that is preliminary and would be used for
     * validation purposes. This is an example of what the client might send to
     * a validation evaluation.Historic vitals will be similar in structural
     * form but may carry additional information and will have a difference
     * status.
     * 
     * Current FHIR Json Exemplar produced:
     * 
     * { "code" : { "coding" : [ { "code" : "55284-4", "display" :
     * "Blood pressure systolic/diastolic", "system" : "http://loinc.org" } ] },
     * "comments" : "Combined Blood pressure observation", "contained" : [ {
     * "code" : { "coding" : [ { "code" : "8480-6", "display" :
     * "Systolic Blood pressure", "system" : "http://loinc.org" } ] },
     * "comments" : "Systolic", "id" : "systolic", "identifier" : [ { "value" :
     * "systolic" } ], "resourceType" : "Observation", "status" : "preliminary",
     * "valueQuantity" : { "units" : "mm[Hg]", "value" : 120.0 } }, { "code" : {
     * "coding" : [ { "code" : "8462-4", "display" : "Diastolic Blood pressure",
     * "system" : "http://loinc.org" } ] }, "comments" : "Diastolic", "id" :
     * "diastolic", "identifier" : [ { "value" : "diastolic" } ], "resourceType"
     * : "Observation", "status" : "preliminary", "valueQuantity" : { "units" :
     * "mm[Hg]", "value" : 60.0 } } ], "issued" :
     * "2015-06-18T10:02:56.722-07:00", "related" : [ { "target" : { "reference"
     * : "#systolic" }, "type" : "has-component" }, { "target" : { "reference" :
     * "#diastolic" }, "type" : "has-component" } ], "resourceType" :
     * "Observation", "status" : "preliminary" }
     * 
     * 
     * @throws JsonProcessingException
     */
    @Ignore
    @Test
    public void testBPObsContainedMin() throws JsonProcessingException {

        Date now = new Date(System.currentTimeMillis());

        Observation obsSystolic = this.createSystolicBPObservationMin(120.0);
        obsSystolic.addIdentifier().setValue("systolic");
        obsSystolic.setId("systolic");

        logger.info("Systolic = " + JsonUtils.toJsonStringCompact(obsSystolic));

        Observation obsDiastolic = this.createDiastolicBPObservationMin(60.0);
        obsDiastolic.addIdentifier().setValue("diastolic");
        obsDiastolic.setId("diastolic");
        logger.info("Diastolic = " + JsonUtils.toJsonStringCompact(obsDiastolic));

        Observation obsParent = this.createParentBPObservationMin(now);

        Related obsc1 = new Related();
        ResourceReferenceDt ref1 = new ResourceReferenceDt();
        ref1.setReference("#systolic");
        obsc1.setTarget(ref1);
        obsc1.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc1);

        Related obsc2 = new Related();
        ResourceReferenceDt ref2 = new ResourceReferenceDt();
        ref2.setReference("#diastolic");
        obsc2.setTarget(ref2);
        obsc2.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc2);

        List<IResource> theContainedResources = new ArrayList<>(2);
        theContainedResources.add(obsSystolic);
        theContainedResources.add(obsDiastolic);

        obsParent.getContained().setContainedResources(theContainedResources);

        logger.info("Combinded JSON = " + JsonUtils.toJsonStringCompact(obsParent));

        IParser xmlParser = FhirUtils.getContext().newXmlParser();
        String XMLVersion = xmlParser.encodeResourceToString(obsParent);
        logger.info("Combinded XML = " + XMLVersion);
        FhirValidator validator = FhirUtils.getContext().newValidator();
        ValidationResult result = validator.validateWithResult(obsParent);
        if (!result.isSuccessful()) {
            logger.error("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
            fail("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
        }
    }

    /**
     * Create Systolic BP OPbservation (Minimum)
     * 
     * @param now
     * @param value
     * @return
     */

    public Observation createSystolicBPObservationMin(double value) {
        Observation obsSystolic = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code = new CodeableConceptDt();
        CodingDt codeDt = new CodingDt();
        codeDt.setCode("8480-6");
        codeDt.setSystem("http://loinc.org");
        codeDt.setDisplay("Systolic Blood pressure");
        code.getCoding().add(codeDt);
        obsSystolic.setCode(code);
        obsSystolic.setStatus(ObservationStatusEnum.PRELIMINARY);

        // Useful: issued, value
        obsSystolic.setComments("Systolic");
        QuantityDt qdt = new QuantityDt();
        qdt.setUnits("mm[Hg]");
        DecimalDt theValue = new DecimalDt(value);
        qdt.setValue(theValue);
        obsSystolic.setValue(qdt);

        return obsSystolic;
    }

    /**
     * Create a Diastolic Blood pressure observation (Minimum)
     * 
     * @return
     */
    public Observation createDiastolicBPObservationMin(double value) {

        Observation obsDiastolic = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code1 = new CodeableConceptDt();
        CodingDt codeDt1 = new CodingDt();
        codeDt1.setCode("8462-4");
        codeDt1.setSystem("http://loinc.org");
        codeDt1.setDisplay("Diastolic Blood pressure");
        code1.getCoding().add(codeDt1);
        obsDiastolic.setCode(code1);
        obsDiastolic.setStatus(ObservationStatusEnum.PRELIMINARY);

        // Useful: issued, value
        obsDiastolic.setComments("Diastolic");
        QuantityDt qdt1 = new QuantityDt();
        qdt1.setUnits("mm[Hg]");
        DecimalDt theValue1 = new DecimalDt(value);
        qdt1.setValue(theValue1);
        obsDiastolic.setValue(qdt1);

        return obsDiastolic;
    }

    /**
     * Create a minimal parent BP observation (In preliminary form)
     * 
     * @param now
     * @return
     */
    public Observation createParentBPObservationMin(Date now) {
        Observation obsBP = new Observation();
        // Needed: Code, status,
        CodeableConceptDt code = new CodeableConceptDt();
        CodingDt codeDt = new CodingDt();
        codeDt.setCode("55284-4");
        codeDt.setSystem("http://loinc.org");
        codeDt.setDisplay("Blood pressure systolic/diastolic");
        code.getCoding().add(codeDt);
        obsBP.setCode(code);
        obsBP.setStatus(ObservationStatusEnum.PRELIMINARY);

        // Useful: issued, value
        obsBP.setComments("Combined Blood pressure observation");
        obsBP.setIssuedWithMillisPrecision(now);

        return obsBP;
    }

    /**
     * Tests a minimal example as might be used by Validation. The form of this
     * observation is an observation that is preliminary as it would be seen by
     * a rules engine.Historic vitals will be similar in structural form but may
     * carry additional information and will have a difference status.
     * 
     * Current FHIR Json Exemplar produced:
     * 
     * { "code" : { "coding" : [ { "code" : "55284-4", "display" :
     * "Blood pressure systolic/diastolic", "system" : "http://loinc.org" } ] },
     * "comments" : "Combined Blood pressure observation", "contained" : [ {
     * "code" : { "coding" : [ { "code" : "8480-6", "display" :
     * "Systolic Blood pressure", "system" : "http://loinc.org" } ] },
     * "comments" : "Systolic", "id" : "systolic", "identifier" : [ { "value" :
     * "systolic" } ], "resourceType" : "Observation", "status" : "preliminary",
     * "valueQuantity" : { "units" : "mm[Hg]", "value" : 120.0 } }, { "code" : {
     * "coding" : [ { "code" : "8462-4", "display" : "Diastolic Blood pressure",
     * "system" : "http://loinc.org" } ] }, "comments" : "Diastolic", "id" :
     * "diastolic", "identifier" : [ { "value" : "diastolic" } ], "resourceType"
     * : "Observation", "status" : "preliminary", "valueQuantity" : { "units" :
     * "mm[Hg]", "value" : 60.0 } } ], "issued" :
     * "2015-06-19T09:26:42.238-07:00", "modifierExtension" : [ { "url" :
     * "http://org.cognitive.cds.invocation.fhir.datanature", "valueCode" :
     * "Input" }, { "url" :
     * "http://org.cognitive.cds.invocation.fhir.parametername", "valueString" :
     * "BloodPressure" } ], "related" : [ { "target" : { "reference" :
     * "#systolic" }, "type" : "has-component" }, { "target" : { "reference" :
     * "#diastolic" }, "type" : "has-component" } ], "resourceType" :
     * "Observation", "status" : "preliminary" }
     * 
     * 
     * @throws JsonProcessingException
     */
    @Ignore
    @Test
    public void testBPObsContainedValidationAtRulesEngine() throws JsonProcessingException {

        Date now = new Date(System.currentTimeMillis());

        Observation obsSystolic = this.createSystolicBPObservationMin(120.0);
        obsSystolic.addIdentifier().setValue("systolic");
        obsSystolic.setId("systolic");

        logger.info("Systolic = " + JsonUtils.toJsonStringCompact(obsSystolic));

        Observation obsDiastolic = this.createDiastolicBPObservationMin(60.0);
        obsDiastolic.addIdentifier().setValue("diastolic");
        obsDiastolic.setId("diastolic");
        logger.info("Diastolic = " + JsonUtils.toJsonStringCompact(obsDiastolic));

        Observation obsParent = this.createParentBPObservationMin(now);

        Related obsc1 = new Related();
        ResourceReferenceDt ref1 = new ResourceReferenceDt();
        ref1.setReference("#systolic");
        obsc1.setTarget(ref1);
        obsc1.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc1);

        Related obsc2 = new Related();
        ResourceReferenceDt ref2 = new ResourceReferenceDt();
        ref2.setReference("#diastolic");
        obsc2.setTarget(ref2);
        obsc2.setType(ObservationRelationshipTypeEnum.HAS_COMPONENT);
        obsParent.getRelated().add(obsc2);

        List<IResource> theContainedResources = new ArrayList<>(2);
        theContainedResources.add(obsSystolic);
        theContainedResources.add(obsDiastolic);

        obsParent.getContained().setContainedResources(theContainedResources);
        FhirUtils.MarkAsParameter(obsParent, "BloodPressure");

        logger.info("Rules JSON = " + JsonUtils.toJsonStringCompact(obsParent));

        IParser xmlParser = FhirUtils.getContext().newXmlParser();
        String XMLVersion = xmlParser.encodeResourceToString(obsParent);
        logger.info("Rules XML = " + XMLVersion);
        FhirValidator validator = FhirUtils.getContext().newValidator();
        ValidationResult result = validator.validateWithResult(obsParent);
        if (!result.isSuccessful()) {
            logger.error("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
            fail("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
        }
    }

    /**
     * Helper function to add a String based extension element
     * 
     * @param rsc
     * @param name
     * @param value
     */
    private void addStringExtension(BaseElement be, String name, String value) {
        String theURL = EXTENSION_BASE + name;
        ExtensionDt theExtension = new ExtensionDt();
        theExtension.setUrl(theURL);
        StringDt theValue = new StringDt(value);
        theExtension.setValue(theValue);
        be.addUndeclaredExtension(theExtension);
    }

    /**
     * Helper to assign a resource and Id and add it to the contained list
     * 
     * @param rsc
     * @param theContainedResources
     */
    private void assignIdAndAdd(IResource rsc, List<IResource> theContainedResources) {
        IdDt id = createId(rsc.getResourceName(), theContainedResources);
        rsc.setId(id);
        theContainedResources.add(rsc);

    }

    /**
     * Helper function to generate the next unique id for contained resources
     *
     * 
     * @param base
     * @param theContainedResources
     * @return the new Id
     */
    private IdDt createId(String base, List<IResource> theContainedResources) {
        IdDt id = new IdDt();
        id.setValue(base + (theContainedResources.size() + 1));
        return id;
    }

    /**
     * Helper the get a Resource Reference
     * 
     * @param resource
     * @return A reference a contained resource
     */
    private ResourceReferenceDt getContainedResourceRef(IResource resource) {
        ResourceReferenceDt ref = new ResourceReferenceDt();
        ref.setReference("#" + resource.getId().getValue());
        return ref;
    }

    /**
     * Helper function to create a CodingDt
     * 
     * @param system
     * @param code
     * @param display
     * @return
     */
    private CodingDt createCoding(String system, String code, String display) {
        CodingDt coding = new CodingDt();
        coding.setSystem(system);
        coding.setCode(code);
        coding.setDisplay(display);
        return coding;
    }

}
