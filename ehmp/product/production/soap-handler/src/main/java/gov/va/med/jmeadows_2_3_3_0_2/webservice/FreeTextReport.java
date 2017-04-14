
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for freeTextReport complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="freeTextReport">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.med.va.gov/}dataBean">
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
@XmlType(name = "freeTextReport", namespace = "http://webservice.vds.med.va.gov/", propOrder = {
    "reportText"
})
public class FreeTextReport
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
