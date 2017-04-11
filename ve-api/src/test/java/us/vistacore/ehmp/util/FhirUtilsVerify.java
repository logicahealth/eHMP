package us.vistacore.ehmp.util;

import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.Decimal;
import org.hl7.fhir.instance.model.Duration;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Location;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Period;
import org.hl7.fhir.instance.model.Practitioner;
import org.hl7.fhir.instance.model.Quantity;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.String_;
import org.hl7.fhir.utilities.xhtml.NodeType;
import org.hl7.fhir.utilities.xhtml.XhtmlNode;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

import static org.junit.Assert.*;

public final class FhirUtilsVerify {

    private FhirUtilsVerify() { }

    /**
     * This method will verify the contents of a single codeable concept (i.e. it will verify
     * that there is exactly one codeable concept and it has the correct values.
     *
     * @param oConcept The codeable concept
     * @param sSystem The system value.
     * @param sCode The code value
     * @param sDisplay The display value
     */
    public static void verifyCodeableConceptSingle(CodeableConcept oConcept, String sSystem, String sCode, String sDisplay) {
        assertNotNull("The Codeable Code should not have been null.", oConcept);
        assertEquals("The Code array within Codeable Concept should have only 1 item.", 1, oConcept.getCoding().size());
        Coding oCoding = oConcept.getCoding().get(0);
        assertEquals("The Product Code code was incorrect.", sSystem, oCoding.getSystemSimple());
        assertEquals("The Product Code code was incorrect.", sCode, oCoding.getCodeSimple());
        assertEquals("The Product Code name was incorrect.", sDisplay, oCoding.getDisplaySimple());
    }

    /**
     * This method will verify the contents of a single codeable concept (i.e. it will verify
     * that there is exactly one codeable concept and it has the correct values.
     *
     * @param oConcept The codeable concept
     * @param sText The codeable concept text
     */
    public static void verifyCodeableConceptTextOnly(CodeableConcept oConcept, String sText) {
        assertNotNull("The Codeable Code should not have been null.", oConcept);
        assertTrue("The Code array within Codeable Concept should have 0 items.", NullChecker.isNullish(oConcept.getCoding()));
        assertEquals("The text element within codeable concept was incorrect.", sText, oConcept.getTextSimple());
    }

    /**
     * Verify that the duration was filled in correctly.
     *
     * @param oDuration The duration to verify.
     * @param oValue The value of the duration.
     * @param sSystem The system for this duration.
     * @param sCode The code for this duration.
     * @param sUnits The units for this duration.
     */
    public static void verifyDuration(Duration oDuration, BigDecimal oValue, String sSystem, String sCode, String sUnits) {
        if (oValue == null) {
            assertNull("The duration should have been null.", oDuration);
        } else {
            assertNotNull("The duration should not have been null.", oDuration);
            assertNotNull("Duration value should not have been null.", oDuration.getValueSimple());
            assertEquals("Duration value was incorrect.", oValue, oDuration.getValueSimple());

            if (NullChecker.isNotNullish(sSystem)) {
                assertEquals("Duration system was incorrect.", sSystem, oDuration.getSystemSimple());
            } else {
                assertNull("Duration system should have been null.", oDuration.getSystemSimple());
            }

            if (NullChecker.isNotNullish(sCode)) {
                assertEquals("Duration Code was incorrect.", sCode, oDuration.getCodeSimple());
            } else {
                assertNull("Duration Code should have been null.", oDuration.getCodeSimple());
            }

            if (NullChecker.isNotNullish(sUnits)) {
                assertEquals("Duration Units was incorrect.", sUnits, oDuration.getUnitsSimple());
            } else {
                assertNull("Duration Units should have been null.", oDuration.getUnitsSimple());
            }
        }
    }

    /**
     * This will verify the values of an extension that contains a string value.
     *
     * @param oExtension The extension to be verified
     * @param sUrl The URL of the extension
     * @param sDateTime The string date and time in the format of "MM/dd/yyyy.HH:mm:ss"
     */
    public static void verifyExtensionDateTime(Extension oExtension, String sUrl, String sDateTime) {
        if (NullChecker.isNullish(sUrl)) {
            assertNull("There should not have been an extension.", oExtension);
        } else {
            assertNotNull("The extension should not have been null.", oExtension);
            assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());

            if (NullChecker.isNotNullish(sDateTime)) {
                assertTrue("The extension value should have been a Decimal type", oExtension.getValue() instanceof DateTime);
                DateTime oHL7DateTime = (DateTime) oExtension.getValue();
                Calendar oCalDateTime = FhirUtils.toCalender(oHL7DateTime);
                SimpleDateFormat oFormat = new SimpleDateFormat("MM/dd/yyyy.HH:mm:ss");
                String sHL7DateTime = oFormat.format(oCalDateTime.getTime());
                assertEquals("The extension decial value was incorrect.", sDateTime, sHL7DateTime);
            }
        }
    }

    /**
     * This will verify the values of an extension that contains a string value.
     *
     * @param oExtension The extension to be verified
     * @param sUrl The URL of the extension
     * @param oDecimalValue The string value in the extension
     */
    public static void verifyExtensionDecimal(Extension oExtension, String sUrl, BigDecimal oDecimalValue) {
        if ((NullChecker.isNullish(sUrl)) || (oDecimalValue == null)) {
            assertNull("Since the URL was nullish, there should not have been an extension.", oExtension);
        } else {
            assertNotNull("The extension should not have been null.", oExtension);
            assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());
            assertTrue("The extension value should have been a Decimal type", oExtension.getValue() instanceof Decimal);
            Decimal oHL7Decimal = (Decimal) oExtension.getValue();
            assertEquals("The extension decial value was incorrect.", oDecimalValue, oHL7Decimal.getValue());
        }
    }

    /**
     * This will verify the values of an extension that contains a string value.
     *
     * @param oExtension The extension to be verified
     * @param sUrl The URL of the extension
     * @param oIntValue The string value in the extension
     */
    public static void verifyExtensionInteger(Extension oExtension, String sUrl, Integer oIntValue) {
        if ((NullChecker.isNullish(sUrl)) || (oIntValue == null)) {
            assertNull("Since the URL was nullish, there should not have been an extension.", oExtension);
        } else {
            assertNotNull("The extension should not have been null.", oExtension);
            assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());
            assertTrue("The extension value should have been a Decimal type", oExtension.getValue() instanceof org.hl7.fhir.instance.model.Integer);
            org.hl7.fhir.instance.model.Integer oHL7Integer = (org.hl7.fhir.instance.model.Integer) oExtension.getValue();
            assertEquals("The extension decial value was incorrect.", oIntValue.intValue(), oHL7Integer.getValue());
        }
    }

    /**
     * This will verify the values of an extension that contains a string value.
     *
     * @param oExtension The extension to be verified
     * @param sUrl The URL of the extension
     * @param sValue The string value in the extension
     */
    public static void verifyExtensionString(Extension oExtension, String sUrl, String sValue) {
        if (NullChecker.isNullish(sUrl)) {
            assertNull("Since the URL was nullish, there should not have been an extension.", oExtension);
        } else {
            assertNotNull("The extension should not have been null.", oExtension);
            assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());
            if (sValue != null) {
                assertTrue("The extension value should have been a FHIR string type (String_)", oExtension.getValue() instanceof String_);
                assertEquals("The extension string value was incorrect.", sValue, FhirUtils.extractFhirStringValue(oExtension.getValue()));
            } else {
                assertNull("The extension value should have been null.", oExtension.getValue());
            }
        }
    }

    /**
     * Verify that an extension exists and is set up correctly.
     *
     * @param oaExtension The list of extensions
     * @param sUrl The URL for the extension.
     * @param sValue The string value for the extension.
     */
    public static void verifyExtensionString(List<Extension> oaExtension, String sUrl, String sValue) {
        Extension oExtension = FhirUtils.findExtension(oaExtension, sUrl);
        assertNotNull("The extension should have been set.", oExtension);
        assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());
        assertEquals("The extension value was incorrect.", sValue, FhirUtils.extractFhirStringValue(oExtension.getValue()));
    }

    /**
     * This will verify the values of an extension that contains a boolean value.
     *
     * @param oExtension The extension to be verified
     * @param sUrl The URL of the extension
     * @param booleanValue The value in the extension
     */
    public static void verifyExtensionBoolean(Extension oExtension, String sUrl, Boolean booleanValue) {
        if (NullChecker.isNullish(sUrl) || booleanValue == null) {
            assertNull("There should not have been an extension.", oExtension);
        } else {
            assertNotNull("The extension should not have been null.", oExtension);
            assertEquals("The extension URL was incorrect.", sUrl, oExtension.getUrlSimple());

            if (booleanValue != null) {
                assertTrue("The extension value should have been a Boolean type", oExtension.getValue() instanceof org.hl7.fhir.instance.model.Boolean);
                assertEquals("The extension boolean value was incorrect.", booleanValue, ((org.hl7.fhir.instance.model.Boolean) oExtension.getValue()).getValue());
            }
        }
    }

    /**
     * This verifies that the identifier is correctly populated with the given data.
     *
     * @param oIdentifier The identifier to be verified.
     * @param sIdentifierSystem The identifier system value.
     * @param sIdentifier The identifier to look for.
     */
    public static void verifyIdentifier(Identifier oIdentifier, String sIdentifierSystem, String sIdentifier) {
        if (NullChecker.isNullish(sIdentifier)) {
            assertNull("Identifier object should have been null.", oIdentifier);
        } else {
            assertNotNull("Identifier object should not have been null.", oIdentifier);
            assertEquals("Identifier value was incorrect.", sIdentifier, oIdentifier.getValueSimple());
            if (NullChecker.isNotNullish(sIdentifierSystem)) {
                assertEquals("The identifier system was incorrect.", sIdentifierSystem, oIdentifier.getSystemSimple());
            } else {
                assertNull("The identifier system should have been null.", oIdentifier.getSystemSimple());
            }

        }
    }

    /**
     * This verifies that the information specified is in the correct locations in the Location resource.
     *
     * @param oLocation The Location resource being verified.
     * @param sLocationId The ID of the Location
     * @param sLocationIdSystem The System that scopes the ID
     * @param sLocationName The name of the Location
     */
    public static void verifyLocationResource(Location oLocation, String sLocationId, String sLocationIdSystem, String sLocationName) {
        if ((NullChecker.isNullish(sLocationId)) && (NullChecker.isNullish(sLocationName))) {
            assertNull("The Location should have been null.", oLocation);
        } else {
            assertNotNull("The Location should not have been null.", oLocation);
            assertTrue("The Location ID should not have been nullish.", NullChecker.isNotNullish(oLocation.getXmlId()));

            // Location ID
            //----------------
            if (NullChecker.isNotNullish(sLocationId)) {
                if (NullChecker.isNotNullish(sLocationIdSystem)) {
                    assertEquals("The identifier system was incorrect.", sLocationIdSystem, oLocation.getIdentifier().getSystemSimple());
                }
                assertEquals("The identifier was incorrect.", sLocationId, oLocation.getIdentifier().getValueSimple());
            } else {
                assertNull("The identifier node should have been null.", oLocation.getIdentifier());
            }

            // Location Name
            //-------------------
            if (NullChecker.isNotNullish(sLocationName)) {
                assertEquals("The Location name was incorrrect.", sLocationName, oLocation.getNameSimple());
            } else {
                assertNull("The Location name should have been null.", oLocation.getNameSimple());
            }

        }
    }

    /**
     * This verifies that the information specified is in the correct locations in the organization resource.
     *
     * @param oOrganization The organization resource being verified.
     * @param sOrganizationId The ID of the organization
     * @param sOrganizationIdSystem The System that scopes the ID
     * @param sOrganizationName The name of the organization
     */
    public static void verifyOrganizationResource(Organization oOrganization, String sOrganizationId, String sOrganizationIdSystem, String sOrganizationName) {
        if ((NullChecker.isNullish(sOrganizationId)) && (NullChecker.isNullish(sOrganizationName))) {
                assertNull("The Organization should have been null.", oOrganization);
        } else {
            assertNotNull("The Organization should not have been null.", oOrganization);
            assertTrue("The Organization ID should not have been nullish.", NullChecker.isNotNullish(oOrganization.getXmlId()));

            // Organization ID
            //----------------
            if (NullChecker.isNotNullish(sOrganizationId)) {
                assertEquals("The identifier array should have had only one element.", 1, oOrganization.getIdentifier().size());
                if (NullChecker.isNotNullish(sOrganizationIdSystem)) {
                    assertEquals("The identifier system was incorrect.", sOrganizationIdSystem, oOrganization.getIdentifier().get(0).getSystemSimple());
                }
                assertEquals("The identifier was incorrect.", sOrganizationId, oOrganization.getIdentifier().get(0).getValueSimple());
            } else {
                assertTrue("The identifier node should have been null.", NullChecker.isNullish(oOrganization.getIdentifier()));
            }

            // Organization Name
            //-------------------
            if (NullChecker.isNotNullish(sOrganizationName)) {
                assertEquals("The Organization name was incorrrect.", sOrganizationName, oOrganization.getNameSimple());
            } else {
                assertNull("The Organization name should have been null.", oOrganization.getNameSimple());
            }

        }
    }

    /**
     * This method verifies that the period object is set correctly.
     *
     * @param oPeriod The period object to be verified.
     * @param sStartTime The start time value in "MM/dd/yyyy.HH:mm:ss" format.
     * @param sEndTime The end time value in "MM/dd/yyyy.HH:mm:ss" format.
     */
    public static void verifyPeriod(Period oPeriod, String sStartTime, String sEndTime) {
        if ((NullChecker.isNullish(sStartTime)) && (NullChecker.isNullish(sEndTime))) {
            assertNull("All values are nullish - the period should be null.", oPeriod);
        } else {
            assertNotNull("The period should not have been null.", oPeriod);
            SimpleDateFormat oFormat = new SimpleDateFormat("MM/dd/yyyy.HH:mm:ss");

            if (NullChecker.isNotNullish(sStartTime)) {
                Calendar oCalStart = FhirUtils.toCalender(oPeriod.getStart());
                assertEquals("The start time was incorrect.", sStartTime, oFormat.format(oCalStart.getTime()));
            } else {
                assertNull("The period start time should have been null.", oPeriod.getStart());
            }

            if (NullChecker.isNotNullish(sEndTime)) {
                Calendar oCalEnd = FhirUtils.toCalender(oPeriod.getEnd());
                assertEquals("The End time was incorrect.", sEndTime, oFormat.format(oCalEnd.getTime()));
            } else {
                assertNull("The period End time should have been null.", oPeriod.getEnd());
            }
        }
    }

    /**
     * This method verifies that the period object is set correctly.
     *
     * @param oPeriod The period object to be verified.
     * @param sStartTime The start time value in "MM/dd/yyyy.HH:mm:ss" format.
     * @param sEndTime The end time value in "MM/dd/yyyy.HH:mm:ss" format.
     * @param sExtensionURL The extension URL.
     * @param sExtensionStringValue The extension string value.
     */
    public static void verifyPeriod(Period oPeriod, String sStartTime, String sEndTime, String sExtensionURL, String sExtensionStringValue) {
        if ((NullChecker.isNullish(sStartTime))
                && (NullChecker.isNullish(sEndTime))
                && (NullChecker.isNullish(sExtensionURL))) {
            assertNull("All values are nullish - the period should be null.", oPeriod);
        } else {
            verifyPeriod(oPeriod, sStartTime, sEndTime);
            if (NullChecker.isNotNullish(sExtensionURL)) {
                assertEquals("There should have been one extension.", 1, oPeriod.getExtensions().size());
                verifyExtensionString(oPeriod.getExtensions().get(0), sExtensionURL, sExtensionStringValue);
            }
        }
    }

    /**
     * This verifies that the practioner resource was set up correctly.
     *
     * @param oPractitioner The practitioner to be verified.
     * @param sPractitionerId The ID for the practitioner.
     * @param sPractitionerIdSystem The System to associate with the practitioner ID.
     * @param sPractitionerName The name of the practitioner.
     * @param sOrgId The internally generated organization ID.
     * @param sLocId The internally generated location ID.
     * @param sHl7RoleCode The HL7 code for the role of this practitioner.
     * @param sHl7RoleCodeSystem The coding system to associate with the role.
     * @param sHl7RoleDisplay The HL7 text for the role of this practitioner.
     */
    public static void verifyPractitionerResource(Practitioner oPractitioner, String sPractitionerId, String sPractitionerIdSystem, String sPractitionerName,
                                            String sOrgId, String sLocId, String sHl7RoleCode, String sHl7RoleCodeSystem,
                                            String sHl7RoleDisplay) {
        if ((NullChecker.isNullish(sPractitionerId))
                && (NullChecker.isNullish(sPractitionerName))
                && (NullChecker.isNullish(sOrgId))
                && (NullChecker.isNullish(sLocId))
                && (NullChecker.isNullish(sHl7RoleCode))
                && (NullChecker.isNullish(sHl7RoleDisplay))) {
            assertNull("The practitioner should have been null.", oPractitioner);
        } else {
            assertNotNull("The practitioner should not have been null.", oPractitioner);
            assertTrue("The practitioner ID should not have been nullish.", NullChecker.isNotNullish(oPractitioner.getXmlId()));

            // Practitioner ID
            //----------------
            if (NullChecker.isNotNullish(sPractitionerId)) {
                assertEquals("The identifier array should have had only one element.", 1, oPractitioner.getIdentifier().size());
                if (NullChecker.isNotNullish(sPractitionerIdSystem)) {
                    assertEquals("The identifier system was incorrect.", sPractitionerId, oPractitioner.getIdentifier().get(0).getValueSimple());
                }
                assertEquals("The identifier was incorrect.", sPractitionerId, oPractitioner.getIdentifier().get(0).getValueSimple());
            } else {
                assertTrue("The identifier node should have been null.", NullChecker.isNullish(oPractitioner.getIdentifier()));
            }

            // Practitioner Name
            //-------------------
            if (NullChecker.isNotNullish(sPractitionerName)) {
                assertNotNull("The practitioner name should not have been null.", oPractitioner.getName());
                assertEquals("The practitioner name was incorrrect.", sPractitionerName, oPractitioner.getName().getTextSimple());
            } else {
                assertNull("The practitioner name should have been null.", oPractitioner.getName());
            }

            // Org ID
            //--------
            if (NullChecker.isNotNullish(sOrgId)) {
                assertNotNull("Organization should not have been null.", oPractitioner.getOrganization());
                assertEquals("Organization reference ID was not correct.", "#" + sOrgId, oPractitioner.getOrganization().getReferenceSimple());
            } else {
                assertNull("Organization should have been null.", oPractitioner.getOrganization());
            }

            // Location ID
            //------------
            if (NullChecker.isNotNullish(sLocId)) {
                assertEquals("The size of the location array should have been 1.", 1, oPractitioner.getLocation().size());
                assertEquals("The location ID was incorrect.", "#" + sLocId, oPractitioner.getLocation().get(0).getReferenceSimple());
            } else {
                assertTrue("Location should have been null.", NullChecker.isNullish(oPractitioner.getLocation()));
            }

            // Role
            //-----
            if ((NullChecker.isNotNullish(sHl7RoleCode)) || (NullChecker.isNotNullish(sHl7RoleDisplay))) {
                assertEquals("The size of the role array should have been 1.", 1, oPractitioner.getRole().size());
                assertEquals("There should have been one role in the list.", 1, oPractitioner.getRole().size());
                assertNotNull("The role should not have been null.", oPractitioner.getRole().get(0));
                assertEquals("The role coding should have only one element in the list.", 1, oPractitioner.getRole().get(0).getCoding().size());

                if (NullChecker.isNotNullish(sHl7RoleCode)) {
                    assertEquals("Role code was incorrect.", sHl7RoleCode, oPractitioner.getRole().get(0).getCoding().get(0).getCodeSimple());

                    if (NullChecker.isNotNullish(sHl7RoleCodeSystem)) {
                        assertEquals("Role code system was incorrect.", sHl7RoleCodeSystem, oPractitioner.getRole().get(0).getCoding().get(0).getSystemSimple());
                    }
                }

                if (NullChecker.isNotNullish(sHl7RoleDisplay)) {
                    assertEquals("Role display was incorrect.", sHl7RoleDisplay, oPractitioner.getRole().get(0).getCoding().get(0).getDisplaySimple());
                }
            } else {
                assertTrue("Role should have been nullish.", NullChecker.isNullish(oPractitioner.getRole()));
            }
        }
    }

    /**
     * This verifies that the quantity has been set up correctly with the given values.
     *
     * @param oQuantity The quantity object to be verified.
     * @param oValue The value of this quantity.
     * @param sUnits The units for this quantity.
     */
    public static void verifyQuantity(Quantity oQuantity, BigDecimal oValue, String sUnits) {
        verifyQuantity(oQuantity, oValue, sUnits, null, null);
    }

    public static void verifyQuantity(Quantity oQuantity, BigDecimal oValue, String sUnits, String sExtensionURL, String sExtensionStringValue) {
        if ((oValue == null) && (NullChecker.isNullish(sUnits)) && (NullChecker.isNullish(sExtensionURL))) {
            assertNull("Quantity should have been null.", oQuantity);
        } else {
            if (oValue != null) {
                assertNotNull("The quantity value should not have been null.", oQuantity.getValueSimple());
                assertEquals("The quantity value was incorrect.", oValue, oQuantity.getValueSimple());
            } else {
                assertNull("The quantity value should have been null.", oQuantity.getValueSimple());
            }

            if (NullChecker.isNotNullish(sUnits)) {
                assertEquals("The quantity units was incorrect.", sUnits, oQuantity.getUnitsSimple());
            } else {
                assertNull("The quantity units should have been null.", oQuantity.getUnitsSimple());
            }

            if (NullChecker.isNotNullish(sExtensionURL)) {
                assertEquals("The quantity extensions should have had 1 element.", 1, oQuantity.getExtensions().size());
                verifyExtensionString(oQuantity.getExtensions().get(0), sExtensionURL, sExtensionStringValue);
            }
        }
    }

    /**
     * Verify the contents of the quantity.
     *
     * @param oQuantity
     *            The quantity value to be verified.
     * @param sValue
     *            The value to look for.
     * @param sUnits
     *            The units to look for.
     */
    public static void verifyQuantity(Quantity oQuantity, String sValue, String sUnits) {
        if ((NullChecker.isNullish(sValue)) && (NullChecker.isNullish(sUnits))) {
            assertNull("Quantity should have been null.", oQuantity);
        } else {
            assertNotNull("Quantity should not have been null.", oQuantity);
            if (NullChecker.isNotNullish(sValue)) {
                assertNotNull("The value should not have been null.", oQuantity.getValueSimple());
                assertEquals("The value was incorrect.", sValue, oQuantity.getValueSimple().toString());
            } else {
                assertNull("The value should have been null", oQuantity.getValueSimple());
            }

            if (NullChecker.isNotNullish(sUnits)) {
                assertEquals("The units was incorrect.", sUnits, oQuantity.getUnitsSimple());
            } else {
                assertNull("The units should have been null.", oQuantity.getUnitsSimple());

            }
        }
    }

    /**
     * This method verifies that the resource reference for external links is correctly populated with the given data.
     *
     * @param oResRef The resource reference to verify.
     * @param sRefId The reference ID in the string.
     */
    public static void verifyResourceReferenceExternal(ResourceReference oResRef, String sRefId) {
        if (NullChecker.isNullish(sRefId)) {
            assertNull("The external resource reference should have been null.", oResRef);
        } else {
            assertNotNull("The external resource reference should not have been null.", oResRef);
            assertEquals("The external resource reference was incorrect.", sRefId, oResRef.getReferenceSimple());
        }
    }

    /**
     * This verifies that the given node contains the specified content.
     *
     * @param oDiv
     *            This is the node that is being verified.
     * @param sContent
     *            The content that should be in the node.
     */
    public static void verifyXhtmlNode(String sContent, XhtmlNode oDiv) {
        assertNotNull("The div node should not have been null.", oDiv);
        assertEquals("NodeType was incorrect.", NodeType.Element, oDiv.getNodeType());
        assertEquals("The name was wrong.", "div", oDiv.getName());
        assertEquals("The content was not correct.", sContent, oDiv.allText());
    }

}
