
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for responsePatientSelect complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="responsePatientSelect">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="allowVAAccess" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="errorMsg" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="externalIDs" type="{http://webservice.jmeadows.med.va.gov/}externalID" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="patient" type="{http://webservice.vds.med.va.gov/}patient" minOccurs="0"/>
 *         &lt;element name="success" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *         &lt;element name="VARestricted" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "responsePatientSelect", propOrder = {
    "allowVAAccess",
    "errorMsg",
    "externalIDs",
    "patient",
    "success",
    "vaRestricted"
})
public class ResponsePatientSelect {

    protected boolean allowVAAccess;
    protected String errorMsg;
    @XmlElement(nillable = true)
    protected List<ExternalID> externalIDs;
    protected Patient patient;
    protected boolean success;
    @XmlElement(name = "VARestricted")
    protected boolean vaRestricted;

    /**
     * Gets the value of the allowVAAccess property.
     * 
     */
    public boolean isAllowVAAccess() {
        return allowVAAccess;
    }

    /**
     * Sets the value of the allowVAAccess property.
     * 
     */
    public void setAllowVAAccess(boolean value) {
        this.allowVAAccess = value;
    }

    /**
     * Gets the value of the errorMsg property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getErrorMsg() {
        return errorMsg;
    }

    /**
     * Sets the value of the errorMsg property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setErrorMsg(String value) {
        this.errorMsg = value;
    }

    /**
     * Gets the value of the externalIDs property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the externalIDs property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getExternalIDs().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link ExternalID }
     * 
     * 
     */
    public List<ExternalID> getExternalIDs() {
        if (externalIDs == null) {
            externalIDs = new ArrayList<ExternalID>();
        }
        return this.externalIDs;
    }

    /**
     * Gets the value of the patient property.
     * 
     * @return
     *     possible object is
     *     {@link Patient }
     *     
     */
    public Patient getPatient() {
        return patient;
    }

    /**
     * Sets the value of the patient property.
     * 
     * @param value
     *     allowed object is
     *     {@link Patient }
     *     
     */
    public void setPatient(Patient value) {
        this.patient = value;
    }

    /**
     * Gets the value of the success property.
     * 
     */
    public boolean isSuccess() {
        return success;
    }

    /**
     * Sets the value of the success property.
     * 
     */
    public void setSuccess(boolean value) {
        this.success = value;
    }

    /**
     * Gets the value of the vaRestricted property.
     * 
     */
    public boolean isVARestricted() {
        return vaRestricted;
    }

    /**
     * Sets the value of the vaRestricted property.
     * 
     */
    public void setVARestricted(boolean value) {
        this.vaRestricted = value;
    }

}
