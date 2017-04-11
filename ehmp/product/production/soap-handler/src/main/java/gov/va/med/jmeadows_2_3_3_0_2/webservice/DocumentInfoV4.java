
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for documentInfoV4 complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="documentInfoV4">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="documentPatient" type="{http://webservice.bhie.med.DNS   /}patientV4" minOccurs="0"/>
 *         &lt;element name="documentPatientEmergencyContact" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="documentPatientNok" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="documentPerformer" type="{http://webservice.bhie.med.DNS   /}performerV4" minOccurs="0"/>
 *         &lt;element name="documentSource" type="{http://webservice.bhie.med.DNS   /}sourceV4" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="documentTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "documentInfoV4", namespace = "http://webservice.bhie.med.DNS   /", propOrder = {
    "documentPatient",
    "documentPatientEmergencyContact",
    "documentPatientNok",
    "documentPerformer",
    "documentSource",
    "documentTitle"
})
public class DocumentInfoV4 {

    protected PatientV4 documentPatient;
    protected String documentPatientEmergencyContact;
    protected String documentPatientNok;
    protected PerformerV4 documentPerformer;
    @XmlElement(nillable = true)
    protected List<SourceV4> documentSource;
    protected String documentTitle;

    /**
     * Gets the value of the documentPatient property.
     * 
     * @return
     *     possible object is
     *     {@link PatientV4 }
     *     
     */
    public PatientV4 getDocumentPatient() {
        return documentPatient;
    }

    /**
     * Sets the value of the documentPatient property.
     * 
     * @param value
     *     allowed object is
     *     {@link PatientV4 }
     *     
     */
    public void setDocumentPatient(PatientV4 value) {
        this.documentPatient = value;
    }

    /**
     * Gets the value of the documentPatientEmergencyContact property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDocumentPatientEmergencyContact() {
        return documentPatientEmergencyContact;
    }

    /**
     * Sets the value of the documentPatientEmergencyContact property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDocumentPatientEmergencyContact(String value) {
        this.documentPatientEmergencyContact = value;
    }

    /**
     * Gets the value of the documentPatientNok property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDocumentPatientNok() {
        return documentPatientNok;
    }

    /**
     * Sets the value of the documentPatientNok property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDocumentPatientNok(String value) {
        this.documentPatientNok = value;
    }

    /**
     * Gets the value of the documentPerformer property.
     * 
     * @return
     *     possible object is
     *     {@link PerformerV4 }
     *     
     */
    public PerformerV4 getDocumentPerformer() {
        return documentPerformer;
    }

    /**
     * Sets the value of the documentPerformer property.
     * 
     * @param value
     *     allowed object is
     *     {@link PerformerV4 }
     *     
     */
    public void setDocumentPerformer(PerformerV4 value) {
        this.documentPerformer = value;
    }

    /**
     * Gets the value of the documentSource property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the documentSource property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDocumentSource().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link SourceV4 }
     * 
     * 
     */
    public List<SourceV4> getDocumentSource() {
        if (documentSource == null) {
            documentSource = new ArrayList<SourceV4>();
        }
        return this.documentSource;
    }

    /**
     * Gets the value of the documentTitle property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDocumentTitle() {
        return documentTitle;
    }

    /**
     * Sets the value of the documentTitle property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDocumentTitle(String value) {
        this.documentTitle = value;
    }

}
