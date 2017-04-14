
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
 * <p>Java class for problemDetail complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="problemDetail">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.va.gov/}problem">
 *       &lt;sequence>
 *         &lt;element name="detailText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="notes" type="{http://webservice.vds.med.va.gov/}problemNote" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="recordedBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "problemDetail", namespace = "http://webservice.vds.med.va.gov/", propOrder = {
    "detailText",
    "enteredBy",
    "enteredDate",
    "notes",
    "recordedBy"
})
public class ProblemDetail
    extends Problem
{

    protected String detailText;
    protected String enteredBy;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar enteredDate;
    @XmlElement(nillable = true)
    protected List<ProblemNote> notes;
    protected String recordedBy;

    /**
     * Gets the value of the detailText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDetailText() {
        return detailText;
    }

    /**
     * Sets the value of the detailText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDetailText(String value) {
        this.detailText = value;
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
     * Gets the value of the enteredDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getEnteredDate() {
        return enteredDate;
    }

    /**
     * Sets the value of the enteredDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setEnteredDate(XMLGregorianCalendar value) {
        this.enteredDate = value;
    }

    /**
     * Gets the value of the notes property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the notes property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getNotes().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link ProblemNote }
     * 
     * 
     */
    public List<ProblemNote> getNotes() {
        if (notes == null) {
            notes = new ArrayList<ProblemNote>();
        }
        return this.notes;
    }

    /**
     * Gets the value of the recordedBy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRecordedBy() {
        return recordedBy;
    }

    /**
     * Sets the value of the recordedBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRecordedBy(String value) {
        this.recordedBy = value;
    }

}
