
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for problemNote complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="problemNote">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.URL       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="noteDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="noteEnteredBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "problemNote", namespace = "http://webservice.vds.URL       /", propOrder = {
    "noteDate",
    "noteEnteredBy",
    "noteText"
})
public class ProblemNote
    extends DataBean
{

    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar noteDate;
    protected String noteEnteredBy;
    protected String noteText;

    /**
     * Gets the value of the noteDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getNoteDate() {
        return noteDate;
    }

    /**
     * Sets the value of the noteDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setNoteDate(XMLGregorianCalendar value) {
        this.noteDate = value;
    }

    /**
     * Gets the value of the noteEnteredBy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteEnteredBy() {
        return noteEnteredBy;
    }

    /**
     * Sets the value of the noteEnteredBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteEnteredBy(String value) {
        this.noteEnteredBy = value;
    }

    /**
     * Gets the value of the noteText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteText() {
        return noteText;
    }

    /**
     * Sets the value of the noteText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteText(String value) {
        this.noteText = value;
    }

}
