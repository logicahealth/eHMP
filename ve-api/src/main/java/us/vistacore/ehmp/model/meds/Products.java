package us.vistacore.ehmp.model.meds;

/**
 * This class represents data for medication
 * @author josephg
 *
 */
public class Products {

    private String summary;
    private String ingredientCode;
    private String ingredientCodeName;
    private String ingredientName;
    private String drugClassCode;
    private String drugClassName;
    private String suppliedCode;
    private String suppliedName;
    private String ingredientRole;
    private String strength;
    private String ingredientRXNCode;
    private String volume;

    public Products(String summary, String ingredientCode,
            String ingredientCodeName, String ingredientName,
            String drugClassCode, String drugClassName, String suppliedCode,
            String suppliedName, String ingredientRole, String strength,
            String ingredientRxnCode) {
        super();
        this.summary = summary;
        this.ingredientCode = ingredientCode;
        this.ingredientCodeName = ingredientCodeName;
        this.ingredientName = ingredientName;
        this.drugClassCode = drugClassCode;
        this.drugClassName = drugClassName;
        this.suppliedCode = suppliedCode;
        this.suppliedName = suppliedName;
        this.ingredientRole = ingredientRole;
        this.strength = strength;
        this.ingredientRXNCode = ingredientRxnCode;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getIngredientCode() {
        return ingredientCode;
    }

    public void setIngredientCode(String ingredientCode) {
        this.ingredientCode = ingredientCode;
    }

    public String getIngredientCodeName() {
        return ingredientCodeName;
    }

    public void setIngredientCodeName(String ingredientCodeName) {
        this.ingredientCodeName = ingredientCodeName;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public String getDrugClassCode() {
        return drugClassCode;
    }

    public void setDrugClassCode(String drugClassCode) {
        this.drugClassCode = drugClassCode;
    }

    public String getDrugClassName() {
        return drugClassName;
    }

    public void setDrugClassName(String drugClassName) {
        this.drugClassName = drugClassName;
    }

    public String getSuppliedCode() {
        return suppliedCode;
    }

    public void setSuppliedCode(String suppliedCode) {
        this.suppliedCode = suppliedCode;
    }

    public String getSuppliedName() {
        return suppliedName;
    }

    public void setSuppliedName(String suppliedName) {
        this.suppliedName = suppliedName;
    }

    public String getIngredientRole() {
        return ingredientRole;
    }

    public void setIngredientRole(String ingredientRole) {
        this.ingredientRole = ingredientRole;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getIngredientRXNCode() {
        return ingredientRXNCode;
    }

    public void setIngredientRXNCode(String ingredientRXNCode) {
        this.ingredientRXNCode = ingredientRXNCode;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }
}
