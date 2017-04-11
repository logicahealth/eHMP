
package gov.va.med.jmeadows_2_3_1.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * <p>Java class for progressNote complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="progressNote">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.domain.ext/}dataBean">
 *       &lt;sequence>
 *         &lt;element name="amended" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="complexDataUrl" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="encounter" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="images" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="location" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteDate" type="{http://www.w3.org/2001/XMLSchema}dateTime" minOccurs="0"/>
 *         &lt;element name="noteId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteTitle" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteTitleId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="noteType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="provider" type="{http://webservice.vds.domain.ext/}provider" minOccurs="0"/>
 *         &lt;element name="sensitive" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="userIen" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="visitDate" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "progressNote", namespace = "http://webservice.vds.domain.ext/", propOrder = {
    "amended",
    "complexDataUrl",
    "encounter",
    "images",
    "location",
    "noteDate",
    "noteId",
    "noteText",
    "noteTitle",
    "noteTitleId",
    "noteType",
    "provider",
    "sensitive",
    "status",
    "userIen",
    "visitDate"
})
public class ProgressNote
    extends DataBean
{

    protected String amended;
    protected String complexDataUrl;
    protected String encounter;
    protected String images;
    protected String location;
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar noteDate;
    protected String noteId;
    protected String noteText;
    protected String noteTitle;
    protected String noteTitleId;
    protected String noteType;
    protected Provider provider;
    protected String sensitive;
    protected String status;
    protected String userIen;
    protected String visitDate;

    /**
     * Gets the value of the amended property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAmended() {
        return amended;
    }

    /**
     * Sets the value of the amended property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAmended(String value) {
        this.amended = value;
    }

    /**
     * Gets the value of the complexDataUrl property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getComplexDataUrl() {
        return complexDataUrl;
    }

    /**
     * Sets the value of the complexDataUrl property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setComplexDataUrl(String value) {
        this.complexDataUrl = value;
    }

    /**
     * Gets the value of the encounter property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEncounter() {
        return encounter;
    }

    /**
     * Sets the value of the encounter property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEncounter(String value) {
        this.encounter = value;
    }

    /**
     * Gets the value of the images property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getImages() {
        return images;
    }

    /**
     * Sets the value of the images property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setImages(String value) {
        this.images = value;
    }

    /**
     * Gets the value of the location property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLocation() {
        return location;
    }

    /**
     * Sets the value of the location property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLocation(String value) {
        this.location = value;
    }

    /**
     * Gets the value of the noteDate property.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getNoteDate() {
        return noteDate;
    }

    /**
     * Sets the value of the noteDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setNoteDate(XMLGregorianCalendar value) {
        this.noteDate = value;
    }

    /**
     * Gets the value of the noteId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteId() {
        return noteId;
    }

    /**
     * Sets the value of the noteId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteId(String value) {
        this.noteId = value;
    }

    /**
     * Gets the value of the noteText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteText() {
        return noteText;
    }

    /**
     * Sets the value of the noteText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteText(String value) {
        this.noteText = value;
    }

    /**
     * Gets the value of the noteTitle property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteTitle() {
        return noteTitle;
    }

    /**
     * Sets the value of the noteTitle property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteTitle(String value) {
        this.noteTitle = value;
    }

    /**
     * Gets the value of the noteTitleId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteTitleId() {
        return noteTitleId;
    }

    /**
     * Sets the value of the noteTitleId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteTitleId(String value) {
        this.noteTitleId = value;
    }

    /**
     * Gets the value of the noteType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNoteType() {
        return noteType;
    }

    /**
     * Sets the value of the noteType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNoteType(String value) {
        this.noteType = value;
    }

    /**
     * Gets the value of the provider property.
     * 
     * @return
     *     possible object is
     *     {@link Provider }
     *     
     */
    public Provider getProvider() {
        return provider;
    }

    /**
     * Sets the value of the provider property.
     * 
     * @param value
     *     allowed object is
     *     {@link Provider }
     *     
     */
    public void setProvider(Provider value) {
        this.provider = value;
    }

    /**
     * Gets the value of the sensitive property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSensitive() {
        return sensitive;
    }

    /**
     * Sets the value of the sensitive property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSensitive(String value) {
        this.sensitive = value;
    }

    /**
     * Gets the value of the status property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the value of the status property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStatus(String value) {
        this.status = value;
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

    /**
     * Gets the value of the visitDate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVisitDate() {
        return visitDate;
    }

    /**
     * Sets the value of the visitDate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVisitDate(String value) {
        this.visitDate = value;
    }

}
