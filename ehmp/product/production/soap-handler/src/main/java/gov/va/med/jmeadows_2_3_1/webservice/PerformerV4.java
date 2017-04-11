
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for performerV4 complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="performerV4">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="date" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerOrgName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerRole" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerTaxonomy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "performerV4", namespace = "http://webservice.bhie.DNS       /", propOrder = {
    "date",
    "providerName",
    "providerOrgName",
    "providerRole",
    "providerTaxonomy"
})
public class PerformerV4 {

    protected String date;
    protected String providerName;
    protected String providerOrgName;
    protected String providerRole;
    protected String providerTaxonomy;

    /**
     * Gets the value of the date property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDate() {
        return date;
    }

    /**
     * Sets the value of the date property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDate(String value) {
        this.date = value;
    }

    /**
     * Gets the value of the providerName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderName() {
        return providerName;
    }

    /**
     * Sets the value of the providerName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderName(String value) {
        this.providerName = value;
    }

    /**
     * Gets the value of the providerOrgName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderOrgName() {
        return providerOrgName;
    }

    /**
     * Sets the value of the providerOrgName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderOrgName(String value) {
        this.providerOrgName = value;
    }

    /**
     * Gets the value of the providerRole property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderRole() {
        return providerRole;
    }

    /**
     * Sets the value of the providerRole property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderRole(String value) {
        this.providerRole = value;
    }

    /**
     * Gets the value of the providerTaxonomy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderTaxonomy() {
        return providerTaxonomy;
    }

    /**
     * Sets the value of the providerTaxonomy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderTaxonomy(String value) {
        this.providerTaxonomy = value;
    }

}
