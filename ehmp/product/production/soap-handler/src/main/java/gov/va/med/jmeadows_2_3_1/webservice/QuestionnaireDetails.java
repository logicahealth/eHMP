
package gov.va.med.jmeadows_2_3_1.webservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for questionnaireDetails complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="questionnaireDetails">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="answers" type="{http://webservice.vds.DNS       /}questionnaireDetailAnswers" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="choices" type="{http://webservice.vds.DNS       /}questionnaireDetailChoices" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="comments" type="{http://webservice.vds.DNS       /}questionnaireDetailComments" maxOccurs="unbounded" minOccurs="0"/>
 *         &lt;element name="question" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sequence" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "questionnaireDetails", namespace = "http://webservice.vds.DNS       /", propOrder = {
    "answers",
    "choices",
    "comments",
    "question",
    "sequence"
})
public class QuestionnaireDetails {

    @XmlElement(nillable = true)
    protected List<QuestionnaireDetailAnswers> answers;
    @XmlElement(nillable = true)
    protected List<QuestionnaireDetailChoices> choices;
    @XmlElement(nillable = true)
    protected List<QuestionnaireDetailComments> comments;
    protected String question;
    protected String sequence;

    /**
     * Gets the value of the answers property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the answers property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getAnswers().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link QuestionnaireDetailAnswers }
     * 
     * 
     */
    public List<QuestionnaireDetailAnswers> getAnswers() {
        if (answers == null) {
            answers = new ArrayList<QuestionnaireDetailAnswers>();
        }
        return this.answers;
    }

    /**
     * Gets the value of the choices property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the choices property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getChoices().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link QuestionnaireDetailChoices }
     * 
     * 
     */
    public List<QuestionnaireDetailChoices> getChoices() {
        if (choices == null) {
            choices = new ArrayList<QuestionnaireDetailChoices>();
        }
        return this.choices;
    }

    /**
     * Gets the value of the comments property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the comments property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getComments().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link QuestionnaireDetailComments }
     * 
     * 
     */
    public List<QuestionnaireDetailComments> getComments() {
        if (comments == null) {
            comments = new ArrayList<QuestionnaireDetailComments>();
        }
        return this.comments;
    }

    /**
     * Gets the value of the question property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getQuestion() {
        return question;
    }

    /**
     * Sets the value of the question property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setQuestion(String value) {
        this.question = value;
    }

    /**
     * Gets the value of the sequence property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSequence() {
        return sequence;
    }

    /**
     * Sets the value of the sequence property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSequence(String value) {
        this.sequence = value;
    }

}
