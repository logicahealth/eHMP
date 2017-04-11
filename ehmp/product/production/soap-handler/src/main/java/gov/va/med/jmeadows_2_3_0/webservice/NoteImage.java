
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for noteImage complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="noteImage">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="contentDisposition" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="contentType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteBytes" type="{http://www.w3.org/2001/XMLSchema}base64Binary" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "noteImage", namespace = "http://webservice.bhie.DNS       /", propOrder = {
    "contentDisposition",
    "contentType",
    "noteBytes"
})
public class NoteImage {

    protected String contentDisposition;
    protected String contentType;
    protected byte[] noteBytes;

    /**
     * Gets the value of the contentDisposition property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getContentDisposition() {
        return contentDisposition;
    }

    /**
     * Sets the value of the contentDisposition property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setContentDisposition(String value) {
        this.contentDisposition = value;
    }

    /**
     * Gets the value of the contentType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getContentType() {
        return contentType;
    }

    /**
     * Sets the value of the contentType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setContentType(String value) {
        this.contentType = value;
    }

    /**
     * Gets the value of the noteBytes property.
     * 
     * @return
     *     possible object is
     *     byte[]
     */
    public byte[] getNoteBytes() {
        return noteBytes;
    }

    /**
     * Sets the value of the noteBytes property.
     * 
     * @param value
     *     allowed object is
     *     byte[]
     */
    public void setNoteBytes(byte[] value) {
        this.noteBytes = value;
    }

}
