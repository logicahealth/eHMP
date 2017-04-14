
package gov.va.med.jmeadows_2_3_0.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for dataBean complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="dataBean">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="cdrEventId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="codes" type="{http://webservice.vds.med.va.gov/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="patientId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="patientName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="site" type="{http://webservice.vds.med.va.gov/}site" minOccurs="0"/>
 *         &lt;element name="sourceProtocol" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "dataBean", namespace = "http://webservice.vds.med.va.gov/", propOrder = {
    "cdrEventId",
    "codes",
    "patientId",
    "patientName",
    "site",
    "sourceProtocol"
})
@XmlSeeAlso({
    ClinicalReminder.class,
    LabResult.class,
    DeploymentForm.class,
    ReferralBean.class,
    Problem.class,
    PatientDemographicsDetail.class,
    VlerDocument.class,
    InsuranceBean.class,
    Order.class,
    Diagnosis.class,
    Allergy.class,
    PrescriptionFill.class,
    Immunization.class,
    Vitals.class,
    LabOrder.class,
    RadiologyExam.class,
    AllergyDetail.class,
    Alert.class,
    EncounterDocument.class,
    QuestionnaireBean.class,
    Consult.class,
    PatientAdmission.class,
    Medication.class,
    Procedure.class,
    PatientAppointments.class,
    ProblemNote.class,
    ProgressNote.class,
    FreeTextReport.class,
    PatientHistory.class,
    Form.class
})
public class DataBean {

    protected String cdrEventId;
    @XmlElement(nillable = true)
    protected List<Code> codes;
    protected String patientId;
    protected String patientName;
    protected Site site;
    protected String sourceProtocol;

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
     * Gets the value of the codes property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the codes property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getCodes().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getCodes() {
        if (codes == null) {
            codes = new ArrayList<Code>();
        }
        return this.codes;
    }

    /**
     * Gets the value of the patientId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPatientId() {
        return patientId;
    }

    /**
     * Sets the value of the patientId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPatientId(String value) {
        this.patientId = value;
    }

    /**
     * Gets the value of the patientName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPatientName() {
        return patientName;
    }

    /**
     * Sets the value of the patientName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPatientName(String value) {
        this.patientName = value;
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

}
