
package gov.va.med.jmeadows_2_3_0.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for patientDemographics complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="patientDemographics">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}patient">
 *       &lt;sequence>
 *         &lt;element name="address1" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="address2" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="admissionDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="admissionId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="cdrEventId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="city" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="clinic" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="codeGreen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ethnicity" type="{http://webservice.vds.med.DNS   /}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="labId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="pcmDates" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="pcmPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="percentServiceConnected" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="phone1" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="phone2" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="primaryProvider" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="race" type="{http://webservice.vds.med.DNS   /}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="rank" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="site" type="{http://webservice.vds.med.DNS   /}site" minOccurs="0"/>
 *         &lt;element name="sourceProtocol" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="state" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ward" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="wardId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="zipCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "patientDemographics", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "address1",
    "address2",
    "admissionDate",
    "admissionId",
    "cdrEventId",
    "city",
    "clinic",
    "codeGreen",
    "ethnicity",
    "labId",
    "pcmDates",
    "pcmPhone",
    "percentServiceConnected",
    "phone1",
    "phone2",
    "primaryProvider",
    "race",
    "rank",
    "site",
    "sourceProtocol",
    "state",
    "ward",
    "wardId",
    "zipCode"
})
public class PatientDemographics
    extends Patient
{

    protected String address1;
    protected String address2;
    protected String admissionDate;
    protected String admissionId;
    protected String cdrEventId;
    protected String city;
    protected String clinic;
    protected String codeGreen;
    @XmlElement(nillable = true)
    protected List<Code> ethnicity;
    protected String labId;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar pcmDates;
    protected String pcmPhone;
    protected String percentServiceConnected;
    protected String phone1;
    protected String phone2;
    protected String primaryProvider;
    @XmlElement(nillable = true)
    protected List<Code> race;
    protected String rank;
    protected Site site;
    protected String sourceProtocol;
    protected String state;
    protected String ward;
    protected String wardId;
    protected String zipCode;

    /**
     * Gets the value of the address1 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAddress1() {
        return address1;
    }

    /**
     * Sets the value of the address1 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAddress1(String value) {
        this.address1 = value;
    }

    /**
     * Gets the value of the address2 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAddress2() {
        return address2;
    }

    /**
     * Sets the value of the address2 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAddress2(String value) {
        this.address2 = value;
    }

    /**
     * Gets the value of the admissionDate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAdmissionDate() {
        return admissionDate;
    }

    /**
     * Sets the value of the admissionDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAdmissionDate(String value) {
        this.admissionDate = value;
    }

    /**
     * Gets the value of the admissionId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAdmissionId() {
        return admissionId;
    }

    /**
     * Sets the value of the admissionId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAdmissionId(String value) {
        this.admissionId = value;
    }

    /**
     * Gets the value of the cdrEventId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCdrEventId() {
        return cdrEventId;
    }

    /**
     * Sets the value of the cdrEventId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCdrEventId(String value) {
        this.cdrEventId = value;
    }

    /**
     * Gets the value of the city property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCity() {
        return city;
    }

    /**
     * Sets the value of the city property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCity(String value) {
        this.city = value;
    }

    /**
     * Gets the value of the clinic property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getClinic() {
        return clinic;
    }

    /**
     * Sets the value of the clinic property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setClinic(String value) {
        this.clinic = value;
    }

    /**
     * Gets the value of the codeGreen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCodeGreen() {
        return codeGreen;
    }

    /**
     * Sets the value of the codeGreen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCodeGreen(String value) {
        this.codeGreen = value;
    }

    /**
     * Gets the value of the ethnicity property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the ethnicity property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getEthnicity().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getEthnicity() {
        if (ethnicity == null) {
            ethnicity = new ArrayList<Code>();
        }
        return this.ethnicity;
    }

    /**
     * Gets the value of the labId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLabId() {
        return labId;
    }

    /**
     * Sets the value of the labId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLabId(String value) {
        this.labId = value;
    }

    /**
     * Gets the value of the pcmDates property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getPcmDates() {
        return pcmDates;
    }

    /**
     * Sets the value of the pcmDates property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setPcmDates(XMLGregorianCalendar value) {
        this.pcmDates = value;
    }

    /**
     * Gets the value of the pcmPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPcmPhone() {
        return pcmPhone;
    }

    /**
     * Sets the value of the pcmPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPcmPhone(String value) {
        this.pcmPhone = value;
    }

    /**
     * Gets the value of the percentServiceConnected property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPercentServiceConnected() {
        return percentServiceConnected;
    }

    /**
     * Sets the value of the percentServiceConnected property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPercentServiceConnected(String value) {
        this.percentServiceConnected = value;
    }

    /**
     * Gets the value of the phone1 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPhone1() {
        return phone1;
    }

    /**
     * Sets the value of the phone1 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPhone1(String value) {
        this.phone1 = value;
    }

    /**
     * Gets the value of the phone2 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPhone2() {
        return phone2;
    }

    /**
     * Sets the value of the phone2 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPhone2(String value) {
        this.phone2 = value;
    }

    /**
     * Gets the value of the primaryProvider property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPrimaryProvider() {
        return primaryProvider;
    }

    /**
     * Sets the value of the primaryProvider property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPrimaryProvider(String value) {
        this.primaryProvider = value;
    }

    /**
     * Gets the value of the race property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the race property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getRace().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getRace() {
        if (race == null) {
            race = new ArrayList<Code>();
        }
        return this.race;
    }

    /**
     * Gets the value of the rank property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRank() {
        return rank;
    }

    /**
     * Sets the value of the rank property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRank(String value) {
        this.rank = value;
    }

    /**
     * Gets the value of the site property.
     * 
     * @return
     *     possible object is
     *     {@link Site }
     *     
     */
    public Site getSite() {
        return site;
    }

    /**
     * Sets the value of the site property.
     * 
     * @param value
     *     allowed object is
     *     {@link Site }
     *     
     */
    public void setSite(Site value) {
        this.site = value;
    }

    /**
     * Gets the value of the sourceProtocol property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSourceProtocol() {
        return sourceProtocol;
    }

    /**
     * Sets the value of the sourceProtocol property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSourceProtocol(String value) {
        this.sourceProtocol = value;
    }

    /**
     * Gets the value of the state property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getState() {
        return state;
    }

    /**
     * Sets the value of the state property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setState(String value) {
        this.state = value;
    }

    /**
     * Gets the value of the ward property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getWard() {
        return ward;
    }

    /**
     * Sets the value of the ward property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setWard(String value) {
        this.ward = value;
    }

    /**
     * Gets the value of the wardId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getWardId() {
        return wardId;
    }

    /**
     * Sets the value of the wardId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setWardId(String value) {
        this.wardId = value;
    }

    /**
     * Gets the value of the zipCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getZipCode() {
        return zipCode;
    }

    /**
     * Sets the value of the zipCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setZipCode(String value) {
        this.zipCode = value;
    }

}
