
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for updateUserSubjectDN complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="updateUserSubjectDN">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="authUserInfoQuery" type="{http://webservice.jmeadows.med.DNS   /}authUserInfo" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "updateUserSubjectDN", propOrder = {
    "authUserInfoQuery"
})
public class UpdateUserSubjectDN {

    protected AuthUserInfo authUserInfoQuery;

    /**
     * Gets the value of the authUserInfoQuery property.
     * 
     * @return
     *     possible object is
     *     {@link AuthUserInfo }
     *     
     */
    public AuthUserInfo getAuthUserInfoQuery() {
        return authUserInfoQuery;
    }

    /**
     * Sets the value of the authUserInfoQuery property.
     * 
     * @param value
     *     allowed object is
     *     {@link AuthUserInfo }
     *     
     */
    public void setAuthUserInfoQuery(AuthUserInfo value) {
        this.authUserInfoQuery = value;
    }

}
