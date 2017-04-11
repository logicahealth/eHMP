
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for patientAppointments complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="patientAppointments">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="apptDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="apptId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="apptType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="clinic" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="clinicId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="clinicStopCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="clinicStopName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="creditStopCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="creditStopName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="patientClass" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="provider" type="{http://webservice.vds.DNS       /}provider" minOccurs="0"/>
 *         &lt;element name="providerClass" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerPager" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="reason" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="service" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="serviceCategoryCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="serviceCategoryName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="userIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="visitString" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "patientAppointments", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "apptDate",
    "apptId",
    "apptType",
    "clinic",
    "clinicId",
    "clinicStopCode",
    "clinicStopName",
    "creditStopCode",
    "creditStopName",
    "patientClass",
    "provider",
    "providerClass",
    "providerCode",
    "providerPager",
    "providerPhone",
    "reason",
    "service",
    "serviceCategoryCode",
    "serviceCategoryName",
    "status",
    "userIen",
    "visitString"
})
@XmlSeeAlso({
    Encounter.class
})
public class PatientAppointments
    extends DataBean
{

    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar apptDate;
    protected String apptId;
    protected String apptType;
    protected String clinic;
    protected String clinicId;
    protected String clinicStopCode;
    protected String clinicStopName;
    protected String creditStopCode;
    protected String creditStopName;
    protected String patientClass;
    protected Provider provider;
    protected String providerClass;
    protected String providerCode;
    protected String providerPager;
    protected String providerPhone;
    protected String reason;
    protected String service;
    protected String serviceCategoryCode;
    protected String serviceCategoryName;
    protected String status;
    protected String userIen;
    protected String visitString;

    /**
     * Gets the value of the apptDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getApptDate() {
        return apptDate;
    }

    /**
     * Sets the value of the apptDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setApptDate(XMLGregorianCalendar value) {
        this.apptDate = value;
    }

    /**
     * Gets the value of the apptId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getApptId() {
        return apptId;
    }

    /**
     * Sets the value of the apptId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setApptId(String value) {
        this.apptId = value;
    }

    /**
     * Gets the value of the apptType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getApptType() {
        return apptType;
    }

    /**
     * Sets the value of the apptType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setApptType(String value) {
        this.apptType = value;
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
     * Gets the value of the clinicId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getClinicId() {
        return clinicId;
    }

    /**
     * Sets the value of the clinicId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setClinicId(String value) {
        this.clinicId = value;
    }

    /**
     * Gets the value of the clinicStopCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getClinicStopCode() {
        return clinicStopCode;
    }

    /**
     * Sets the value of the clinicStopCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setClinicStopCode(String value) {
        this.clinicStopCode = value;
    }

    /**
     * Gets the value of the clinicStopName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getClinicStopName() {
        return clinicStopName;
    }

    /**
     * Sets the value of the clinicStopName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setClinicStopName(String value) {
        this.clinicStopName = value;
    }

    /**
     * Gets the value of the creditStopCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCreditStopCode() {
        return creditStopCode;
    }

    /**
     * Sets the value of the creditStopCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCreditStopCode(String value) {
        this.creditStopCode = value;
    }

    /**
     * Gets the value of the creditStopName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCreditStopName() {
        return creditStopName;
    }

    /**
     * Sets the value of the creditStopName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCreditStopName(String value) {
        this.creditStopName = value;
    }

    /**
     * Gets the value of the patientClass property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPatientClass() {
        return patientClass;
    }

    /**
     * Sets the value of the patientClass property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPatientClass(String value) {
        this.patientClass = value;
    }

    /**
     * Gets the value of the provider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getProvider() {
        return provider;
    }

    /**
     * Sets the value of the provider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setProvider(Provider value) {
        this.provider = value;
    }

    /**
     * Gets the value of the providerClass property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderClass() {
        return providerClass;
    }

    /**
     * Sets the value of the providerClass property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderClass(String value) {
        this.providerClass = value;
    }

    /**
     * Gets the value of the providerCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderCode() {
        return providerCode;
    }

    /**
     * Sets the value of the providerCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderCode(String value) {
        this.providerCode = value;
    }

    /**
     * Gets the value of the providerPager property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderPager() {
        return providerPager;
    }

    /**
     * Sets the value of the providerPager property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderPager(String value) {
        this.providerPager = value;
    }

    /**
     * Gets the value of the providerPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderPhone() {
        return providerPhone;
    }

    /**
     * Sets the value of the providerPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderPhone(String value) {
        this.providerPhone = value;
    }

    /**
     * Gets the value of the reason property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReason() {
        return reason;
    }

    /**
     * Sets the value of the reason property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReason(String value) {
        this.reason = value;
    }

    /**
     * Gets the value of the service property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getService() {
        return service;
    }

    /**
     * Sets the value of the service property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setService(String value) {
        this.service = value;
    }

    /**
     * Gets the value of the serviceCategoryCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getServiceCategoryCode() {
        return serviceCategoryCode;
    }

    /**
     * Sets the value of the serviceCategoryCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setServiceCategoryCode(String value) {
        this.serviceCategoryCode = value;
    }

    /**
     * Gets the value of the serviceCategoryName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getServiceCategoryName() {
        return serviceCategoryName;
    }

    /**
     * Sets the value of the serviceCategoryName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setServiceCategoryName(String value) {
        this.serviceCategoryName = value;
    }

    /**
     * Gets the value of the status property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the value of the status property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStatus(String value) {
        this.status = value;
    }

    /**
     * Gets the value of the userIen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserIen() {
        return userIen;
    }

    /**
     * Sets the value of the userIen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserIen(String value) {
        this.userIen = value;
    }

    /**
     * Gets the value of the visitString property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVisitString() {
        return visitString;
    }

    /**
     * Sets the value of the visitString property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVisitString(String value) {
        this.visitString = value;
    }

}
