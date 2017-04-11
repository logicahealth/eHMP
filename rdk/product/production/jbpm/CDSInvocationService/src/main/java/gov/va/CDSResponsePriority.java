package gov.va;

import java.util.ArrayList;
import java.util.List;

public class CDSResponsePriority {

	private List<CDSResponseCoding> coding = new ArrayList<CDSResponseCoding>();

	/**
	* 
	* @return
	* The coding
	*/
	public List<CDSResponseCoding> getCoding() {
		return coding;
	}

	/**
	* 
	* @param coding
	* The coding
	*/
	public void setCoding(List<CDSResponseCoding> coding) {
		this.coding = coding;
	}
	
}
