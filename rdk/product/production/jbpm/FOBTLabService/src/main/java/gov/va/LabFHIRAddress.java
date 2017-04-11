package gov.va;

import java.util.ArrayList;
import java.util.List;

public class LabFHIRAddress {

	private String text;
	private String state;
	private String city;
	private List<String> line = new ArrayList<String>();
	private String postalCode;
	
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
	* The state
	*/
	public String getState() {
	return state;
	}
	
	/**
	* 
	* @param state
	* The state
	*/
	public void setState(String state) {
	this.state = state;
	}
	
	/**
	* 
	* @return
	* The city
	*/
	public String getCity() {
	return city;
	}
	
	/**
	* 
	* @param city
	* The city
	*/
	public void setCity(String city) {
	this.city = city;
	}
	
	/**
	* 
	* @return
	* The line
	*/
	public List<String> getLine() {
	return line;
	}
	
	/**
	* 
	* @param line
	* The line
	*/
	public void setLine(List<String> line) {
	this.line = line;
	}
	
	/**
	* 
	* @return
	* The postalCode
	*/
	public String getPostalCode() {
	return postalCode;
	}
	
	/**
	* 
	* @param postalCode
	* The postalCode
	*/
	public void setPostalCode(String postalCode) {
	this.postalCode = postalCode;
	}

}