package us.vistacore.ehmp.model.allergies.transform;

import com.google.common.collect.ImmutableMap;
import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.AdverseReaction.AdverseReactionExposureComponent;
import org.hl7.fhir.instance.model.AdverseReaction.AdverseReactionSymptomComponent;
import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.HumanName;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Identifier.IdentifierUse;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Narrative.NarrativeStatus;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Resource;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.Substance;

import us.vistacore.ehmp.model.TerminologyCode;
import us.vistacore.ehmp.model.allergies.AllergiesResult;
import us.vistacore.ehmp.model.allergies.Product;
import us.vistacore.ehmp.model.allergies.Reaction;
import us.vistacore.ehmp.model.allergies.VPRAllergiesRpcOutput;
import us.vistacore.ehmp.model.transform.ModelTransformException;
import us.vistacore.ehmp.util.FhirUtils;
import us.vistacore.ehmp.util.VprExtractionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

public class AllergiesVistaToFhir {
    public static final String ALLERGY_IDENTIFIER_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final String SYMPTOM_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final String SUBSTANCE_SYSTEM = "urn:oid:2.16.840.1.113883.6.233";
    public static final String EXT_URL_ENTERED_DATETIME = "http://vistacore.us/fhir/profiles/@main#entered-datetime";
    public static final String EXT_URL_REACTION_NATURE = "http://vistacore.us/fhir/profiles/@main#reaction-nature";
    public static final Map<String, AdverseReaction.ReactionSeverity> SEVERITY_MAP = ImmutableMap.<String, AdverseReaction.ReactionSeverity>builder()
            .put("MILD", AdverseReaction.ReactionSeverity.minor)
            .put("MODERATE", AdverseReaction.ReactionSeverity.moderate)
            .put("SEVERE", AdverseReaction.ReactionSeverity.severe)
            .build();

    /**
     * Do the transformation.
     *
     * @param vprAllergiesRpcOutput The VistA VPR object format of the Allergies.
     * @return The FHIR format of the Allergies
     * @throws ModelTransformException The exception if there is a problem in the transformation.
     */
    public List<AdverseReaction> transform(VPRAllergiesRpcOutput vprAllergiesRpcOutput) throws ModelTransformException {
        List<AdverseReaction> oaFhirAllergy = new ArrayList<AdverseReaction>();

        // Is there something to convert?
        //--------------------------------
        if ((vprAllergiesRpcOutput != null) && (vprAllergiesRpcOutput.getData() != null)
                && (isNotNullish(vprAllergiesRpcOutput.getData().getItems()))) {
            for (AllergiesResult oAllergy : vprAllergiesRpcOutput.getData().getItems()) {
                AdverseReaction oFhirAllergy = transformOneAllergyResult(oAllergy);
                if (oFhirAllergy != null) {
                    oaFhirAllergy.add(oFhirAllergy);
                }
            }   // for (AllergiesResult oResult : vprAllergiesRpcOutput.data.items) ...
        }   // if ((vprAllergiesRpcOutput != null) &&

        return oaFhirAllergy;

    }

    /**
     * This method transforms one allergy result from Vista format to FHIR format.
     *
     * @param oAllergy The allergy result to be transformed.
     * @return The FHIR AdverseReaction object for that allergy result.
     * @throws ModelTransformException If there is a problem transforming the data.
     */
    protected AdverseReaction transformOneAllergyResult(AllergiesResult oAllergy)
        throws ModelTransformException {
        // If there is nothing to convert - get out of here.
        //---------------------------------------------------
        if (oAllergy == null) {
            return null;
        }

        AdverseReaction oFhirAllergy = new AdverseReaction();

        // Mandatory Fields
        //-----------------
        transformText(oFhirAllergy, oAllergy);
        transformSubstance(oFhirAllergy, oAllergy);
        transformIdentifier(oFhirAllergy, oAllergy);
        transformSubject(oFhirAllergy, oAllergy);
        transformDidNotOccurFlag(oFhirAllergy, oAllergy);

        // Additional Data Fields
        //------------------------
        transformEnteredDatetime(oFhirAllergy, oAllergy);
        transformSymptoms(oFhirAllergy, oAllergy);

        // Fields currently not available from VPR
        //-----------------------------------------
        transformReactionNature(oFhirAllergy, oAllergy);
        transformRecorder(oFhirAllergy, oAllergy);
        transformDate(oFhirAllergy, oAllergy);
        transformSymptomSeverity(oFhirAllergy, oAllergy);

        return oFhirAllergy;
    }

    /**
     * This method extracts the symptom information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformSymptoms(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        oFhirAllergy.getSymptom().clear();

        if ((oAllergy != null) && (isNotNullish(oAllergy.getReactionsList()))) {

            for (Reaction oReaction : oAllergy.getReactionsList()) {
                if (oReaction != null) {
                    CodeableConcept oSymptomConcept = null;
                    String sVuid = VprExtractionUtils.extractVuid(oReaction.getReactionsVuid());
                    if (isNotNullish(sVuid)) {
                        oSymptomConcept = FhirUtils.createCodeableConcept(oReaction.getReactionsVuid(),
                                                                          oReaction.getReactionsName(),
                                                                          SYMPTOM_SYSTEM,
                                                                          oReaction.getReactionsName());
                    } else if (isNotNullish(oReaction.getReactionsName())) {
                        oSymptomConcept = FhirUtils.createCodeableConcept(oReaction.getReactionsName());
                    }

                    // Did we get a symptom?
                    //-----------------------
                    if (oSymptomConcept != null) {
                        AdverseReactionSymptomComponent oFhirSymptom = new AdverseReactionSymptomComponent();
                        oFhirSymptom.setCode(oSymptomConcept);
                        oFhirAllergy.getSymptom().add(oFhirSymptom);
                    }
                }
            }
        }
    }

    /**
     * This method extracts the entered date/time information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     * @throws ModelTransformException
     */
    protected void transformEnteredDatetime(AdverseReaction oFhirAllergy, AllergiesResult oAllergy)
        throws ModelTransformException {
        FhirUtils.removeExtensions(oFhirAllergy.getExtensions(), EXT_URL_ENTERED_DATETIME);

        if ((oAllergy != null) && (isNotNullish(oAllergy.getEntered()))) {
            Extension oExtension = new Extension();
            oExtension.setUrlSimple(EXT_URL_ENTERED_DATETIME);
            DateTime oFhirDateTime = FhirUtils.createFhirDateTime(oAllergy.getEntered());
            oExtension.setValue(oFhirDateTime);
            oFhirAllergy.getExtensions().add(oExtension);
        }
    }

    /**
     * This method extracts the did not occur flag information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformDidNotOccurFlag(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        // Currently this always is set to false - according to the mapping table.
        oFhirAllergy.setDidNotOccurFlagSimple(false);
    }

    /**
     * This method extracts the Subject (DFN) information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformSubject(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        oFhirAllergy.setSubject(null);

        if ((oAllergy != null) && (isNotNullish(oAllergy.getUid()))) {
            String sSubjectReference = VprExtractionUtils.extractSubjectReferenceFromUid(oAllergy.getUid());
            if (isNotNullish(sSubjectReference)) {
                ResourceReference oSubject = new ResourceReference();
                oSubject.setReferenceSimple(sSubjectReference);
                oFhirAllergy.setSubject(oSubject);
            }
        }
    }

    /**
     * This method extracts the identifier information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergy result being created.
     * @param oAllergy The Vista allergy result that is the source of the data.
     */
    protected void transformIdentifier(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        oFhirAllergy.getIdentifier().clear();
        if ((oAllergy != null) && (isNotNullish(oAllergy.getUid()))) {
            Identifier oIdentifier = new Identifier();
            oIdentifier.setUseSimple(IdentifierUse.official);
            oIdentifier.setSystemSimple(ALLERGY_IDENTIFIER_SYSTEM);
            oIdentifier.setValueSimple(oAllergy.getUid());
            oFhirAllergy.getIdentifier().add(oIdentifier);
        }
    }

    /**
     * This method looks at the contained resources and removes all resources that are substances from the list.
     *
     * @param oFhirAllergy The FHIR Allergy instance to be checked.
     */
    protected void removeExistingSubstances(AdverseReaction oFhirAllergy) {
        // First get rid of any substance information that may already be in the Fhir Allergy.
        //-------------------------------------------------------------------------------------
        if ((oFhirAllergy != null) && (isNotNullish(oFhirAllergy.getContained()))) {
            // Note you cannot remove items while searching the list.  So we need to keep handles to each object
            // that needs to be removed and then remove them after we find them all.
            //---------------------------------------------------------------------------------------------------
            List<Substance> oaSubstanceToRemove = new ArrayList<Substance>();
            for (Resource oResource : oFhirAllergy.getContained()) {
                if ((oResource != null) && (oResource instanceof Substance)) {
                    oaSubstanceToRemove.add((Substance) oResource);
                }
            }
            if (oaSubstanceToRemove.size() > 0) {
                for (Substance oSubstanceToRemove : oaSubstanceToRemove) {
                    oFhirAllergy.getContained().remove(oSubstanceToRemove);
                }
            }
        }

    }

    /**
     * Remove exposure elements that contain a substance reference.
     *
     * @param oFhirAllergy This removes the exposure information containing a reference to a substance.
     */
    protected void removeExistingExposures(AdverseReaction oFhirAllergy) {
        if ((oFhirAllergy != null) && (isNotNullish(oFhirAllergy.getExposure()))) {
            List<AdverseReactionExposureComponent> oaExposureComponentToRemove = new ArrayList<AdverseReactionExposureComponent>();
            for (AdverseReactionExposureComponent oExposureComponent : oFhirAllergy.getExposure()) {
                if ((oExposureComponent != null) && (oExposureComponent.getSubstance() != null)) {
                    oaExposureComponentToRemove.add(oExposureComponent);
                }
            }

            if (oaExposureComponentToRemove.size() > 0) {
                for (AdverseReactionExposureComponent oExposureToRemove : oaExposureComponentToRemove) {
                    oFhirAllergy.getExposure().remove(oExposureToRemove);
                }
            }
        }
    }

    /**
     * Remove recorder and linked practitioner resources.
     *
     * @param oFhirAllergy This removes the recorder information containing a reference to a substance.
     */
    protected void removeExistingRecorder(AdverseReaction oFhirAllergy) {
        if ((oFhirAllergy != null) && (oFhirAllergy.getRecorder() != null)) {
            oFhirAllergy.getContained().remove(FhirUtils.getContainedResource(oFhirAllergy, oFhirAllergy.getRecorder().getReferenceSimple(), Practitioner.class));
            oFhirAllergy.setRecorder(null);
        }
    }

    /**
     * This method extracts the substance information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergy result being created.
     * @param oAllergy The Vista allergy result that is the source of the data.
     */
    protected void transformSubstance(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        removeExistingSubstances(oFhirAllergy);
        removeExistingExposures(oFhirAllergy);

        // Create the Substance Object
        //----------------------------
        Substance oSubstance = new Substance();
        UUID oReferenceId = UUID.randomUUID();
        oSubstance.setXmlId(oReferenceId.toString());
        boolean bHasData = false;

        if (oAllergy != null) {
            if (isNotNullish(oAllergy.getProductsList())) {
                for (Product oProduct : oAllergy.getProductsList()) {
                    if ((oProduct != null) && (isNotNullish(oProduct.getProductsName()))) {

                        String sProductVuid = VprExtractionUtils.extractVuid(oProduct.getProductsVuid());
                        if (isNotNullish(sProductVuid)) {
                            oSubstance.setType(FhirUtils.createCodeableConcept(oProduct.getProductsVuid(),
                                                                               oProduct.getProductsName(),
                                                                               SUBSTANCE_SYSTEM,
                                                                               oProduct.getProductsName()));
                            bHasData = true;
                        } else {
                            oSubstance.setType(FhirUtils.createCodeableConcept(oProduct.getProductsName()));
                            bHasData = true;
                        }
                        if (isNotNullish(oAllergy.getSummary())) {
                            oSubstance.setText(FhirUtils.createNarrative(NarrativeStatus.generated, oAllergy.getSummary()));
                            bHasData = true;
                        }

                        // There should only be one product/VUID in the allergy - so we should break out if we found one with data.
                        //----------------------------------------------------------------------------------------------------------
                        if (bHasData) {
                            break;
                        }
                    }
                }
            }

            if (isNotNullish(oAllergy.getCodesList())) {
                List<Coding> oaCoding = new ArrayList<Coding>();
                for (TerminologyCode oCode : oAllergy.getCodesList()) {
                    if (oCode != null) {
                        Coding oCoding = FhirUtils.createCoding(oCode.getCode(), oCode.getDisplay(), oCode.getSystem());
                        oaCoding.add(oCoding);
                    }
                }

                if (isNotNullish(oaCoding)) {
                    // Need to see if we already built the type information above... If not, create it.  If so, then
                    // add in these new ones.
                    //------------------------------------------------------------------------------------------------
                    if (oSubstance.getType() == null) {
                        oSubstance.setType(FhirUtils.createCodeableConcept(oaCoding));
                        bHasData = true;
                    } else {
                        // Add these items into the existing coding list.
                        //-----------------------------------------------
                        oSubstance.getType().getCoding().addAll(oaCoding);
                        bHasData = true;
                    }
                }
            }
        }

        if (bHasData) {
            oFhirAllergy.getContained().add(oSubstance);

            // Create the exposure object.
            //----------------------------
            AdverseReactionExposureComponent oExposureComponent = new AdverseReactionExposureComponent();
            ResourceReference oResourceReference = FhirUtils.createResourceReferenceAnchor(oReferenceId.toString());
            oExposureComponent.setSubstance(oResourceReference);
            oFhirAllergy.getExposure().add(oExposureComponent);
        }

    }

    /**
     * This method extracts the text information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergy result being created.
     * @param oAllergy The Vista allergy result that is the source of the data.
     */
    protected void transformText(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        oFhirAllergy.setText(null);
        if ((oAllergy != null) && (isNotNullish(oAllergy.getSummary()))) {
            Narrative oText = FhirUtils.createNarrative(NarrativeStatus.generated, oAllergy.getSummary());
            oFhirAllergy.setText(oText);
        }
    }

    /**
     * This method extracts the reaction nature information from the Vista instance
     * and places the information into the FHIR instance.
     *
     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformReactionNature(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        FhirUtils.removeExtensions(oFhirAllergy.getExtensions(), EXT_URL_REACTION_NATURE);

        if ((oAllergy != null) && (isNotNullish(oAllergy.getMechanism()))) {
            Extension extension = new Extension();
            extension.setUrlSimple(EXT_URL_REACTION_NATURE);
            extension.setValue(FhirUtils.createFhirString(oAllergy.getMechanism().toLowerCase()));
            oFhirAllergy.getExtensions().add(extension);
        }
    }

    /**
     * This method extracts the practitioner information from the Vista instance
     * and places the information into the FHIR instance.

     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformRecorder(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) {
        removeExistingRecorder(oFhirAllergy);

        if ((oAllergy != null) && (isNotNullish(oAllergy.getOriginatorName()))) {
            // Create the practitioner
            //----------------------------
            Practitioner practitioner = new Practitioner();
            UUID referenceId = UUID.randomUUID();
            practitioner.setXmlId(referenceId.toString());
            HumanName name = new HumanName();
            name.setTextSimple(oAllergy.getOriginatorName());
            practitioner.setName(name);
            oFhirAllergy.getContained().add(practitioner);

            oFhirAllergy.setRecorder(FhirUtils.createResourceReferenceAnchor(referenceId.toString()));
        }
    }

    /**
     * This method extracts the reaction date from the Vista instance
     * and places the information into the FHIR instance.

     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformDate(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) throws ModelTransformException {
        oFhirAllergy.setDateSimple(null);

        if ((oAllergy != null) && (isNotNullish(oAllergy.getObservations()) && isNotNullish(oAllergy.getObservations().get(0).getDate()))) {
            oFhirAllergy.setDate(FhirUtils.createFhirDateTime(oAllergy.getObservations().get(0).getDate()));
        }
    }

    /**
     * This method extracts the observed severity from the Vista instance
     * and places the information into the FHIR instance.

     * @param oFhirAllergy The FHIR allergies result being created.
     * @param oAllergy The Vista allergies result that is the source of the data.
     */
    protected void transformSymptomSeverity(AdverseReaction oFhirAllergy, AllergiesResult oAllergy) throws ModelTransformException {
        if ((oAllergy != null) && (isNotNullish(oAllergy.getObservations()) && isNotNullish(oAllergy.getObservations().get(0).getSeverity()))) {
            AdverseReaction.ReactionSeverity reactionSeverity = SEVERITY_MAP.get(oAllergy.getObservations().get(0).getSeverity());
            if (reactionSeverity != null) {
                for (AdverseReactionSymptomComponent adverseReactionSymptomComponent : oFhirAllergy.getSymptom()) {
                    adverseReactionSymptomComponent.setSeveritySimple(reactionSeverity);
                }
            } else {
                throw new ModelTransformException("Unknown severity: " + oAllergy.getObservations().get(0).getSeverity() + " found in " + oAllergy.getUid());
            }
        }
    }


}
