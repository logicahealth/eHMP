
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for vlerccda complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="vlerccda">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="errorList" type="{http://www.w3.org/2001/XMLSchema}string" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="statusList" type="{http://webservice.bhie.DNS       /}siteStatusV4" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="demographics" type="{http://webservice.vds.DNS       /}patientDemographics" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="allergies" type="{http://webservice.vds.DNS       /}allergy" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="immunizations" type="{http://webservice.vds.DNS       /}immunization" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="medications" type="{http://webservice.vds.DNS       /}medication" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="results" type="{http://webservice.vds.DNS       /}labResult" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="problems" type="{http://webservice.vds.DNS       /}problem" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="procedures" type="{http://webservice.vds.DNS       /}procedure" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="vitals" type="{http://webservice.vds.DNS       /}vitals" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="encounters" type="{http://webservice.vds.DNS       /}encounter" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="payers" type="{http://webservice.vds.DNS       /}insuranceBean" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="narratives" type="{http://webservice.bhie.DNS       /}narrativeV4" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="documentInfo" type="{http://webservice.bhie.DNS       /}documentInfoV4" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="queryComplete" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "vlerccda", propOrder = {
    "errorList",
    "statusList",
    "demographics",
    "allergies",
    "immunizations",
    "medications",
    "results",
    "problems",
    "procedures",
    "vitals",
    "encounters",
    "payers",
    "narratives",
    "documentInfo",
    "queryComplete"
})
public class Vlerccda
    extends DataBean
{

    @XmlElement(nillable = true)
    protected List<String> errorList;
    @XmlElement(nillable = true)
    protected List<SiteStatusV4> statusList;
    @XmlElement(nillable = true)
    protected List<PatientDemographics> demographics;
    @XmlElement(nillable = true)
    protected List<Allergy> allergies;
    @XmlElement(nillable = true)
    protected List<Immunization> immunizations;
    @XmlElement(nillable = true)
    protected List<Medication> medications;
    @XmlElement(nillable = true)
    protected List<LabResult> results;
    @XmlElement(nillable = true)
    protected List<Problem> problems;
    @XmlElement(nillable = true)
    protected List<Procedure> procedures;
    @XmlElement(nillable = true)
    protected List<Vitals> vitals;
    @XmlElement(nillable = true)
    protected List<Encounter> encounters;
    @XmlElement(nillable = true)
    protected List<InsuranceBean> payers;
    @XmlElement(nillable = true)
    protected List<NarrativeV4> narratives;
    @XmlElement(nillable = true)
    protected List<DocumentInfoV4> documentInfo;
    protected String queryComplete;

    /**
     * Gets the value of the errorList property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the errorList property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getErrorList().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link String }
     * 
     * 
     */
    public List<String> getErrorList() {
        if (errorList == null) {
            errorList = new ArrayList<String>();
        }
        return this.errorList;
    }

    /**
     * Gets the value of the statusList property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the statusList property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getStatusList().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link SiteStatusV4 }
     * 
     * 
     */
    public List<SiteStatusV4> getStatusList() {
        if (statusList == null) {
            statusList = new ArrayList<SiteStatusV4>();
        }
        return this.statusList;
    }

    /**
     * Gets the value of the demographics property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the demographics property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDemographics().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link PatientDemographics }
     * 
     * 
     */
    public List<PatientDemographics> getDemographics() {
        if (demographics == null) {
            demographics = new ArrayList<PatientDemographics>();
        }
        return this.demographics;
    }

    /**
     * Gets the value of the allergies property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the allergies property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getAllergies().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Allergy }
     * 
     * 
     */
    public List<Allergy> getAllergies() {
        if (allergies == null) {
            allergies = new ArrayList<Allergy>();
        }
        return this.allergies;
    }

    /**
     * Gets the value of the immunizations property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the immunizations property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getImmunizations().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Immunization }
     * 
     * 
     */
    public List<Immunization> getImmunizations() {
        if (immunizations == null) {
            immunizations = new ArrayList<Immunization>();
        }
        return this.immunizations;
    }

    /**
     * Gets the value of the medications property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the medications property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getMedications().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Medication }
     * 
     * 
     */
    public List<Medication> getMedications() {
        if (medications == null) {
            medications = new ArrayList<Medication>();
        }
        return this.medications;
    }

    /**
     * Gets the value of the results property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the results property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getResults().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link LabResult }
     * 
     * 
     */
    public List<LabResult> getResults() {
        if (results == null) {
            results = new ArrayList<LabResult>();
        }
        return this.results;
    }

    /**
     * Gets the value of the problems property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the problems property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getProblems().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Problem }
     * 
     * 
     */
    public List<Problem> getProblems() {
        if (problems == null) {
            problems = new ArrayList<Problem>();
        }
        return this.problems;
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
     * Gets the value of the vitals property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the vitals property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getVitals().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Vitals }
     * 
     * 
     */
    public List<Vitals> getVitals() {
        if (vitals == null) {
            vitals = new ArrayList<Vitals>();
        }
        return this.vitals;
    }

    /**
     * Gets the value of the encounters property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the encounters property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getEncounters().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Encounter }
     * 
     * 
     */
    public List<Encounter> getEncounters() {
        if (encounters == null) {
            encounters = new ArrayList<Encounter>();
        }
        return this.encounters;
    }

    /**
     * Gets the value of the payers property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the payers property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getPayers().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link InsuranceBean }
     * 
     * 
     */
    public List<InsuranceBean> getPayers() {
        if (payers == null) {
            payers = new ArrayList<InsuranceBean>();
        }
        return this.payers;
    }

    /**
     * Gets the value of the narratives property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the narratives property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getNarratives().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link NarrativeV4 }
     * 
     * 
     */
    public List<NarrativeV4> getNarratives() {
        if (narratives == null) {
            narratives = new ArrayList<NarrativeV4>();
        }
        return this.narratives;
    }

    /**
     * Gets the value of the documentInfo property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the documentInfo property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDocumentInfo().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link DocumentInfoV4 }
     * 
     * 
     */
    public List<DocumentInfoV4> getDocumentInfo() {
        if (documentInfo == null) {
            documentInfo = new ArrayList<DocumentInfoV4>();
        }
        return this.documentInfo;
    }

    /**
     * Gets the value of the queryComplete property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getQueryComplete() {
        return queryComplete;
    }

    /**
     * Sets the value of the queryComplete property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setQueryComplete(String value) {
        this.queryComplete = value;
    }

}
