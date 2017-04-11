
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
 * <p>Java class for insuranceBean complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="insuranceBean">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="companyAddressLine1" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyAddressLine2" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyAddressLine3" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyCity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyPostalCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyStateProvince" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="companyTelecom" type="{http://webservice.vds.med.DNS   /}telecom" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="effectiveDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="expirationDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="groupNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="insuranceNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="insuranceType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="insuranceTypeId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="memberId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="planName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="policyHolder" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="relationShip" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="subscriberDOB" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="subscriberId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "insuranceBean", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "companyAddressLine1",
    "companyAddressLine2",
    "companyAddressLine3",
    "companyCity",
    "companyIen",
    "companyName",
    "companyPostalCode",
    "companyStateProvince",
    "companyTelecom",
    "effectiveDate",
    "expirationDate",
    "groupNumber",
    "insuranceNumber",
    "insuranceType",
    "insuranceTypeId",
    "memberId",
    "planName",
    "policyHolder",
    "relationShip",
    "subscriberDOB",
    "subscriberId"
})
public class InsuranceBean
    extends DataBean
{

    protected String companyAddressLine1;
    protected String companyAddressLine2;
    protected String companyAddressLine3;
    protected String companyCity;
    protected String companyIen;
    protected String companyName;
    protected String companyPostalCode;
    protected String companyStateProvince;
    @XmlElement(nillable = true)
    protected List<Telecom> companyTelecom;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar effectiveDate;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar expirationDate;
    protected String groupNumber;
    protected String insuranceNumber;
    protected String insuranceType;
    protected String insuranceTypeId;
    protected String memberId;
    protected String planName;
    protected String policyHolder;
    protected String relationShip;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar subscriberDOB;
    protected String subscriberId;

    /**
     * Gets the value of the companyAddressLine1 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyAddressLine1() {
        return companyAddressLine1;
    }

    /**
     * Sets the value of the companyAddressLine1 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyAddressLine1(String value) {
        this.companyAddressLine1 = value;
    }

    /**
     * Gets the value of the companyAddressLine2 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyAddressLine2() {
        return companyAddressLine2;
    }

    /**
     * Sets the value of the companyAddressLine2 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyAddressLine2(String value) {
        this.companyAddressLine2 = value;
    }

    /**
     * Gets the value of the companyAddressLine3 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyAddressLine3() {
        return companyAddressLine3;
    }

    /**
     * Sets the value of the companyAddressLine3 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyAddressLine3(String value) {
        this.companyAddressLine3 = value;
    }

    /**
     * Gets the value of the companyCity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyCity() {
        return companyCity;
    }

    /**
     * Sets the value of the companyCity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyCity(String value) {
        this.companyCity = value;
    }

    /**
     * Gets the value of the companyIen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyIen() {
        return companyIen;
    }

    /**
     * Sets the value of the companyIen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyIen(String value) {
        this.companyIen = value;
    }

    /**
     * Gets the value of the companyName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyName() {
        return companyName;
    }

    /**
     * Sets the value of the companyName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyName(String value) {
        this.companyName = value;
    }

    /**
     * Gets the value of the companyPostalCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyPostalCode() {
        return companyPostalCode;
    }

    /**
     * Sets the value of the companyPostalCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyPostalCode(String value) {
        this.companyPostalCode = value;
    }

    /**
     * Gets the value of the companyStateProvince property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompanyStateProvince() {
        return companyStateProvince;
    }

    /**
     * Sets the value of the companyStateProvince property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompanyStateProvince(String value) {
        this.companyStateProvince = value;
    }

    /**
     * Gets the value of the companyTelecom property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the companyTelecom property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getCompanyTelecom().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Telecom }
     * 
     * 
     */
    public List<Telecom> getCompanyTelecom() {
        if (companyTelecom == null) {
            companyTelecom = new ArrayList<Telecom>();
        }
        return this.companyTelecom;
    }

    /**
     * Gets the value of the effectiveDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getEffectiveDate() {
        return effectiveDate;
    }

    /**
     * Sets the value of the effectiveDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setEffectiveDate(XMLGregorianCalendar value) {
        this.effectiveDate = value;
    }

    /**
     * Gets the value of the expirationDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getExpirationDate() {
        return expirationDate;
    }

    /**
     * Sets the value of the expirationDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setExpirationDate(XMLGregorianCalendar value) {
        this.expirationDate = value;
    }

    /**
     * Gets the value of the groupNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGroupNumber() {
        return groupNumber;
    }

    /**
     * Sets the value of the groupNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGroupNumber(String value) {
        this.groupNumber = value;
    }

    /**
     * Gets the value of the insuranceNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInsuranceNumber() {
        return insuranceNumber;
    }

    /**
     * Sets the value of the insuranceNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInsuranceNumber(String value) {
        this.insuranceNumber = value;
    }

    /**
     * Gets the value of the insuranceType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInsuranceType() {
        return insuranceType;
    }

    /**
     * Sets the value of the insuranceType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInsuranceType(String value) {
        this.insuranceType = value;
    }

    /**
     * Gets the value of the insuranceTypeId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInsuranceTypeId() {
        return insuranceTypeId;
    }

    /**
     * Sets the value of the insuranceTypeId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInsuranceTypeId(String value) {
        this.insuranceTypeId = value;
    }

    /**
     * Gets the value of the memberId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMemberId() {
        return memberId;
    }

    /**
     * Sets the value of the memberId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMemberId(String value) {
        this.memberId = value;
    }

    /**
     * Gets the value of the planName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPlanName() {
        return planName;
    }

    /**
     * Sets the value of the planName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPlanName(String value) {
        this.planName = value;
    }

    /**
     * Gets the value of the policyHolder property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPolicyHolder() {
        return policyHolder;
    }

    /**
     * Sets the value of the policyHolder property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPolicyHolder(String value) {
        this.policyHolder = value;
    }

    /**
     * Gets the value of the relationShip property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRelationShip() {
        return relationShip;
    }

    /**
     * Sets the value of the relationShip property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRelationShip(String value) {
        this.relationShip = value;
    }

    /**
     * Gets the value of the subscriberDOB property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getSubscriberDOB() {
        return subscriberDOB;
    }

    /**
     * Sets the value of the subscriberDOB property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setSubscriberDOB(XMLGregorianCalendar value) {
        this.subscriberDOB = value;
    }

    /**
     * Gets the value of the subscriberId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSubscriberId() {
        return subscriberId;
    }

    /**
     * Sets the value of the subscriberId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSubscriberId(String value) {
        this.subscriberId = value;
    }

}
