
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for narrativeV4 complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="narrativeV4">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="narrativeAssigningAuthorityIdentifier" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="narrativeHomeCommunityIdentifier" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="narrativeIdentifier" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="narrativeText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "narrativeV4", namespace = "http://webservice.bhie.med.DNS   /", propOrder = {
    "narrativeAssigningAuthorityIdentifier",
    "narrativeHomeCommunityIdentifier",
    "narrativeIdentifier",
    "narrativeText"
})
public class NarrativeV4 {

    protected String narrativeAssigningAuthorityIdentifier;
    protected String narrativeHomeCommunityIdentifier;
    protected String narrativeIdentifier;
    protected String narrativeText;

    /**
     * Gets the value of the narrativeAssigningAuthorityIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNarrativeAssigningAuthorityIdentifier() {
        return narrativeAssigningAuthorityIdentifier;
    }

    /**
     * Sets the value of the narrativeAssigningAuthorityIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNarrativeAssigningAuthorityIdentifier(String value) {
        this.narrativeAssigningAuthorityIdentifier = value;
    }

    /**
     * Gets the value of the narrativeHomeCommunityIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNarrativeHomeCommunityIdentifier() {
        return narrativeHomeCommunityIdentifier;
    }

    /**
     * Sets the value of the narrativeHomeCommunityIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNarrativeHomeCommunityIdentifier(String value) {
        this.narrativeHomeCommunityIdentifier = value;
    }

    /**
     * Gets the value of the narrativeIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNarrativeIdentifier() {
        return narrativeIdentifier;
    }

    /**
     * Sets the value of the narrativeIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNarrativeIdentifier(String value) {
        this.narrativeIdentifier = value;
    }

    /**
     * Gets the value of the narrativeText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNarrativeText() {
        return narrativeText;
    }

    /**
     * Sets the value of the narrativeText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNarrativeText(String value) {
        this.narrativeText = value;
    }

}
