
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for questionnaireResponseComments complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="questionnaireResponseComments">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dateEntered" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="enteredBy" type="{http://webservice.vds.med.DNS   /}provider" minOccurs="0"/>
 *         &lt;element name="enteredDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="number" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sequence" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "questionnaireResponseComments", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "comment",
    "dateEntered",
    "enteredBy",
    "enteredDate",
    "number",
    "sequence"
})
public class QuestionnaireResponseComments {

    protected String comment;
    protected String dateEntered;
    protected Provider enteredBy;
    protected String enteredDate;
    protected String number;
    protected String sequence;

    /**
     * Gets the value of the comment property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getComment() {
        return comment;
    }

    /**
     * Sets the value of the comment property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setComment(String value) {
        this.comment = value;
    }

    /**
     * Gets the value of the dateEntered property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDateEntered() {
        return dateEntered;
    }

    /**
     * Sets the value of the dateEntered property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDateEntered(String value) {
        this.dateEntered = value;
    }

    /**
     * Gets the value of the enteredBy property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getEnteredBy() {
        return enteredBy;
    }

    /**
     * Sets the value of the enteredBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setEnteredBy(Provider value) {
        this.enteredBy = value;
    }

    /**
     * Gets the value of the enteredDate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEnteredDate() {
        return enteredDate;
    }

    /**
     * Sets the value of the enteredDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEnteredDate(String value) {
        this.enteredDate = value;
    }

    /**
     * Gets the value of the number property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNumber() {
        return number;
    }

    /**
     * Sets the value of the number property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNumber(String value) {
        this.number = value;
    }

    /**
     * Gets the value of the sequence property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSequence() {
        return sequence;
    }

    /**
     * Sets the value of the sequence property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSequence(String value) {
        this.sequence = value;
    }

}
