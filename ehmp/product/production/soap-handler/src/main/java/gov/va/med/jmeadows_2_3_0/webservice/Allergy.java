
package gov.va.med.jmeadows_2_3_0.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for allergy complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="allergy">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.va.gov/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="allergyId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="allergyName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="drugClasses" type="{http://webservice.vds.med.va.gov/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="drugIngredients" type="{http://webservice.vds.med.va.gov/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="reactions" type="{http://webservice.vds.med.va.gov/}code" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="severity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "allergy", namespace = "http://webservice.vds.med.va.gov/", propOrder = {
    "allergyId",
    "allergyName",
    "comment",
    "drugClasses",
    "drugIngredients",
    "reactions",
    "severity"
})
public class Allergy
    extends DataBean
{

    protected String allergyId;
    protected String allergyName;
    protected String comment;
    @XmlElement(nillable = true)
    protected List<Code> drugClasses;
    @XmlElement(nillable = true)
    protected List<Code> drugIngredients;
    @XmlElement(nillable = true)
    protected List<Code> reactions;
    protected String severity;

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

}
