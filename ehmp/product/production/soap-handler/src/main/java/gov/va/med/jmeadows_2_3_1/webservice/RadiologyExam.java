
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for radiologyExam complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="radiologyExam">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.DNS       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="accessionNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="amendedDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="amendedText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="examDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="examId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="priority" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="reasonForOrder" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="study" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "radiologyExam", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "accessionNumber",
    "amendedDate",
    "amendedText",
    "examDate",
    "examId",
    "orderNumber",
    "priority",
    "reasonForOrder",
    "status",
    "study"
})
@XmlSeeAlso({
    RadiologyReport.class
})
public class RadiologyExam
    extends DataBean
{

    protected String accessionNumber;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar amendedDate;
    protected String amendedText;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar examDate;
    protected String examId;
    protected String orderNumber;
    protected String priority;
    protected String reasonForOrder;
    protected String status;
    protected String study;

    /**
     * Gets the value of the accessionNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAccessionNumber() {
        return accessionNumber;
    }

    /**
     * Sets the value of the accessionNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAccessionNumber(String value) {
        this.accessionNumber = value;
    }

    /**
     * Gets the value of the amendedDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getAmendedDate() {
        return amendedDate;
    }

    /**
     * Sets the value of the amendedDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setAmendedDate(XMLGregorianCalendar value) {
        this.amendedDate = value;
    }

    /**
     * Gets the value of the amendedText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAmendedText() {
        return amendedText;
    }

    /**
     * Sets the value of the amendedText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAmendedText(String value) {
        this.amendedText = value;
    }

    /**
     * Gets the value of the examDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getExamDate() {
        return examDate;
    }

    /**
     * Sets the value of the examDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setExamDate(XMLGregorianCalendar value) {
        this.examDate = value;
    }

    /**
     * Gets the value of the examId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getExamId() {
        return examId;
    }

    /**
     * Sets the value of the examId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setExamId(String value) {
        this.examId = value;
    }

    /**
     * Gets the value of the orderNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOrderNumber() {
        return orderNumber;
    }

    /**
     * Sets the value of the orderNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOrderNumber(String value) {
        this.orderNumber = value;
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
     * Gets the value of the reasonForOrder property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReasonForOrder() {
        return reasonForOrder;
    }

    /**
     * Sets the value of the reasonForOrder property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReasonForOrder(String value) {
        this.reasonForOrder = value;
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
     * Gets the value of the study property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStudy() {
        return study;
    }

    /**
     * Sets the value of the study property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStudy(String value) {
        this.study = value;
    }

}
