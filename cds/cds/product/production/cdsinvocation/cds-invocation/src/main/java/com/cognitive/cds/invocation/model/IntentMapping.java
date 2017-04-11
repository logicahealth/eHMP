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

import java.util.LinkedHashMap;
import java.util.List;

import org.bson.types.ObjectId;

/**
 * Base definition of an Intents and Link to a governance model Used in
 * configuration of that interface.
 * 
 * 
 * @author jgoodnough
 *
 */
public class IntentMapping extends Base {

	/**
	 * The description of the Intent
	 */
	private String description;

	/**
	 * An optional governance plug-in that is used dynamically configure this
	 * intent.
	 */
	private InvocationGovernanceIFace governance;
	/**
	 * A optional id
	 */
	private String id = "";

	// For mongodb serialization
	private ObjectId _id;

	/**
	 * A List of Invocation Mappings, might be empty if a
	 * InvocationGovernanceIFace is present. If this Mapping is empty and no
	 * governance instance is defined then a particular intent is of no use.
	 */
	private List<InvocationMapping> invocations;

	private String name;

	/**
	 * The scope of this particular intent mapping At runtime the the final
	 * InvocationMappings may result in multiple scopes for a named intent being
	 * combined.
	 */
	private IntentScope scope = IntentScope.BuiltIn;

	/**
	 * The scope Id is used to further qualify the intent mapping in a
	 * particular scope. For example if the scope is Provider, the scopeId would
	 * be the provider Id. For a Specialty it might be the snomed code
	 * representing that specialty
	 */
	private String scopeId;

	/**
	 * Return the description
	 * 
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * Provides a Global name that is the scope / scope id / name
	 * 
	 * @return
	 */

	public String getGlobalName() {

		if (scopeId == null) {
			return scope + "//" + name;
		}

		return scope + "/" + scopeId + "/" + name;
	}

	/**
	 * Returns the configured InvocationGovernanceIFace that is used to govern
	 * intent mapping. In general this interface is used dynamically load
	 * intents from a central repository and to use the context to configure the
	 * intent.
	 * 
	 * @see InvocationGovernanceIFace
	 * 
	 * @return the governance
	 */
	public InvocationGovernanceIFace getGovernance() {
		return governance;
	}

	/**
	 * An id to use with the intent. Not required for a static configuration,
	 * but useful when used
	 * 
	 * @return
	 */
	public String getId() {
		return id;
	}

	/**
	 * Get a list of Invocation Mappings associated with a specific intent
	 * 
	 * @return
	 */
	public List<InvocationMapping> getInvocations() {
		return invocations;
	}

	/**
	 * The name of the intent - Optional on static definitions but useful for
	 * stored instances
	 * 
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 * @return the scope
	 */
	public IntentScope getScope() {
		return scope;
	}

	/**
	 * Set a Description of the Mapping
	 * 
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * No-op method - Hack for deserialization
	 * 
	 * @param name
	 */
	public void setGlobalName(String name) {
		// A No-Op
		return;
	}

	/**
	 * Return the interface used to control access and configuration of intents.
	 * 
	 * @param governance
	 *            the governance interface to set
	 */
	public void setGovernance(InvocationGovernanceIFace governance) {
		this.governance = governance;
	}

	/**
	 * Set the Id of the intent mapping
	 * 
	 * @param id
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * Set the list of invocations that are a stock part of this intent.
	 * 
	 * @param invocations
	 */
	public void setInvocations(List<InvocationMapping> invocations) {
		this.invocations = invocations;
	}

	/**
	 * Set the name of the intent
	 * 
	 * @param name
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @param scope
	 *            the scope to set
	 */
	public void setScope(IntentScope scope) {
		this.scope = scope;
	}

	/**
	 * Get the Id of this mapping in the scope
	 * 
	 * @return an Id in this scope
	 */
	public String getScopeId() {
		return scopeId;
	}

	/**
	 * Set the scope Id
	 * 
	 * @param scopeId
	 */
	public void setScopeId(String scopeId) {
		this.scopeId = scopeId;
	}

	public ObjectId get_id() {
		return _id;
	}

	public void set_id(Object _id) {
		if (_id instanceof LinkedHashMap<?, ?>) {
			LinkedHashMap<String, String> hashMap = (LinkedHashMap<String, String>) _id;
			String id = hashMap.get("$oid");
			if (id != null) {
				this._id = new ObjectId(id);
			}
		} else if (_id instanceof String) {
			this.id = (String) _id;
			if (!this.id.isEmpty()) {
				this._id = new ObjectId(id);
			}
		} else if (_id instanceof ObjectId) {
			this._id = (ObjectId) _id;
		}
	}

}
