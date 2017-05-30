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

import java.sql.Timestamp;
import java.util.LinkedHashMap;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

public class EngineInstanceState extends Base {

	/**
	 * A optional id
	 */
	private String id = "";

	// For mongodb serialization
	private ObjectId _id;

	/**
	 * The Name of the Engine
	 */
	private String name;
	/**
	 * The Status of the Engine true for available
	 */
	private boolean status;
	/**
	 * The type of the engine
	 */
	private String type;
	/**
	 * The Timestamp of the last update
	 */
	private Timestamp time;
	/**
	 * The Host of the engine
	 */
	private String host;
	/**
	 * The port of the engine
	 */
	private String port;

	/**
	 * Default Constructor
	 */
	public EngineInstanceState() {
	}

	/**
	 * The name of the Engine
	 *
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 *
	 * @param newVal
	 */
	public void setName(String newVal) {
		name = newVal;
	}

	/**
	 * The type of Engine
	 *
	 * @return
	 */
	public String getType() {
		return type;
	}

	/**
	 *
	 * @param newVal
	 */
	public void setType(String newVal) {
		type = newVal;
	}

	public boolean getStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	public Timestamp getTime() {
		return time;
	}

//    public void setTime(Timestamp time) {
//        this.time = time;
//    }
	public void setTime(Object time) {
		if (time instanceof Timestamp) {
			this.time = (Timestamp) time;
		} else if (time instanceof LinkedHashMap<?, ?>) {
			LinkedHashMap<String, String> hashMap = (LinkedHashMap<String, String>) time;
			Object id = hashMap.get("$numberLong");
			if (id != null && (id instanceof TextNode)) {
				String t = (String) ((TextNode) id).asText();
				if (t != null) {
					this.time = new Timestamp(new Long(t));
				}
			}
		}
	}

	/**
	 * Set the Id of the intent mapping
	 *
	 * @param id
	 */
	public void setId(String id) {
		this.id = id;
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
		} else if (_id instanceof ObjectNode) {
			_id = ((ObjectNode) _id).findValue("$oid");
			if (_id != null && (_id instanceof TextNode)) {
				String id = (String) ((TextNode) _id).asText();
				if (id != null) {
					this._id = new ObjectId(id);
				}
			}
		}
	}

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public String getPort() {
		return port;
	}

	public void setPort(String port) {
		this.port = port;
	}

}
