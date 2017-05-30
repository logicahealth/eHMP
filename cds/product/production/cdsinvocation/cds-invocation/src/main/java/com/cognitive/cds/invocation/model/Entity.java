/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
package com.cognitive.cds.invocation.model;


/**
 * Abstracted coded entity
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:41 AM
 */
public abstract class Entity extends Base{


	protected String name;
	protected String id;
	protected String codeSystem;
	protected String type;
	protected String entityType;

	public Entity(){

	}

	public void finalize() throws Throwable {

	}

	public String getName(){
		return name;
	}

	/**
	 * 
	 * @param newVal
	 */
	public void setName(String newVal){
		name = newVal;
	}

	public String getId(){
		return id;
	}

	/**
	 * 
	 * @param newVal
	 */
	public void setId(String newVal){
		id = newVal;
	}
	/**
	 * Get type associated with a particular entity, this is distinct from the entity type in that it has meaning  for the
	 * each subclass of entity - For example a Subject might have a type of Patient, or Provider, or Vendor.
	 * @return
	 */
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	/**
	 * Get the code system (if any) associated with the entity - This provide scoping information for the Id.
	 * @return
	 */
	public String getCodeSystem() {
		return codeSystem;
	}

	public void setCodeSystem(String codeSystem) {
		this.codeSystem = codeSystem;
	}

	public String getEntityType() {
	    return this.entityType;
	}
	
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
	
}
