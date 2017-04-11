package us.vistacore.ehmp.model.labresults.transform;

import com.google.common.collect.ImmutableMap;
import org.hl7.fhir.instance.model.Address;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Observation.ObservationReliability;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Specimen;
import org.hl7.fhir.instance.model.String_;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.labresults.LabResult;
import us.vistacore.ehmp.model.labresults.LabResult.GramStain;
import us.vistacore.ehmp.model.labresults.LabResult.Organism;
import us.vistacore.ehmp.model.labresults.VPRLabsRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import java.beans.Expression;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;
import static us.vistacore.ehmp.util.NullChecker.isNullish;

/**
 * A Transformation class that contains the logic for VPR Lab -> FHIR
 * DiagnosticReport
 */
public class LabResultsVistaToFhir {
    public static final String LAB_RESULTS_UID_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final String VUID_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final String DIAGNOSTIC_REPORTS_SYSTEM = "urn:oid:2.16.840.1.113883.4.642.2.58";

    protected static final String COMPLETE_STATUS_CODE = "urn:va:lab-status:completed";

    protected static final String COMMENTS_REGEX_STRING = "^(?<comment>.*)Ordering Provider: (?<providerName>.+) Report Released Date/Time: (?<releasedDateTime>\\w+ \\d+, \\d+@\\d+:\\d+(?::\\d+)?)\\r\\n\\s+(?:Performing Lab: (?<labName>.+)\\r\\n(?<labAddress>.+)\\r\\n\\s+)?$";
    protected static final String ADDRESS_REGEX_STRING = "^\\s*(?<line>.+) (?<city>\\S+), (?<stateAbbr>\\S{2}) (?<zip>[0-9\\-]{5,})$";

    protected static final String LAB_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/lab#";
    public static final String PATIENT_PREFIX = "Patient/";
    public static final String UNKNOWN_NAME = "Unknown Name";

    public static final String GRAMSTAIN_CODE = "664-3";
    public static final String GRAMSTAIN_DISPLAY = "Microscopic observation [Identifier] in Unspecified specimen by Gram stain";
    public static final String GRAMSTAIN_SYSTEM = "http://loinc.org";

    public static final String ORGANISM_CODE = "252390002";
    public static final String ORGANISM_DISPLAY = "Culture and Susceptibility";
    public static final String ORGANISM_SYSTEM = "http://snomed.org/sct";

    private Pattern commentPattern;
    private Pattern addressPattern;

    protected static final String[] LAB_EXTENSION_MAIN_FIELD_NAMES = new String[] {"bactRemarks", "groupName", "groupUid", "labOrderId", "localId", "orderUid", "urineScreen" };

    @SuppressWarnings("serial")
    protected static final Map<String, String> SERVICE_CATEGORY_CODE_CONSTANT_MAP = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("CH", "CH");
            put("CY", "CP");
            put("EM", "OTH");
            put("MI", "MB");
            put("SP", "SP");
        }
    });

    public static final String SERVICE_CATEGORY_SYSTEM = "http://hl7.org/fhir/v2/0074";

    @SuppressWarnings("serial")
    protected static final Map<String, String> SERVICE_CATEGORY_TEXT_CONSTANT_MAP = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("CH", "Chemistry");
            put("CY", "Cytopathology");
            put("EM", "Other");
            put("MI", "Microbiology");
            put("SP", "Surgical Pathology");
        }
    });
    protected static final String INTERPRETATION_SYSTEM = "http://hl7.org/fhir/vs/observation-interpretation";

    protected static final Map<String, CodeableConcept> INTERPRETATION_MAP = ImmutableMap.<String, CodeableConcept>builder()
            .put("urn:hl7:observation-interpretation:H", FhirUtils.createCodeableConcept("H", "Above high normal", INTERPRETATION_SYSTEM))
            .put("urn:hl7:observation-interpretation:HH", FhirUtils.createCodeableConcept("HH", "Above upper panic limits", INTERPRETATION_SYSTEM))
            .put("urn:hl7:observation-interpretation:L", FhirUtils.createCodeableConcept("L", "Below low normal", INTERPRETATION_SYSTEM))
            .put("urn:hl7:observation-interpretation:LL", FhirUtils.createCodeableConcept("LL", "Below lower panic limits", INTERPRETATION_SYSTEM))

            .build();

    protected static final CodeableConcept INTERPRETATION_NORMAL_CC = FhirUtils.createCodeableConcept("N", "Normal", INTERPRETATION_SYSTEM);

    private static final Logger LOGGER = LoggerFactory.getLogger(LabResultsVistaToFhir.class);

    /**
     * Default Constructor
     */
    public LabResultsVistaToFhir() {

        // Regex has the pattern:
        // "Ordering Provider: <provider-name> Report Released Date/Time: <release-date-time> Performing Lab: <name-of-lab>\r\n<address-of-lab>\r\n"
        // see examples of this regex at http://fiddle.re/6ft6c
        commentPattern = Pattern.compile(COMMENTS_REGEX_STRING);

        // Regex has the pattern:
        // "<line> <city>, <state> <zip>"
        // e.g., "VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097"
        // see examples of this regex at http://rubular.com/r/2Ju9GixwtA
        // Please note that US street address are not a regular language, and
        // this regex will not work for every address
        addressPattern = Pattern.compile(ADDRESS_REGEX_STRING);
    }

    public static String getLabTypeCode(String categoryCode) {
        return categoryCode.substring(Math.max(categoryCode.length() - 2, 0));
    }

    public static String getPaitentExternalReferenceId(VistaPatientIdentity oVistaPatientIdentity) {
        String referenceId = null;
        if (oVistaPatientIdentity != null && isNotNullish(oVistaPatientIdentity.getEnterprisePatientIdentifier())) {
            referenceId = PATIENT_PREFIX + oVistaPatientIdentity.getEnterprisePatientIdentifier();
        }
        return referenceId;
    }

    public Pattern getCommentPattern() {
        return commentPattern;
    }

    public Pattern getAddressPattern() {
        return addressPattern;
    }

    /**
     * Transform a VPR labs object in a list of FHIR Diagnostic Report objects.
     *
     * @param vprLabsRpcOutput
     *            The VistA VPR object of the lab results.
     * @return The FHIR object list of the lab reports
     * @throws us.vistacore.ehmp.model.transform.ModelTransformException
     *             The exception if there is a problem in the transformation.
     */
    public List<DiagnosticReport> transform(VPRLabsRpcOutput vprLabsRpcOutput, VistaPatientIdentity oVistaPatientIdentity) throws ModelTransformException {
        List<DiagnosticReport> fhirDiagnosticReports = new ArrayList<DiagnosticReport>();

        if ((vprLabsRpcOutput != null) && (vprLabsRpcOutput.getData() != null) && (isNotNullish(vprLabsRpcOutput.getData().getItems()))) {
            for (LabResult labResult : vprLabsRpcOutput.getData().getItems()) {
                DiagnosticReport fhirDiagnosticReport = transformOneLabResult(labResult, oVistaPatientIdentity);
                if (fhirDiagnosticReport != null) {
                    fhirDiagnosticReports.add(fhirDiagnosticReport);
                }
            }
        }

        return fhirDiagnosticReports;
    }

    /**
     * This method transforms one lab result from Vista format to FHIR format
     * DiagnosticReport.
     *
     * @param labResult
     *            The lab result to be transformed.
     * @return The FHIR DiagnosticReport object for that lab result.
     * @throws us.vistacore.ehmp.model.transform.ModelTransformException
     *             If there is a problem transforming the data.
     */
    protected DiagnosticReport transformOneLabResult(LabResult labResult, VistaPatientIdentity oVistaPatientIdentity) throws ModelTransformException {

        // If there is nothing to convert - end method.
        if (labResult == null) {
            return null;
        }

        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();

        //No dependencies
        transformStatus(fhirDiagnosticReport, labResult);
        transformIssuedDateTime(fhirDiagnosticReport, labResult);
        transformIdentifier(fhirDiagnosticReport, labResult);
        transformPerformer(fhirDiagnosticReport, labResult);
        transformDiagnosticDateTime(fhirDiagnosticReport, labResult);
        transformExtensions(fhirDiagnosticReport, labResult);
        transformServiceCategory(fhirDiagnosticReport, labResult);
        transformGramStainResults(fhirDiagnosticReport, labResult);
        transformOrganismResults(fhirDiagnosticReport, labResult);

        //attributes with dependencies
        ResourceReference oSubjectReference = transformSubject(fhirDiagnosticReport, oVistaPatientIdentity);
        ResourceReference oSpecimenReference = transformSpecimen(labResult, fhirDiagnosticReport, oSubjectReference);
        CodeableConcept name = transformName(fhirDiagnosticReport, labResult);
        transformResults(fhirDiagnosticReport, labResult, oSpecimenReference, name);

        //must execute last, uses internal values to populate text
        transformText(fhirDiagnosticReport);

        return fhirDiagnosticReport;
    }

    protected void transformServiceCategory(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {
        if ((labResult != null) && (isNotNullish(labResult.getCategoryCode()))) {
            String categoryCode = labResult.getCategoryCode();
            if (categoryCode != null) {
                String codingKey = getLabTypeCode(categoryCode);
                String sCode = SERVICE_CATEGORY_CODE_CONSTANT_MAP.get(codingKey);
                String sDisplay = SERVICE_CATEGORY_TEXT_CONSTANT_MAP.get(codingKey);

                CodeableConcept serviceCategory = FhirUtils.createCodeableConcept(sCode, sDisplay, SERVICE_CATEGORY_SYSTEM, sDisplay);
                fhirDiagnosticReport.setServiceCategory(serviceCategory);
            }
        }

    }

    /**
     * This method extracts and set the text information for the FHIR Diagnostic
     * report Create text.div in the format: Collected: <<diagnostic[DateTime]>> <br>
     * Report Released: <<issued>> <br>
     * Accession: <<extension[externalAccession].value>> <br>
     * Test: <<results.name.text>> <br>
     * Result: <<contained[Observation].value[Quantity].value>>
     * <<contained[Observation].value[Quantity].units>> <br>
     * Low: <<contained[Observation].referenceRange.low.value>><<<<contained[
     * Observation].value[Quantity].units>> <br>
     * High: <<contained[Observation].referenceRange.high.value>><<<<contained[
     * Observation].value[Quantity].units>> <br>
     * Specimen: <<contained[Specimen].type.text>> <br>
     * Performing Lab: <<contained[Organization].name>> <br>
     * <tab><tab> <<contained[Organization].text.div>>
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReport being updated with text.
     */
    protected void transformText(DiagnosticReport fhirDiagnosticReport) {
        if (fhirDiagnosticReport != null) {
            fhirDiagnosticReport.setText(null);

            StringBuilder text = new StringBuilder();
            if (fhirDiagnosticReport.getDiagnostic() != null) {
                text.append("Collected: " + ((DateTime) fhirDiagnosticReport.getDiagnostic()).getValue() + "<br>");
            }

            if (fhirDiagnosticReport.getIssued() != null) {
                text.append("Report Released: " + fhirDiagnosticReport.getIssuedSimple() + "<br>");
            }

            Extension extension = FhirUtils.findExtension(fhirDiagnosticReport.getExtensions(), LAB_EXTENSION_URL_PREFIX + "groupUid");
            if (extension != null) {
                text.append("Accession: " + ((String_) extension.getValue()).getValue() + "<br>");
            }

            if (fhirDiagnosticReport.getName() != null) {
                text.append("Test: " + fhirDiagnosticReport.getName().getTextSimple() + "<br>");
            }

            List<Observation> observations = FhirUtils.getContainedResources(fhirDiagnosticReport, Observation.class);
            if (observations.size() > 0) {
                Observation observation = observations.get(0);
                if (observation.getValue() instanceof Quantity) {
                    text.append("Result: " + ((Quantity) observation.getValue()).getValueSimple().toPlainString() + " " + ((Quantity) observation.getValue()).getUnitsSimple()
                            + "<br>");

                    if (observation.getReferenceRange() != null && observation.getReferenceRange().size() == 1) {
                        Quantity low = observation.getReferenceRange().get(0).getLow();
                        if (low != null) {
                            text.append("Low: " + low.getValueSimple().toPlainString());
                            text.append(" " + low.getUnitsSimple() + "<br>");
                        }

                        Quantity high = observation.getReferenceRange().get(0).getHigh();
                        if (high != null) {
                            text.append("High: " + high.getValueSimple().toPlainString());
                            text.append(" " + high.getUnitsSimple() + "<br>");
                        }
                    }

                } else if (observation.getValue() instanceof String_) {
                    text.append("Result: " + ((String_) observation.getValue()).getValue() + "<br>");
                }

            }

            List<Specimen> specimens = FhirUtils.getContainedResources(fhirDiagnosticReport, Specimen.class);
            if (specimens.size() == 1) {
                text.append("Specimen: " + specimens.get(0).getType().getTextSimple() + "<br>");
            }

            List<Organization> organizations = FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class);
            if (organizations.size() == 1) {

                text.append("Performing Lab: " + organizations.get(0).getNameSimple() + "<br>");
                text.append("\t\t" + organizations.get(0).getText().getDiv().allText() + "<br>");
            }

            Narrative oText = FhirUtils.createNarrative(NarrativeStatus.generated, text.toString());
            fhirDiagnosticReport.setText(oText);
        }
    }

    /**
     * Extracts the status information from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformStatus(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {
        fhirDiagnosticReport.setStatus(null);

        if ((labResult != null) && (isNotNullish(labResult.getStatusCode()))) {
            if (COMPLETE_STATUS_CODE.equals(labResult.getStatusCode())) {
                fhirDiagnosticReport.setStatusSimple(DiagnosticReport.DiagnosticReportStatus.final_);
            }

            // Only complete lab results are known at this time
        }
    }

    /**
     * Extracts the issued/resulted date from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformIssuedDateTime(DiagnosticReport fhirDiagnosticReport, LabResult labResult) throws ModelTransformException {
        fhirDiagnosticReport.setIssued(null);

        if ((labResult != null) && (isNotNullish(labResult.getResulted()))) {
            String fhirDateTimeString = FhirUtils.transformHL7V2DateTimeToFhirDateTime(labResult.getResulted());
            DateTime fhirDateTime = FhirUtils.createFhirDateTime(fhirDateTimeString);
            fhirDiagnosticReport.setIssued(fhirDateTime);
        }
    }

    /**
     * This method extracts the Subject (DFN) information from the Vista
     * instance and places the information into the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param oVistaPatientIdentity
     *            the vista patient identity
     */
    protected ResourceReference transformSubject(DiagnosticReport fhirDiagnosticReport, VistaPatientIdentity oVistaPatientIdentity) {
        ResourceReference oSubject = new ResourceReference();

        String sSubjectReference = getPaitentExternalReferenceId(oVistaPatientIdentity);
         if (NullChecker.isNotNullish(sSubjectReference)) {
            oSubject.setReferenceSimple(sSubjectReference);
            fhirDiagnosticReport.setSubject(oSubject);
        }

        return oSubject;
    }

    /**
     * This method extracts the report id from the Vista instance and places the
     * information into the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The Vista lab result that is the source of the data.
     */
    protected void transformIdentifier(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {
        fhirDiagnosticReport.setIdentifier(null);
        if ((labResult != null) && (isNotNullish(labResult.getUid()))) {
            Identifier identifier = new Identifier();
            identifier.setSystemSimple(LAB_RESULTS_UID_IDENTIFIER_SYSTEM);
            identifier.setValueSimple(labResult.getUid());
            fhirDiagnosticReport.setIdentifier(identifier);
        }
    }

    /**
     * This method extracts the performer information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * Either the comment or the facilityCode and facilityName must be non-empty
     * to complete transformation
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The Vista lab result that is the source of the data.
     */
    protected void transformPerformer(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {

        // This embedded resource represents the Institution where the lab was
        // performed
        // Organization.location is not yet implemented in FHIR v0.12 Java RI

        Matcher commentMatcher = null;
        if (labResult != null && (isNotNullish(labResult.getComment()) || (isNotNullish(labResult.getFacilityCode()) && isNotNullish(labResult.getFacilityName())))) {

            UUID referenceId = UUID.randomUUID();
            Organization organization = new Organization();

            // create a reference to the contained resource
            ResourceReference organizationReference = new ResourceReference();
            organizationReference.setReferenceSimple("#" + referenceId.toString());
            organization.setXmlId(referenceId.toString());
            fhirDiagnosticReport.setPerformer(organizationReference);

            if (labResult.getFacilityCode() != null) {
                Identifier identifier = organization.addIdentifier();
                identifier.setLabelSimple("facility-code");
                identifier.setValueSimple(labResult.getFacilityCode());
            }

            // add contained resource
            fhirDiagnosticReport.getContained().add(organization);

            if (labResult.getComment() != null) {
                commentMatcher = this.commentPattern.matcher(labResult.getComment());
            }

            if (commentMatcher != null && commentMatcher.matches() && isNotNullish(commentMatcher.group("labName")) && isNotNullish(commentMatcher.group("labAddress"))) {
                organization.setNameSimple(commentMatcher.group("labName"));
                Address address = organization.addAddress();
                address.setTextSimple(commentMatcher.group("labAddress"));

                Matcher addressMatcher = this.addressPattern.matcher(commentMatcher.group("labAddress"));
                if (addressMatcher.matches()) {
                    String line = addressMatcher.group("line");
                    String city = addressMatcher.group("city");
                    String stateAbbr = addressMatcher.group("stateAbbr");
                    String zip = addressMatcher.group("zip");

                    address.addLineSimple(commentMatcher.group("labName"));
                    if (isNotNullish(line)) {
                        address.addLineSimple(line);
                    }
                    if (isNotNullish(city)) {
                        address.setCitySimple(city);
                    }
                    if (isNotNullish(stateAbbr)) {
                        address.setStateSimple(stateAbbr);
                    }
                    if (isNotNullish(zip)) {
                        address.setZipSimple(zip);
                    }
                }

                organizationReference.setDisplaySimple(commentMatcher.group("labName"));
                organization.setText(FhirUtils.createNarrative(NarrativeStatus.generated, commentMatcher.group("labName") + "<br>" + commentMatcher.group("labAddress")));

            } else {
                organization.setNameSimple(labResult.getFacilityName());
                organizationReference.setDisplaySimple(labResult.getFacilityName());
                organization.setText(FhirUtils.createNarrative(NarrativeStatus.generated, labResult.getFacilityName()));
            }

        }
    }

    /**
     * Extracts the diagnostic/observed date from the VistA instance ands sets
     * the information in the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformDiagnosticDateTime(DiagnosticReport fhirDiagnosticReport, LabResult labResult) throws ModelTransformException {
        fhirDiagnosticReport.setDiagnostic(null);
        if ((labResult != null) && (isNotNullish(labResult.getObserved()))) {
            String fhirDateTimeString = FhirUtils.transformHL7V2DateTimeToFhirDateTime(labResult.getObserved());
            DateTime fhirDateTime = FhirUtils.createFhirDateTime(fhirDateTimeString);
            fhirDiagnosticReport.setDiagnostic(fhirDateTime);
        }
    }

    /**
     * Extracts the results date from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformResults(DiagnosticReport fhirDiagnosticReport, LabResult labResult, ResourceReference specimenReference, CodeableConcept name) {
        if (labResult != null && name != null && labResult.getResult() != null) {
            // if units is empty or null, cast to null
            String labUnits = isNullish(labResult.getUnits()) ? null : labResult.getUnits();

            // Create the contained observation for results.result reference
            UUID referenceId = UUID.randomUUID();
            Observation resultObservation = new Observation();

            // create a reference to the contained resource
            ResourceReference resultReference = new ResourceReference();
            fhirDiagnosticReport.getResult().add(resultReference);
            resultReference.setReferenceSimple("#" + referenceId.toString());
            resultReference.setDisplaySimple(name.getTextSimple());
            resultObservation.setXmlId(referenceId.toString());
            resultObservation.setStatusSimple(Observation.ObservationStatus.final_);
            resultObservation.setReliabilitySimple(ObservationReliability.ok);

            resultObservation.setName(name);

            if (isNotNullish(labResult.getResult())) {
                try {
                    resultObservation.setValue(FhirUtils.createQuantity(labResult.getResult(), labUnits));
                } catch (NumberFormatException nfe) {
                    // This will occur if the result if not a number, such as
                    // "NEG", "\u003c-3.0", or
                    // "OPPS WE GOOFED, THIS IS WRONG DATA"
                    resultObservation.setValue(FhirUtils.createFhirString(labResult.getResult()));
                }
            }

            if (labResult.getInterpretationCode() != null) {
                resultObservation.setInterpretation(INTERPRETATION_MAP.get(labResult.getInterpretationCode()));
            } else {
                resultObservation.setInterpretation(INTERPRETATION_NORMAL_CC);
            }

            fhirDiagnosticReport.getContained().add(resultObservation);
            transformReferenceRange(labResult, resultObservation);
            resultObservation.setSpecimen(specimenReference);
        }
    }

    protected void transformGramStainResults(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {

        if (labResult != null && labResult.getGramStain() != null) {
            for (GramStain gramStain : labResult.getGramStain()) {
                // Create the contained observation for results.result reference
                UUID referenceId = UUID.randomUUID();
                Observation resultObservation = new Observation();

                CodeableConcept name = FhirUtils.createCodeableConcept(GRAMSTAIN_CODE, GRAMSTAIN_DISPLAY, GRAMSTAIN_SYSTEM, GRAMSTAIN_DISPLAY);

                // create a reference to the contained resource
                ResourceReference resultReference = new ResourceReference();
                fhirDiagnosticReport.getResult().add(resultReference);
                resultReference.setReferenceSimple("#" + referenceId.toString());
                resultReference.setDisplaySimple(name.getTextSimple());
                resultObservation.setXmlId(referenceId.toString());
                resultObservation.setStatusSimple(Observation.ObservationStatus.final_);
                resultObservation.setReliabilitySimple(ObservationReliability.ok);
                resultObservation.setName(name);
                resultObservation.setValue(FhirUtils.createFhirString(gramStain.getResult()));
                fhirDiagnosticReport.getContained().add(resultObservation);
            }
        }
    }

    protected void transformOrganismResults(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {

        if (labResult != null && labResult.getOrganisms() != null) {
            for (Organism organism : labResult.getOrganisms()) {
                if (organism.getDrugs() != null) {
                    for (Organism.Drugs drug : organism.getDrugs()) {
                        UUID referenceId = UUID.randomUUID();
                        Observation resultObservation = new Observation();

                        String sText = organism.getName() + " (" + organism.getQty() + ")" + " DRUG=" + drug.getName() + " INTERP=" + drug.getInterp() + " RESULT=" + drug.getResult();
                        CodeableConcept name = FhirUtils.createCodeableConcept(ORGANISM_CODE, ORGANISM_DISPLAY, ORGANISM_SYSTEM, sText);

                        ResourceReference resultReference = new ResourceReference();
                        fhirDiagnosticReport.getResult().add(resultReference);
                        resultReference.setReferenceSimple("#" + referenceId.toString());
                        resultReference.setDisplaySimple(name.getTextSimple());
                        resultObservation.setXmlId(referenceId.toString());
                        resultObservation.setStatusSimple(Observation.ObservationStatus.final_);
                        resultObservation.setReliabilitySimple(ObservationReliability.ok);
                        resultObservation.setName(name);
                        fhirDiagnosticReport.getContained().add(resultObservation);
                    }
                }
            }
        }
    }

    protected CodeableConcept transformName(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {

        CodeableConcept name = new CodeableConcept();

        if ((labResult != null) && (isNotNullish(labResult.getTypeName()))) {
            name.setTextSimple(labResult.getTypeName());
        } else if ((labResult != null) && (labResult.getResults() != null) && labResult.getResults().size() > 0) {
            String text = labResult.getResults().get(0).getLocalTitle();
            if (isNotNullish(text)) {
                name.setTextSimple(labResult.getResults().get(0).getLocalTitle());
            } else {
                name.setTextSimple(UNKNOWN_NAME);
            }
       } else {
            name.setTextSimple(UNKNOWN_NAME);
        }

        if ((labResult != null) && isNotNullish(labResult.getVuid())) {
            name.getCoding().add(FhirUtils.createCoding(labResult.getVuid(), labResult.getTypeName(), VUID_SYSTEM));
        }
        if ((labResult != null) && isNotNullish(labResult.getTypeCode())) {
            name.getCoding().add(FhirUtils.createCoding(labResult.getTypeCode(), labResult.getTypeName(), DIAGNOSTIC_REPORTS_SYSTEM));
        }
        // Add in the codes from the code array.
        //--------------------------------------
        if ((labResult != null) && isNotNullish(labResult.getCodesList())) {
            for (TerminologyCode oCode : labResult.getCodesList()) {
                if (oCode != null) {
                    name.getCoding().add(FhirUtils.createCoding(oCode.getCode(), oCode.getDisplay(), oCode.getSystem()));
                }
            }
        }

        fhirDiagnosticReport.setName(name);
        return name;
    }

    /**
     * Extracts the results date from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param resultObservation
     *            The contained FHIR Observation reference by the result
     *            created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformReferenceRange(LabResult labResult, Observation resultObservation) {
        // if units is empty or null, cast to null
        String labUnits = isNullish(labResult.getUnits()) ? null : labResult.getUnits();

        Observation.ObservationReferenceRangeComponent referenceRangeComponent = null;

        Quantity high = null;
        Quantity low = null;
        try {
            high = FhirUtils.createQuantity(labResult.getHigh(), labUnits);
        } catch (NumberFormatException nfe) {
            // a reference range could not be created for a non-numeric value
            LOGGER.debug("High reference range could not be created for " + labResult.getHigh());
        }

        try {
            low = FhirUtils.createQuantity(labResult.getLow(), labUnits);
        } catch (NumberFormatException nfe) {
            // a reference range could not be created for a non-numeric value
            LOGGER.debug("Low reference range could not be created for " + labResult.getLow());
        }

        if ((high != null && high.getValueSimple() != null) || (low != null && low.getValueSimple() != null)) {
            referenceRangeComponent = resultObservation.addReferenceRange();
        }
        if (high != null && high.getValueSimple() != null) {
            referenceRangeComponent.setHigh(high);
        }

        if (low != null && low.getValueSimple() != null) {
            referenceRangeComponent.setLow(low);
        }

    }

    /**
     * Extracts the specimen from the VistA instance ands sets the information
     * in the FHIR instance.
     *
     * @param fhirDiagnosticReport The FHIR DiagnosticReportbeing created.
     * @param labResult The VistA lab result that is the source of the data.
     * @param subjectReference
     */
    protected ResourceReference transformSpecimen(LabResult labResult, DiagnosticReport fhirDiagnosticReport, ResourceReference subjectReference) {

        // create a reference to the contained resource
        ResourceReference specimenReference = fhirDiagnosticReport.addSpecimen();

        if (labResult != null && isNotNullish(labResult.getSpecimen()) && isNotNullish(labResult.getObserved())) {
            UUID referenceId = UUID.randomUUID();

            specimenReference.setReferenceSimple("#" + referenceId.toString());
            specimenReference.setDisplaySimple(labResult.getSpecimen());

            Specimen containedSpecimen = new Specimen();

            // add contained resource
            fhirDiagnosticReport.getContained().add(containedSpecimen);
            containedSpecimen.setXmlId(referenceId.toString());
            containedSpecimen.setType(FhirUtils.createCodeableConcept(labResult.getSpecimen()));

            try {
                DateTime collectedDateTime = FhirUtils.createFhirDateTime(labResult.getObserved());
                containedSpecimen.setCollection(new Specimen.SpecimenCollectionComponent());
                containedSpecimen.getCollection().setCollected(collectedDateTime);
            } catch (ModelTransformException e) {
                LOGGER.warn("Could not format observed value " + labResult.getObserved(), e);
            }

            containedSpecimen.setSubject(subjectReference);
        }
        return specimenReference;

    }

    protected static String getFieldValue(Object labResult, String fieldName) {
        String fieldValue = null;

        try {
            Expression expr = new Expression(labResult, fieldToGetter(fieldName), new Object[0]);
            expr.execute();
            fieldValue = (String) expr.getValue();
        } catch (Exception e) {
            LOGGER.error("error", e);
        }

        return fieldValue;
    }

    /**
     * Extracts the external accession id from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param fhirDiagnosticReport
     *            The FHIR DiagnosticReportbeing created.
     * @param labResult
     *            The VistA lab result that is the source of the data.
     */
    protected void transformExtensions(DiagnosticReport fhirDiagnosticReport, LabResult labResult) {

        // standard lab extensions
        for (String fieldName : LAB_EXTENSION_MAIN_FIELD_NAMES) {
            String fieldValue = getFieldValue(labResult, fieldName);
            if (isNotNullish(fieldValue)) {
                Extension extension = createLabExtension(fieldName, fieldValue);
                fhirDiagnosticReport.getExtensions().add(extension);
            }
        }

        if (labResult != null && labResult.getResults() != null && labResult.getResults().size() > 0) {
            Extension oExtension = new Extension();
            String sResourceReferenceId = "Composition/" + labResult.getResults().get(0).getResultUid();

            oExtension.setUrlSimple(LAB_EXTENSION_URL_PREFIX + "report");
            oExtension.setValue(FhirUtils.createResourceReferenceExternal(sResourceReferenceId));
            fhirDiagnosticReport.getExtensions().add(oExtension);
        }

    }

    private Extension createLabExtension(String fieldName, String fieldValue) {
        Extension oExtension = new Extension();
        if (fieldValue != null) {
            oExtension.setUrlSimple(LAB_EXTENSION_URL_PREFIX + fieldName);
            oExtension.setValue(FhirUtils.createFhirString(fieldValue));
        }
        return oExtension;
    }

    private static String fieldToGetter(String name) {
        return "get" + name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}
