
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for labResult complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="labResult">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.URL       /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="accession" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="accessionComment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="collectedDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="comment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="facilityName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="interpretation" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderComment" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="orderDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="orderId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabCity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabPostalCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabStateProvince" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabStreet1" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabStreet2" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="performingLabStreet3" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="printName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="provider" type="{http://webservice.vds.URL       /}provider" minOccurs="0"/>
 *         &lt;element name="quantity" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="referenceRange" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="requestingLocation" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="result" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="resultDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="resultStatus" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sensitive" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="specimen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="stationNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="testId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="testName" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="testType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="units" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="verifiedBy" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "labResult", namespace = "http://webservice.vds.URL       /", propOrder = {
    "accession",
    "accessionComment",
    "collectedDate",
    "comment",
    "facilityName",
    "interpretation",
    "orderComment",
    "orderDate",
    "orderId",
    "performingLabCity",
    "performingLabName",
    "performingLabPhone",
    "performingLabPostalCode",
    "performingLabStateProvince",
    "performingLabStreet1",
    "performingLabStreet2",
    "performingLabStreet3",
    "printName",
    "provider",
    "quantity",
    "referenceRange",
    "requestingLocation",
    "result",
    "resultDate",
    "resultStatus",
    "sensitive",
    "specimen",
    "stationNumber",
    "testId",
    "testName",
    "testType",
    "units",
    "verifiedBy"
})
public class LabResult
    extends DataBean
{

    protected String accession;
    protected String accessionComment;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar collectedDate;
    protected String comment;
    protected String facilityName;
    protected String interpretation;
    protected String orderComment;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar orderDate;
    protected String orderId;
    protected String performingLabCity;
    protected String performingLabName;
    protected String performingLabPhone;
    protected String performingLabPostalCode;
    protected String performingLabStateProvince;
    protected String performingLabStreet1;
    protected String performingLabStreet2;
    protected String performingLabStreet3;
    protected String printName;
    protected Provider provider;
    protected String quantity;
    protected String referenceRange;
    protected String requestingLocation;
    protected String result;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar resultDate;
    protected String resultStatus;
    protected boolean sensitive;
    protected String specimen;
    protected String stationNumber;
    protected String testId;
    protected String testName;
    protected String testType;
    protected String units;
    protected String verifiedBy;

    /**
     * Gets the value of the accession property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAccession() {
        return accession;
    }

    /**
     * Sets the value of the accession property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAccession(String value) {
        this.accession = value;
    }

    /**
     * Gets the value of the accessionComment property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAccessionComment() {
        return accessionComment;
    }

    /**
     * Sets the value of the accessionComment property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAccessionComment(String value) {
        this.accessionComment = value;
    }

    /**
     * Gets the value of the collectedDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getCollectedDate() {
        return collectedDate;
    }

    /**
     * Sets the value of the collectedDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setCollectedDate(XMLGregorianCalendar value) {
        this.collectedDate = value;
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
     * Gets the value of the facilityName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFacilityName() {
        return facilityName;
    }

    /**
     * Sets the value of the facilityName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFacilityName(String value) {
        this.facilityName = value;
    }

    /**
     * Gets the value of the interpretation property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInterpretation() {
        return interpretation;
    }

    /**
     * Sets the value of the interpretation property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInterpretation(String value) {
        this.interpretation = value;
    }

    /**
     * Gets the value of the orderComment property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOrderComment() {
        return orderComment;
    }

    /**
     * Sets the value of the orderComment property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOrderComment(String value) {
        this.orderComment = value;
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
     * Gets the value of the performingLabCity property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabCity() {
        return performingLabCity;
    }

    /**
     * Sets the value of the performingLabCity property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabCity(String value) {
        this.performingLabCity = value;
    }

    /**
     * Gets the value of the performingLabName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabName() {
        return performingLabName;
    }

    /**
     * Sets the value of the performingLabName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabName(String value) {
        this.performingLabName = value;
    }

    /**
     * Gets the value of the performingLabPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabPhone() {
        return performingLabPhone;
    }

    /**
     * Sets the value of the performingLabPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabPhone(String value) {
        this.performingLabPhone = value;
    }

    /**
     * Gets the value of the performingLabPostalCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabPostalCode() {
        return performingLabPostalCode;
    }

    /**
     * Sets the value of the performingLabPostalCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabPostalCode(String value) {
        this.performingLabPostalCode = value;
    }

    /**
     * Gets the value of the performingLabStateProvince property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabStateProvince() {
        return performingLabStateProvince;
    }

    /**
     * Sets the value of the performingLabStateProvince property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabStateProvince(String value) {
        this.performingLabStateProvince = value;
    }

    /**
     * Gets the value of the performingLabStreet1 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabStreet1() {
        return performingLabStreet1;
    }

    /**
     * Sets the value of the performingLabStreet1 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabStreet1(String value) {
        this.performingLabStreet1 = value;
    }

    /**
     * Gets the value of the performingLabStreet2 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabStreet2() {
        return performingLabStreet2;
    }

    /**
     * Sets the value of the performingLabStreet2 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabStreet2(String value) {
        this.performingLabStreet2 = value;
    }

    /**
     * Gets the value of the performingLabStreet3 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPerformingLabStreet3() {
        return performingLabStreet3;
    }

    /**
     * Sets the value of the performingLabStreet3 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPerformingLabStreet3(String value) {
        this.performingLabStreet3 = value;
    }

    /**
     * Gets the value of the printName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPrintName() {
        return printName;
    }

    /**
     * Sets the value of the printName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPrintName(String value) {
        this.printName = value;
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
     * Gets the value of the referenceRange property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReferenceRange() {
        return referenceRange;
    }

    /**
     * Sets the value of the referenceRange property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReferenceRange(String value) {
        this.referenceRange = value;
    }

    /**
     * Gets the value of the requestingLocation property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRequestingLocation() {
        return requestingLocation;
    }

    /**
     * Sets the value of the requestingLocation property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRequestingLocation(String value) {
        this.requestingLocation = value;
    }

    /**
     * Gets the value of the result property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getResult() {
        return result;
    }

    /**
     * Sets the value of the result property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setResult(String value) {
        this.result = value;
    }

    /**
     * Gets the value of the resultDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getResultDate() {
        return resultDate;
    }

    /**
     * Sets the value of the resultDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setResultDate(XMLGregorianCalendar value) {
        this.resultDate = value;
    }

    /**
     * Gets the value of the resultStatus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getResultStatus() {
        return resultStatus;
    }

    /**
     * Sets the value of the resultStatus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setResultStatus(String value) {
        this.resultStatus = value;
    }

    /**
     * Gets the value of the sensitive property.
     * 
     */
    public boolean isSensitive() {
        return sensitive;
    }

    /**
     * Sets the value of the sensitive property.
     * 
     */
    public void setSensitive(boolean value) {
        this.sensitive = value;
    }

    /**
     * Gets the value of the specimen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSpecimen() {
        return specimen;
    }

    /**
     * Sets the value of the specimen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSpecimen(String value) {
        this.specimen = value;
    }

    /**
     * Gets the value of the stationNumber property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStationNumber() {
        return stationNumber;
    }

    /**
     * Sets the value of the stationNumber property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStationNumber(String value) {
        this.stationNumber = value;
    }

    /**
     * Gets the value of the testId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTestId() {
        return testId;
    }

    /**
     * Sets the value of the testId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTestId(String value) {
        this.testId = value;
    }

    /**
     * Gets the value of the testName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTestName() {
        return testName;
    }

    /**
     * Sets the value of the testName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTestName(String value) {
        this.testName = value;
    }

    /**
     * Gets the value of the testType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTestType() {
        return testType;
    }

    /**
     * Sets the value of the testType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTestType(String value) {
        this.testType = value;
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
     * Gets the value of the verifiedBy property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVerifiedBy() {
        return verifiedBy;
    }

    /**
     * Sets the value of the verifiedBy property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVerifiedBy(String value) {
        this.verifiedBy = value;
    }

}
