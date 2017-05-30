
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for setIehrUserProfile complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="setIehrUserProfile">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="iehrUserProfile" type="{http://webservice.jmeadows.URL       /}iehrUserProfile" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "setIehrUserProfile", propOrder = {
    "iehrUserProfile"
})
public class SetIehrUserProfile {

    protected IehrUserProfile iehrUserProfile;

    /**
     * Gets the value of the iehrUserProfile property.
     * 
     * @return
     *     possible object is
     *     {@link IehrUserProfile }
     *     
     */
    public IehrUserProfile getIehrUserProfile() {
        return iehrUserProfile;
    }

    /**
     * Sets the value of the iehrUserProfile property.
     * 
     * @param value
     *     allowed object is
     *     {@link IehrUserProfile }
     *     
     */
    public void setIehrUserProfile(IehrUserProfile value) {
        this.iehrUserProfile = value;
    }

}
