package us.vistacore.ehmp.model.demographics;

import java.util.HashSet;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * Demographics information for the patient.
 *
 * @see <a href="http://wiki.hitsp.org/docs/C83/C83-3.html#_Ref232942628">HITSP/C83
 *      Personal Information</a>
 */
public class PatientDemographics {

    // Patient
    private String birthDate;
    private String ssn;
    private String icn;
    private String familyName;
    private String givenNames;
    private String fullName;
    private String displayName;
    private String genderCode;
    private String genderName;
    private String briefId;
    private String died;
    private Boolean sensitive;
    private String uid;
    private String pid;
    private String localId;

    private String religionCode;
    private String religionName;

    private Boolean veteran;
    private String lrdfn;
    private Boolean serviceConnected;
    private String scPercent;
    private String maritalStatusCode;
    private String maritalStatusName;

    private PatientFacility homeFacility;

    private String lastUpdated;
    private String domainUpdated;

    private Set<Alias> aliases;
    private Set<Address> address;
    private Set<PatientDisability> disabilities;
    private SortedSet<PatientFacility> facility;
    private Set<PatientFlag> flags;
    private Set<Telecom> telecom;
    private Set<PatientLanguage> languages;
    private Set<PatientEthnicity> ethnicities;
    private Set<PatientRace> races;
    private Set<PatientExposure> exposures;

    private Set<PatientContact> contact;

    public void addToRaces(PatientRace race) {
        if (races == null) {
            races = new HashSet<PatientRace>();
        }
        races.add(race);
    }

    public void addToEthnicities(PatientEthnicity ethnicity) {
        if (ethnicities == null) {
            ethnicities = new HashSet<PatientEthnicity>();
        }
        ethnicities.add(ethnicity);
    }

    public void addToLanguages(PatientLanguage language) {
        if (languages == null) {
            languages = new HashSet<PatientLanguage>();
        }
        languages.add(language);
    }

    public void addToDisabilities(PatientDisability disability) {
        if (disabilities == null) {
            disabilities = new HashSet<PatientDisability>();
        }
        disabilities.add(disability);
    }

    public void addToFacilities(PatientFacility patientFacility) {
        if (facility == null) {
            facility = new TreeSet<PatientFacility>();
        }
        facility.add(patientFacility);
    }

    public void addToAddresses(Address address) {
        if (this.address == null) {
            this.address = new HashSet<Address>();
        }
        this.address.add(address);
    }

    public void addToAliases(Alias alias) {
        if (aliases == null) {
            aliases = new HashSet<Alias>();
        }
        aliases.add(alias);
    }

    public void addToTelecoms(Telecom telecom) {
        if (this.telecom == null) {
            this.telecom = new HashSet<Telecom>();
        }
        this.telecom.add(telecom);
    }

    public void addToFlags(PatientFlag flag) {
        if (flags == null) {
            flags = new HashSet<PatientFlag>();
        }
        flags.add(flag);
    }

    public void addToExposures(PatientExposure exposure) {
        if (exposures == null) {
            exposures = new HashSet<PatientExposure>();
        }
        exposures.add(exposure);
    }

    public String getReligionCode() {
        return religionCode;
    }

    public String getReligionName() {
        return religionName;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getDomainUpdated() {
        return domainUpdated;
    }

    public Set<Alias> getAliases() {
        return aliases;
    }

    public Set<Address> getAddresses() {
        return address;
    }

    public Set<PatientDisability> getDisabilities() {
        return disabilities;
    }

    public SortedSet<PatientFacility> getFacilities() {
        return facility;
    }

    public Set<PatientFlag> getFlags() {
        return flags;
    }

    public Set<Telecom> getTelecoms() {
        return telecom;
    }

    public Set<PatientLanguage> getLanguages() {
        return languages;
    }

    public Set<PatientEthnicity> getEthnicities() {
        return ethnicities;
    }

    public Set<PatientRace> getRaces() {
        return races;
    }

    public Set<PatientExposure> getExposures() {
        return exposures;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public String getSsn() {
        return ssn;
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

    public String getBriefId() {
        return briefId;
    }

    public String getDied() {
        return died;
    }

    public Boolean getSensitive() {
        return sensitive;
    }

    public String getUid() {
        return uid;
    }

    public String getPid() {
        return pid;
    }

    public String getLocalId() {
        return localId;
    }

    public Boolean isVeteran() {
        return veteran;
    }

    public String getLrdfn() {
        return lrdfn;
    }

    public Boolean isServiceConnected() {
        return serviceConnected;
    }

    public String getScPercent() {
        return scPercent;
    }

    public PatientFacility getHomeFacility() {
        return homeFacility;
    }

    public Set<PatientContact> getContacts() {
        return contact;
    }

    public String getMaritalStatusCode() {
        return maritalStatusCode;
    }

    public String getMaritalStatusName() {
        return maritalStatusName;
    }
}
