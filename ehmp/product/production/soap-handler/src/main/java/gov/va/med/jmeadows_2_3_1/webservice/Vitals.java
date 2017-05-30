
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
 * <p>Java class for vitals complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="vitals">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.URL       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="comments" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dateTimeTaken" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="qualifiers" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="rate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="resultComments" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="units" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="unitsCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="vitalModifiers" type="{http://webservice.vds.URL       /}vitalModifier" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="vitalType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="vitalsIEN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "vitals", namespace = "http://webservice.vds.URL       /", propOrder = {
    "comments",
    "dateTimeTaken",
    "qualifiers",
    "rate",
    "resultComments",
    "units",
    "unitsCode",
    "vitalModifiers",
    "vitalType",
    "vitalsIEN"
})
public class Vitals
    extends DataBean
{

    protected String comments;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar dateTimeTaken;
    protected String qualifiers;
    protected String rate;
    protected String resultComments;
    protected String units;
    protected String unitsCode;
    @XmlElement(nillable = true)
    protected List<VitalModifier> vitalModifiers;
    protected String vitalType;
    protected String vitalsIEN;

    /**
     * Gets the value of the comments property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getComments() {
        return comments;
    }

    /**
     * Sets the value of the comments property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setComments(String value) {
        this.comments = value;
    }

    /**
     * Gets the value of the dateTimeTaken property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getDateTimeTaken() {
        return dateTimeTaken;
    }

    /**
     * Sets the value of the dateTimeTaken property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setDateTimeTaken(XMLGregorianCalendar value) {
        this.dateTimeTaken = value;
    }

    /**
     * Gets the value of the qualifiers property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getQualifiers() {
        return qualifiers;
    }

    /**
     * Sets the value of the qualifiers property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setQualifiers(String value) {
        this.qualifiers = value;
    }

    /**
     * Gets the value of the rate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRate() {
        return rate;
    }

    /**
     * Sets the value of the rate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRate(String value) {
        this.rate = value;
    }

    /**
     * Gets the value of the resultComments property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getResultComments() {
        return resultComments;
    }

    /**
     * Sets the value of the resultComments property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setResultComments(String value) {
        this.resultComments = value;
    }

    /**
     * Gets the value of the units property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUnits() {
        return units;
    }

    /**
     * Sets the value of the units property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUnits(String value) {
        this.units = value;
    }

    /**
     * Gets the value of the unitsCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUnitsCode() {
        return unitsCode;
    }

    /**
     * Sets the value of the unitsCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUnitsCode(String value) {
        this.unitsCode = value;
    }

    /**
     * Gets the value of the vitalModifiers property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the vitalModifiers property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getVitalModifiers().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link VitalModifier }
     * 
     * 
     */
    public List<VitalModifier> getVitalModifiers() {
        if (vitalModifiers == null) {
            vitalModifiers = new ArrayList<VitalModifier>();
        }
        return this.vitalModifiers;
    }

    /**
     * Gets the value of the vitalType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVitalType() {
        return vitalType;
    }

    /**
     * Sets the value of the vitalType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVitalType(String value) {
        this.vitalType = value;
    }

    /**
     * Gets the value of the vitalsIEN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVitalsIEN() {
        return vitalsIEN;
    }

    /**
     * Sets the value of the vitalsIEN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVitalsIEN(String value) {
        this.vitalsIEN = value;
    }

}
