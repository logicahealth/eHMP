
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for admissionDetail complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="admissionDetail">
 *   &lt;complexContent>
 *     &lt;extension base="{http://webservice.vds.URL       /}patientAdmission">
 *       &lt;sequence>
 *         &lt;element name="detailText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="diagnoses" type="{http://webservice.vds.URL       /}diagnosis" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="procedures" type="{http://webservice.vds.URL       /}procedure" maxOccurs="unbounded" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "admissionDetail", namespace = "http://webservice.vds.URL       /", propOrder = {
    "detailText",
    "diagnoses",
    "procedures"
})
public class AdmissionDetail
    extends PatientAdmission
{

    protected String detailText;
    @XmlElement(nillable = true)
    protected List<Diagnosis> diagnoses;
    @XmlElement(nillable = true)
    protected List<Procedure> procedures;

    /**
     * Gets the value of the detailText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDetailText() {
        return detailText;
    }

    /**
     * Sets the value of the detailText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDetailText(String value) {
        this.detailText = value;
    }

    /**
     * Gets the value of the diagnoses property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the diagnoses property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDiagnoses().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Diagnosis }
     * 
     * 
     */
    public List<Diagnosis> getDiagnoses() {
        if (diagnoses == null) {
            diagnoses = new ArrayList<Diagnosis>();
        }
        return this.diagnoses;
    }

    /**
     * Gets the value of the procedures property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the procedures property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getProcedures().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Procedure }
     * 
     * 
     */
    public List<Procedure> getProcedures() {
        if (procedures == null) {
            procedures = new ArrayList<Procedure>();
        }
        return this.procedures;
    }

}
