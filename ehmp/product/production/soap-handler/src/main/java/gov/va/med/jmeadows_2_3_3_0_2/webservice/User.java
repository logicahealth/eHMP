
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for user complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="user">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="agency" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="bseToken" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="cardId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dmisId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dob" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dutyPhone" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="email" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encryptedAvCode" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encryptedFederatedUid" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="gender" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="hostSite" type="{http://webservice.vds.URL       /}site" minOccurs="0"/>
 *         &lt;element name="janusGUIConfig" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="janusPermissions" type="{http://webservice.vds.URL       /}janusPermission" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="NPI" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="pager" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerClass" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerFlag" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="providerIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sigClass" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="userId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="userIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "user", namespace = "http://webservice.vds.URL       /", propOrder = {
    "agency",
    "bseToken",
    "cardId",
    "dmisId",
    "dob",
    "dutyPhone",
    "email",
    "encryptedAvCode",
    "encryptedFederatedUid",
    "gender",
    "hostSite",
    "janusGUIConfig",
    "janusPermissions",
    "npi",
    "name",
    "pager",
    "providerClass",
    "providerFlag",
    "providerIen",
    "sigClass",
    "userId",
    "userIen"
})
public class User {

    protected String agency;
    protected String bseToken;
    protected String cardId;
    protected String dmisId;
    protected String dob;
    protected String dutyPhone;
    protected String email;
    protected String encryptedAvCode;
    protected String encryptedFederatedUid;
    protected String gender;
    protected Site hostSite;
    protected String janusGUIConfig;
    @XmlElement(nillable = true)
    protected List<JanusPermission> janusPermissions;
    @XmlElement(name = "NPI")
    protected String npi;
    protected String name;
    protected String pager;
    protected String providerClass;
    protected String providerFlag;
    protected String providerIen;
    protected String sigClass;
    protected String userId;
    protected String userIen;

    /**
     * Gets the value of the agency property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAgency() {
        return agency;
    }

    /**
     * Sets the value of the agency property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAgency(String value) {
        this.agency = value;
    }

    /**
     * Gets the value of the bseToken property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBseToken() {
        return bseToken;
    }

    /**
     * Sets the value of the bseToken property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBseToken(String value) {
        this.bseToken = value;
    }

    /**
     * Gets the value of the cardId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCardId() {
        return cardId;
    }

    /**
     * Sets the value of the cardId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCardId(String value) {
        this.cardId = value;
    }

    /**
     * Gets the value of the dmisId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDmisId() {
        return dmisId;
    }

    /**
     * Sets the value of the dmisId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDmisId(String value) {
        this.dmisId = value;
    }

    /**
     * Gets the value of the dob property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDob() {
        return dob;
    }

    /**
     * Sets the value of the dob property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDob(String value) {
        this.dob = value;
    }

    /**
     * Gets the value of the dutyPhone property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDutyPhone() {
        return dutyPhone;
    }

    /**
     * Sets the value of the dutyPhone property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDutyPhone(String value) {
        this.dutyPhone = value;
    }

    /**
     * Gets the value of the email property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the value of the email property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEmail(String value) {
        this.email = value;
    }

    /**
     * Gets the value of the encryptedAvCode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncryptedAvCode() {
        return encryptedAvCode;
    }

    /**
     * Sets the value of the encryptedAvCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncryptedAvCode(String value) {
        this.encryptedAvCode = value;
    }

    /**
     * Gets the value of the encryptedFederatedUid property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncryptedFederatedUid() {
        return encryptedFederatedUid;
    }

    /**
     * Sets the value of the encryptedFederatedUid property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncryptedFederatedUid(String value) {
        this.encryptedFederatedUid = value;
    }

    /**
     * Gets the value of the gender property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGender() {
        return gender;
    }

    /**
     * Sets the value of the gender property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGender(String value) {
        this.gender = value;
    }

    /**
     * Gets the value of the hostSite property.
     * 
     * @return
     *     possible object is
     *     {@link Site }
     *     
     */
    public Site getHostSite() {
        return hostSite;
    }

    /**
     * Sets the value of the hostSite property.
     * 
     * @param value
     *     allowed object is
     *     {@link Site }
     *     
     */
    public void setHostSite(Site value) {
        this.hostSite = value;
    }

    /**
     * Gets the value of the janusGUIConfig property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJanusGUIConfig() {
        return janusGUIConfig;
    }

    /**
     * Sets the value of the janusGUIConfig property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJanusGUIConfig(String value) {
        this.janusGUIConfig = value;
    }

    /**
     * Gets the value of the janusPermissions property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the janusPermissions property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getJanusPermissions().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link JanusPermission }
     * 
     * 
     */
    public List<JanusPermission> getJanusPermissions() {
        if (janusPermissions == null) {
            janusPermissions = new ArrayList<JanusPermission>();
        }
        return this.janusPermissions;
    }

    /**
     * Gets the value of the npi property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNPI() {
        return npi;
    }

    /**
     * Sets the value of the npi property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNPI(String value) {
        this.npi = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the pager property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPager() {
        return pager;
    }

    /**
     * Sets the value of the pager property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPager(String value) {
        this.pager = value;
    }

    /**
     * Gets the value of the providerClass property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderClass() {
        return providerClass;
    }

    /**
     * Sets the value of the providerClass property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderClass(String value) {
        this.providerClass = value;
    }

    /**
     * Gets the value of the providerFlag property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderFlag() {
        return providerFlag;
    }

    /**
     * Sets the value of the providerFlag property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderFlag(String value) {
        this.providerFlag = value;
    }

    /**
     * Gets the value of the providerIen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProviderIen() {
        return providerIen;
    }

    /**
     * Sets the value of the providerIen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProviderIen(String value) {
        this.providerIen = value;
    }

    /**
     * Gets the value of the sigClass property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSigClass() {
        return sigClass;
    }

    /**
     * Sets the value of the sigClass property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSigClass(String value) {
        this.sigClass = value;
    }

    /**
     * Gets the value of the userId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserId() {
        return userId;
    }

    /**
     * Sets the value of the userId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserId(String value) {
        this.userId = value;
    }

    /**
     * Gets the value of the userIen property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserIen() {
        return userIen;
    }

    /**
     * Sets the value of the userIen property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserIen(String value) {
        this.userIen = value;
    }

}
