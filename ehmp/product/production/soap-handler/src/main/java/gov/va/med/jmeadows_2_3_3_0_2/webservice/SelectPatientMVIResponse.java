
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for selectPatientMVIResponse complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="selectPatientMVIResponse">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="return" type="{http://webservice.jmeadows.med.DNS   /}responsePatientSelect" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "selectPatientMVIResponse", propOrder = {
    "_return"
})
public class SelectPatientMVIResponse {

    @XmlElement(name = "return")
    protected ResponsePatientSelect _return;

    /**
     * Gets the value of the return property.
     * 
     * @return
     *     possible object is
     *     {@link ResponsePatientSelect }
     *     
     */
    public ResponsePatientSelect getReturn() {
        return _return;
    }

    /**
     * Sets the value of the return property.
     * 
     * @param value
     *     allowed object is
     *     {@link ResponsePatientSelect }
     *     
     */
    public void setReturn(ResponsePatientSelect value) {
        this._return = value;
    }

}
