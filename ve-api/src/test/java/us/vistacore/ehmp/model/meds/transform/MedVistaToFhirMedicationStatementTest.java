package us.vistacore.ehmp.model.meds.transform;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

import java.util.Collection;
import java.util.List;

import org.apache.commons.lang3.math.NumberUtils;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Medication;
import org.hl7.fhir.instance.model.MedicationDispense;
import org.hl7.fhir.instance.model.MedicationPrescription;
import org.hl7.fhir.instance.model.MedicationStatement;
import org.hl7.fhir.instance.model.Specimen;
import org.hl7.fhir.instance.model.Type;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.labresults.LabResult;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;
import us.vistacore.ehmp.model.labresults.transform.LabResultsGenerator;
import us.vistacore.ehmp.model.labresults.transform.LabResultsVistaToFhir;
import us.vistacore.ehmp.model.meds.Dosages;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.MedicationData;
import us.vistacore.ehmp.model.meds.Orders;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

@RunWith(Parameterized.class)
public class MedVistaToFhirMedicationStatementTest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return MedicationsGenerator.create();
    }
    
    private MedVistaToFhirMedicationStatement testObject = null;

    @Before
    public void setUp() throws Exception {
        testObject = new MedVistaToFhirMedicationStatement();
    }
    
    private static MedResult emptyMedResult = new MedResult();
    private MedResult medResult;

    public MedVistaToFhirMedicationStatementTest(MedResult medicationResultInput, String dfn) {
        this.medResult = medicationResultInput;
    }

//    @Before
//    public void setUp() throws Exception { }

    public static final Logger LOGGER = LoggerFactory.getLogger(MedVistaToFhirMedicationPrescription.class);

    private void verifyTransformExtensions(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        int foundFields = 0;
        List<Extension> extensions = fhirMedicationStatement.getExtensions();

        for (Extension extension : extensions) {
            String url = extension.getUrlSimple();
            Type value = extension.getValue();
            assertNotNull("Medication Statement extension shouldn't be null", value);

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationStatement.MEDICATIONSTATEMENT_MED_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    assertTrue("The field should have been prefixed correctly",
                            url.startsWith(MedVistaToFhirMedicationStatement.MED_EXTENSION_URL_PREFIX));
                    //assertEquals("Medication statement med extension value should equal ", value.toString(), medResult);
                }
            }

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationStatement.MEDICATIONSTATEMENT_ORDERS_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    for (Orders order : medResult.getOrders()) {
                        assertTrue("Medication statement order extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                        //assertEquals("Medication statement order extension value should equal ", value.toString(), order);
                    }
                }
            }
        }
    }

    @Test
    public void testTransformExtensionsValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformExtensions(fhirMedicationStatement, medResult);
        verifyTransformExtensions(fhirMedicationStatement, this.medResult);
    }

    @Test
    public void testTransformExtensionsNull() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformExtensions(fhirMedicationStatement, emptyMedResult);
        assertEquals("Extensions should be 0 ", 0, fhirMedicationStatement.getExtensions().size());
    }

    private void verifyTransformPatient(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (fhirMedicationStatement.getPatient() != null) {
        assertNotNull("Patient shouldn't be null ", fhirMedicationStatement.getPatient().getDisplaySimple());
        assertEquals("Patient should equal ", fhirMedicationStatement.getPatient().getDisplaySimple(), medResult.getPid());
        } else {
            assertNull("Patient should be null ", fhirMedicationStatement.getPatient());
        }
    }

    @Test
    public void testTransformPatient() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        VistaPatientIdentity oVistaPatientIdentity = new VistaPatientIdentity();
        MedVistaToFhirMedicationStatement.transformPatient(fhirMedicationStatement, oVistaPatientIdentity, medResult);
        verifyTransformPatient(fhirMedicationStatement, this.medResult);
    }

    private void verifyTransformWhenGiven(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        assertNotNull("When given shouldn't be null ", fhirMedicationStatement.getWhenGiven());
        if (medResult != null && medResult.getDosages() != null) {
            for (Dosages dosage : medResult.getDosages()) {
                 try {
                    DateTime start = FhirUtils.createFhirDateTime(dosage.getStart());
                    assertThat(fhirMedicationStatement.getWhenGiven().getStartSimple().toString(), containsString(start.asStringValue()));
                } catch (ModelTransformException e) {
                    e.printStackTrace();
                }
            }
        } else {
            assertNull("When given should be null ", fhirMedicationStatement.getWhenGiven());
        }
    }

    @Test
    public void testTransformWhenGivenValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformWhenGiven(fhirMedicationStatement, medResult);
        verifyTransformWhenGiven(fhirMedicationStatement, this.medResult);
    }

    private void verifyTransformDosageExtensions(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        int foundFields = 0;
        
        List<Extension> extensions = fhirMedicationStatement.addDosage().getExtensions();

        for (Extension extension : extensions) {
            String url = extension.getUrlSimple();
            Type value = extension.getValue();
            assertNotNull("Medication statement dosage extension shouldn't be null", value);

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationStatement.DOSAGE_MED_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    assertTrue("Medication statement dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                    assertEquals("Medication statement dosage extension value should equal ", value.toString(), medResult);
                }
            }

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationStatement.DOSAGE_DOSAGES_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    for (Dosages dosage : medResult.getDosages()) {
                        assertTrue("Medication statement dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                        assertEquals("Medication statement dosage extension value should equal ", value.toString(), dosage);
                    }
                }
            }

            // validate url - should start with the prefix and end with the fieldname
            for (String fieldName : MedVistaToFhirMedicationStatement.DOSAGE_ORDERS_EXTENSION_FIELD_NAMES) {
                if (url.endsWith(fieldName)) {
                    foundFields++;
                    for (Orders order : medResult.getOrders()) {
                        assertTrue("Medication statement dosage extension url should have been prefixed correctly", url.startsWith(MedVistaToFhirMedicationAdministration.MED_EXTENSION_URL_PREFIX));
                        assertEquals("Medication statement dosage extension value should equal ", value.toString(), order);
                    }
                }
            }
        }
    }

    @Test
    public void testTransformDosageExtensionValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformDosageExtensions(fhirMedicationStatement, medResult);
        verifyTransformDosageExtensions(fhirMedicationStatement, this.medResult);
    }

    @Test
    public void testTransformDosageExtensionNull() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformDosageExtensions(fhirMedicationStatement, emptyMedResult);
        assertEquals("Dosage extension should be 0 ", 0, fhirMedicationStatement.getDosage().iterator().next().getExtensions().size());
    }


    private void verifyTransformDosageQuantity(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getDose()) && NumberUtils.isNumber(dosage.getDose()) && isNotNullish(dosage.getUnits())) {
                    //these asserts only work if there is only one dosage in the test 
                    assertEquals("Dosage quantity value should equal ", dosage.getDose(), fhirMedicationStatement.getDosage().iterator().next().getQuantity().getValueSimple());
                    assertEquals("Dosage quantity unit should equal ", dosage.getUnits(), fhirMedicationStatement.getDosage().iterator().next().getQuantity().getUnitsSimple());
                } 
            }
        }
    }

    @Test
    public void testTransformDosageQuantityValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformDosageQuantity(fhirMedicationStatement, medResult);
        verifyTransformDosageQuantity(fhirMedicationStatement, this.medResult);
    }


    private void verifyTransformScheduleName(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (medResult != null) {
            for (Dosages dosage : medResult.getDosages()) {
                if (isNotNullish(dosage.getScheduleName())) {
                    assertNotNull("Schedule name shouldn't be null ", fhirMedicationStatement.getDosage().iterator().next().getTiming().getExtensions());

                    List<Extension> e = fhirMedicationStatement.getDosage().iterator().next().getTiming().getExtensions();

                    Extension a = FhirUtils.findExtension(e, MedVistaToFhirMedicationStatement.SCHEDULE_EXTENSION_URL_PREFIX);

                    String b = FhirUtils.extractFhirStringValue(a.getValue());
                    assertEquals("Shedule name should equal ", dosage.getScheduleName(), b);
                    assertThat(a.getUrlSimple(), containsString(MedVistaToFhirMedicationStatement.SCHEDULE_EXTENSION_URL_PREFIX));
                } else {
                    assertNull("Schedule name should be null", fhirMedicationStatement.getDosage().iterator().next().getTiming());
                }
            }
        }
    }

    @Test
    public void testTransformScheduleNameValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformScheduleName(fhirMedicationStatement, medResult);
        verifyTransformScheduleName(fhirMedicationStatement, this.medResult);
    }

    private void verifyTransformDosageRoute(MedicationStatement fhirMedicationStatement, MedResult medResult) {
        if (fhirMedicationStatement.addDosage().getRoute() != null) {
        assertNotNull("Dosage route shouldn't be null ", fhirMedicationStatement.getDosage().iterator().next().getRoute().getTextSimple());
        assertEquals("Dosage route should equal ", fhirMedicationStatement.getDosage().iterator().next().getRoute().getTextSimple(), medResult.getDosages().get(0).getRouteName());
        } else {
            assertNull("Dosage route should be null ", fhirMedicationStatement.addDosage().getRoute());
        }
    }

    @Test
    public void testTransformDosageRouteValid() {
        MedicationStatement fhirMedicationStatement = new MedicationStatement();
        MedVistaToFhirMedicationStatement.transformDosageRoute(fhirMedicationStatement, medResult);
        verifyTransformDosageRoute(fhirMedicationStatement, this.medResult);
    }
    
    @Test
    public void testTransform() throws ModelTransformException {

        MedicationData data = new MedicationData();
        data.addItems(medResult);

        VPRMedicationsRpcOutput rpcOutput = new VPRMedicationsRpcOutput();
        rpcOutput.setApiVersion("1.0");
        rpcOutput.setData(data);

        List<MedicationStatement> results = MedVistaToFhirMedicationStatement.transform(rpcOutput, new VistaPatientIdentity());
        if (medResult != null && NullChecker.isNotNullish(medResult.getVaType()) && medResult.getVaType().equals("N")) {
            assertEquals("There should be a single medication statement record", 1, results.size());
            MedicationStatement medicationStatement = results.iterator().next();

            List<MedicationPrescription> prescriptionList = FhirUtils.getContainedResources(medicationStatement, MedicationPrescription.class);
            assertEquals("There should be a single medication prescription", 0, prescriptionList.size());

            List<Medication> medicationList = FhirUtils.getContainedResources(medicationStatement, Medication.class);
            assertEquals("There should be a single medication", 1, medicationList.size());
        } else {
            assertEquals("There should not be no statement record", 0, results.size());
        }
    }
}
