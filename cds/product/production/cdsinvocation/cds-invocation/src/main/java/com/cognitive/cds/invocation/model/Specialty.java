package com.cognitive.cds.invocation.model;

/**
 * The specialty - In the future this should be standards based structure
 * @author jgoodnough
 *
 */
public class Specialty extends Entity {

	
	public Specialty()
	{
		
		this.entityType="Specialty";
	}

	public Specialty(String name, String id){
		this.id=id;
		this.name=name;		
		this.entityType="Specialty";
	}

	public Specialty(String name, String id, String type){
		this.id=id;
		this.name=name;		
		this.type = type;
		this.entityType="Specialty";
	}

	public Specialty(String name, String id, String type, String codeSystem){
		this.id=id;
		this.name=name;	
		this.type = type;
		this.codeSystem = codeSystem;
		this.entityType="Specialty";
	}
	
	
//	@Override
//	public String getEntityType() {
//		return this.entityType;
//	}

}
