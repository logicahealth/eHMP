
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for clinicalReminder complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="clinicalReminder">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="description" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="detail" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dueDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="dueDateString" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="id" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="lastOccurrenceDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="lastOccurrenceDateString" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="reminderClass" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
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
@XmlType(name = "clinicalReminder", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "description",
    "detail",
    "dueDate",
    "dueDateString",
    "id",
    "lastOccurrenceDate",
    "lastOccurrenceDateString",
    "name",
    "reminderClass",
    "status"
})
public class ClinicalReminder
    extends DataBean
{

    protected String description;
    protected String detail;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar dueDate;
    protected String dueDateString;
    protected String id;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar lastOccurrenceDate;
    protected String lastOccurrenceDateString;
    protected String name;
    protected String reminderClass;
    protected String status;

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
     * Gets the value of the detail property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDetail() {
        return detail;
    }

    /**
     * Sets the value of the detail property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDetail(String value) {
        this.detail = value;
    }

    /**
     * Gets the value of the dueDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDueDate() {
        return dueDate;
    }

    /**
     * Sets the value of the dueDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDueDate(XMLGregorianCalendar value) {
        this.dueDate = value;
    }

    /**
     * Gets the value of the dueDateString property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDueDateString() {
        return dueDateString;
    }

    /**
     * Sets the value of the dueDateString property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDueDateString(String value) {
        this.dueDateString = value;
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
     * Gets the value of the lastOccurrenceDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getLastOccurrenceDate() {
        return lastOccurrenceDate;
    }

    /**
     * Sets the value of the lastOccurrenceDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setLastOccurrenceDate(XMLGregorianCalendar value) {
        this.lastOccurrenceDate = value;
    }

    /**
     * Gets the value of the lastOccurrenceDateString property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLastOccurrenceDateString() {
        return lastOccurrenceDateString;
    }

    /**
     * Sets the value of the lastOccurrenceDateString property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLastOccurrenceDateString(String value) {
        this.lastOccurrenceDateString = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the reminderClass property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReminderClass() {
        return reminderClass;
    }

    /**
     * Sets the value of the reminderClass property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReminderClass(String value) {
        this.reminderClass = value;
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
