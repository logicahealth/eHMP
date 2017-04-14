
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for setJanusGUIConfig complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="setJanusGUIConfig">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="queryBean" type="{http://webservice.jmeadows.med.va.gov/}jMeadowsQuery" minOccurs="0"/>
 *         &lt;element name="cfg" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "setJanusGUIConfig", propOrder = {
    "queryBean",
    "cfg"
})
public class SetJanusGUIConfig {

    protected JMeadowsQuery queryBean;
    protected String cfg;

    /**
     * Gets the value of the queryBean property.
     * 
     * @return
     *     possible object is
     *     {@link JMeadowsQuery }
     *     
     */
    public JMeadowsQuery getQueryBean() {
        return queryBean;
    }

    /**
     * Sets the value of the queryBean property.
     * 
     * @param value
     *     allowed object is
     *     {@link JMeadowsQuery }
     *     
     */
    public void setQueryBean(JMeadowsQuery value) {
        this.queryBean = value;
    }

    /**
     * Gets the value of the cfg property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCfg() {
        return cfg;
    }

    /**
     * Sets the value of the cfg property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCfg(String value) {
        this.cfg = value;
    }

}
