package com.cognitive.cds.invocation.model;

public class CentralLoggingBean {
	private String source;
	private String destination;
	private String body;
	private String type;
	private String url;
	public CentralLoggingBean(String source,String destination, String body, String type, String url ){
		this.source = source;
		this.destination = destination;
		this.body = body;
		this.type = type;
		this.url  = url;
	}
	public String getSource() {
		return source;
	}
	public void setSource(String source) {
		this.source = source;
	}
	public String getDestination() {
		return destination;
	}
	public void setDestination(String destination) {
		this.destination = destination;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	
}
