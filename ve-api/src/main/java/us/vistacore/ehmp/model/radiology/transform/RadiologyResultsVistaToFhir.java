package us.vistacore.ehmp.model.radiology.transform;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticOrder;
import org.hl7.fhir.instance.model.DiagnosticOrder.DiagnosticOrderItemComponent;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.domain.VistaPatientIdentity;
import us.vistacore.ehmp.model.radiology.Diagnosis;
import us.vistacore.ehmp.model.radiology.Providers;
import us.vistacore.ehmp.model.radiology.RadiologyResult;
import us.vistacore.ehmp.model.radiology.VPRRadiologyRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.NullChecker;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * Converts VPR Radiology Records to FHIR DiagnosticReport records.
 */
public class RadiologyResultsVistaToFhir {

    /** The Constant RAD_EXTENSION_URL_PREFIX. */
    public static final String RAD_EXTENSION_URL_PREFIX = "http://vistacore.us/fhir/extensions/rad#";

    /** The Constant ORGANIZATION_SYSTEM. */
    public static final String ORGANIZATION_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";

    /** The Constant RADIOLOGY_SYSTEM. */
    public static final String RADIOLOGY_SYSTEM = "CPT OID: 2.16.840.1.113883.6.12";

    /** The Constant SERVICE_CATEGORY_SYSTEM. */
    public static final String SERVICE_CATEGORY_SYSTEM = "http://hl7.org/fhir/v2/0074";

    /** The Constant PATIENT_PREFIX. */
    public static final String PATIENT_PREFIX = "Patient/";

    /** The Constant UNKNOWN_NAME. */
    public static final String UNKNOWN_NAME = "Unknown Name";

    /** The Constant NONE. */
    public static final String NONE = "None";

    /** The Constant EXTENSION_RAD_FIELD_NAMES. */
    protected static final List<String> EXTENSION_RAD_FIELD_NAMES = ImmutableList.<String>builder()
        .add("statusName")
        .add("hasImages")
        .add("imagingTypeUid")
        .add("locationUid")
        .add("locationName")
        .add("encounterUid")
        .add("encounterName")
        .add("imageLocation")
        .add("localId")
        .add("caseId")
        .add("verified")
        .add("orderUid")
        .build();

    /** The Constant EXTENSION_PROVIDERS_FIELD_NAMES. */
    protected static final List<String> EXTENSION_PROVIDERS_FIELD_NAMES = ImmutableList.<String>builder()
        .add("providerUid")
        .add("providerName")
        .build();

    /** The Constant EXTENSION_DIAGNOSIS_FIELD_NAMES. */
    protected static final List<String> EXTENSION_DIAGNOSIS_FIELD_NAMES = ImmutableList.<String>builder()
        .add("primary")
        .build();

    /** The Constant STATUS_MAP. */
    protected static final Map<String, DiagnosticReportStatus> STATUS_MAP = ImmutableMap.<String, DiagnosticReportStatus>builder()
        .put("COMPLETE", DiagnosticReportStatus.final_)
        .put("WAITING FOR EXAM", DiagnosticReportStatus.registered)
        .put("TRANSCRIBED", DiagnosticReportStatus.partial)
        .put("CANCELLED", DiagnosticReportStatus.cancelled)
        .put("EXAMINED", DiagnosticReportStatus.partial)
        .build();
    
    /** The Constant DEFAULT_STATUS. */
    public static final DiagnosticReportStatus DEFAULT_STATUS = DiagnosticReportStatus.Null;

    /** The Constant DIAGNOSTIC_SERVICE_MAP. */
    protected static final Map<String, CodeableConcept> DIAGNOSTIC_SERVICE_MAP = ImmutableMap.<String, CodeableConcept>builder()
        .put("RA", FhirUtils.createCodeableConcept("RAD", "Radiology", SERVICE_CATEGORY_SYSTEM, "Radiology"))
        .build();

    /**
     * Gets the paitent external reference id.
     *
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the paitent external reference id
     */
    public static String getPaitentExternalReferenceId(VistaPatientIdentity oVistaPatientIdentity) {
        String referenceId = null;
        if (oVistaPatientIdentity != null && isNotNullish(oVistaPatientIdentity.getEnterprisePatientIdentifier())) {
            referenceId = PATIENT_PREFIX + oVistaPatientIdentity.getEnterprisePatientIdentifier();
        }
        return referenceId;
    }

    /** The Constant LOGGER. */
    private static final Logger LOGGER = LoggerFactory.getLogger(RadiologyResultsVistaToFhir.class);

   

    /**
     * Transform a VPR radiology object in a list of FHIR Diagnostic Report objects.
     *
     * @param vprRadiologyRpcOutput the vpr radiology rpc output
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the list
     * @throws ModelTransformException if there is a problem in the transformation.
     */
    public List<Resource> transform(VPRRadiologyRpcOutput vprRadiologyRpcOutput, VistaPatientIdentity oVistaPatientIdentity) {
        List<Resource> fhirDiagnosticReports = new ArrayList<Resource>();

        if ((vprRadiologyRpcOutput != null) && (vprRadiologyRpcOutput.getData() != null) && (isNotNullish(vprRadiologyRpcOutput.getData().getItems()))) {
            for (RadiologyResult radResult : vprRadiologyRpcOutput.getData().getItems()) {
                DiagnosticReport fhirDiagnosticReport = transformOneRadiologyResult(radResult, oVistaPatientIdentity);
                if (fhirDiagnosticReport != null) {
                    fhirDiagnosticReports.add(fhirDiagnosticReport);
                }
            }
        }
        return fhirDiagnosticReports;
    }

    /**
     * This method transforms one radiology result from Vista format to FHIR format
     * DiagnosticReport.
     *
     * @param radResult the rad result
     * @param oVistaPatientIdentity the o vista patient identity
     * @return the diagnostic report
     * @throws ModelTransformException the model transform exception
     */
    protected DiagnosticReport transformOneRadiologyResult(RadiologyResult radResult, VistaPatientIdentity oVistaPatientIdentity) {
        // If there is nothing to convert - end method.
        if (radResult == null) {
            return null;
        }

        DiagnosticReport fhirDiagnosticReport = new DiagnosticReport();
        try {
            transformExtensions(radResult, fhirDiagnosticReport);
            transformPerformer(radResult, fhirDiagnosticReport);
            transformDiagnosticDateTime(radResult, fhirDiagnosticReport);
            transformRequestDetail(radResult, fhirDiagnosticReport);
            transformIssuedDateTime(radResult, fhirDiagnosticReport);
            transformName(radResult, fhirDiagnosticReport);
            transformResult(radResult, fhirDiagnosticReport);
            transformStatus(radResult, fhirDiagnosticReport);
            transformSubject(radResult, fhirDiagnosticReport, oVistaPatientIdentity);
            transformIdentifier(radResult, fhirDiagnosticReport);
            transformCodedDiagnosis(radResult, fhirDiagnosticReport);
            transformServiceCategory(radResult, fhirDiagnosticReport);
            transformConclusion(radResult, fhirDiagnosticReport);
            transformText(fhirDiagnosticReport);
        } catch (ModelTransformException e) {
            LOGGER.error(e.getMessage(), e);
            return null;
        }

        return fhirDiagnosticReport;
    }

    /**
     * Transform the extension for DiagnosticReport.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformExtensions(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if (radResult != null) {
            FhirUtils.addExtensionsFromBeanProperties(fhirDiagnosticReport, radResult, RAD_EXTENSION_URL_PREFIX, EXTENSION_RAD_FIELD_NAMES);
            if (radResult.getProviders() != null) {
                for (Providers provider : radResult.getProviders()) {
                    FhirUtils.addExtensionsFromBeanProperties(fhirDiagnosticReport, provider, RAD_EXTENSION_URL_PREFIX, EXTENSION_PROVIDERS_FIELD_NAMES);
                }
            }

            if (radResult.getDiagnosis() != null) {
                for (Diagnosis diagnosis : radResult.getDiagnosis()) {
                    FhirUtils.addExtensionsFromBeanProperties(fhirDiagnosticReport, diagnosis, RAD_EXTENSION_URL_PREFIX, EXTENSION_DIAGNOSIS_FIELD_NAMES);
                }
            }
        }
    }

    /**
     * Transform performer.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformPerformer(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getFacilityCode())) {
            Organization organization = new Organization();
            organization.setNameSimple(radResult.getFacilityName());

            ResourceReference organizationReferenceResource = FhirUtils.createLocalResourceReference(fhirDiagnosticReport, organization);
            organizationReferenceResource.setDisplaySimple(radResult.getFacilityName());

            Identifier identifer = FhirUtils.createIdentifier(ORGANIZATION_SYSTEM, radResult.getFacilityCode());
            organization.getIdentifier().add(identifer);

            fhirDiagnosticReport.setPerformer(organizationReferenceResource);
        }
    }

    /**
     * Transform request detail.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformRequestDetail(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getOrderName())) {
            DiagnosticOrder diagnosticOrder = new DiagnosticOrder();
            ResourceReference diagnosticOrderReference = FhirUtils.createLocalResourceReference(fhirDiagnosticReport, diagnosticOrder);

            CodeableConcept codeableConcept = FhirUtils.createCodeableConcept(radResult.getOrderName(), radResult.getOrderName(), RADIOLOGY_SYSTEM, radResult.getName());
            diagnosticOrder.addItem().setCode(codeableConcept);
            fhirDiagnosticReport.getRequestDetail().add(diagnosticOrderReference);
        }
    }

    /**
     * Transform name.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformName(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getName())) {
            CodeableConcept name = FhirUtils.createCodeableConcept(radResult.getName());
            fhirDiagnosticReport.setName(name);
        } else  {
            fhirDiagnosticReport.getName().setTextSimple(UNKNOWN_NAME);
        }
    }

    /**
     * Transform status.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformStatus(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getStatusName())) {
            if (STATUS_MAP.containsKey(radResult.getStatusName())) {
                fhirDiagnosticReport.setStatusSimple(STATUS_MAP.get(radResult.getStatusName()));
            } else {
                LOGGER.warn("Found an unknown VPR status of '" + radResult.getStatusName() + "' for uid:" + radResult.getUid());
                fhirDiagnosticReport.setStatusSimple(DEFAULT_STATUS);
            }
        }
    }

    /**
     * Transform text.
     *
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformText(DiagnosticReport fhirDiagnosticReport) {
        if (fhirDiagnosticReport != null) {
            fhirDiagnosticReport.setText(null);

            StringBuilder text = new StringBuilder();

            if (fhirDiagnosticReport.getName() != null) {
                text.append("<div>Name: " + fhirDiagnosticReport.getName().getTextSimple() + "</div>");
                for (Coding c : fhirDiagnosticReport.getName().getCoding()) {
                    text.append("Name System: " + c.getSystemSimple() + "<br>");
                    text.append("Name Code: " + c.getCodeSimple() + "<br>");
                    text.append("Name Display: " + c.getDisplaySimple() + "<br>");
                }
            }

            if (fhirDiagnosticReport.getStatus() != null) {
                text.append("<div>Status: " + fhirDiagnosticReport.getStatus().asStringValue() + "</div>");
            }

            if (fhirDiagnosticReport.getIssued() != null) {
                text.append("<div>Report Released: " + fhirDiagnosticReport.getIssuedSimple() + "</div>");
            }

            if (fhirDiagnosticReport.getSubject() != null) {
                text.append("<div>Subject: " + fhirDiagnosticReport.getSubject().getReferenceSimple() + "</div>");
            }

            List<Organization> organizations = FhirUtils.getContainedResources(fhirDiagnosticReport, Organization.class);
            if (organizations.size() == 1) {
                text.append("Performer: " + organizations.get(0).getNameSimple() + "<br>");
                for (Identifier i : organizations.get(0).getIdentifier()) {
                    text.append("Organization Identifier System: " + i.getSystemSimple() + "<br>");
                    text.append("Organization Identifier Value: " + i.getValueSimple() + "<br>");
                }
            }

            if (fhirDiagnosticReport.getIdentifier() != null) {
                text.append("<div>Identifier System: " + fhirDiagnosticReport.getIdentifier().getSystemSimple() + "</div>");
                text.append("<div>Identifier Value: " + fhirDiagnosticReport.getIdentifier().getValueSimple() + "</div>");
            }

            List<DiagnosticOrder> diagnosticOrders = FhirUtils.getContainedResources(fhirDiagnosticReport, DiagnosticOrder.class);
            if (diagnosticOrders.size() > 0) {
                for (DiagnosticOrderItemComponent diagnosticOrder : diagnosticOrders.get(0).getItem()) {
                    for (Coding d : diagnosticOrder.getCode().getCoding()) {
                            text.append("Request Detail Item System: " + d.getSystemSimple() + "<br>");
                            text.append("Request Detail Item Code: " + d.getCodeSimple() + "<br>");
                            text.append("Request Detail Item Display: " + d.getDisplaySimple() + "<br>");
                    }
                }
            }

            if (fhirDiagnosticReport.getServiceCategory() != null) {
                for (Coding code : fhirDiagnosticReport.getServiceCategory().getCoding()) {
                text.append("<div>Service Category System: " + code.getSystemSimple() + "</div>");
                text.append("<div>Service Category Code: " + code.getCode().getValue() + "</div>");
                text.append("<div>Service Category Display: " + code.getDisplaySimple() + "</div>");
                }
            }

            if (fhirDiagnosticReport.getDiagnostic() != null) {
                text.append("<div>Diagnostic Date: " + ((DateTime) fhirDiagnosticReport.getDiagnostic()).getValue() + "</div>");
            }

            List<Extension> extensions = fhirDiagnosticReport.getExtensions();
            if (extensions != null) {
                for (Extension e : extensions) {
                    text.append("<div>Extension Url: " + e.getUrlSimple() + "</div>");
                    text.append("<div>Extension Value: " + e.getValue().toString() + "</div>");
                }
            }

            List<Observation> observations = FhirUtils.getContainedResources(fhirDiagnosticReport, Observation.class);
            if (observations.size() > 0) {
                CodeableConcept c = observations.get(0).getName();
                text.append("Result Text: " + c.getText().asStringValue() + "</div>");
                for (Coding code : c.getCoding()) {
                    text.append("Result Name System: " + code.getSystemSimple() + "</div>");
                    text.append("Result Name Code: " + code.getCode().asStringValue() + "</div>");
                    text.append("Result Name Display: " + code.getDisplaySimple() + "</div>");
                }
            }

          if (fhirDiagnosticReport != null) {
              text.append("Conclusion: " + fhirDiagnosticReport.getConclusionSimple() + "</div>");
          }

          if (fhirDiagnosticReport != null) {
            for (CodeableConcept code : fhirDiagnosticReport.getCodedDiagnosis()) {
                text.append("Coded Diagnosis Text: " + code.getTextSimple() + "</div>");
            }
          }

        Narrative narrative = FhirUtils.createNarrative(NarrativeStatus.generated, text.toString());
        fhirDiagnosticReport.setText(narrative);
        }
    }

    /**
     * Extracts the issued/resulted date from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     * @throws ModelTransformException the model transform exception
     */
    protected void transformIssuedDateTime(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) throws ModelTransformException {
        fhirDiagnosticReport.setIssued(null);
        if ((radResult != null) && (isNotNullish(radResult.getDateTime()))) {
            DateTime fhirDateTime = FhirUtils.createFhirDateTime(radResult.getDateTime());
            fhirDiagnosticReport.setIssued(fhirDateTime);
        }
    }

    /**
     * This method extracts the Subject (DFN) information from the Vista
     * instance and places the information into the FHIR instance.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport            The FHIR DiagnosticReportbeing created.
     * @param oVistaPatientIdentity            the vista patient identity
     * @return the resource reference
     */
    protected ResourceReference transformSubject(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport, VistaPatientIdentity oVistaPatientIdentity) {
        String sSubjectReference = getPaitentExternalReferenceId(oVistaPatientIdentity);
        ResourceReference oSubject = null;
         if (NullChecker.isNotNullish(sSubjectReference)) {
            oSubject = FhirUtils.createResourceReferenceExternal(sSubjectReference, radResult.getPid());
            fhirDiagnosticReport.setSubject(oSubject);
        }
        return oSubject;
    }

    /**
     * This method extracts the report id from the Vista instance and places the
     * information into the FHIR instance.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport            The FHIR DiagnosticReportbeing created.
     */
    protected void transformIdentifier(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        fhirDiagnosticReport.setIdentifier(null);
        if ((radResult != null) && (isNotNullish(radResult.getUid()))) {
            Identifier identifier = FhirUtils.createIdentifier(ORGANIZATION_SYSTEM, radResult.getUid());
            fhirDiagnosticReport.setIdentifier(identifier);
        }
    }

    /**
     * Extracts the diagnostic/observed date from the VistA instance ands sets
     * the information in the FHIR instance.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     * @throws ModelTransformException the model transform exception
     */
    protected void transformDiagnosticDateTime(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) throws ModelTransformException {
        fhirDiagnosticReport.setDiagnostic(null);
        if ((radResult != null) && (isNotNullish(radResult.getDateTime()))) {
            DateTime fhirDateTime = FhirUtils.createFhirDateTime(radResult.getDateTime());
            fhirDiagnosticReport.setDiagnostic(fhirDateTime);
        }
    }

    /**
     * This transform the service category.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformServiceCategory(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getCategory())) {
            fhirDiagnosticReport.setServiceCategory(DIAGNOSTIC_SERVICE_MAP.get(radResult.getCategory()));
        }
    }

    /**
     * Extracts the results date from the VistA instance ands sets the
     * information in the FHIR instance.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformResult(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getName())) {
            Observation resultObservation = new Observation();

            CodeableConcept name = FhirUtils.createCodeableConcept(NONE, radResult.getTypeName(), RADIOLOGY_SYSTEM, radResult.getName());
            resultObservation.setName(name);

            ResourceReference resultReference = FhirUtils.createLocalResourceReference(fhirDiagnosticReport, resultObservation);
            resultReference.setDisplaySimple(name.getTextSimple());

            fhirDiagnosticReport.getResult().add(resultReference);
        }
    }

    /**
     * Transform coded diagnosis.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformCodedDiagnosis(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
       if ((radResult != null) && (radResult.getDiagnosis() != null)) {
            for (Diagnosis diagnosis : radResult.getDiagnosis()) {
                if (isNotNullish(diagnosis.getCode())) {
                    CodeableConcept codeableConcept = FhirUtils.createCodeableConcept(diagnosis.getCode());
                    fhirDiagnosticReport.getCodedDiagnosis().add(codeableConcept);
                }
            }
        }
    }

    /**
     * Transform conclusion.
     *
     * @param radResult the rad result
     * @param fhirDiagnosticReport the fhir diagnostic report
     */
    protected void transformConclusion(RadiologyResult radResult, DiagnosticReport fhirDiagnosticReport) {
        if ((radResult != null) && isNotNullish(radResult.getInterpretation())) {
            fhirDiagnosticReport.setConclusionSimple(radResult.getInterpretation());
        }
    }
}
