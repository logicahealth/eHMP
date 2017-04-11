package us.vistacore.vxsync.mvi;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.vxsync.utility.Utils;

public class MviDemographics {
	private String firstName; // Required
	private String lastName;  // Required
	private String ssn;       // Required
	private String birthDate;  // Optional but need in the format of yyyyMMdd (19660830)
	private static final Logger LOG = LoggerFactory.getLogger(MviDemographics.class);

	public MviDemographics() {
	}

	@JsonProperty
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	@JsonProperty
	public String getFirstName() {
		return firstName;
	}

	@JsonProperty
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	@JsonProperty
	public String getLastName() {
		return lastName;
	}

	@JsonProperty("ssn")
	public void setSSN(String ssn) {
		this.ssn = ssn;
	}

	@JsonProperty
	public String getSSN() {
		return ssn;
	}

	@JsonProperty()
	public void setBirthDate(String birthDate) {
		/** check to see if birthData is valid **/
		if (Utils.isValidDateFormat(birthDate, "yyyyMMdd")){
			this.birthDate = birthDate;
		}
		else {
			LOG.warn("Date String " + birthDate + " is NOT a valid Date format!");
		}

	}

	@JsonProperty
	public String getBirthDate() {
		return birthDate;
	}

	@JsonIgnore
	public boolean isValidInput() {
		if (StringUtils.isNotBlank(lastName) &&
			StringUtils.isNotBlank(firstName) &&
			StringUtils.isNotBlank(ssn)) {
			return true;
		}
		return false;
	}
}
