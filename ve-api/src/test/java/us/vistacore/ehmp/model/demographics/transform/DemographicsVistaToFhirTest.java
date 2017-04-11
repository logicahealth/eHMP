package us.vistacore.ehmp.model.demographics.transform;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.io.Resources;
import com.google.gson.Gson;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Patient;
import org.junit.Before;
import org.junit.Test;
import us.vistacore.ehmp.model.demographics.PatientDemographics;
import us.vistacore.ehmp.model.demographics.VPRDemographicsRpcOutput;
import us.vistacore.ehmp.util.FhirUtils;

import java.io.IOException;
import java.util.List;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

public class DemographicsVistaToFhirTest {

    private List<PatientDemographics> testData;
    private PatientDemographics emptyTestData;
    private DemographicsVistaToFhir transformObject;


    @Before
    public void setup() throws IOException {
        transformObject = new DemographicsVistaToFhir();
        emptyTestData = toPatientDemographics("vpr_json/patient_empty.json");
        testData = ImmutableList.<PatientDemographics>builder()
                .add(toPatientDemographics("vpr_json/patient_10108V420871.json"))
                .add(toPatientDemographics("vpr_json/patient_10118V572553.json"))
                .build();
    }

    @Test
    public void testTransformTextEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformText(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getText());
    }

    @Test
    public void testTransformText() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformText(fhirPatient, testDemographics);
            assertNotNull(fhirPatient.getText());
        }
    }

    @Test
    public void testTransformReligionEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformReligion(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getExtension(DemographicsVistaToFhir.RELIGION_EXTENSION_URL));
    }

    @Test
    public void testTransformReligion() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformReligion(fhirPatient, testDemographics);
            if (testDemographics.getReligionCode() != null) {
                assertNotNull(fhirPatient.getExtension(DemographicsVistaToFhir.RELIGION_EXTENSION_URL));
            }
        }
    }

    @Test
    public void testTransformVeteranEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformVeteran(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getExtension(DemographicsVistaToFhir.SERVICE_CONNNECTED_EXTENSION_URL));
        assertNull(fhirPatient.getExtension(DemographicsVistaToFhir.SERVICE_PERCENT_EXTENSION_URL));
    }

    @Test
    public void testTransformVeteran() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformVeteran(fhirPatient, testDemographics);
            if (testDemographics.isVeteran()) {
                assertNotNull(fhirPatient.getExtension(DemographicsVistaToFhir.SERVICE_CONNNECTED_EXTENSION_URL));
                assertNotNull(fhirPatient.getExtension(DemographicsVistaToFhir.SERVICE_PERCENT_EXTENSION_URL));
            }
        }
    }

    @Test
    public void testTransformSupportEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformSupport(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getContact(), hasSize(0));
    }

    @Test
    public void testTransformSupport() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformSupport(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getContacts())) {
                assertThat(fhirPatient.getContact(), hasSize(greaterThan(0)));
            }
        }
    }

    @Test
    public void testTransformSsnEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformSsn(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformSsn() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformSsn(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getSsn())) {
                assertThat(fhirPatient.getIdentifier(), hasSize(1));
            }
        }
    }

    @Test
    public void testTransformGenderEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformGender(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getGender());
    }

    @Test
    public void testTransformGender() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformGender(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getGenderCode())) {
                assertNotNull(fhirPatient.getGender());
            }
        }
    }

    @Test
    public void testTransformDateOfBirthEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformDateOfBirth(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getBirthDate());
        assertNull(fhirPatient.getBirthDateSimple());
    }

    @Test
    public void testTransformDateOfBirth() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformDateOfBirth(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getBirthDate())) {
                assertNotNull(fhirPatient.getBirthDate());
                assertNotNull(fhirPatient.getBirthDateSimple());
            }
        }
    }

    @Test
    public void testTransformTelecomEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformTelecom(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getTelecom(), hasSize(0));
    }

    @Test
    public void testTransformTelecom() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformTelecom(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getTelecoms())) {
                assertThat(fhirPatient.getTelecom(), hasSize(greaterThan(0)));
            }
        }
    }

    @Test
    public void testTransformUidEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformUid(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformUid() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformUid(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getUid())) {
                assertThat(fhirPatient.getIdentifier(), hasSize(1));
            }
        }
    }

    @Test
    public void testTransformIcnEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformIcn(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformIcn() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformIcn(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getIcn())) {
                assertThat(fhirPatient.getIdentifier(), hasSize(1));
            }
        }
    }

    @Test
    public void testTransformDfnEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformDfn(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformDfn() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformDfn(fhirPatient, testDemographics);
            assertThat(fhirPatient.getIdentifier(), hasSize(1));
        }
    }

    @Test
    public void testTransformLrdfnEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformLrdfn(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformLrdfn() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformLrdfn(fhirPatient, testDemographics);
            assertThat(fhirPatient.getIdentifier(), hasSize(1));
        }
    }

    @Test
    public void testTransformPidEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformPid(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getIdentifier(), hasSize(0));
    }

    @Test
    public void testTransformPid() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformPid(fhirPatient, testDemographics);
            assertThat(fhirPatient.getIdentifier(), hasSize(1));
        }
    }

    @Test
    public void testTransformMaritalStatusEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformMaritalStatus(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getMaritalStatus());
    }

    @Test
    public void testTransformMaritalStatus() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformMaritalStatus(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getMaritalStatusCode())) {
                assertNotNull(fhirPatient.getMaritalStatus());
            }
        }
    }

    @Test
    public void testTransformNameEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformName(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getAddress(), hasSize(0));
    }

    @Test
    public void testTransformName() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformName(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getFullName())) {
                assertThat(fhirPatient.getName(), hasSize(1));
            }
        }
    }

    @Test
    public void testTransformAddressesEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformAddresses(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getAddress(), hasSize(0));
    }

    @Test
    public void testTransformAddresses() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformAddresses(fhirPatient, testDemographics);
            if (isNotNullish(testDemographics.getFullName())) {
                assertThat(fhirPatient.getAddress(), hasSize(greaterThan(0)));
            }
        }
    }

    @Test
    public void testTransformSensitiveEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformSensitive(fhirPatient, emptyTestData);
        assertNull(fhirPatient.getExtension(DemographicsVistaToFhir.SENSITIVE_EXTENSION_URL));
    }

    @Test
    public void testTransformSensitive() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformSensitive(fhirPatient, testDemographics);
            if (testDemographics.getSensitive() != null) {
                assertNotNull(fhirPatient.getExtension(DemographicsVistaToFhir.SENSITIVE_EXTENSION_URL));
            }
        }
    }

    @Test
    public void testTransformManagingOrganizationEmpty() {
        Patient fhirPatient = new Patient();
        transformObject.transformManagingOrganization(fhirPatient, emptyTestData);
        assertThat(fhirPatient.getContained(), hasSize(0));
        assertNull(fhirPatient.getManagingOrganization());
        assertNull(fhirPatient.getManagingOrganizationTarget());
    }

    @Test
    public void testTransformManagingOrganization() {
        for (PatientDemographics testDemographics : testData) {
            Patient fhirPatient = new Patient();
            transformObject.transformManagingOrganization(fhirPatient, testDemographics);
            assertThat(fhirPatient.getContained(), hasSize(1));
            Organization organization = FhirUtils.getContainedResources(fhirPatient, Organization.class).get(0);
            assertNotNull(fhirPatient.getManagingOrganization());
            assertNull(fhirPatient.getManagingOrganizationTarget());
            assertEquals(fhirPatient.getManagingOrganization().getReferenceSimple(), "#" + organization.getXmlId());
            assertThat(organization.getIdentifier(), hasSize(1));
            assertThat(organization.getIdentifier().get(0).getLabelSimple(), is("facility-code"));
            assertNotNull(organization.getIdentifier().get(0).getValueSimple());
            assertNotNull(organization.getNameSimple());
        }
    }

    private static String toText(String resource) throws IOException {
        return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
    }

    private static PatientDemographics toPatientDemographics(String resource) throws IOException {
        return new Gson().fromJson(toText(resource), VPRDemographicsRpcOutput.class).getData().getItems().get(0);
    }

}
