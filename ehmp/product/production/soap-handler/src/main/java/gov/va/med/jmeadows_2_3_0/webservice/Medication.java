
package gov.va.med.jmeadows_2_3_0.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for medication complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="medication">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.domain.ext/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="active" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="currentProvider" type="{http://webservice.vds.domain.ext/}provider" minOccurs="0"/>
 *         &lt;element name="daysSupply" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="drugName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="fillOrderDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="lastDispensingPharmacy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="medId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="medType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderIEN" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderingProvider" type="{http://webservice.vds.domain.ext/}provider" minOccurs="0"/>
 *         &lt;element name="pharmacyId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="prescriptionFills" type="{http://webservice.vds.domain.ext/}prescriptionFill" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="quantity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="RXNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="refills" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sigCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="stopDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "medication", namespace = "http://webservice.vds.domain.ext/", propOrder = {
    "active",
    "comment",
    "currentProvider",
    "daysSupply",
    "drugName",
    "fillOrderDate",
    "lastDispensingPharmacy",
    "medId",
    "medType",
    "orderIEN",
    "orderingProvider",
    "pharmacyId",
    "prescriptionFills",
    "quantity",
    "rxNumber",
    "refills",
    "sigCode",
    "stopDate"
})
public class Medication
    extends DataBean
{

    protected String active;
    protected String comment;
    protected Provider currentProvider;
    protected String daysSupply;
    protected String drugName;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar fillOrderDate;
    protected String lastDispensingPharmacy;
    protected String medId;
    protected String medType;
    protected String orderIEN;
    protected Provider orderingProvider;
    protected String pharmacyId;
    @XmlElement(nillable = true)
    protected List<PrescriptionFill> prescriptionFills;
    protected String quantity;
    @XmlElement(name = "RXNumber")
    protected String rxNumber;
    protected String refills;
    protected String sigCode;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar stopDate;

    /**
     * Gets the value of the active property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getActive() {
        return active;
    }

    /**
     * Sets the value of the active property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setActive(String value) {
        this.active = value;
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
     * Gets the value of the currentProvider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getCurrentProvider() {
        return currentProvider;
    }

    /**
     * Sets the value of the currentProvider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setCurrentProvider(Provider value) {
        this.currentProvider = value;
    }

    /**
     * Gets the value of the daysSupply property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDaysSupply() {
        return daysSupply;
    }

    /**
     * Sets the value of the daysSupply property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDaysSupply(String value) {
        this.daysSupply = value;
    }

    /**
     * Gets the value of the drugName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDrugName() {
        return drugName;
    }

    /**
     * Sets the value of the drugName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDrugName(String value) {
        this.drugName = value;
    }

    /**
     * Gets the value of the fillOrderDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getFillOrderDate() {
        return fillOrderDate;
    }

    /**
     * Sets the value of the fillOrderDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setFillOrderDate(XMLGregorianCalendar value) {
        this.fillOrderDate = value;
    }

    /**
     * Gets the value of the lastDispensingPharmacy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLastDispensingPharmacy() {
        return lastDispensingPharmacy;
    }

    /**
     * Sets the value of the lastDispensingPharmacy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLastDispensingPharmacy(String value) {
        this.lastDispensingPharmacy = value;
    }

    /**
     * Gets the value of the medId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMedId() {
        return medId;
    }

    /**
     * Sets the value of the medId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMedId(String value) {
        this.medId = value;
    }

    /**
     * Gets the value of the medType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMedType() {
        return medType;
    }

    /**
     * Sets the value of the medType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMedType(String value) {
        this.medType = value;
    }

    /**
     * Gets the value of the orderIEN property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOrderIEN() {
        return orderIEN;
    }

    /**
     * Sets the value of the orderIEN property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOrderIEN(String value) {
        this.orderIEN = value;
    }

    /**
     * Gets the value of the orderingProvider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getOrderingProvider() {
        return orderingProvider;
    }

    /**
     * Sets the value of the orderingProvider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setOrderingProvider(Provider value) {
        this.orderingProvider = value;
    }

    /**
     * Gets the value of the pharmacyId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPharmacyId() {
        return pharmacyId;
    }

    /**
     * Sets the value of the pharmacyId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPharmacyId(String value) {
        this.pharmacyId = value;
    }

    /**
     * Gets the value of the prescriptionFills property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the prescriptionFills property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getPrescriptionFills().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link PrescriptionFill }
     * 
     * 
     */
    public List<PrescriptionFill> getPrescriptionFills() {
        if (prescriptionFills == null) {
            prescriptionFills = new ArrayList<PrescriptionFill>();
        }
        return this.prescriptionFills;
    }

    /**
     * Gets the value of the quantity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getQuantity() {
        return quantity;
    }

    /**
     * Sets the value of the quantity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setQuantity(String value) {
        this.quantity = value;
    }

    /**
     * Gets the value of the rxNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRXNumber() {
        return rxNumber;
    }

    /**
     * Sets the value of the rxNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRXNumber(String value) {
        this.rxNumber = value;
    }

    /**
     * Gets the value of the refills property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRefills() {
        return refills;
    }

    /**
     * Sets the value of the refills property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRefills(String value) {
        this.refills = value;
    }

    /**
     * Gets the value of the sigCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSigCode() {
        return sigCode;
    }

    /**
     * Sets the value of the sigCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSigCode(String value) {
        this.sigCode = value;
    }

    /**
     * Gets the value of the stopDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getStopDate() {
        return stopDate;
    }

    /**
     * Sets the value of the stopDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setStopDate(XMLGregorianCalendar value) {
        this.stopDate = value;
    }

}
