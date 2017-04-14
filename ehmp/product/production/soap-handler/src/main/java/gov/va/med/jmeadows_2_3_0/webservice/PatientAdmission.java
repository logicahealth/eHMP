
package gov.va.med.jmeadows_2_3_0.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for patientAdmission complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="patientAdmission">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.va.gov/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="admissionDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="admissionId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="admittingProvider" type="{http://webservice.vds.med.va.gov/}provider" minOccurs="0"/>
 *         &lt;element name="admittingUserIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="codingCompleteDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="dischargeSummaryId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dispositionDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="division" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="drg" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="drgDescription" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encounterDocuments" type="{http://webservice.vds.med.va.gov/}encounterDocument" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="provider" type="{http://webservice.vds.med.va.gov/}provider" minOccurs="0"/>
 *         &lt;element name="reason" type="{http://webservice.vds.med.va.gov/}code" minOccurs="0"/>
 *         &lt;element name="reasonNarrative" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="recordStatus" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="registerNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="roomBed" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="specialty" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="userIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="visitId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ward" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="wardId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "patientAdmission", namespace = "http://webservice.vds.med.va.gov/", propOrder = {
    "admissionDate",
    "admissionId",
    "admittingProvider",
    "admittingUserIen",
    "codingCompleteDate",
    "dischargeSummaryId",
    "dispositionDate",
    "division",
    "drg",
    "drgDescription",
    "encounterDocuments",
    "provider",
    "reason",
    "reasonNarrative",
    "recordStatus",
    "registerNumber",
    "roomBed",
    "specialty",
    "userIen",
    "visitId",
    "ward",
    "wardId"
})
@XmlSeeAlso({
    AdmissionDetail.class
})
public class PatientAdmission
    extends DataBean
{

    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar admissionDate;
    protected String admissionId;
    protected Provider admittingProvider;
    protected String admittingUserIen;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar codingCompleteDate;
    protected String dischargeSummaryId;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar dispositionDate;
    protected String division;
    protected String drg;
    protected String drgDescription;
    @XmlElement(nillable = true)
    protected List<EncounterDocument> encounterDocuments;
    protected Provider provider;
    protected Code reason;
    protected String reasonNarrative;
    protected String recordStatus;
    protected String registerNumber;
    protected String roomBed;
    protected String specialty;
    protected String userIen;
    protected String visitId;
    protected String ward;
    protected String wardId;

    /**
     * Gets the value of the admissionDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getAdmissionDate() {
        return admissionDate;
    }

    /**
     * Sets the value of the admissionDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setAdmissionDate(XMLGregorianCalendar value) {
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
     * Gets the value of the admittingUserIen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAdmittingUserIen() {
        return admittingUserIen;
    }

    /**
     * Sets the value of the admittingUserIen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAdmittingUserIen(String value) {
        this.admittingUserIen = value;
    }

    /**
     * Gets the value of the codingCompleteDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getCodingCompleteDate() {
        return codingCompleteDate;
    }

    /**
     * Sets the value of the codingCompleteDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setCodingCompleteDate(XMLGregorianCalendar value) {
        this.codingCompleteDate = value;
    }

    /**
     * Gets the value of the dischargeSummaryId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDischargeSummaryId() {
        return dischargeSummaryId;
    }

    /**
     * Sets the value of the dischargeSummaryId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDischargeSummaryId(String value) {
        this.dischargeSummaryId = value;
    }

    /**
     * Gets the value of the dispositionDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDispositionDate() {
        return dispositionDate;
    }

    /**
     * Sets the value of the dispositionDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDispositionDate(XMLGregorianCalendar value) {
        this.dispositionDate = value;
    }

    /**
     * Gets the value of the division property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDivision() {
        return division;
    }

    /**
     * Sets the value of the division property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDivision(String value) {
        this.division = value;
    }

    /**
     * Gets the value of the drg property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDrg() {
        return drg;
    }

    /**
     * Sets the value of the drg property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDrg(String value) {
        this.drg = value;
    }

    /**
     * Gets the value of the drgDescription property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDrgDescription() {
        return drgDescription;
    }

    /**
     * Sets the value of the drgDescription property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDrgDescription(String value) {
        this.drgDescription = value;
    }

    /**
     * Gets the value of the encounterDocuments property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the encounterDocuments property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getEncounterDocuments().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link EncounterDocument }
     * 
     * 
     */
    public List<EncounterDocument> getEncounterDocuments() {
        if (encounterDocuments == null) {
            encounterDocuments = new ArrayList<EncounterDocument>();
        }
        return this.encounterDocuments;
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
     * Gets the value of the reason property.
     * 
     * @return
     *     possible object is
     *     {@link Code }
     *     
     */
    public Code getReason() {
        return reason;
    }

    /**
     * Sets the value of the reason property.
     * 
     * @param value
     *     allowed object is
     *     {@link Code }
     *     
     */
    public void setReason(Code value) {
        this.reason = value;
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
     * Gets the value of the recordStatus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRecordStatus() {
        return recordStatus;
    }

    /**
     * Sets the value of the recordStatus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRecordStatus(String value) {
        this.recordStatus = value;
    }

    /**
     * Gets the value of the registerNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRegisterNumber() {
        return registerNumber;
    }

    /**
     * Sets the value of the registerNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRegisterNumber(String value) {
        this.registerNumber = value;
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
     * Gets the value of the visitId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVisitId() {
        return visitId;
    }

    /**
     * Sets the value of the visitId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVisitId(String value) {
        this.visitId = value;
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

}
