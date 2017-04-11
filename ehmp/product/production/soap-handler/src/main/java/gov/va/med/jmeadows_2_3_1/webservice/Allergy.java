
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for allergy complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="allergy">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.domain.ext/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="allergyId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="allergyName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="comments" type="{http://webservice.vds.domain.ext/}comment" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="drugClasses" type="{http://webservice.vds.domain.ext/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="drugIngredients" type="{http://webservice.vds.domain.ext/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="enteredDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="historical" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="onsetDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="provider" type="{http://webservice.vds.domain.ext/}provider" minOccurs="0"/>
 *         &lt;element name="reactions" type="{http://webservice.vds.domain.ext/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="severity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="verified" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "allergy", namespace = "http://webservice.vds.domain.ext/", propOrder = {
    "allergyId",
    "allergyName",
    "comment",
    "comments",
    "drugClasses",
    "drugIngredients",
    "enteredDate",
    "historical",
    "onsetDate",
    "provider",
    "reactions",
    "severity",
    "verified"
})
public class Allergy
    extends DataBean
{

    protected String allergyId;
    protected String allergyName;
    protected String comment;
    @XmlElement(nillable = true)
    protected List<Comment> comments;
    @XmlElement(nillable = true)
    protected List<Code> drugClasses;
    @XmlElement(nillable = true)
    protected List<Code> drugIngredients;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar enteredDate;
    protected String historical;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar onsetDate;
    protected Provider provider;
    @XmlElement(nillable = true)
    protected List<Code> reactions;
    protected String severity;
    protected String verified;

    /**
     * Gets the value of the allergyId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAllergyId() {
        return allergyId;
    }

    /**
     * Sets the value of the allergyId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAllergyId(String value) {
        this.allergyId = value;
    }

    /**
     * Gets the value of the allergyName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAllergyName() {
        return allergyName;
    }

    /**
     * Sets the value of the allergyName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAllergyName(String value) {
        this.allergyName = value;
    }

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
     * Gets the value of the comments property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the comments property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getComments().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Comment }
     * 
     * 
     */
    public List<Comment> getComments() {
        if (comments == null) {
            comments = new ArrayList<Comment>();
        }
        return this.comments;
    }

    /**
     * Gets the value of the drugClasses property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the drugClasses property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDrugClasses().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getDrugClasses() {
        if (drugClasses == null) {
            drugClasses = new ArrayList<Code>();
        }
        return this.drugClasses;
    }

    /**
     * Gets the value of the drugIngredients property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the drugIngredients property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDrugIngredients().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getDrugIngredients() {
        if (drugIngredients == null) {
            drugIngredients = new ArrayList<Code>();
        }
        return this.drugIngredients;
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
     * Gets the value of the historical property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHistorical() {
        return historical;
    }

    /**
     * Sets the value of the historical property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHistorical(String value) {
        this.historical = value;
    }

    /**
     * Gets the value of the onsetDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getOnsetDate() {
        return onsetDate;
    }

    /**
     * Sets the value of the onsetDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setOnsetDate(XMLGregorianCalendar value) {
        this.onsetDate = value;
    }

    /**
     * Gets the value of the provider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getProvider() {
        return provider;
    }

    /**
     * Sets the value of the provider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setProvider(Provider value) {
        this.provider = value;
    }

    /**
     * Gets the value of the reactions property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the reactions property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getReactions().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Code }
     * 
     * 
     */
    public List<Code> getReactions() {
        if (reactions == null) {
            reactions = new ArrayList<Code>();
        }
        return this.reactions;
    }

    /**
     * Gets the value of the severity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSeverity() {
        return severity;
    }

    /**
     * Sets the value of the severity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSeverity(String value) {
        this.severity = value;
    }

    /**
     * Gets the value of the verified property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVerified() {
        return verified;
    }

    /**
     * Sets the value of the verified property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVerified(String value) {
        this.verified = value;
    }

}
