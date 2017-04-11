package com.cognitive.cds.invocation.mongo.exception;

/*
 * Indicates a failure to connect to CDSDB
 */
public class CDSDBConnectionException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	
	public CDSDBConnectionException() { };
	
	public CDSDBConnectionException(Throwable e) { 
		super(e);
	};
}
