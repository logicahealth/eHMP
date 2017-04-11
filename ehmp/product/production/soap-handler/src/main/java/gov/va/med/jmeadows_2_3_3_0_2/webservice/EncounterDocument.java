
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for encounterDocument complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="encounterDocument">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="content" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="id" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="localTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="nationalTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="vuid" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "encounterDocument", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "content",
    "id",
    "localTitle",
    "nationalTitle",
    "vuid"
})
public class EncounterDocument
    extends DataBean
{

    protected String content;
    protected String id;
    protected String localTitle;
    protected String nationalTitle;
    protected String vuid;

    /**
     * Gets the value of the content property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getContent() {
        return content;
    }

    /**
     * Sets the value of the content property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setContent(String value) {
        this.content = value;
    }

    /**
     * Gets the value of the id property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the value of the id property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setId(String value) {
        this.id = value;
    }

    /**
     * Gets the value of the localTitle property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLocalTitle() {
        return localTitle;
    }

    /**
     * Sets the value of the localTitle property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLocalTitle(String value) {
        this.localTitle = value;
    }

    /**
     * Gets the value of the nationalTitle property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNationalTitle() {
        return nationalTitle;
    }

    /**
     * Sets the value of the nationalTitle property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNationalTitle(String value) {
        this.nationalTitle = value;
    }

    /**
     * Gets the value of the vuid property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVuid() {
        return vuid;
    }

    /**
     * Sets the value of the vuid property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVuid(String value) {
        this.vuid = value;
    }

}
