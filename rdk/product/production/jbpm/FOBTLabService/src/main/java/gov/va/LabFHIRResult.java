package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRResult {

	private String resourceType;
	private String type;
	private String id;
	private List<LabFHIRLink> link = new ArrayList<LabFHIRLink>();
	private Integer total;
	private List<LabFHIREntry> entry = new ArrayList<LabFHIREntry>();
	
	/**
	* 
	* @return
	* The resourceType
	*/
	public String getResourceType() {
		return resourceType;
	}
	
	/**
	* 
	* @param resourceType
	* The resourceType
	*/
	public void setResourceType(String resourceType) {
		this.resourceType = resourceType;
	}
	
	/**
	* 
	* @return
	* The type
	*/
	public String getType() {
		return type;
	}
	
	/**
	* 
	* @param type
	* The type
	*/
	public void setType(String type) {
		this.type = type;
	}
	
	/**
	* 
	* @return
	* The id
	*/
	public String getId() {
		return id;
	}
	
	/**
	* 
	* @param id
	* The id
	*/
	public void setId(String id) {
		this.id = id;
	}
	
	/**
	* 
	* @return
	* The link
	*/
	public List<LabFHIRLink> getLink() {
		return link;
	}
	
	/**
	* 
	* @param link
	* The link
	*/
	public void setLink(List<LabFHIRLink> link) {
		this.link = link;
	}
	
	/**
	* 
	* @return
	* The total
	*/
	public Integer getTotal() {
		return total;
	}
	
	/**
	* 
	* @param total
	* The total
	*/
	public void setTotal(Integer total) {
		this.total = total;
	}
	
	/**
	* 
	* @return
	* The entry
	*/
	public List<LabFHIREntry> getEntry() {
		return entry;
	}
	
	/**
	* 
	* @param entry
	* The entry
	*/
	public void setEntry(List<LabFHIREntry> entry) {
		this.entry = entry;
	}

}