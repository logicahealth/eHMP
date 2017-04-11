package us.vistacore.ehmp.model.demographics;

/**
 * Demographics information for the patient.
 *
 * @see <a href="http://wiki.hitsp.org/docs/C83/C83-3.html#_Ref232942628">HITSP/C83
 *      Personal Information</a>
 */
public class PatientSelect {

    // Patient
    private String birthdate;
    private String pid;
    private String last4;
    private String last5;
    private String icn;
    private String familyName;
    private String givenNames;
    private String fullName;
    private String displayName;
    private String genderCode;
    private String genderName;
    private Boolean sensitive;
    private String uid;
    private String summary;
    private String ssn;
    private String localId;
    
    public String getBirthdate() {
        return birthdate;
    }
    public String getPid() {
        return pid;
    }
    public String getLast4() {
        return last4;
    }
    public String getLast5() {
        return last5;
    }
    public String getIcn() {
        return icn;
    }
    public String getFamilyName() {
        return familyName;
    }
    public String getGivenNames() {
        return givenNames;
    }
    public String getFullName() {
        return fullName;
    }
    public String getDisplayName() {
        return displayName;
    }
    public String getGenderCode() {
        return genderCode;
    }
    public String getGenderName() {
        return genderName;
    }
    public Boolean getSensitive() {
        return sensitive;
    }
    public String getUid() {
        return uid;
    }
    public String getSummary() {
        return summary;
    }
    public String getSsn() {
        return ssn;
    }
    public String getLocalId() {
        return localId;
    }
    
    

}
