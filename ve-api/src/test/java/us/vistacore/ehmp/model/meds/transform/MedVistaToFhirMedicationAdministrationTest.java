package us.vistacore.ehmp.model.meds.transform;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

import java.util.Collection;
import java.util.List;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Encounter;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.MedicationAdministration;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.Type;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;

@RunWith(Parameterized.class)
public class MedVistaToFhirMedicationAdministrationTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return MedicationsGenerator.create();
    }

    private static MedResult emptyMedResult = new MedResult();
    private MedResult medResult;

    public MedVistaToFhirMedicationAdministrationTest(MedResult medicationResultInput, String dfn) {
        this.medResult = medicationResultInput;
    }

    @Before
    public void setUp() throws Exception { }

    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationPrescription.class);
    
    @Test
    public void testTransformEncounter() throws ModelTransformException {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationAdministration.transformEncounter(fhirMedicationAdministration, medResult, fhirMedicationPrescription);
        verifyTransformEncounter(fhirMedicationAdministration, this.medResult, fhirMedicationPrescription);
    }

    public void verifyTransformEncounter(MedicationAdministration fhirMedicationAdministration, MedResult medResult, MedicationPrescription fhirMedicationPrescription) throws ModelTransformException {
        List<Encounter> containedEncounter = FhirUtils.getContainedResources(fhirMedicationAdministration, Encounter.class);
        if (containedEncounter != null && containedEncounter.size() != 0) {
            assertEquals("There should be only one encounter ", 1, containedEncounter.size());
        } else {
            assertEquals("There should be no encounter ", 0, containedEncounter.size());
        }
    }
    
    @Test
    public void testTransformMedicationPrescription() throws ModelTransformException {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        VistaPatientIdentity oVistaPatientIdentity = new VistaPatientIdentity();
        MedicationPrescription fhirMedicationPrescription = new MedicationPrescription();
        MedVistaToFhirMedicationAdministration.transformPrescription(fhirMedicationAdministration, medResult, oVistaPatientIdentity);
        verifyTransformEncounter(fhirMedicationAdministration, this.medResult, fhirMedicationPrescription);
    }

    public void verifyTransformMedicationPrescription(MedicationAdministration fhirMedicationAdministration, MedResult medResult, VistaPatientIdentity oVistaPatientIdentity) throws ModelTransformException {
        List<MedicationPrescription> containedMedicationPrescription = FhirUtils.getContainedResources(fhirMedicationAdministration, MedicationPrescription.class);
        assertEquals("There must be one and only one prescription ", 1, containedMedicationPrescription.size());
    }
    
    private void verifyTransformExtensions(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        int foundFields = 0;

        List<Extension> extensions = fhirMedicationAdministration.getExtensions();

        for (Extension extension : extensions) {
            String url = extension.getUrlSimple();
            Type value = extension.getValue();
            assertNotNull("Medication Administration extension shouldn't be null", value);

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationAdministration.MEDICATIONADMINISTRATION_MED_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    assertTrue("The field should have been prefixed correctly",
                            url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                }
            }
        }
    }

    @Test
    public void testTransformExtensionsValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformExtensions(fhirMedicationAdministration, medResult);
        verifyTransformExtensions(fhirMedicationAdministration, this.medResult);
    }

    @Test
    public void testTransformExtensionsNull() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformExtensions(fhirMedicationAdministration, emptyMedResult);
        assertEquals("Extensions should be 0 ", 0, fhirMedicationAdministration.getExtensions().size());
    }

    private void verifyTransformStatus(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null && medResult.getVaStatus() != null) {
            assertNotNull("The status shouldn't be null", fhirMedicationAdministration.getStatusSimple());
            assertEquals("The status was incorrect ", MedVistaToFhirMedicationAdministration.MEDICATION_ADMIN_STATUS_NAME_MAP.get(medResult.getVaStatus()), fhirMedicationAdministration.getStatusSimple());
        } else {
            assertNull("Status should have been null ", fhirMedicationAdministration.getStatusSimple());
        }
    }

    @Test
    public void testTransformStatusValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformStatus(fhirMedicationAdministration, medResult);
        verifyTransformStatus(fhirMedicationAdministration, this.medResult);
    }

    private void verifyTransformWhenGiven(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        assertNotNull("When given shouldn't be null ", fhirMedicationAdministration.getWhenGiven());
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                 try {
                    DateTime start = FhirUtils.createFhirDateTime(dosage.getStart());
                    DateTime stop = FhirUtils.createFhirDateTime(dosage.getStop());
                    assertThat(fhirMedicationAdministration.getWhenGiven().getStartSimple().toString(), containsString(start.asStringValue()));
                    assertThat(fhirMedicationAdministration.getWhenGiven().getEndSimple().toString(), containsString(stop.asStringValue()));
                } catch (ModelTransformException e) {
                    e.printStackTrace();
                }
            }
        } else {
            assertNull("When given should be null ", fhirMedicationAdministration.getWhenGiven());
        }
    }

    @Test
    public void testTransformWhenGivenValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformWhenGiven(fhirMedicationAdministration, medResult);
        verifyTransformWhenGiven(fhirMedicationAdministration, this.medResult);
    }

    private void verifyTransformDosageExtensions(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        int foundFields = 0;
        
        List<Extension> extensions = fhirMedicationAdministration.addDosage().getExtensions();

        for (Extension extension : extensions) {
            String url = extension.getUrlSimple();
            Type value = extension.getValue();
            assertNotNull("Medication administration dosage extension shouldn't be null", value);

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationAdministration.DOSAGE_MED_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    assertTrue("Medication administration dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                    assertEquals("Medication administration dosage extension value should equal ", value.toString(), medResult);
                }
            }

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationAdministration.DOSAGE_DOSAGES_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    for (Dosages dosage : medResult.getDosages()) {
                        assertTrue("Medication administration dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                        assertEquals("Medication administration dosage extension value should equal ", value.toString(), dosage);
                    }
                }
            }

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationAdministration.DOSAGE_ORDERS_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    for (Orders order : medResult.getOrders()) {
                        assertTrue("Medication administration dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                        assertEquals("Medication administration dosage extension value should equal ", value.toString(), order);
                    }
                }
            }
        }
    }

    @Test
    public void testTransformDosageExtensionValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformDosageExtensions(fhirMedicationAdministration, medResult);
        verifyTransformDosageExtensions(fhirMedicationAdministration, this.medResult);
    }

    @Test
    public void testTransformDosageExtensionNull() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformDosageExtensions(fhirMedicationAdministration, emptyMedResult);
        assertEquals("Dosage extension should be 0 ", 0, fhirMedicationAdministration.addDosage().getExtensions().size());
    }


    private void verifyTransformDosageQuantity(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getDose()) && NumberUtils.isNumber(dosage.getDose())) {
                    assertEquals("Dosage quantity value should equal ", dosage.getDose(), fhirMedicationAdministration.getDosage().iterator().next().getQuantity().getValueSimple());
                    assertEquals("Dosage quantity unit should equal ", dosage.getUnits(), fhirMedicationAdministration.getDosage().iterator().next().getQuantity().getUnitsSimple());
                }
//                else {
//                    assertNull("Dosage quantity value should be null ", fhirMedicationAdministration.getDosage().iterator().next().getQuantity().getValueSimple());
//                    assertNull("Dosage quantity unit should be null ", fhirMedicationAdministration.getDosage().iterator().next().getQuantity().getUnitsSimple());
//                }
            }
        }
    }

    @Test
    public void testTransformDosageQuantityValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformDosageQuantity(fhirMedicationAdministration, medResult);
        verifyTransformDosageQuantity(fhirMedicationAdministration, this.medResult);
    }


    private void verifyTransformScheduleName(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (medResult != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getScheduleName())) {
                    assertNotNull("Schedule name shouldn't be null ", fhirMedicationAdministration.getDosage().iterator().next().getTiming().getExtensions());

                    List<Extension> e = fhirMedicationAdministration.getDosage().iterator().next().getTiming().getExtensions();

                    Extension a = FhirUtils.findExtension(e, MedVistaToFhirMedicationAdministration.SCHEDULE_EXTENSION_URL_PREFIX);

                    String b = FhirUtils.extractFhirStringValue(a.getValue());
                    assertEquals("Shedule name should equal ", dosage.getScheduleName(), b);
                    assertThat(a.getUrlSimple(), containsString(MedVistaToFhirMedicationAdministration.SCHEDULE_EXTENSION_URL_PREFIX));
                } else {
                    assertNull("Schedule name should be null", fhirMedicationAdministration.addDosage().getTiming());
                }
            }
        }
    }

    @Test
    public void testTransformScheduleNameValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformScheduleName(fhirMedicationAdministration, medResult);
        verifyTransformScheduleName(fhirMedicationAdministration, this.medResult);
    }

    private void verifyTransformDosageRoute(MedicationAdministration fhirMedicationAdministration, MedResult medResult) {
        if (fhirMedicationAdministration.addDosage().getRoute() != null) {
        assertNotNull("Dosage route shouldn't be null ", fhirMedicationAdministration.addDosage().getRoute().getTextSimple());
        assertEquals("Dosage route should equal ", fhirMedicationAdministration.addDosage().getRoute().getTextSimple(), medResult.getDosages().get(0).getRouteName());
        } else {
            assertNull("Dosage route should be null ", fhirMedicationAdministration.addDosage().getRoute());
        }
    }

    @Test
    public void testTransformDosageRouteValid() {
        MedicationAdministration fhirMedicationAdministration = new MedicationAdministration();
        MedVistaToFhirMedicationAdministration.transformDosageRoute(fhirMedicationAdministration, medResult);
        verifyTransformDosageRoute(fhirMedicationAdministration, this.medResult);
    }
}
