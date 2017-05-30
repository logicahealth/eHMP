package gov.va.jbpm.tasksservice.bean;

public class VariableValue {

	private String  name;
	private String  declaredType;
	private String scope;
	private String value;
	private boolean nil;
	private boolean globalScope;
	private boolean typeSubstituted;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDeclaredType() {
		return declaredType;
	}
	public void setDeclaredType(String declaredType) {
		this.declaredType = declaredType;
	}
	public String getScope() {
		return scope;
	}
	public void setScope(String scope) {
		this.scope = scope;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public boolean isNil() {
		return nil;
	}
	public void setNil(boolean nil) {
		this.nil = nil;
	}
	public boolean isGlobalScope() {
		return globalScope;
	}
	public void setGlobalScope(boolean globalScope) {
		this.globalScope = globalScope;
	}
	public boolean isTypeSubstituted() {
		return typeSubstituted;
	}
	public void setTypeSubstituted(boolean typeSubstituted) {
		this.typeSubstituted = typeSubstituted;
	}

}
