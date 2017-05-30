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
 * Placeholder for Location - Should in the future be a standards based structure.
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 */
public class Location extends Entity {

	public Location(){
		entityType="Location";
	}
	/**
	 * Simple parameter based constructor
	 * @param name The Location name 
	 * @param id The Id of the Location
	 */
	public Location(String name, String id){
		this.id=id;
		this.name=name;
		entityType ="Location";
	}

	/**
	 * Simple parameter based constructor
	 * @param name The Location name 
	 * @param id The Id of the Location
	 * @param type The Location Type
	 */
	public Location(String name, String id, String type){
		this.id=id;
		this.name=name;
		this.type= type;
		entityType ="Location";
	}

	/**
	 * Simple parameter based constructor
	 * @param name The Location name 
	 * @param id The Id of the Location
	 * @param type The Location Type
	 * @param codeSystem the Code System used by the Id
	 */
	public Location(String name, String id, String type, String codeSystem){
		this.id=id;
		this.name=name;
		this.type= type;
		this.codeSystem = codeSystem;
		entityType ="Location";
	}


	public void finalize() throws Throwable {
		super.finalize();
	}

//	public String getEntityType(){
//		return entityType;
//	}

}
