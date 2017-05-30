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
package com.cognitive.cds.services.metrics.model;

import java.sql.Timestamp;

/**
 * @author Jeremy Fox
 * @version 1.0
 * @created 30-Jan-2014 2:53:45 PM
 */
public class Observation {

	public String name;
	public Double value;
	public Timestamp time;
	public String origin;

	public Observation(){

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
	
	public Double getValue(){
		return value;
	}

	/**
	 * 
	 * @param newVal
	 */
	public void setValue(Double newVal){
		value = newVal;
	}

	public Timestamp getTime(){
		return time;
	}

	/**
	 * 
	 * @param newVal
	 */
	public void setTime(Timestamp newVal){
		time = newVal;
	}

	public String getOrigin(){
		return origin;
	}
	
	/**
	 * 
	 * @param newVal
	 */
	public void setOrigin(String newVal){
		origin = newVal;
	}



}
