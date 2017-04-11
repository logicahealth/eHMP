
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for patient complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="patient">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="age" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ahltaUnitNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dob" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="EDIPI" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="FMP" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="gender" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ICN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="patientIens" type="{http://webservice.vds.med.DNS   /}keyValuePair" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="SSN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sensitive" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="sponsorSSN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="vistaSites" type="{http://webservice.vds.med.DNS   /}site" maxOccurs="unbounded" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "patient", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "age",
    "ahltaUnitNumber",
    "dob",
    "edipi",
    "fmp",
    "gender",
    "icn",
    "name",
    "patientIens",
    "ssn",
    "sensitive",
    "sponsorSSN",
    "vistaSites"
})
@XmlSeeAlso({
    PatientDemographics.class
})
public class Patient {

    protected String age;
    protected String ahltaUnitNumber;
    protected String dob;
    @XmlElement(name = "EDIPI")
    protected String edipi;
    @XmlElement(name = "FMP")
    protected String fmp;
    protected String gender;
    @XmlElement(name = "ICN")
    protected String icn;
    protected String name;
    @XmlElement(nillable = true)
    protected List<KeyValuePair> patientIens;
    @XmlElement(name = "SSN")
    protected String ssn;
    protected boolean sensitive;
    protected String sponsorSSN;
    @XmlElement(nillable = true)
    protected List<Site> vistaSites;

    /**
     * Gets the value of the age property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAge() {
        return age;
    }

    /**
     * Sets the value of the age property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAge(String value) {
        this.age = value;
    }

    /**
     * Gets the value of the ahltaUnitNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAhltaUnitNumber() {
        return ahltaUnitNumber;
    }

    /**
     * Sets the value of the ahltaUnitNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAhltaUnitNumber(String value) {
        this.ahltaUnitNumber = value;
    }

    /**
     * Gets the value of the dob property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDob() {
        return dob;
    }

    /**
     * Sets the value of the dob property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDob(String value) {
        this.dob = value;
    }

    /**
     * Gets the value of the edipi property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEDIPI() {
        return edipi;
    }

    /**
     * Sets the value of the edipi property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEDIPI(String value) {
        this.edipi = value;
    }

    /**
     * Gets the value of the fmp property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFMP() {
        return fmp;
    }

    /**
     * Sets the value of the fmp property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFMP(String value) {
        this.fmp = value;
    }

    /**
     * Gets the value of the gender property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGender() {
        return gender;
    }

    /**
     * Sets the value of the gender property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGender(String value) {
        this.gender = value;
    }

    /**
     * Gets the value of the icn property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getICN() {
        return icn;
    }

    /**
     * Sets the value of the icn property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setICN(String value) {
        this.icn = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the patientIens property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the patientIens property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getPatientIens().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link KeyValuePair }
     * 
     * 
     */
    public List<KeyValuePair> getPatientIens() {
        if (patientIens == null) {
            patientIens = new ArrayList<KeyValuePair>();
        }
        return this.patientIens;
    }

    /**
     * Gets the value of the ssn property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSSN() {
        return ssn;
    }

    /**
     * Sets the value of the ssn property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSSN(String value) {
        this.ssn = value;
    }

    /**
     * Gets the value of the sensitive property.
     * 
     */
    public boolean isSensitive() {
        return sensitive;
    }

    /**
     * Sets the value of the sensitive property.
     * 
     */
    public void setSensitive(boolean value) {
        this.sensitive = value;
    }

    /**
     * Gets the value of the sponsorSSN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSponsorSSN() {
        return sponsorSSN;
    }

    /**
     * Sets the value of the sponsorSSN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSponsorSSN(String value) {
        this.sponsorSSN = value;
    }

    /**
     * Gets the value of the vistaSites property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the vistaSites property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getVistaSites().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Site }
     * 
     * 
     */
    public List<Site> getVistaSites() {
        if (vistaSites == null) {
            vistaSites = new ArrayList<Site>();
        }
        return this.vistaSites;
    }

}
