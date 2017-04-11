package us.vistacore.ehmp.model.meds.transform;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Collection;
import java.util.List;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.Encounter;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.MedicationPrescription.MedicationPrescriptionDispenseComponent;
import org.hl7.fhir.instance.model.MedicationPrescription.MedicationPrescriptionDosageInstructionComponent;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceType;
import org.hl7.fhir.instance.model.Type;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class tests the MedicationsVistaToFhir class
 *
 * @author josephg
 *
 */
@RunWith(Parameterized.class)
public class MedsVistaToFhirMedicationPrescriptionTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return MedicationsGenerator.create();
    }

    private MedResult medResult;

    public MedsVistaToFhirMedicationPrescriptionTest(MedResult medicationResultInput, String dfn) {
        this.medResult = medicationResultInput;
    }

    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationPrescription.class);

    @SuppressWarnings("unused")
    private void verifyTransformDate(MedResult medResult, MedicationPrescription fhirMedicationPrescription) {
        assertNotNull("The medicationPrescription extension node should not have been null", fhirMedicationPrescription.getExtensions());
        assertFalse(medResult.getSupply(), false);
        for (String fieldName : MedVistaToFhirMedicationPrescription.MEDICATIONPRECRIPTION_MED_EXTENSION_FIELD_NAMES) {
            String fieldValue = (String) FhirUtils.getBeanPropertyValue(medResult, fieldName);
            if (isNotNullish(fieldValue)) {
                String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirMedicationPrescription.getExtension(name);
                assertEquals("Extension value does equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }
    }

    /**
     * This method tests creates an empty medication prescription report and transform the extension
     */
    @Test
    public void testTransformMedicationPrescriptionExtensions() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformMedicationPrescriptionExtensions(fhirMedicationPrescription, this.medResult);
        verifyTransformMedicationPrescriptionExtensions(this.medResult, fhirMedicationPrescription);
    }

    /**
     * This method tests verifies we populated Fhir correctly
     *
     * @param medResult The med result to compare to.
     * @param fhirMedicationPrescription The MedicationPrescription being verified.
     */
    private void verifyTransformMedicationPrescriptionExtensions(MedResult medResult, MedicationPrescription fhirMedicationPrescription) {
        assertNotNull("The medicationPrescription extension node should not have been null", fhirMedicationPrescription.getExtensions());
        assertFalse(medResult.getSupply(), false);
        for (String fieldName : MedVistaToFhirMedicationPrescription.MEDICATIONPRECRIPTION_MED_EXTENSION_FIELD_NAMES) {
            String fieldValue = (String) FhirUtils.getBeanPropertyValue(medResult, fieldName);
            if (isNotNullish(fieldValue)) {
                String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirMedicationPrescription.getExtension(name);
                assertEquals("Extension value does equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }
    }

    /**
     * This method tests creates an empty medication prescription dosage instruction report and transform the extension
     */
    @Test
    public void testTransformMedicationPrescriptionDosageInstructionExtensions() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformMedicationPrescriptionDosageInstructionExtensions(fhirMedicationPrescription, this.medResult);
        verifyTransformMedicationPrescriptionDosageInstructionExtensions(this.medResult, fhirMedicationPrescription);
    }

    private void verifyTransformMedicationPrescriptionDosageInstructionExtensions(MedResult medResult, MedicationPrescription fhirMedicationPrescription) {
        MedicationPrescriptionDosageInstructionComponent fhirMedicationPrescriptionDosageInstructionComponent = fhirMedicationPrescription.addDosageInstruction();
        assertNotNull("The MedicationPrescriptionDosageInstructionComponent extension node should not have been null", fhirMedicationPrescriptionDosageInstructionComponent.getExtensions());
        for (String fieldName : MedVistaToFhirMedicationPrescription.DOSAGEINSTRUCTION_DOSAGES_EXTENSION_FIELD_NAMES) {
            String fieldValue = (String) FhirUtils.getBeanPropertyValue(medResult.getDosages(), fieldName);
            if (isNotNullish(fieldValue)) {
                String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirMedicationPrescriptionDosageInstructionComponent.getExtension(name);
                assertEquals("Extension value does equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }
        for (String fieldName : MedVistaToFhirMedicationPrescription.DOSAGEINSTRUCTION_ORDERS_EXTENSION_FIELD_NAMES) {
            String fieldValue = (String) FhirUtils.getBeanPropertyValue(medResult.getOrders(), fieldName);
            if (isNotNullish(fieldValue)) {
                String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + fieldName;
                Extension extension = fhirMedicationPrescriptionDosageInstructionComponent.getExtension(name);
                assertEquals("Extension value does equal field value", fieldValue, FhirUtils.extractFhirStringValue(extension.getValue()));
            }
        }
    }

    @Test
    public void testTransformDateWritten() throws ModelTransformException {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformDateWritten(fhirMedicationPrescription, this.medResult);
        verifyTransformDateWritten(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformDateWritten(MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        if ((medResult != null) && (isNotNullish(medResult.getOrders()))) {
            for (Orders order : medResult.getOrders()) {
                try {
                    DateAndTime d = DateAndTime.parseV3(order.getOrdered()); 
                    assertTrue("The issued date/time was incorrect.", fhirMedicationPrescription.getDateWritten().getValue().toString().startsWith(d.toString()));
                } catch (ParseException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Test
    public void testTransformSummary() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformSummary(fhirMedicationPrescription, this.medResult);
        verifyTransformSummary(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformSummary(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        assertEquals("For status ", NarrativeStatus.generated, fhirMedicationPrescription.getText().getStatusSimple());
    }

    @Test
    public void testTransformIdentifier() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformIdentifier(fhirMedicationPrescription, medResult);
        verifyTransformIdentifier(fhirMedicationPrescription, this.medResult);
    }

    /**
     * This method verifies the contents of the transformed medication prescription ids.
     *
     * @param medResult The med result to compare to.
     * @param fhirMedicationPrescription The MedicationPrescription being verified.
     */
    private void verifyTransformIdentifier(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if ((medResult != null) && (isNotNullish(medResult.getUid()))) {
            assertEquals("The uid is not the same", medResult.getUid(), fhirMedicationPrescription.getIdentifier().get(0).getValueSimple());
        }

        if ((medResult != null) && (isNotNullish(medResult.getOrders()))) {
            for (Orders order : medResult.getOrders()) {
                assertEquals("Identifier value is not the same.", order.getPrescriptionId(), fhirMedicationPrescription.getIdentifier().get(1).getValueSimple());
            }
        }
    }

    @Test
    public void testTransformPractitioner() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformPrescriber(fhirMedicationPrescription, medResult, fhirMedicationPrescription);
        verifyTransformPractitioner(fhirMedicationPrescription, this.medResult);
    }

    public void verifyTransformPractitioner(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        for (Orders order : medResult.getOrders()) {
            assertNotNull("The prescriber field should not have been null.", fhirMedicationPrescription.getPrescriber());

            List<Practitioner> containedPrescribers = FhirUtils.getContainedResources(fhirMedicationPrescription, Practitioner.class);
            assertEquals("There should have been only one contained prescriber.", 1, containedPrescribers.size());
            
            Practitioner containedPrescriber = containedPrescribers.get(0);

            assertTrue("The prescriber reference field should reference the contained resource.", fhirMedicationPrescription.getPrescriber().getReferenceSimple().contains(containedPrescriber.getXmlId()));

            assertNotNull(containedPrescriber.getIdentifier());
            assertEquals("For the contained practitioner identifier value ", order.getProviderUid(), containedPrescriber.getIdentifier().iterator().next().getValueSimple());
            assertEquals("For the contained practitioner identifier system ", MedVistaToFhirMedicationPrescription.PRESCRIBER_INTERPRETATION_SYSTEM, containedPrescriber.getIdentifier().iterator().next().getSystemSimple());
            assertEquals("For the content of prescriber name ", order.getProviderName(), containedPrescriber.getName().getTextSimple());

        }
    }

    @Test
    public void testTransformEncounter() throws ModelTransformException {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformEncounter(fhirMedicationPrescription, medResult, fhirMedicationPrescription);
        verifyTransformEncounter(fhirMedicationPrescription, this.medResult);
    }

    public void verifyTransformEncounter(MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        List<Encounter> containedEncounters = FhirUtils.getContainedResources(fhirMedicationPrescription, Encounter.class);

        assertEquals("There should be only one contained Encounter", 1, containedEncounters.size());
        Encounter containedEncounter = containedEncounters.get(0);
        
        assertEquals("For contained Encounter type ", medResult.getVaType(), containedEncounter.getType().get(0).getTextSimple());
        
        List<Location> containedLocations = FhirUtils.getContainedResources(fhirMedicationPrescription, Location.class);
        assertEquals("There should be only one contained location", 1, containedLocations.size());
        
        Location containedLocation = containedLocations.get(0);
        assertTrue("The encounter reference should reference the location reference ", containedEncounter.getLocation().iterator().next().getLocation().getReferenceSimple().contains(containedLocation.getXmlId()));
        assertEquals("For location identifier value ", medResult.getFacilityCode(), containedLocation.getIdentifier().getValueSimple());
        assertEquals("For location identifier system ", MedVistaToFhirMedicationPrescription.ENCOUNTER_INTERPRETATION_SYSTEM, containedLocation.getIdentifier().getSystemSimple());
        assertEquals("Facility name is wrong ", medResult.getFacilityName(), containedLocation.getNameSimple().toString());

        for (Orders order : medResult.getOrders()) {
            assertEquals("Location name is wrong", order.getLocationName(), containedEncounter.getLocation().iterator().next().getLocation().getDisplaySimple());
            String startFhirDateTimeString = FhirUtils.transformHL7V2DateTimeToFhirDateTime(order.getOrdered());
            
            if (startFhirDateTimeString != null) {
                Period a = containedEncounter.getPeriod();
                if (a != null) {
                    DateAndTime b = a.getStartSimple();
                    assertEquals("Encounter start time is wrong", startFhirDateTimeString.toString(), b);   
                }
            }
        }
    }

    @Test
    public void testTransformStatus() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformStatus(fhirMedicationPrescription, this.medResult);
        verifyTransformStatus(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformStatus(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (isNotNullish(medResult.getMedStatusName())) {
            assertNotNull("The status should not be null", fhirMedicationPrescription.getStatusSimple());
            assertEquals("For status code  ", MedVistaToFhirMedicationPrescription.MED_STATUS_NAME_MAP.get(medResult.getMedStatusName()), fhirMedicationPrescription.getStatusSimple());
        } else {
            assertNull("The status should be null", fhirMedicationPrescription.getStatusSimple());
        }
    }

    @Test
    public void testTransformDoseQuantity() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformDoseQuantity(fhirMedicationPrescription, this.medResult);
        verifyTransformDoseQuantity(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformDoseQuantity(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (dosage.getDose() != null && NumberUtils.isNumber(dosage.getDose())) {
                    assertEquals("For dosageInstruction doseQuantity value ", dosage.getDose(), fhirMedicationPrescription.getDosageInstruction().get(0).getDoseQuantity().getValueSimple().toPlainString());
                }
            }
        }
    }

    @Test
    public void testTransformRoute() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformRoute(fhirMedicationPrescription, this.medResult);
        verifyTransformRoute(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformRoute(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
            if (medResult != null && medResult.getDosages() != null) {
                for (Dosages dosage : medResult.getDosages()) {
                    if (dosage.getRouteName() != null) {
                        List<MedicationPrescriptionDosageInstructionComponent>  a = fhirMedicationPrescription.getDosageInstruction();
                        
                        if (a.size() > 0) {
                        MedicationPrescriptionDosageInstructionComponent b = a.get(0);
                        CodeableConcept codeable = b.getRoute();
                            if (codeable == null) {
                                assertNull("Dosage route codeable concept was not null", codeable);
                            } else {
                                Coding coding = codeable.getCoding().get(0);
                                String e = coding.getCodeSimple();
                                String f = coding.getDisplaySimple();
                                String g = coding.getSystemSimple();
                                assertEquals("The coding code was incorrect.", dosage.getRouteName(), e);
                                assertEquals("The coding system was incorrect.", MedVistaToFhirMedicationPrescription.ROUTE_INTERPRETATION_SYSTEM, g);
                                assertEquals("The coding display was incorrect.", MedVistaToFhirMedicationPrescription.DOSAGE_ROUTE_MAP.get(dosage.getRouteName()).getCoding().get(0).getDisplaySimple().toString(), f);
                            }
                        }
                    } else {
                        assertNull("No codeable match ", MedVistaToFhirMedicationPrescription.DOSAGE_ROUTE_MAP.get(dosage.getRouteName()));
                    }
                    
                    if (isNotNullish(dosage.getDose())) {
                        List<MedicationPrescriptionDosageInstructionComponent> a = fhirMedicationPrescription.getDosageInstruction();
                        BigDecimal q = FhirUtils.createBigDecimal(dosage.getDose());
                        if (q != null) {
                            MedicationPrescriptionDosageInstructionComponent b = a.get(0);
                            Quantity c = b.getDoseQuantity();
                            BigDecimal d = c.getValueSimple();
                            String e = c.getUnitsSimple();
                            assertEquals("For dosageInstruction doseQuantity value ", q, d);
                            assertEquals("For dosageInstruction doseQuantity value ", dosage.getUnits(), e);
                        } else {
                            assertNull("Could not parse dosage.getDoseVal ", q);
                        }
                    }
                }
             }
         }
  
    @Test
    public void testTransformScheduleName() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformScheduleName(fhirMedicationPrescription, this.medResult);
        verifyTransformScheduleName(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformScheduleName(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getDosages() != null) {            
            for (Dosages dosage : medResult.getDosages()) {
                if (dosage.getScheduleName() != null) {
                    String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + "scheduleName";
                    Extension extension = fhirMedicationPrescription.getDosageInstruction().iterator().next().getTiming().getExtension(name);                      
                    assertEquals("For dosage instruction timing schedule extension value ", dosage.getScheduleName(), FhirUtils.extractFhirStringValue(extension.getValue()));
                    assertThat(fhirMedicationPrescription.getDosageInstruction().iterator().next().getTiming().getExtensions().iterator().next().getUrlSimple(), containsString(name));
                }
            }
        }
    }

    @Test
    public void testTransformTiming() throws ModelTransformException {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformTiming(fhirMedicationPrescription, this.medResult);
        verifyTransformTiming(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformTiming(MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {

                String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + "scheduleType";
                Extension extension = fhirMedicationPrescription.getDosageInstruction().iterator().next().getTiming().getExtension(name);                
                
                assertEquals("For dosage instruction timing period extension value ", dosage.getScheduleType(), FhirUtils.extractFhirStringValue(extension.getValue()));
                assertThat(fhirMedicationPrescription.getDosageInstruction().iterator().next().getTiming().getExtensions().iterator().next().getUrlSimple(), containsString(name));
                
                Type d = fhirMedicationPrescription.getDosageInstruction().iterator().next().getTiming();
                DateAndTime fhirStart = ((Period) d).getStartSimple();
                DateAndTime fhirEnd = ((Period) d).getEndSimple();        
                
                try {
                    DateAndTime start = DateAndTime.parseV3(dosage.getStart());
                    DateAndTime end = DateAndTime.parseV3(dosage.getStop()); 
                    if (d instanceof Period) {
                       assertThat(fhirStart.toString(), containsString(start.toString()));
                       assertThat(fhirEnd.toString(), containsString(end.toString()));
                    }
                } catch (ParseException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        }
    }

    @Test
    public void testTransformPatientInstruction() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformPatientInstruction(fhirMedicationPrescription, this.medResult);
        verifyTransformPatientInstruction(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformPatientInstruction(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult.getPatientInstruction() != null) {
            assertEquals("For additional instructions ", medResult.getPatientInstruction(), fhirMedicationPrescription.getDosageInstruction().iterator().next().getAdditionalInstructions().getTextSimple());
        } else {
            assertNull("For additional instructions ", medResult.getPatientInstruction());
        }
    }

    @Test
    public void testTransformSig() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformSig(fhirMedicationPrescription, this.medResult);
        verifyTransformSig(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformSig(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (isNotNullish(medResult.getSig())) {
            assertEquals("For dosageInstruction text ", medResult.getSig(), fhirMedicationPrescription.getDosageInstruction().iterator().next().getTextSimple());
        }
    }

    @Test
    public void testTransformValidityPeriod() throws ModelTransformException {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent = new MedicationPrescriptionDispenseComponent();
        MedVistaToFhirMedicationPrescription.transformValidityPeriod(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
        verifyTransformValidityPeriod(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformValidityPeriod(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) throws ModelTransformException {
        
        try {
            if (isNotNullish(medResult.getOverallStart()) && isNotNullish(medResult.getOverallStop())) {
                DateAndTime start, stop;
                start = DateAndTime.parseV3(medResult.getOverallStart());
                stop = DateAndTime.parseV3(medResult.getOverallStop());
                
                assertThat(fhirMedicationPrescriptionDispenseComponent.getValidityPeriod().getStartSimple().toString(),  containsString(start.toString()));
                assertThat(fhirMedicationPrescriptionDispenseComponent.getValidityPeriod().getEndSimple().toString(), containsString(stop.toString()));
            } else {
                assertNull("For start date null check ", fhirMedicationPrescriptionDispenseComponent.getValidityPeriod().getStartSimple().toString());
                assertNull("For end date null check ", fhirMedicationPrescriptionDispenseComponent.getValidityPeriod().getEndSimple().toString());
            }
        } catch (ParseException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }
        
        if (isNotNullish(medResult.getStopped()) && (!medResult.getVaType().equals("N"))) {
            String name = MedVistaToFhirMedicationPrescription.MED_EXTENSION_URL_PREFIX + "stopped";
            Extension extension = fhirMedicationPrescriptionDispenseComponent.getValidityPeriod().getExtension(name);
            assertEquals("Extension value does equal field value", medResult.getStopped(), FhirUtils.extractFhirStringValue(extension.getValue()));
        }
    }
    
    @Test
    public void testTransformQuantity() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent = new MedicationPrescriptionDispenseComponent();
        MedVistaToFhirMedicationPrescription.transformQuantity(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
        verifyTransformQuantity(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformQuantity(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                assertEquals("For dispense quantity ", order.getQuantityOrdered(), fhirMedicationPrescriptionDispenseComponent.getQuantity().getValueSimple().toPlainString());
            }
        }
    }

    @Test
    public void testTransformExpectedSupplyNumberOfRepeats() {
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent = new MedicationPrescriptionDispenseComponent();
        MedVistaToFhirMedicationPrescription.transformExpectedSupplyNumberOfRepeats(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
        verifyTransformExpectedSupplyNumberOfRepeats(fhirMedicationPrescriptionDispenseComponent, fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformExpectedSupplyNumberOfRepeats(MedicationPrescriptionDispenseComponent fhirMedicationPrescriptionDispenseComponent, MedicationPrescription fhirMedicationPrescription, MedResult medResult) {   
        if (medResult != null && medResult.getOrders() != null) {
            for (Orders order : medResult.getOrders()) {
                assertEquals("For dispense expectedSupplyDuration ", order.getDaysSupply(), fhirMedicationPrescriptionDispenseComponent.getExpectedSupplyDuration().getValueSimple().toPlainString());
                assertEquals("For dispense numberOfRepeatsAllowed ", order.getFillsAllowed(), fhirMedicationPrescriptionDispenseComponent.getNumberOfRepeatsAllowed().getStringValue());
            }
        }
    }

    @Test
    public void testTransformMedication() {
        @SuppressWarnings("serial")
        Resource parentResource = new Resource() {
            public ResourceType getResourceType() { return ResourceType.Other; }
        };
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationPrescription.transformMedication(fhirMedicationPrescription, this.medResult, parentResource);
        verifyTransformMedication(fhirMedicationPrescription, this.medResult);
    }

    private void verifyTransformMedication(MedicationPrescription fhirMedicationPrescription, MedResult medResult) {
        assertEquals("For medication resource display ", medResult.getName(), fhirMedicationPrescription.getMedication().getDisplaySimple());
        assertThat(fhirMedicationPrescription.getMedication().getReferenceSimple(), containsString(MedVistaToFhirMedication.MEDICATION_ID_PREFIX + medResult.getUid()));

    }

}
