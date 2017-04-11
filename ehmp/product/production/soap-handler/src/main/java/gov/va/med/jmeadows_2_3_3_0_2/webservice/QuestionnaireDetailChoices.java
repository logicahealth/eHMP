
package gov.va.med.jmeadows_2_3_3_0_2.webservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for questionnaireDetailChoices complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="questionnaireDetailChoices">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="answerType" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="choice" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="choiceText" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="correctAnswer" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="selected" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "questionnaireDetailChoices", namespace = "http://webservice.vds.med.DNS   /", propOrder = {
    "answerType",
    "choice",
    "choiceText",
    "correctAnswer",
    "selected"
})
public class QuestionnaireDetailChoices {

    protected String answerType;
    protected String choice;
    protected String choiceText;
    protected String correctAnswer;
    protected boolean selected;

    /**
     * Gets the value of the answerType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAnswerType() {
        return answerType;
    }

    /**
     * Sets the value of the answerType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAnswerType(String value) {
        this.answerType = value;
    }

    /**
     * Gets the value of the choice property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getChoice() {
        return choice;
    }

    /**
     * Sets the value of the choice property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setChoice(String value) {
        this.choice = value;
    }

    /**
     * Gets the value of the choiceText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getChoiceText() {
        return choiceText;
    }

    /**
     * Sets the value of the choiceText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setChoiceText(String value) {
        this.choiceText = value;
    }

    /**
     * Gets the value of the correctAnswer property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCorrectAnswer() {
        return correctAnswer;
    }

    /**
     * Sets the value of the correctAnswer property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCorrectAnswer(String value) {
        this.correctAnswer = value;
    }

    /**
     * Gets the value of the selected property.
     * 
     */
    public boolean isSelected() {
        return selected;
    }

    /**
     * Sets the value of the selected property.
     * 
     */
    public void setSelected(boolean value) {
        this.selected = value;
    }

}
