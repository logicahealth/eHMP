
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for sourceV4 complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="sourceV4">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="custodianOrgAddress" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="custodianOrgName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="custodianOrgPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="representedOrgAddress" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="representedOrgName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="representedOrgPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "sourceV4", namespace = "http://webservice.bhie.URL       /", propOrder = {
    "custodianOrgAddress",
    "custodianOrgName",
    "custodianOrgPhone",
    "representedOrgAddress",
    "representedOrgName",
    "representedOrgPhone"
})
public class SourceV4 {

    protected String custodianOrgAddress;
    protected String custodianOrgName;
    protected String custodianOrgPhone;
    protected String representedOrgAddress;
    protected String representedOrgName;
    protected String representedOrgPhone;

    /**
     * Gets the value of the custodianOrgAddress property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCustodianOrgAddress() {
        return custodianOrgAddress;
    }

    /**
     * Sets the value of the custodianOrgAddress property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCustodianOrgAddress(String value) {
        this.custodianOrgAddress = value;
    }

    /**
     * Gets the value of the custodianOrgName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCustodianOrgName() {
        return custodianOrgName;
    }

    /**
     * Sets the value of the custodianOrgName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCustodianOrgName(String value) {
        this.custodianOrgName = value;
    }

    /**
     * Gets the value of the custodianOrgPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCustodianOrgPhone() {
        return custodianOrgPhone;
    }

    /**
     * Sets the value of the custodianOrgPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCustodianOrgPhone(String value) {
        this.custodianOrgPhone = value;
    }

    /**
     * Gets the value of the representedOrgAddress property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRepresentedOrgAddress() {
        return representedOrgAddress;
    }

    /**
     * Sets the value of the representedOrgAddress property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepresentedOrgAddress(String value) {
        this.representedOrgAddress = value;
    }

    /**
     * Gets the value of the representedOrgName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRepresentedOrgName() {
        return representedOrgName;
    }

    /**
     * Sets the value of the representedOrgName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepresentedOrgName(String value) {
        this.representedOrgName = value;
    }

    /**
     * Gets the value of the representedOrgPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRepresentedOrgPhone() {
        return representedOrgPhone;
    }

    /**
     * Sets the value of the representedOrgPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepresentedOrgPhone(String value) {
        this.representedOrgPhone = value;
    }

}
