
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for patientHistory complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="patientHistory">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.domain.ext/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="dateReported" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="type" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="repositoryId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredByDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="findings" type="{http://webservice.jmeadows.domain.ext/}finding" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="unverifiedFlag" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encComment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="custodianName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="historyMedcinId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="periodEndDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="chronicity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dateOnset" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="sensitivity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="comments" type="{http://www.w3.org/2001/XMLSchema}string" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="periodStartDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="couplerType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="reportingClinician" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="custodianId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="otherIdentifier" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="relationshipId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="formattedFindings" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="source" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="facility" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="loincCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="relationship" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "patientHistory", propOrder = {
    "dateReported",
    "enteredBy",
    "type",
    "repositoryId",
    "enteredByDate",
    "findings",
    "unverifiedFlag",
    "encComment",
    "custodianName",
    "historyMedcinId",
    "periodEndDate",
    "chronicity",
    "dateOnset",
    "sensitivity",
    "comments",
    "periodStartDate",
    "couplerType",
    "reportingClinician",
    "custodianId",
    "otherIdentifier",
    "relationshipId",
    "formattedFindings",
    "source",
    "status",
    "facility",
    "loincCode",
    "relationship"
})
public class PatientHistory
    extends DataBean
{

    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar dateReported;
    protected String enteredBy;
    protected String type;
    protected String repositoryId;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar enteredByDate;
    @XmlElement(nillable = true)
    protected List<Finding> findings;
    protected String unverifiedFlag;
    protected String encComment;
    protected String custodianName;
    protected String historyMedcinId;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar periodEndDate;
    protected String chronicity;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar dateOnset;
    protected String sensitivity;
    @XmlElement(nillable = true)
    protected List<String> comments;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar periodStartDate;
    protected String couplerType;
    protected String reportingClinician;
    protected String custodianId;
    protected String otherIdentifier;
    protected String relationshipId;
    protected String formattedFindings;
    protected String source;
    protected String status;
    protected String facility;
    protected String loincCode;
    protected String relationship;

    /**
     * Gets the value of the dateReported property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDateReported() {
        return dateReported;
    }

    /**
     * Sets the value of the dateReported property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDateReported(XMLGregorianCalendar value) {
        this.dateReported = value;
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
     * Gets the value of the type property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the value of the type property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setType(String value) {
        this.type = value;
    }

    /**
     * Gets the value of the repositoryId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRepositoryId() {
        return repositoryId;
    }

    /**
     * Sets the value of the repositoryId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepositoryId(String value) {
        this.repositoryId = value;
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
     * Gets the value of the findings property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the findings property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getFindings().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Finding }
     * 
     * 
     */
    public List<Finding> getFindings() {
        if (findings == null) {
            findings = new ArrayList<Finding>();
        }
        return this.findings;
    }

    /**
     * Gets the value of the unverifiedFlag property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUnverifiedFlag() {
        return unverifiedFlag;
    }

    /**
     * Sets the value of the unverifiedFlag property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUnverifiedFlag(String value) {
        this.unverifiedFlag = value;
    }

    /**
     * Gets the value of the encComment property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncComment() {
        return encComment;
    }

    /**
     * Sets the value of the encComment property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncComment(String value) {
        this.encComment = value;
    }

    /**
     * Gets the value of the custodianName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCustodianName() {
        return custodianName;
    }

    /**
     * Sets the value of the custodianName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCustodianName(String value) {
        this.custodianName = value;
    }

    /**
     * Gets the value of the historyMedcinId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHistoryMedcinId() {
        return historyMedcinId;
    }

    /**
     * Sets the value of the historyMedcinId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHistoryMedcinId(String value) {
        this.historyMedcinId = value;
    }

    /**
     * Gets the value of the periodEndDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getPeriodEndDate() {
        return periodEndDate;
    }

    /**
     * Sets the value of the periodEndDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setPeriodEndDate(XMLGregorianCalendar value) {
        this.periodEndDate = value;
    }

    /**
     * Gets the value of the chronicity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getChronicity() {
        return chronicity;
    }

    /**
     * Sets the value of the chronicity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setChronicity(String value) {
        this.chronicity = value;
    }

    /**
     * Gets the value of the dateOnset property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDateOnset() {
        return dateOnset;
    }

    /**
     * Sets the value of the dateOnset property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDateOnset(XMLGregorianCalendar value) {
        this.dateOnset = value;
    }

    /**
     * Gets the value of the sensitivity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSensitivity() {
        return sensitivity;
    }

    /**
     * Sets the value of the sensitivity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSensitivity(String value) {
        this.sensitivity = value;
    }

    /**
     * Gets the value of the comments property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the comments property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getComments().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link String }
     * 
     * 
     */
    public List<String> getComments() {
        if (comments == null) {
            comments = new ArrayList<String>();
        }
        return this.comments;
    }

    /**
     * Gets the value of the periodStartDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getPeriodStartDate() {
        return periodStartDate;
    }

    /**
     * Sets the value of the periodStartDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setPeriodStartDate(XMLGregorianCalendar value) {
        this.periodStartDate = value;
    }

    /**
     * Gets the value of the couplerType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCouplerType() {
        return couplerType;
    }

    /**
     * Sets the value of the couplerType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCouplerType(String value) {
        this.couplerType = value;
    }

    /**
     * Gets the value of the reportingClinician property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReportingClinician() {
        return reportingClinician;
    }

    /**
     * Sets the value of the reportingClinician property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReportingClinician(String value) {
        this.reportingClinician = value;
    }

    /**
     * Gets the value of the custodianId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCustodianId() {
        return custodianId;
    }

    /**
     * Sets the value of the custodianId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCustodianId(String value) {
        this.custodianId = value;
    }

    /**
     * Gets the value of the otherIdentifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOtherIdentifier() {
        return otherIdentifier;
    }

    /**
     * Sets the value of the otherIdentifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOtherIdentifier(String value) {
        this.otherIdentifier = value;
    }

    /**
     * Gets the value of the relationshipId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRelationshipId() {
        return relationshipId;
    }

    /**
     * Sets the value of the relationshipId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRelationshipId(String value) {
        this.relationshipId = value;
    }

    /**
     * Gets the value of the formattedFindings property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFormattedFindings() {
        return formattedFindings;
    }

    /**
     * Sets the value of the formattedFindings property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFormattedFindings(String value) {
        this.formattedFindings = value;
    }

    /**
     * Gets the value of the source property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSource() {
        return source;
    }

    /**
     * Sets the value of the source property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSource(String value) {
        this.source = value;
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
     * Gets the value of the facility property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFacility() {
        return facility;
    }

    /**
     * Sets the value of the facility property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFacility(String value) {
        this.facility = value;
    }

    /**
     * Gets the value of the loincCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLoincCode() {
        return loincCode;
    }

    /**
     * Sets the value of the loincCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLoincCode(String value) {
        this.loincCode = value;
    }

    /**
     * Gets the value of the relationship property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRelationship() {
        return relationship;
    }

    /**
     * Sets the value of the relationship property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRelationship(String value) {
        this.relationship = value;
    }

}
