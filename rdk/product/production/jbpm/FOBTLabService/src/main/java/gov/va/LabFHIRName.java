package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRName {
	
	private String text;
	private List<LabFHIRCoding> coding = new ArrayList<LabFHIRCoding>();

	/**
	* 
	* @return
	* The text
	*/
	public String getText() {
		return text;
	}

	/**
	* 
	* @param text
	* The text
	*/
	public void setText(String text) {
		this.text = text;
	}

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
