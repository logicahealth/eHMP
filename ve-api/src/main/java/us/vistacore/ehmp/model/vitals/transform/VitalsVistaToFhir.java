package us.vistacore.ehmp.model.vitals.transform;

import com.google.common.base.Charsets;
import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.io.Resources;
import com.google.gson.GsonBuilder;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Identifier.IdentifierUse;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Observation.ObservationReferenceRangeComponent;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.String_;
import org.hl7.fhir.instance.model.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.model.transform.coding.TransformCodes;
import us.vistacore.ehmp.model.vitals.VPRVitalsRpcOutput;
import us.vistacore.ehmp.model.vitals.Vitals;
import us.vistacore.ehmp.model.vitals.transform.coding.QualifierCodes;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.VprExtractionUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

/**
 * This class is used to transform a Vitals from a Vista object format into a FHIR object format.
 *
 * @author Les.Westberg
 *
 */
public class VitalsVistaToFhir {

    private static Logger logger = LoggerFactory.getLogger(VitalsVistaToFhir.class);

    private static final String TRANSFORM_CODES_FILE = "observation_transform_codes.json";
    private static final String QUALIFIER_CODES_FILE = "observation_qualifier_codes.json";

    private TransformCodes transformCodes = null;
    private QualifierCodes qualifierCodes = null;

    public static final String VUID_CODING_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final int SYSTOLIC_TOKEN_INDEX = 0;
    public static final int DIASTOLIC_TOKEN_INDEX = 1;
    public static final String UID_SYSTEM = "http://vistacore.us/fhir/id/uid";

    public static final String FACILITY_CODE_LABEL = "facility-code";
//    public static final String LOINC_SYSTEM = "urn:oid:2.16.840.1.113883.6.1";
    public static final String LOINC_SYSTEM = "http://loinc.org";
    public static final CodeableConcept SYSTOLIC_CONCEPT = FhirUtils.createCodeableConcept("8480-6", "Systolic blood pressure", LOINC_SYSTEM);
    public static final CodeableConcept DIASTOLIC_CONCEPT = FhirUtils.createCodeableConcept("8462-4", "Diastolic blood pressure", LOINC_SYSTEM);

    public static final String CUFF_SIZE_EXTENSION_URL = "http://vistacore.us/fhir/profiles/@main#cuff-size";
    public static final String POSITION_EXTENSION_URL = "http://vistacore.us/fhir/profiles/@main#position";
    public static final String QUALITY_EXTENSION_URL = "http://vistacore.us/fhir/profiles/@main#quality";

    public static final String CUFF_SIZE_CATEGORY_VUID = "4688627";
    public static final String LOCATION_CATEGORY_VUID = "4688628";
    public static final String POSITION_CATEGORY_VUID = "4688630";
    public static final String METHOD_CATEGORY_VUID = "4688629";
    public static final String QUALITY_CATEGORY_VUID = "4688631";

    /**
     * Default Constructor
     */
    public VitalsVistaToFhir() {
        try {
            this.transformCodes = new GsonBuilder().create().fromJson(Resources.toString(Resources.getResource(TRANSFORM_CODES_FILE), Charsets.UTF_8), TransformCodes.class);
            this.qualifierCodes = new GsonBuilder().create().fromJson(Resources.toString(Resources.getResource(QUALIFIER_CODES_FILE), Charsets.UTF_8), QualifierCodes.class);
        } catch (IOException e) {
            logger.warn("Error building VitalsVistaToFhir converter.", e);
        }
    }

    /**
     * Do the transformation.
     *
     * @param vprVitalsRpcOutput The VistA VPR object format of the Vitals.
     * @return The FHIR format of the vitals
     * @throws ModelTransformException The exception if there is a problem in the transformation.
     */
    public List<Observation> transform(VPRVitalsRpcOutput vprVitalsRpcOutput) throws ModelTransformException {
        List<Observation> oaFhirObservation = new ArrayList<Observation>();

        // Is there something to convert?
        //--------------------------------
        if ((vprVitalsRpcOutput != null) && (vprVitalsRpcOutput.getData() != null) && (isNotNullish(vprVitalsRpcOutput.getData().getItems()))) {
            for (Vitals oVitals : vprVitalsRpcOutput.getData().getItems()) {
                Observation oFhirObservation = transformOneVitalsResult(oVitals);
                if (oFhirObservation != null) {
                    oaFhirObservation.add(oFhirObservation);
                }
            }   // for (Vitals oVitals : vprVitalsRpcOutput.data.items) ...
        }   // if ((vprVitalsRpcOutput != null) &&

        // Split combined BP vitals (160/120) into separate observations
        Function<Observation, List<Observation>> splitBloodPressureObservations = new Function<Observation, List<Observation>>() {
            @Override
            public List<Observation> apply(Observation input) {
                if (VitalsVistaToFhir.isBloodPresureWithCombinedValues(input)) {
                    return VitalsVistaToFhir.splitBloodPressure(input);
                } else {
                    return Collections.singletonList(input);
                }
            }
        };

        List<List<Observation>> splitObservations = Lists.transform(oaFhirObservation, splitBloodPressureObservations);
        List<Observation> flattenedObservations = Lists.newArrayList(Iterables.concat(splitObservations));

        return flattenedObservations;
    }

    /**
     * This method transforms one vitals result from Vista format to FHIR format.
     *
     * @param oVitals The vitals result to be transformed.
     * @return The FHIR observation for that vitals result.
     * @throws ModelTransformException If there is a problem transforming the data.
     */
    protected Observation transformOneVitalsResult(Vitals oVitals) throws ModelTransformException {
        // If there is nothing to convert - get out of here.
        //---------------------------------------------------
        if (oVitals == null) {
            return null;
        }
        Observation oFhirObservation = new Observation();

        transformText(oFhirObservation, oVitals);
        transformName(oFhirObservation, oVitals);
        transformResult(oFhirObservation, oVitals);
        transformAppliesDateTime(oFhirObservation, oVitals);
        transformIssuedDateTime(oFhirObservation, oVitals);
        transformStatus(oFhirObservation, oVitals);
        transformReliability(oFhirObservation, oVitals);
        transformIdentifier(oFhirObservation, oVitals);
        transformSubject(oFhirObservation, oVitals);
        transformPerformer(oFhirObservation, oVitals);
        transformReferenceRange(oFhirObservation, oVitals);
        transformCuffSize(oFhirObservation, oVitals);
        transformBodySite(oFhirObservation, oVitals);
        transformPosition(oFhirObservation, oVitals);
        transformMethod(oFhirObservation, oVitals);
        transformQuality(oFhirObservation, oVitals);
        return oFhirObservation;
    }

    /**
     * This method extracts the Subject (DFN) information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     * @throws ModelTransformException if this method is called before transformName()
     */
    protected void transformReferenceRange(Observation oFhirObservation, Vitals oVitals) throws ModelTransformException {
        if (oFhirObservation.getName() == null) {
            throw new ModelTransformException("Name must not be null before transforming the reference range. Have you called VitalsVistAToFhir.transformName()?");
        }

        oFhirObservation.getReferenceRange().clear();

        if (oVitals != null && !isBloodPresure(oFhirObservation)) {
            TransformCodes.VitalsTransformCodes codes = this.getTransformCodeForType(oFhirObservation);
            if (codes != null) {
                for (TransformCodes.Coding rangeCodes : codes.getNormalRange()) {
                    ObservationReferenceRangeComponent rangeComponent = new ObservationReferenceRangeComponent();
                    rangeComponent.setMeaning(FhirUtils.createCodeableConcept(rangeCodes.getCode(), rangeCodes.getDisplay(), rangeCodes.getSystem()));

                    // Set low range
                    if (isNotNullish(oVitals.getLow())) {
                        rangeComponent.setLow(FhirUtils.createQuantity(oVitals.getLow(), oVitals.getUnits()));
                    }

                    // Set high range
                    if (isNotNullish(oVitals.getHigh())) {
                        rangeComponent.setHigh(FhirUtils.createQuantity(oVitals.getHigh(), oVitals.getUnits()));
                    }

                    if (rangeComponent.getLow() != null || rangeComponent.getHigh() != null) {
                        oFhirObservation.getReferenceRange().add(rangeComponent);
                    }
                }
            }
        }

        if (oVitals != null && isBloodPresure(oFhirObservation)) {
            transformReferenceRangeBloodPresure(oFhirObservation, oVitals);
        }
    }


    protected void transformReferenceRangeBloodPresure(Observation oFhirObservation, Vitals oVitals) throws ModelTransformException {
        boolean bHaveSystolicData = false;
        boolean bHaveDiastolicData = false;

        TransformCodes.VitalsTransformCodes codes = this.getTransformCodeForType(oFhirObservation);

        ObservationReferenceRangeComponent oSystolicRefRange = new ObservationReferenceRangeComponent();
        oSystolicRefRange.setMeaning(FhirUtils.createCodeableConcept(codes.getNormalRange().get(SYSTOLIC_TOKEN_INDEX).getCode(), codes.getNormalRange().get(SYSTOLIC_TOKEN_INDEX).getDisplay(), codes.getNormalRange().get(SYSTOLIC_TOKEN_INDEX).getSystem()));
        ObservationReferenceRangeComponent oDiastolicRefRange = new ObservationReferenceRangeComponent();
        oDiastolicRefRange.setMeaning(FhirUtils.createCodeableConcept(codes.getNormalRange().get(DIASTOLIC_TOKEN_INDEX).getCode(), codes.getNormalRange().get(DIASTOLIC_TOKEN_INDEX).getDisplay(), codes.getNormalRange().get(DIASTOLIC_TOKEN_INDEX).getSystem()));

        // Get the low settings for both Systolic and Diastolic.
        //-------------------------------------------------------
        if (isNotNullish(oVitals.getLow())) {
            String[] saToken = oVitals.getLow().split("/");
            if ((saToken.length > SYSTOLIC_TOKEN_INDEX) && (isNotNullish(saToken[SYSTOLIC_TOKEN_INDEX]))) {
                Quantity oQuantLow = FhirUtils.createQuantity(saToken[SYSTOLIC_TOKEN_INDEX], oVitals.getUnits());
                if (oQuantLow != null) {
                    oSystolicRefRange.setLow(oQuantLow);
                    bHaveSystolicData = true;
                }
            }
            if ((saToken.length > DIASTOLIC_TOKEN_INDEX) && (isNotNullish(saToken[DIASTOLIC_TOKEN_INDEX]))) {
                Quantity oQuantLow = FhirUtils.createQuantity(saToken[DIASTOLIC_TOKEN_INDEX], oVitals.getUnits());
                if (oQuantLow != null) {
                    oDiastolicRefRange.setLow(oQuantLow);
                    bHaveDiastolicData = true;
                }
            }
        }

        // Get the high settings for both Systolic and Diastolic.
        //-------------------------------------------------------
        if (isNotNullish(oVitals.getHigh())) {
            String[] saToken = oVitals.getHigh().split("/");
            if ((saToken.length > SYSTOLIC_TOKEN_INDEX) && (isNotNullish(saToken[SYSTOLIC_TOKEN_INDEX]))) {
                Quantity oQuantHigh = FhirUtils.createQuantity(saToken[SYSTOLIC_TOKEN_INDEX], oVitals.getUnits());
                if (oQuantHigh != null) {
                    oSystolicRefRange.setHigh(oQuantHigh);
                    bHaveSystolicData = true;
                }
            }
            if ((saToken.length > DIASTOLIC_TOKEN_INDEX) && (isNotNullish(saToken[DIASTOLIC_TOKEN_INDEX]))) {
                Quantity oQuantHigh = FhirUtils.createQuantity(saToken[DIASTOLIC_TOKEN_INDEX], oVitals.getUnits());
                if (oQuantHigh != null) {
                    oDiastolicRefRange.setHigh(oQuantHigh);
                    bHaveDiastolicData = true;
                }
            }
        }

        if (bHaveSystolicData) {
            oFhirObservation.getReferenceRange().add(oSystolicRefRange);
        }

        if (bHaveDiastolicData) {
            oFhirObservation.getReferenceRange().add(oDiastolicRefRange);
        }
    }

    /**
     * This method extracts the Subject (DFN) information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformSubject(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setSubject(null);

        if ((oVitals != null) && (isNotNullish(oVitals.getUid()))) {
            String sSubjectReference = VprExtractionUtils.extractSubjectReferenceFromUid(oVitals.getUid());
            if (isNotNullish(sSubjectReference)) {
                ResourceReference oSubject = new ResourceReference();
                oSubject.setReferenceSimple(sSubjectReference);
                oFhirObservation.setSubject(oSubject);
            }
        }
    }

    /**
     * This method extracts the performer information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformPerformer(Observation oFhirObservation, Vitals oVitals) {

        // This embedded resource represents the Institution where the vitals was collected
        // Organization.location is not yet implemented in FHIR v0.12 Java RI

        if ((oVitals != null) && (isNotNullish(oVitals.getFacilityName())) && (isNotNullish(oVitals.getFacilityCode()))) {

            UUID referenceId = UUID.randomUUID();
            Organization organization = new Organization();
            organization.setNameSimple(oVitals.getFacilityName());
            Identifier id = organization.addIdentifier();
            id.setValueSimple(oVitals.getFacilityCode());
            id.setLabelSimple(FACILITY_CODE_LABEL);
            organization.setXmlId(referenceId.toString());

            // add organization as a contained resource to the observation
            oFhirObservation.getContained().add(organization);

            // create a reference to the contained resource
            ResourceReference organizationReference = oFhirObservation.addPerformer();
            organizationReference.setDisplaySimple(oVitals.getFacilityName());
            organizationReference.setReferenceSimple("#" + referenceId.toString());
        }
    }

    /**
     * This method extracts the identifier information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformIdentifier(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setIdentifier(null);

        if ((oVitals != null) && (isNotNullish(oVitals.getUid()))) {
            Identifier oIdentifier = new Identifier();
            oIdentifier.setUseSimple(IdentifierUse.official);
            oIdentifier.setLabelSimple("uid");
            oIdentifier.setSystemSimple(UID_SYSTEM);
            oIdentifier.setValueSimple(oVitals.getUid());
            oFhirObservation.setIdentifier(oIdentifier);
        }
    }

    /**
     * This method extracts the Body Site information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformBodySite(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setBodySite(null);
        if ((oVitals != null) && (isNotNullish(oVitals.getQualifiers()))) {
            for (Vitals.NamedVuid qualifier : oVitals.getQualifiers()) {
                if (LOCATION_CATEGORY_VUID.equals(getCategoryVuid(qualifier.getVuid()))) {
                    oFhirObservation.setBodySite(FhirUtils.createCodeableConcept(qualifier.getVuid(), qualifier.getName(), VUID_CODING_SYSTEM));
                }
            }
        }
    }

    /**
     * This method extracts the method information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformMethod(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setMethod(null);
        if ((oVitals != null) && (isNotNullish(oVitals.getQualifiers()))) {
            for (Vitals.NamedVuid qualifier : oVitals.getQualifiers()) {
                if (METHOD_CATEGORY_VUID.equals(getCategoryVuid(qualifier.getVuid()))) {
                    oFhirObservation.setMethod(FhirUtils.createCodeableConcept(qualifier.getVuid(), qualifier.getName(), VUID_CODING_SYSTEM));
                }
            }
        }
    }

    /**
     * This method extracts the quality information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformQuality(Observation oFhirObservation, Vitals oVitals) {
        FhirUtils.removeExtensions(oFhirObservation.getExtensions(), QUALITY_EXTENSION_URL);
        if ((oVitals != null) && (isNotNullish(oVitals.getQualifiers()))) {
            for (Vitals.NamedVuid qualifier : oVitals.getQualifiers()) {
                if (QUALITY_CATEGORY_VUID.equals(getCategoryVuid(qualifier.getVuid()))) {
                    Extension extension = FhirUtils.createExtension(QUALITY_EXTENSION_URL, FhirUtils.createCoding(qualifier.getVuid(), qualifier.getName(), VUID_CODING_SYSTEM));
                    oFhirObservation.getExtensions().add(extension);
                }
            }
        }

    }

    /**
     * This method extracts the reliability information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformReliability(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setReliabilitySimple(Observation.ObservationReliability.unknown);
    }

    /**
     * This method extracts the status information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformStatus(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setStatusSimple(Observation.ObservationStatus.final_);
    }

    /**
     * Transforms the issued date time from Vista vitals to FHIR instance.
     *
     * @param oFhirObservation The FHIR instance.
     * @param oVitals The Vista Vitals instance containing the data.
     * @throws ModelTransformException This is thrown if there is an error in converting the date.
     */
    protected void transformIssuedDateTime(Observation oFhirObservation, Vitals oVitals) throws ModelTransformException {
        oFhirObservation.setIssuedSimple(null);
        oFhirObservation.setIssued(null);

        if ((oVitals != null) && (isNotNullish(oVitals.getResulted()))) {
            Calendar oCalDateTime = FhirUtils.createCalendarDateTime(oVitals.getResulted());
            DateAndTime issuedDateAndTIme = new DateAndTime(oCalDateTime);
            oFhirObservation.setIssuedSimple(issuedDateAndTIme);
        }
    }

    /**
     * Transforms the applies date time from VistA vitals to the FHIR instance.
     *
     * Note: the v0.12 specification states that "a time zone SHALL be populated. Seconds may be provided but may also be ignored".
     * However, the schema validation requires seconds and does not check the timezone.
     *
     * @param oFhirObservation The FHIR instance.
     * @param oVitals The Vista vitals instance containing the data.
     * @throws ModelTransformException Exception if the date and time cannot be transformed.
     */
    protected void transformAppliesDateTime(Observation oFhirObservation, Vitals oVitals) throws ModelTransformException {
        oFhirObservation.setApplies(null);

        if ((oVitals != null) && (isNotNullish(oVitals.getObserved()))) {
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime(oVitals.getObserved());
            oFhirObservation.setApplies(oFhirDateTime);
        }
    }

    /**
     * Transform the observation result from the vitals record to the FHIR instance.
     *
     * @param oFhirObservation The FHIR instance.
     * @param oVitals The VistA vitals instance containing the data.
     */
    protected void transformResult(Observation oFhirObservation, Vitals oVitals) throws ModelTransformException {
        if (oFhirObservation.getName() == null) {
            throw new ModelTransformException("Name must not be null before transforming the result. Have you called VitalsVistAToFhir.transformName()?");
        }

        oFhirObservation.setValue(null);

        if ((oVitals != null) && (isNotNullish(oVitals.getResult()))) {
            Type value;
            try {
                value = FhirUtils.createQuantity(oVitals.getResult(), oVitals.getUnits());
            } catch (NumberFormatException nfe) {
                // Sometime the result value is "Refused" or other non-numeric type
                value = FhirUtils.createFhirString(oVitals.getResult());
            }
            oFhirObservation.setValue(value);
        }
    }

    /**
     * Transform the name information from the vitals record to the FHIR instance.
     *
     * @param oFhirObservation The FHIR instance.
     * @param oVitals The Vista Vitals instance containing the data.
     */
    protected void transformName(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setName(null);

        if ((oVitals != null) && ((isNotNullish(oVitals.getTypeCode())) || (isNotNullish(oVitals.getTypeName())))) {
            CodeableConcept oName = FhirUtils.createCodeableConcept(oVitals.getTypeCode(), oVitals.getTypeName(), VUID_CODING_SYSTEM);
            oFhirObservation.setName(oName);
        }

        if ((oVitals != null) && ((isNotNullish(oVitals.getCodesList())))) {
            for (TerminologyCode oCode : oVitals.getCodesList()) {
                if (oCode != null) {
                    Coding oCoding = FhirUtils.createCoding(oCode.getCode(), oCode.getDisplay(), oCode.getSystem());
                    if (oCoding != null) {
                        if (oFhirObservation.getName() != null) {
                            oFhirObservation.getName().getCoding().add(oCoding);
                        } else {
                            CodeableConcept oName = FhirUtils.createCodeableConcept(oCoding);
                            oFhirObservation.setName(oName);
                        }
                    }
                }
            }
        }
    }

    /**
     * This method extracts the text information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformText(Observation oFhirObservation, Vitals oVitals) {
        oFhirObservation.setText(null);
        if ((oVitals != null) && (isNotNullish(oVitals.getSummary()))) {
            Narrative oText = FhirUtils.createNarrative(NarrativeStatus.generated, oVitals.getSummary());
            oFhirObservation.setText(oText);
        }
    }

    /**
     * This method extracts the cuff size information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformCuffSize(Observation oFhirObservation, Vitals oVitals) {
        FhirUtils.removeExtensions(oFhirObservation.getExtensions(), CUFF_SIZE_EXTENSION_URL);
        if ((oVitals != null) && (isNotNullish(oVitals.getQualifiers()))) {
            for (Vitals.NamedVuid qualifier : oVitals.getQualifiers()) {
                if (CUFF_SIZE_CATEGORY_VUID.equals(getCategoryVuid(qualifier.getVuid()))) {
                    Extension extension = FhirUtils.createExtension(CUFF_SIZE_EXTENSION_URL, FhirUtils.createCoding(qualifier.getVuid(), qualifier.getName(), VUID_CODING_SYSTEM));
                    oFhirObservation.getExtensions().add(extension);
                }
            }
        }
    }

    /**
     * This method extracts the position information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirObservation The FHIR vitals observation being created.
     * @param oVitals The Vista Vitals observation that is the source of the data.
     */
    protected void transformPosition(Observation oFhirObservation, Vitals oVitals) {
        FhirUtils.removeExtensions(oFhirObservation.getExtensions(), POSITION_EXTENSION_URL);
        if ((oVitals != null) && (isNotNullish(oVitals.getQualifiers()))) {
            for (Vitals.NamedVuid qualifier : oVitals.getQualifiers()) {
                if (POSITION_CATEGORY_VUID.equals(getCategoryVuid(qualifier.getVuid()))) {
                    Extension extension = FhirUtils.createExtension(POSITION_EXTENSION_URL, FhirUtils.createCoding(qualifier.getVuid(), qualifier.getName(), VUID_CODING_SYSTEM));
                    oFhirObservation.getExtensions().add(extension);
                }
            }
        }
    }

    /**
     * Returns true if this vitals observation is of blood pressure
     * @param oFhirObservation  the Fhir Observation to test
     * @return true if the observation is for blood pressure
     */
    public static boolean isBloodPresure(Observation oFhirObservation) {
        try {
            for (Coding coding : oFhirObservation.getName().getCoding()) {
                if (coding.getDisplaySimple().equals("BLOOD PRESSURE")) {
                    return true;
                }
            }
            return false;
        } catch (NullPointerException npe) {
            return false;
        }
    }

    /**
     * Returns true if this vitals observation is of blood pressure with a systolic/diastolic value (rather than a string qualifier, such as "refused")
     * @param oFhirObservation  the Fhir Observation to test
     * @return true if the observation is for blood pressure with valid values
     */
    public static boolean isBloodPresureWithCombinedValues(Observation oFhirObservation) {
        return isBloodPresure(oFhirObservation) && oFhirObservation != null && oFhirObservation.getValue() instanceof String_ && ((String_) oFhirObservation.getValue()).getValue().matches("\\d+/\\d+");
    }


    /**
     * Returns the system-configured transform codings for this vitals type.
     * If more than one type if defined, only the first is returned.
     * @param oFhirObservation  the Fhir Observation to test
     * @return a VitalsTransformCode, or null if no transform coding was found
     */
    protected TransformCodes.VitalsTransformCodes getTransformCodeForType(Observation oFhirObservation) throws ModelTransformException {
        String type;
        try {
            type = oFhirObservation.getName().getCoding().get(0).getDisplaySimple();
        } catch (NullPointerException npe) {
            throw new ModelTransformException("Name must have at least 1 coding before getting the transform code set. Have you called VitalsVistAToFhir.transformName()?");
        }

        for (TransformCodes.VitalsTransformCodes code: this.transformCodes.getData()) {
            if (code.getType().equalsIgnoreCase(type)) {
                return code;
            }
        }
        return null;
    }

    public static List<Observation> splitBloodPressure(Observation bpObservation) {
        return Arrays.asList(splitBloodPressure(bpObservation, SYSTOLIC_CONCEPT, "12929001"), splitBloodPressure(bpObservation, DIASTOLIC_CONCEPT, "53813002"));
    }

    public static Observation splitBloodPressure(Observation bpObservation, CodeableConcept partConcept, String partReferenceRangeSctCode) {
        if (!isBloodPresure(bpObservation)) {
            throw new IllegalArgumentException("Observation must be a blood pressure observation.");
        }
        if (!(bpObservation.getValue() instanceof String_)) {
            throw new IllegalArgumentException("Observation must have a combined systolic/diastolic string value.");
        }

        // Transform value
        Observation observation = bpObservation.copy();
        observation.getExtensions().addAll(bpObservation.getExtensions());
        observation.getContained().addAll(bpObservation.getContained());

        String value = "";
        if (partConcept.equals(SYSTOLIC_CONCEPT)) {
            value = ((String_) bpObservation.getValue()).getValue().split("/")[0];
        } else {
            value = ((String_) bpObservation.getValue()).getValue().split("/")[1];
        }
        observation.setValue(FhirUtils.createQuantity(value, "mm[Hg]"));

        // Transform text
        DateTime appliesDateTime = ((DateTime) observation.getApplies());
        observation.setText(FhirUtils.createNarrative(NarrativeStatus.generated, appliesDateTime.getValue().toHumanDisplay() + " : " + partConcept.getCoding().get(0).getDisplaySimple() + " " + value + " mm[Hg]"));

        // Transform name
        observation.setName(partConcept);

        // Transform reference range
        ObservationReferenceRangeComponent referenceRangeComponent = null;
        for (ObservationReferenceRangeComponent rangeComponent : observation.getReferenceRange()) {
            if (rangeComponent != null && rangeComponent.getMeaning() != null && isNotNullish(rangeComponent.getMeaning().getCoding())) {
                for (Coding coding : rangeComponent.getMeaning().getCoding()) {
                    if ("http://snomed.info/id".equals(coding.getSystemSimple()) && partReferenceRangeSctCode.equals(coding.getCodeSimple())) {
                        referenceRangeComponent = rangeComponent;
                    }
                }
            }
        }
        observation.getReferenceRange().retainAll(Collections.singleton(referenceRangeComponent));
        return observation;
    }

    /**
     * Returns the Category VUID (e.g. "4688627" for "CUFF SIZE") when passed a Vitals Qualifier VUID (e.g., "4500641" for "ADULT CUFF")
     * @param qualifierVuid the VUID (numerals only) of a vitals qualifier
     * @return a String of the category VUID or {@code null} if no match is found or local identifier used
     */
    protected String getCategoryVuid(String qualifierVuid) {
        if ("LOCAL".equals(qualifierVuid)) {
            return null;
        }
        for (QualifierCodes.Result result : this.qualifierCodes.getResults()) {
            // Find passed in VUID among qualifiers in qualifierCodes
            if (result.getUri().getSameAs() != null && result.getUri().getSameAs().replaceAll("VA:", "").equals(qualifierVuid)) {
                if (result.getVitalType() != null && result.getVitalType().getValue() != null) {
                    for (QualifierCodes.VitalTypeValue vitalTypeValue : result.getVitalType().getValue()) {
                        if (vitalTypeValue.getCategory() != null) {
                            return vitalTypeValue.getCategory().getSameAs().replaceAll("VA:", "");
                        }
                    }
                }
            }
        }
        return null;
    }


}
