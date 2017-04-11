
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
 * <p>Java class for medication complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="medication">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="active" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="childResistant" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="currentProvider" type="{http://webservice.vds.med.DNS   /}provider" minOccurs="0"/>
 *         &lt;element name="daysSupply" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="drugName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="fillExpirationDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="lastDispensingPharmacy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="lastFilledDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="medId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="medType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="orderId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderingProvider" type="{http://webservice.vds.med.DNS   /}provider" minOccurs="0"/>
 *         &lt;element name="pharmacyId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="prescriptionFills" type="{http://webservice.vds.med.DNS   /}prescriptionFill" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="quantity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="refills" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="refillsRemaining" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="rxNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sigCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="startDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="stopDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="units" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "medication", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "active",
    "childResistant",
    "comment",
    "currentProvider",
    "daysSupply",
    "drugName",
    "fillExpirationDate",
    "lastDispensingPharmacy",
    "lastFilledDate",
    "medId",
    "medType",
    "orderDate",
    "orderId",
    "orderingProvider",
    "pharmacyId",
    "prescriptionFills",
    "quantity",
    "refills",
    "refillsRemaining",
    "rxNumber",
    "sigCode",
    "startDate",
    "status",
    "stopDate",
    "units"
})
public class Medication
    extends DataBean
{

    protected String active;
    protected boolean childResistant;
    protected String comment;
    protected Provider currentProvider;
    protected String daysSupply;
    protected String drugName;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar fillExpirationDate;
    protected String lastDispensingPharmacy;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar lastFilledDate;
    protected String medId;
    protected String medType;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar orderDate;
    protected String orderId;
    protected Provider orderingProvider;
    protected String pharmacyId;
    @XmlElement(nillable = true)
    protected List<PrescriptionFill> prescriptionFills;
    protected String quantity;
    protected String refills;
    protected String refillsRemaining;
    protected String rxNumber;
    protected String sigCode;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar startDate;
    protected String status;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar stopDate;
    protected String units;

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
     * Gets the value of the childResistant property.
     * 
     */
    public boolean isChildResistant() {
        return childResistant;
    }

    /**
     * Sets the value of the childResistant property.
     * 
     */
    public void setChildResistant(boolean value) {
        this.childResistant = value;
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
     * Gets the value of the fillExpirationDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getFillExpirationDate() {
        return fillExpirationDate;
    }

    /**
     * Sets the value of the fillExpirationDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setFillExpirationDate(XMLGregorianCalendar value) {
        this.fillExpirationDate = value;
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
     * Gets the value of the lastFilledDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getLastFilledDate() {
        return lastFilledDate;
    }

    /**
     * Sets the value of the lastFilledDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setLastFilledDate(XMLGregorianCalendar value) {
        this.lastFilledDate = value;
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
     * Gets the value of the orderDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getOrderDate() {
        return orderDate;
    }

    /**
     * Sets the value of the orderDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setOrderDate(XMLGregorianCalendar value) {
        this.orderDate = value;
    }

    /**
     * Gets the value of the orderId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOrderId() {
        return orderId;
    }

    /**
     * Sets the value of the orderId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOrderId(String value) {
        this.orderId = value;
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
     * Gets the value of the refillsRemaining property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRefillsRemaining() {
        return refillsRemaining;
    }

    /**
     * Sets the value of the refillsRemaining property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRefillsRemaining(String value) {
        this.refillsRemaining = value;
    }

    /**
     * Gets the value of the rxNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRxNumber() {
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
    public void setRxNumber(String value) {
        this.rxNumber = value;
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
     * Gets the value of the startDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getStartDate() {
        return startDate;
    }

    /**
     * Sets the value of the startDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setStartDate(XMLGregorianCalendar value) {
        this.startDate = value;
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

}
