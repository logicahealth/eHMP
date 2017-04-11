/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
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
 * The Context object is used to define the context in which reasoning is
 * occurring. The core component of the subject which defines about whom the
 * reasoning is occurring, for example a specific patient. The reset of the
 * context is used to define the environment in which the reasoning is occurring
 * included such things as what user is requesting the reasoning and the
 * clinical setting (e.g location, specialty etc.) in which the request occurs.
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:41 AM
 */
public class Context extends Base {

	private Location location;
	private Specialty specialty;
	private Subject subject;
	private User user;

	/**
	 * Factory method to create a blank context with all members having a base
	 * form
	 * 
	 * @return Content with present, but empty properties
	 */
	public static Context createContext() {
		Context ctx = new Context();
		ctx.location = new Location();
		ctx.specialty = new Specialty();
		ctx.subject = new Subject();
		ctx.user = new User();
		return ctx;
	}

	/**
	 * Simple empty constructor - Creates a empty context. This creates a
	 * lightweight instance suitable for frameworks
	 */
	public Context() {
	}

	/**
	 * Basic copy constructor
	 * 
	 * @param base
	 *            the Context to use as a basis.
	 * 
	 */
	public Context(Context base) {
		this.subject = base.subject;
		this.user = base.user;
		this.location = base.location;
		this.specialty = base.specialty;
	}

	public void finalize() throws Throwable {

	}

	/**
	 * Get the Location
	 * 
	 * @see Location
	 * @return The Location
	 */
	public Location getLocation() {
		return location;
	}

	/*
	 * Get the Specialty
	 * 
	 * @see Specialty
	 * 
	 * @return The Specialty
	 */
	public Specialty getSpecialty() {
		return specialty;
	}

	/*
	 * Get the Subject (e.g. Patient)
	 * 
	 * @see Subject
	 * 
	 * @return The Subject
	 */
	public Subject getSubject() {
		return subject;
	}

	/*
	 * Get the User (e.g. Provider)
	 * 
	 * @see User
	 * 
	 * @return The User
	 */
	public User getUser() {
		return user;
	}

	/**
	 * Set the Location
	 * 
	 * @param newVal
	 *            The location
	 */
	public void setLocation(Location newVal) {
		location = newVal;
	}

	/**
	 * Set the Specialty
	 * 
	 * @param newVal
	 *            The specialty
	 * 
	 */
	public void setSpecialty(Specialty specialty) {
		this.specialty = specialty;
	}

	/**
	 * Set the Subject (e.g. Patient)
	 * 
	 * @param newVal
	 *            The Subject
	 */
	public void setSubject(Subject newVal) {
		subject = newVal;
	}

	/**
	 * Set the user (e.g. provider)
	 * 
	 * @param newVal
	 */
	public void setUser(User newVal) {
		user = newVal;
	}

}
