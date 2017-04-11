package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRResource {

	private String resourceType;
	private LabFHIRName name;
	private String status;
	private String issued;
	private LabFHIRSubject subject;
	private LabFHIRPerformer performer;
	private List<LabFHIRContained> contained = new ArrayList<LabFHIRContained>();
	private List<LabFHIRIdentifier> identifier = new ArrayList<LabFHIRIdentifier>();
	private LabFHIRServiceCategory serviceCategory;
	private String diagnosticDateTime;
	private List<LabFHIRSpecimen> specimen = new ArrayList<LabFHIRSpecimen>();
	private List<LabFHIRExtension> extension = new ArrayList<LabFHIRExtension>();
	private List<LabFHIRResultData> result = new ArrayList<LabFHIRResultData>();
	private LabFHIRText text;

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
	* The name
	*/
	public LabFHIRName getName() {
		return name;
	}

	/**
	* 
	* @param name
	* The name
	*/
	public void setName(LabFHIRName name) {
		this.name = name;
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
	* The issued
	*/
	public String getIssued() {
		return issued;
	}

	/**
	* 
	* @param issued
	* The issued
	*/
	public void setIssued(String issued) {
		this.issued = issued;
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
	* The performer
	*/
	public LabFHIRPerformer getPerformer() {
		return performer;
	}

	/**
	* 
	* @param performer
	* The performer
	*/
	public void setPerformer(LabFHIRPerformer performer) {
		this.performer = performer;
	}

	/**
	* 
	* @return
	* The contained
	*/
	public List<LabFHIRContained> getContained() {
		return contained;
	}

	/**
	* 
	* @param contained
	* The contained
	*/
	public void setContained(List<LabFHIRContained> contained) {
		this.contained = contained;
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
	* The serviceCategory
	*/
	public LabFHIRServiceCategory getServiceCategory() {
		return serviceCategory;
	}

	/**
	* 
	* @param serviceCategory
	* The serviceCategory
	*/
	public void setServiceCategory(LabFHIRServiceCategory serviceCategory) {
		this.serviceCategory = serviceCategory;
	}

	/**
	* 
	* @return
	* The diagnosticDateTime
	*/
	public String getDiagnosticDateTime() {
		return diagnosticDateTime;
	}

	/**
	* 
	* @param diagnosticDateTime
	* The diagnosticDateTime
	*/
	public void setDiagnosticDateTime(String diagnosticDateTime) {
		this.diagnosticDateTime = diagnosticDateTime;
	}

	/**
	* 
	* @return
	* The specimen
	*/
	public List<LabFHIRSpecimen> getSpecimen() {
		return specimen;
	}

	/**
	* 
	* @param specimen
	* The specimen
	*/
	public void setSpecimen(List<LabFHIRSpecimen> specimen) {
		this.specimen = specimen;
	}

	/**
	* 
	* @return
	* The extension
	*/
	public List<LabFHIRExtension> getExtension() {
	return extension;
	}

	/**
	* 
	* @param extension
	* The extension
	*/
	public void setExtension(List<LabFHIRExtension> extension) {
		this.extension = extension;
	}

	/**
	* 
	* @return
	* The result
	*/
	public List<LabFHIRResultData> getResult() {
		return result;
	}

	/**
	* 
	* @param result
	* The result
	*/
	public void setResult(List<LabFHIRResultData> result) {
		this.result = result;
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

}
