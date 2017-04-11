
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for deploymentForm complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="deploymentForm">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="completeNote" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="custodianId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredByDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="facility" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="loincCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteFormat" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteTypeCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteTypeName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="otherIdentifier" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="repositoryId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="verifiedBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="verifiedDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "deploymentForm", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "completeNote",
    "custodianId",
    "enteredBy",
    "enteredByDate",
    "facility",
    "loincCode",
    "noteFormat",
    "noteId",
    "noteTitle",
    "noteTypeCode",
    "noteTypeName",
    "otherIdentifier",
    "repositoryId",
    "verifiedBy",
    "verifiedDate"
})
public class DeploymentForm
    extends DataBean
{

    protected String completeNote;
    protected String custodianId;
    protected String enteredBy;
    protected String enteredByDate;
    protected String facility;
    protected String loincCode;
    protected String noteFormat;
    protected String noteId;
    protected String noteTitle;
    protected String noteTypeCode;
    protected String noteTypeName;
    protected String otherIdentifier;
    protected String repositoryId;
    protected String verifiedBy;
    protected String verifiedDate;

    /**
     * Gets the value of the completeNote property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCompleteNote() {
        return completeNote;
    }

    /**
     * Sets the value of the completeNote property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCompleteNote(String value) {
        this.completeNote = value;
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
     *     {@link String }
     *     
     */
    public String getEnteredByDate() {
        return enteredByDate;
    }

    /**
     * Sets the value of the enteredByDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEnteredByDate(String value) {
        this.enteredByDate = value;
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
     * Gets the value of the noteFormat property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteFormat() {
        return noteFormat;
    }

    /**
     * Sets the value of the noteFormat property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteFormat(String value) {
        this.noteFormat = value;
    }

    /**
     * Gets the value of the noteId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteId() {
        return noteId;
    }

    /**
     * Sets the value of the noteId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteId(String value) {
        this.noteId = value;
    }

    /**
     * Gets the value of the noteTitle property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteTitle() {
        return noteTitle;
    }

    /**
     * Sets the value of the noteTitle property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteTitle(String value) {
        this.noteTitle = value;
    }

    /**
     * Gets the value of the noteTypeCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteTypeCode() {
        return noteTypeCode;
    }

    /**
     * Sets the value of the noteTypeCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteTypeCode(String value) {
        this.noteTypeCode = value;
    }

    /**
     * Gets the value of the noteTypeName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteTypeName() {
        return noteTypeName;
    }

    /**
     * Sets the value of the noteTypeName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteTypeName(String value) {
        this.noteTypeName = value;
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
     * Gets the value of the verifiedBy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVerifiedBy() {
        return verifiedBy;
    }

    /**
     * Sets the value of the verifiedBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVerifiedBy(String value) {
        this.verifiedBy = value;
    }

    /**
     * Gets the value of the verifiedDate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVerifiedDate() {
        return verifiedDate;
    }

    /**
     * Sets the value of the verifiedDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVerifiedDate(String value) {
        this.verifiedDate = value;
    }

}
