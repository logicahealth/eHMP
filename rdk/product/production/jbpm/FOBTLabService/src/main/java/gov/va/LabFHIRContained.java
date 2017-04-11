package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRContained {

	private String resourceType;
	private String id;
	private List<LabFHIRIdentifier> identifier = new ArrayList<LabFHIRIdentifier>();
	private String name;
	private List<LabFHIRAddress> address = new ArrayList<LabFHIRAddress>();
	private LabFHIRText text;
	private LabFHIRType type;
	private LabFHIRSubject subject;
	private LabFHIRCollection collection;
	private LabFHIRCode code;
	private String status;
	private String valueString;
	private LabFHIRInterpretation interpretation;
	private String reliability;
	private LabFHIRSpecimen specimen;
	private List<LabFHIRReferenceRange> referenceRange = new ArrayList<LabFHIRReferenceRange>();
	
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
	* The identifier
	*/
	public List<LabFHIRIdentifier> getIdentifier() {
		return identifier;
	}
	
	/**
	* 
	* @param identifier
	* The identifier
	*/
	public void setIdentifier(List<LabFHIRIdentifier> identifier) {
		this.identifier = identifier;
	}
	
	/**
	* 
	* @return
	* The name
	*/
	public String getName() {
		return name;
	}
	
	/**
	* 
	* @param name
	* The name
	*/
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	* 
	* @return
	* The address
	*/
	public List<LabFHIRAddress> getAddress() {
	return address;
	}

	/**
	* 
	* @param address
	* The address
	*/
	public void setAddress(List<LabFHIRAddress> address) {
	this.address = address;
	}
	
	/**
	* 
	* @return
	* The text
	*/
	public LabFHIRText getText() {
		return text;
	}
	
	/**
	* 
	* @param text
	* The text
	*/
	public void setText(LabFHIRText text) {
		this.text = text;
	}
	
	/**
	* 
	* @return
	* The type
	*/
	public LabFHIRType getType() {
		return type;
	}
	
	/**
	* 
	* @param type
	* The type
	*/
	public void setType(LabFHIRType type) {
		this.type = type;
	}
	
	/**
	* 
	* @return
	* The subject
	*/
	public LabFHIRSubject getSubject() {
		return subject;
	}
	
	/**
	* 
	* @param subject
	* The subject
	*/
	public void setSubject(LabFHIRSubject subject) {
		this.subject = subject;
	}
	
	/**
	* 
	* @return
	* The collection
	*/
	public LabFHIRCollection getCollection() {
		return collection;
	}
	
	/**
	* 
	* @param collection
	* The collection
	*/
	public void setCollection(LabFHIRCollection collection) {
		this.collection = collection;
	}
	
	/**
	* 
	* @return
	* The code
	*/
	public LabFHIRCode getCode() {
		return code;
	}
	
	/**
	* 
	* @param code
	* The code
	*/
	public void setCode(LabFHIRCode code) {
		this.code = code;
	}
	
	/**
	* 
	* @return
	* The status
	*/
	public String getStatus() {
		return status;
	}
	
	/**
	* 
	* @param status
	* The status
	*/
	public void setStatus(String status) {
		this.status = status;
	}
	
	/**
	* 
	* @return
	* The valueString
	*/
	public String getValueString() {
		return valueString;
	}
	
	/**
	* 
	* @param valueString
	* The valueString
	*/
	public void setValueString(String valueString) {
		this.valueString = valueString;
	}
	
	/**
	* 
	* @return
	* The interpretation
	*/
	public LabFHIRInterpretation getInterpretation() {
		return interpretation;
	}
	
	/**
	* 
	* @param interpretation
	* The interpretation
	*/
	public void setInterpretation(LabFHIRInterpretation interpretation) {
		this.interpretation = interpretation;
	}
	
	/**
	* 
	* @return
	* The reliability
	*/
	public String getReliability() {
		return reliability;
	}
	
	/**
	* 
	* @param reliability
	* The reliability
	*/
	public void setReliability(String reliability) {
		this.reliability = reliability;
	}
	
	/**
	* 
	* @return
	* The specimen
	*/
	public LabFHIRSpecimen getSpecimen() {
		return specimen;
	}
	
	/**
	* 
	* @param specimen
	* The specimen
	*/
	public void setSpecimen(LabFHIRSpecimen specimen) {
		this.specimen = specimen;
	}
	
	/**
	* 
	* @return
	* The referenceRange
	*/
	public List<LabFHIRReferenceRange> getReferenceRange() {
		return referenceRange;
	}
	
	/**
	* 
	* @param referenceRange
	* The referenceRange
	*/
	public void setReferenceRange(List<LabFHIRReferenceRange> referenceRange) {
		this.referenceRange = referenceRange;
	}

}