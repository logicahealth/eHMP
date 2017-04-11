package us.vistacore.ehmp.model;

import com.google.gson.GsonBuilder;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.instance.model.*;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput;
import us.vistacore.ehmp.model.allergies.transform.AllergiesVistaToFhir;
import us.vistacore.ehmp.model.demographics.VPRDemographicsRpcOutput;
import us.vistacore.ehmp.model.demographics.transform.DemographicsVistaToFhir;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;
import us.vistacore.ehmp.model.labresults.transform.LabResultsVistaToFhir;
import us.vistacore.ehmp.model.meds.MedResult;
import us.vistacore.ehmp.model.meds.VPRMedicationsRpcOutput;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationAdministration;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationDispense;
import us.vistacore.ehmp.model.meds.transform.MedVistaToFhirMedicationStatement;
import us.vistacore.ehmp.model.radiology.VPRRadiologyRpcOutput;
import us.vistacore.ehmp.model.radiology.transform.RadiologyResultsVistaToFhir;
import us.vistacore.ehmp.model.transform.FhirToJson;
import us.vistacore.ehmp.model.transform.FhirToXML;
import us.vistacore.ehmp.model.vitals.VPRVitalsRpcOutput;
import us.vistacore.ehmp.model.vitals.transform.VitalsVistaToFhir;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.junit.Assert.*;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

/**
 * Test serialization of test data. Many errors only manifest during
 * serialization.
 *
 * With gradle, run only this test with: gradle -Pverbose
 * -Dtest.single=TransformITest :production:ehmp-fhir:itest
 */
public class TransformITest {

    private static final String ALLERGIES_DATA_FOLDER = "jds_allergy/";
    private static final String DEMOGRAPHICS_DATA_FOLDER = "jds_demographics/";
    private static final String LABS_DATA_FOLDER = "jds_lab/";
    private static final String RADS_DATA_FOLDER = "jds_rad/";
    private static final String MEDS_DATA_FOLDER = "jds_med/";
    private static final String VITALS_DATA_FOLDER = "jds_vitalsign/";
    private static final String OUTPUT_FOLDER = "build/fhir/";

    private static final String[] JSON_FILE_TYPES = {"json"};
    
    private static final boolean OUPUT_TO_FILESYSTEM = false;
    
    private static Logger LOGGER = LoggerFactory.getLogger(TransformITest.class);  

    private List<String> getFileList(final String testDataFolder) {
        final List<String> saFile = new ArrayList<>();
        final URL urlTestDataFolder = TransformITest.class.getClassLoader().getResource(testDataFolder);
        final File fTestDataFolder = new File(urlTestDataFolder.getFile());
        final Collection<File> faTestDataFiles = FileUtils.listFiles(fTestDataFolder, JSON_FILE_TYPES, false);
        for (final File fTestDataFile : faTestDataFiles) {
            saFile.add(fTestDataFile.getName());
        }
        return saFile;
    }

    private String readFile(final String testDataFolder, final String sFile) throws IOException {
        final InputStream isFileData = TransformITest.class.getClassLoader().getResourceAsStream(testDataFolder + sFile);
        final StringWriter swFileData = new StringWriter();
        String sFileData;
        IOUtils.copy(isFileData, swFileData);
        sFileData = swFileData.toString();
        return sFileData;
    }

    private void testSerialization(final Resource fhirResource) throws Exception {
        testSerialization(fhirResource, null);
    }

    private void testSerialization(final Resource fhirResource, final String outputFilename) throws Exception {
        final String json = FhirToJson.transform(fhirResource);
        if (outputFilename != null) {
            FileUtils.writeStringToFile(new File(OUTPUT_FOLDER + outputFilename + ".json"), json, Charset.defaultCharset());
        }
        assertTrue("The JSON text should not have been null.", isNotNullish(json));

        final String xml = FhirToXML.transform(fhirResource);
        if (outputFilename != null) {
            FileUtils.writeStringToFile(new File(OUTPUT_FOLDER + outputFilename + ".xml"), xml, Charset.defaultCharset());
        }
        assertTrue("The XML text should not have been null.", isNotNullish(xml));
    }

    @Test
    public void testAllergies() throws Exception {
        final List<String> saFile = getFileList(ALLERGIES_DATA_FOLDER);

        for (final String sFile : saFile) {
            final String sJson = readFile(ALLERGIES_DATA_FOLDER, sFile);
            assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

            // Deserialize the Vista data into Java Object form.
            final VPRAllergiesRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRAllergiesRpcOutput.class);
            assertNotNull("The result should not have been null.", rpcOutput);

            // Transform from Vista to FHIR
            final AllergiesVistaToFhir transformationObject = new AllergiesVistaToFhir();
            final List<AdverseReaction> fhirAdverseReactions = transformationObject.transform(rpcOutput);
            assertNotNull("Response from transform should not have been null.", fhirAdverseReactions);

            if (fhirAdverseReactions.size() == 0) {
                fail("No data transformed for file " + sFile + ". Did you add test data?");
            }

            // Iterate over each FHIR object and attempt to serialize the result.
            int index = 1;
            for (final Resource fhirResource : fhirAdverseReactions) {
                if (OUPUT_TO_FILESYSTEM) {
                    String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                    testSerialization(fhirResource,  filename);
                } else {
                    testSerialization(fhirResource);
                }
            }
        }
    }

    @Test
    public void testDemographics() throws Exception {
        final List<String> saFile = getFileList(DEMOGRAPHICS_DATA_FOLDER);

        for (final String sFile : saFile) {
            LOGGER.info("File: " + saFile);
            final String sJson = readFile(DEMOGRAPHICS_DATA_FOLDER, sFile);
            assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

            // Deserialize the Vista data into Java Object form.
            final VPRDemographicsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRDemographicsRpcOutput.class);
            assertNotNull("The result should not have been null.", rpcOutput);

            // Transform from Vista to FHIR
            final DemographicsVistaToFhir transformationObject = new DemographicsVistaToFhir();
            final List<Patient> fhirPatients = transformationObject.transform(rpcOutput);

            if (fhirPatients.size() == 0) {
                fail("No data transformed for file " + sFile + ". Did you add test data?");
            }

            // Iterate over each FHIR object and attempt to serialize the result.         
            int index = 1;
            for (final Patient fhirResource : fhirPatients) {
                if (OUPUT_TO_FILESYSTEM) {
                    String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                    testSerialization(fhirResource, filename);
                } else {
                    testSerialization(fhirResource);
                }
            }  
        }
    }

    @Test
    public void testLabs() throws Exception {
        final List<String> saFile = getFileList(LABS_DATA_FOLDER);

        for (final String sFile : saFile) {
            final String sJson = readFile(LABS_DATA_FOLDER, sFile);
            assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

            // Deserialize the Vista data into Java Object form.
            final VPRLabsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRLabsRpcOutput.class);
            // Transform from Vista to FHIR
            final LabResultsVistaToFhir transformationObject = new LabResultsVistaToFhir();
            final List<DiagnosticReport> fhirResourceList = transformationObject.transform(rpcOutput, VistaPatientIdentityGenerator.createSampleVistaPatientIdentity());
            assertNotNull("Response from transform should not have been null.", fhirResourceList);

            if (fhirResourceList.size() == 0) {
                fail("No data transformed for file " + sFile + ". Did you add test data?");
            }
            // Iterate over each FHIR object and attempt to serialize the result.
            int index = 1;
            for (final DiagnosticReport fhirResource : fhirResourceList) {
                if (OUPUT_TO_FILESYSTEM) {
                    String filename = FilenameUtils.removeExtension(sFile)  + "." + fhirResource.getServiceCategory().getTextSimple() + "." + index++;
                    testSerialization(fhirResource, filename);
                } else {
                    testSerialization(fhirResource);
                }
            }
        }
    }

  
  @Test
  public void testMedicationDispense() throws Exception {
      List<String> saFile = getFileList(MEDS_DATA_FOLDER);

      for (String sFile : saFile) {
          String sJson = readFile(MEDS_DATA_FOLDER, sFile);
          assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

          // Deserialize the Vista data into Java Object form.
          VPRMedicationsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRMedicationsRpcOutput.class);
       // Transform from Vista to FHIR
          List<MedicationDispense> fhirResourceList = MedVistaToFhirMedicationDispense.transform(rpcOutput, VistaPatientIdentityGenerator.createSampleVistaPatientIdentity());
          int count = countVaMedTypes(rpcOutput, "O");
          assertEquals("Number of results should match vaType==O record count", count, fhirResourceList.size());

       // Iterate over each FHIR object and attempt to serialize the result.         
          int index = 1;
          for (final Resource fhirResource : fhirResourceList) {
              if (OUPUT_TO_FILESYSTEM) {
                  String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                  testSerialization(fhirResource, filename);
              } else {
                  testSerialization(fhirResource);
              }
          }          
      }
  }

  @Test
  public void testMedicationAdministration() throws Exception {
      List<String> saFile = getFileList(MEDS_DATA_FOLDER);

      for (String sFile : saFile) {
          String sJson = readFile(MEDS_DATA_FOLDER, sFile);
          assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

          // Deserialize the Vista data into Java Object form.
          VPRMedicationsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRMedicationsRpcOutput.class);
       // Transform from Vista to FHIR
          List<MedicationAdministration> fhirResourceList = MedVistaToFhirMedicationAdministration.transform(rpcOutput, VistaPatientIdentityGenerator.createSampleVistaPatientIdentity());
          int count = countVaMedTypes(rpcOutput, "I") + countVaMedTypes(rpcOutput, "V");
          assertEquals("Number of results should match vaType == I or V record count", count, fhirResourceList.size());

          // Iterate over each FHIR object and attempt to serialize the result.
          int index = 1;
          for (final Resource fhirResource : fhirResourceList) {
              if (OUPUT_TO_FILESYSTEM) {
                  String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                  testSerialization(fhirResource,  filename);
              } else {
                  testSerialization(fhirResource);
              }
          }
      }
  }

  @Test
  public void testMedicationStatement() throws Exception {
      List<String> saFile = getFileList(MEDS_DATA_FOLDER);

      for (String sFile : saFile) {
          String sJson = readFile(MEDS_DATA_FOLDER, sFile);
          assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

          // Deserialize the Vista data into Java Object form.
          VPRMedicationsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRMedicationsRpcOutput.class);
       // Transform from Vista to FHIR
          List<MedicationStatement> fhirResourceList = MedVistaToFhirMedicationStatement.transform(rpcOutput, VistaPatientIdentityGenerator.createSampleVistaPatientIdentity());
          int count = countVaMedTypes(rpcOutput, "N");
          assertEquals("Number of results should match vaType == N record count", count, fhirResourceList.size());

       // Iterate over each FHIR object and attempt to serialize the result.
          int index = 1;
          for (final Resource fhirResource : fhirResourceList) {
              if (OUPUT_TO_FILESYSTEM) {
                  String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                  testSerialization(fhirResource,  filename);
              } else {
                  testSerialization(fhirResource);
              }
          }
      }
  }

  /**
   * Count va med types.
   *
   * @param rpcOutput the rpc output
   * @param vaType the va type
   * @return the int
   */
  private int countVaMedTypes(VPRMedicationsRpcOutput rpcOutput, String vaType) {
      int count = 0;
      if (rpcOutput != null && rpcOutput.getData() != null && rpcOutput.getData().getItems() != null) {
          for (MedResult result : rpcOutput.getData().getItems()) {
              if (vaType.equals(result.getVaType())) {
                  ++count;
              }
          }
      }
      return count;
  }

    @Test
    public void testRadiology() throws Exception {
        List<String> saFile = getFileList(RADS_DATA_FOLDER);

        for (String sFile : saFile) {
            String sJson = readFile(RADS_DATA_FOLDER, sFile);
            assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

            // Deserialize the Vista data into Java Object form.
            VPRRadiologyRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRRadiologyRpcOutput.class);
            // Transform from Vista to FHIR
            RadiologyResultsVistaToFhir transformationObject = new RadiologyResultsVistaToFhir();
            List<Resource> fhirResourceList = transformationObject.transform(rpcOutput, VistaPatientIdentityGenerator.createSampleVistaPatientIdentity());
            assertNotNull("Response from transform should not have been null.", fhirResourceList);

            if (rpcOutput.getData().getTotalItems() == 0 && fhirResourceList.size() != 0) {
                fail("No data transformed for file " + sFile + ". Did you add test data?");
            } else if (rpcOutput.getData().getTotalItems() != 0  && fhirResourceList.size() == 0) {
                fail("FHIR transformation should have returned data for" + sFile);
            }          
            
            // Iterate over each FHIR object and attempt to serialize the result.         
            int index = 1;
            for (final Resource fhirResource : fhirResourceList) {
                if (OUPUT_TO_FILESYSTEM) {
                    String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                    testSerialization(fhirResource, filename);
                } else {
                    testSerialization(fhirResource);
                }
            }  
        }
    }

    @Test
    public void testVitals() throws Exception {
        final List<String> saFile = getFileList(VITALS_DATA_FOLDER);

        for (final String sFile : saFile) {
            final String sJson = readFile(VITALS_DATA_FOLDER, sFile);
            assertTrue("The JSON text should not have been nullish.", isNotNullish(sJson));

            // Deserialize the Vista data into Java Object form.
            final VPRVitalsRpcOutput rpcOutput = new GsonBuilder().create().fromJson(sJson, VPRVitalsRpcOutput.class);
            assertNotNull("The result should not have been null.", rpcOutput);

            // Transform from Vista to FHIR
            final VitalsVistaToFhir transformationObject = new VitalsVistaToFhir();
            final List<Observation> fhirObservations = transformationObject.transform(rpcOutput);
            assertNotNull("Response from transform should not have been null.", fhirObservations);

            if (fhirObservations.size() == 0) {
                fail("No data transformed for file " + sFile + ". Did you add test data?");
            }

            // Iterate over each FHIR object and attempt to serialize the result.
            int index = 1;
            for (final Resource fhirResource : fhirObservations) {
                if (OUPUT_TO_FILESYSTEM) {
                    String filename = FilenameUtils.removeExtension(sFile) + "." + index++;
                    testSerialization(fhirResource,  filename);
                } else {
                    testSerialization(fhirResource);
                }
            }
        }
    }

    private static final class VistaPatientIdentityGenerator {
        public static final String ENTERPRISE_PATIENT_IDENTIFIER = "3";
        public static final String PATIENT_ID = "30";
        public static final String LOCATION = "FACILITY1";

        private VistaPatientIdentityGenerator() { }

        /**
         * Create an instance of the VistaPatientIdentity that we can use to do the various transforms from.
         *
         * @return A sample VistaPatientIdentity object to use for transformation purposes.
         */
        public static VistaPatientIdentity createSampleVistaPatientIdentity() {
            final VistaPatientIdentity oPtIdentity = new VistaPatientIdentity();

            oPtIdentity.setEnterprisePatientIdentifier(ENTERPRISE_PATIENT_IDENTIFIER);
            oPtIdentity.setLocalId(PATIENT_ID);
            oPtIdentity.setSiteCode(LOCATION);

            return oPtIdentity;
        }
    }
}
