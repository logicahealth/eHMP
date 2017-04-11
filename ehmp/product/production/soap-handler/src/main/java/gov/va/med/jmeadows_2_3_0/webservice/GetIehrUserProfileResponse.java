
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for getIehrUserProfileResponse complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="getIehrUserProfileResponse">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="return" type="{http://webservice.jmeadows.med.DNS   /}iehrUserProfile" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getIehrUserProfileResponse", propOrder = {
    "_return"
})
public class GetIehrUserProfileResponse {

    @XmlElement(name = "return")
    protected IehrUserProfile _return;

    /**
     * Gets the value of the return property.
     * 
     * @return
     *     possible object is
     *     {@link IehrUserProfile }
     *     
     */
    public IehrUserProfile getReturn() {
        return _return;
    }

    /**
     * Sets the value of the return property.
     * 
     * @param value
     *     allowed object is
     *     {@link IehrUserProfile }
     *     
     */
    public void setReturn(IehrUserProfile value) {
        this._return = value;
    }

}
