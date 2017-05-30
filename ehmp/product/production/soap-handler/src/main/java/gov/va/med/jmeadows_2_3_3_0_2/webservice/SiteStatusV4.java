
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for siteStatusV4 complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="siteStatusV4">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="expectedCount" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="partner" type="{http://webservice.bhie.URL       /}partnerV4" minOccurs="0"/>
 *         &lt;element name="partnerStatus" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="receivedCount" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "siteStatusV4", namespace = "http://webservice.bhie.URL       /", propOrder = {
    "expectedCount",
    "partner",
    "partnerStatus",
    "receivedCount"
})
public class SiteStatusV4 {

    protected int expectedCount;
    protected PartnerV4 partner;
    protected String partnerStatus;
    protected int receivedCount;

    /**
     * Gets the value of the expectedCount property.
     * 
     */
    public int getExpectedCount() {
        return expectedCount;
    }

    /**
     * Sets the value of the expectedCount property.
     * 
     */
    public void setExpectedCount(int value) {
        this.expectedCount = value;
    }

    /**
     * Gets the value of the partner property.
     * 
     * @return
     *     possible object is
     *     {@link PartnerV4 }
     *     
     */
    public PartnerV4 getPartner() {
        return partner;
    }

    /**
     * Sets the value of the partner property.
     * 
     * @param value
     *     allowed object is
     *     {@link PartnerV4 }
     *     
     */
    public void setPartner(PartnerV4 value) {
        this.partner = value;
    }

    /**
     * Gets the value of the partnerStatus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPartnerStatus() {
        return partnerStatus;
    }

    /**
     * Sets the value of the partnerStatus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPartnerStatus(String value) {
        this.partnerStatus = value;
    }

    /**
     * Gets the value of the receivedCount property.
     * 
     */
    public int getReceivedCount() {
        return receivedCount;
    }

    /**
     * Sets the value of the receivedCount property.
     * 
     */
    public void setReceivedCount(int value) {
        this.receivedCount = value;
    }

}
