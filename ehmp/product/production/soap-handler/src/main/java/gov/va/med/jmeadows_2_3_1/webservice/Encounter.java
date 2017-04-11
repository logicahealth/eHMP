
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for encounter complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="encounter">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}patientAppointments">
 *       &lt;sequence>
 *         &lt;element name="admissionRegistrationNum" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="admittingProvider" type="{http://webservice.vds.DNS       /}provider" minOccurs="0"/>
 *         &lt;element name="arrivalDateTime" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="complexDataUrl" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="departureDateTime" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="diagnosis" type="{http://webservice.vds.DNS       /}diagnosis" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="dischargeDisposition" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="documents" type="{http://webservice.vds.DNS       /}encounterDocument" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="encounterId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encounterNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredByDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="evalManagementCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="procedures" type="{http://webservice.vds.DNS       /}procedure" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="reasonCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="reasonNarrative" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="roomBed" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sensitive" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="specialty" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "encounter", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "admissionRegistrationNum",
    "admittingProvider",
    "arrivalDateTime",
    "complexDataUrl",
    "departureDateTime",
    "diagnosis",
    "dischargeDisposition",
    "documents",
    "encounterId",
    "encounterNumber",
    "enteredBy",
    "enteredByDate",
    "evalManagementCode",
    "procedures",
    "reasonCode",
    "reasonNarrative",
    "roomBed",
    "sensitive",
    "specialty"
})
public class Encounter
    extends PatientAppointments
{

    protected String admissionRegistrationNum;
    protected Provider admittingProvider;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar arrivalDateTime;
    protected String complexDataUrl;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar departureDateTime;
    @XmlElement(nillable = true)
    protected List<Diagnosis> diagnosis;
    protected String dischargeDisposition;
    @XmlElement(nillable = true)
    protected List<EncounterDocument> documents;
    protected String encounterId;
    protected String encounterNumber;
    protected String enteredBy;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar enteredByDate;
    protected String evalManagementCode;
    @XmlElement(nillable = true)
    protected List<Procedure> procedures;
    protected String reasonCode;
    protected String reasonNarrative;
    protected String roomBed;
    protected String sensitive;
    protected String specialty;

    /**
     * Gets the value of the admissionRegistrationNum property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAdmissionRegistrationNum() {
        return admissionRegistrationNum;
    }

    /**
     * Sets the value of the admissionRegistrationNum property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAdmissionRegistrationNum(String value) {
        this.admissionRegistrationNum = value;
    }

    /**
     * Gets the value of the admittingProvider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getAdmittingProvider() {
        return admittingProvider;
    }

    /**
     * Sets the value of the admittingProvider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setAdmittingProvider(Provider value) {
        this.admittingProvider = value;
    }

    /**
     * Gets the value of the arrivalDateTime property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getArrivalDateTime() {
        return arrivalDateTime;
    }

    /**
     * Sets the value of the arrivalDateTime property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setArrivalDateTime(XMLGregorianCalendar value) {
        this.arrivalDateTime = value;
    }

    /**
     * Gets the value of the complexDataUrl property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getComplexDataUrl() {
        return complexDataUrl;
    }

    /**
     * Sets the value of the complexDataUrl property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setComplexDataUrl(String value) {
        this.complexDataUrl = value;
    }

    /**
     * Gets the value of the departureDateTime property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDepartureDateTime() {
        return departureDateTime;
    }

    /**
     * Sets the value of the departureDateTime property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDepartureDateTime(XMLGregorianCalendar value) {
        this.departureDateTime = value;
    }

    /**
     * Gets the value of the diagnosis property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the diagnosis property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDiagnosis().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Diagnosis }
     * 
     * 
     */
    public List<Diagnosis> getDiagnosis() {
        if (diagnosis == null) {
            diagnosis = new ArrayList<Diagnosis>();
        }
        return this.diagnosis;
    }

    /**
     * Gets the value of the dischargeDisposition property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDischargeDisposition() {
        return dischargeDisposition;
    }

    /**
     * Sets the value of the dischargeDisposition property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDischargeDisposition(String value) {
        this.dischargeDisposition = value;
    }

    /**
     * Gets the value of the documents property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the documents property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDocuments().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link EncounterDocument }
     * 
     * 
     */
    public List<EncounterDocument> getDocuments() {
        if (documents == null) {
            documents = new ArrayList<EncounterDocument>();
        }
        return this.documents;
    }

    /**
     * Gets the value of the encounterId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncounterId() {
        return encounterId;
    }

    /**
     * Sets the value of the encounterId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncounterId(String value) {
        this.encounterId = value;
    }

    /**
     * Gets the value of the encounterNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncounterNumber() {
        return encounterNumber;
    }

    /**
     * Sets the value of the encounterNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncounterNumber(String value) {
        this.encounterNumber = value;
    }

    /**
     * Gets the value of the enteredBy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEnteredBy() {
        return enteredBy;
    }

    /**
     * Sets the value of the enteredBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEnteredBy(String value) {
        this.enteredBy = value;
    }

    /**
     * Gets the value of the enteredByDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getEnteredByDate() {
        return enteredByDate;
    }

    /**
     * Sets the value of the enteredByDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setEnteredByDate(XMLGregorianCalendar value) {
        this.enteredByDate = value;
    }

    /**
     * Gets the value of the evalManagementCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEvalManagementCode() {
        return evalManagementCode;
    }

    /**
     * Sets the value of the evalManagementCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEvalManagementCode(String value) {
        this.evalManagementCode = value;
    }

    /**
     * Gets the value of the procedures property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the procedures property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getProcedures().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Procedure }
     * 
     * 
     */
    public List<Procedure> getProcedures() {
        if (procedures == null) {
            procedures = new ArrayList<Procedure>();
        }
        return this.procedures;
    }

    /**
     * Gets the value of the reasonCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReasonCode() {
        return reasonCode;
    }

    /**
     * Sets the value of the reasonCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReasonCode(String value) {
        this.reasonCode = value;
    }

    /**
     * Gets the value of the reasonNarrative property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReasonNarrative() {
        return reasonNarrative;
    }

    /**
     * Sets the value of the reasonNarrative property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReasonNarrative(String value) {
        this.reasonNarrative = value;
    }

    /**
     * Gets the value of the roomBed property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoomBed() {
        return roomBed;
    }

    /**
     * Sets the value of the roomBed property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoomBed(String value) {
        this.roomBed = value;
    }

    /**
     * Gets the value of the sensitive property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSensitive() {
        return sensitive;
    }

    /**
     * Sets the value of the sensitive property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSensitive(String value) {
        this.sensitive = value;
    }

    /**
     * Gets the value of the specialty property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSpecialty() {
        return specialty;
    }

    /**
     * Sets the value of the specialty property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSpecialty(String value) {
        this.specialty = value;
    }

}
