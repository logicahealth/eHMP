
package gov.va.med.jmeadows_2_3_0.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for allergyDetail complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="allergyDetail">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.DNS   /}dataBean">
 *       &lt;sequence>
 *         &lt;element name="reportText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "allergyDetail", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "reportText"
})
public class AllergyDetail
    extends DataBean
{

    protected String reportText;

    /**
     * Gets the value of the reportText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReportText() {
        return reportText;
    }

    /**
     * Sets the value of the reportText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReportText(String value) {
        this.reportText = value;
    }

}
