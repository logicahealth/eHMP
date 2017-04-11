
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for problem complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="problem">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="acuity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="condition" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="description" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hasComment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hospitalLocation" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="icdCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="id" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="inOutpatient" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="inactiveICDCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="lastModifiedDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="locationIEN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="locationType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="onsetDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="priority" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerIEN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="recordedDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="responsibleProvider" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="scConditions" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="serviceConnected" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="serviceIEN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="serviceName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="specialExposure" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "problem", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "acuity",
    "condition",
    "description",
    "hasComment",
    "hospitalLocation",
    "icdCode",
    "id",
    "inOutpatient",
    "inactiveICDCode",
    "lastModifiedDate",
    "locationIEN",
    "locationType",
    "onsetDate",
    "priority",
    "providerIEN",
    "recordedDate",
    "responsibleProvider",
    "scConditions",
    "serviceConnected",
    "serviceIEN",
    "serviceName",
    "specialExposure",
    "status"
})
@XmlSeeAlso({
    ProblemDetail.class
})
public class Problem
    extends DataBean
{

    protected String acuity;
    protected String condition;
    protected String description;
    protected String hasComment;
    protected String hospitalLocation;
    protected String icdCode;
    protected String id;
    protected String inOutpatient;
    protected String inactiveICDCode;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar lastModifiedDate;
    protected String locationIEN;
    protected String locationType;
    protected String onsetDate;
    protected String priority;
    protected String providerIEN;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar recordedDate;
    protected String responsibleProvider;
    protected String scConditions;
    protected String serviceConnected;
    protected String serviceIEN;
    protected String serviceName;
    protected String specialExposure;
    protected String status;

    /**
     * Gets the value of the acuity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAcuity() {
        return acuity;
    }

    /**
     * Sets the value of the acuity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAcuity(String value) {
        this.acuity = value;
    }

    /**
     * Gets the value of the condition property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCondition() {
        return condition;
    }

    /**
     * Sets the value of the condition property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCondition(String value) {
        this.condition = value;
    }

    /**
     * Gets the value of the description property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the value of the description property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDescription(String value) {
        this.description = value;
    }

    /**
     * Gets the value of the hasComment property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHasComment() {
        return hasComment;
    }

    /**
     * Sets the value of the hasComment property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHasComment(String value) {
        this.hasComment = value;
    }

    /**
     * Gets the value of the hospitalLocation property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHospitalLocation() {
        return hospitalLocation;
    }

    /**
     * Sets the value of the hospitalLocation property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHospitalLocation(String value) {
        this.hospitalLocation = value;
    }

    /**
     * Gets the value of the icdCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getIcdCode() {
        return icdCode;
    }

    /**
     * Sets the value of the icdCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setIcdCode(String value) {
        this.icdCode = value;
    }

    /**
     * Gets the value of the id property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the value of the id property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setId(String value) {
        this.id = value;
    }

    /**
     * Gets the value of the inOutpatient property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInOutpatient() {
        return inOutpatient;
    }

    /**
     * Sets the value of the inOutpatient property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInOutpatient(String value) {
        this.inOutpatient = value;
    }

    /**
     * Gets the value of the inactiveICDCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInactiveICDCode() {
        return inactiveICDCode;
    }

    /**
     * Sets the value of the inactiveICDCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInactiveICDCode(String value) {
        this.inactiveICDCode = value;
    }

    /**
     * Gets the value of the lastModifiedDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getLastModifiedDate() {
        return lastModifiedDate;
    }

    /**
     * Sets the value of the lastModifiedDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setLastModifiedDate(XMLGregorianCalendar value) {
        this.lastModifiedDate = value;
    }

    /**
     * Gets the value of the locationIEN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLocationIEN() {
        return locationIEN;
    }

    /**
     * Sets the value of the locationIEN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLocationIEN(String value) {
        this.locationIEN = value;
    }

    /**
     * Gets the value of the locationType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLocationType() {
        return locationType;
    }

    /**
     * Sets the value of the locationType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLocationType(String value) {
        this.locationType = value;
    }

    /**
     * Gets the value of the onsetDate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOnsetDate() {
        return onsetDate;
    }

    /**
     * Sets the value of the onsetDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOnsetDate(String value) {
        this.onsetDate = value;
    }

    /**
     * Gets the value of the priority property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPriority() {
        return priority;
    }

    /**
     * Sets the value of the priority property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPriority(String value) {
        this.priority = value;
    }

    /**
     * Gets the value of the providerIEN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderIEN() {
        return providerIEN;
    }

    /**
     * Sets the value of the providerIEN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderIEN(String value) {
        this.providerIEN = value;
    }

    /**
     * Gets the value of the recordedDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getRecordedDate() {
        return recordedDate;
    }

    /**
     * Sets the value of the recordedDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setRecordedDate(XMLGregorianCalendar value) {
        this.recordedDate = value;
    }

    /**
     * Gets the value of the responsibleProvider property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getResponsibleProvider() {
        return responsibleProvider;
    }

    /**
     * Sets the value of the responsibleProvider property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setResponsibleProvider(String value) {
        this.responsibleProvider = value;
    }

    /**
     * Gets the value of the scConditions property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getScConditions() {
        return scConditions;
    }

    /**
     * Sets the value of the scConditions property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setScConditions(String value) {
        this.scConditions = value;
    }

    /**
     * Gets the value of the serviceConnected property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getServiceConnected() {
        return serviceConnected;
    }

    /**
     * Sets the value of the serviceConnected property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setServiceConnected(String value) {
        this.serviceConnected = value;
    }

    /**
     * Gets the value of the serviceIEN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getServiceIEN() {
        return serviceIEN;
    }

    /**
     * Sets the value of the serviceIEN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setServiceIEN(String value) {
        this.serviceIEN = value;
    }

    /**
     * Gets the value of the serviceName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getServiceName() {
        return serviceName;
    }

    /**
     * Sets the value of the serviceName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setServiceName(String value) {
        this.serviceName = value;
    }

    /**
     * Gets the value of the specialExposure property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSpecialExposure() {
        return specialExposure;
    }

    /**
     * Sets the value of the specialExposure property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSpecialExposure(String value) {
        this.specialExposure = value;
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

}
