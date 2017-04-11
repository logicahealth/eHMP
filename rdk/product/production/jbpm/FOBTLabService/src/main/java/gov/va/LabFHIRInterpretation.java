package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRInterpretation {

	private List<LabFHIRCoding> coding = new ArrayList<LabFHIRCoding>();

	/**
	* 
	* @return
	* The coding
	*/
	public List<LabFHIRCoding> getCoding() {
		return coding;
	}

	/**
	* 
	* @param coding
	* The coding
	*/
	public void setCoding(List<LabFHIRCoding> coding) {
		this.coding = coding;
	}
}
