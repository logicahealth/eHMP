package com.cognitive.cds.invocation.model;

/**
 * Types of Intent Scope
 * 
 * @author jgoodnough
 *
 */
public enum IntentScope {
	
	/**
	 * The intent is a built in part of the application
	 */
	BuiltIn,

	/**
	 * The intent is enterprise level
	 */
	Enterprise,    
	/**
	 * The intent is specific to a clinical specialty
	 */
	Specialty,
	/**
	 * The intent is specific to a provider
	 */
	Provider
}
