
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for form complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="form">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.domain.ext/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="formId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="formDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="documentTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="facilityName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="deploymentForm" type="{http://webservice.vds.domain.ext/}progressNote" minOccurs="0"/>
 *         &lt;element name="questionnaireBean" type="{http://webservice.vds.domain.ext/}questionnaireBean" minOccurs="0"/>
 *         &lt;element name="docType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "form", propOrder = {
    "formId",
    "formDate",
    "enteredBy",
    "documentTitle",
    "facilityName",
    "deploymentForm",
    "questionnaireBean",
    "docType"
})
public class Form
    extends DataBean
{

    protected String formId;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar formDate;
    protected String enteredBy;
    protected String documentTitle;
    protected String facilityName;
    protected ProgressNote deploymentForm;
    protected QuestionnaireBean questionnaireBean;
    protected String docType;

    /**
     * Gets the value of the formId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFormId() {
        return formId;
    }

    /**
     * Sets the value of the formId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFormId(String value) {
        this.formId = value;
    }

    /**
     * Gets the value of the formDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getFormDate() {
        return formDate;
    }

    /**
     * Sets the value of the formDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setFormDate(XMLGregorianCalendar value) {
        this.formDate = value;
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

    /**
     * Gets the value of the facilityName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFacilityName() {
        return facilityName;
    }

    /**
     * Sets the value of the facilityName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFacilityName(String value) {
        this.facilityName = value;
    }

    /**
     * Gets the value of the deploymentForm property.
     * 
     * @return
     *     possible object is
     *     {@link ProgressNote }
     *     
     */
    public ProgressNote getDeploymentForm() {
        return deploymentForm;
    }

    /**
     * Sets the value of the deploymentForm property.
     * 
     * @param value
     *     allowed object is
     *     {@link ProgressNote }
     *     
     */
    public void setDeploymentForm(ProgressNote value) {
        this.deploymentForm = value;
    }

    /**
     * Gets the value of the questionnaireBean property.
     * 
     * @return
     *     possible object is
     *     {@link QuestionnaireBean }
     *     
     */
    public QuestionnaireBean getQuestionnaireBean() {
        return questionnaireBean;
    }

    /**
     * Sets the value of the questionnaireBean property.
     * 
     * @param value
     *     allowed object is
     *     {@link QuestionnaireBean }
     *     
     */
    public void setQuestionnaireBean(QuestionnaireBean value) {
        this.questionnaireBean = value;
    }

    /**
     * Gets the value of the docType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDocType() {
        return docType;
    }

    /**
     * Sets the value of the docType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDocType(String value) {
        this.docType = value;
    }

}
