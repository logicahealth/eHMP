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

import java.util.LinkedHashMap;

import org.bson.types.ObjectId;

import com.cognitive.cds.invocation.CDSEnginePlugInIFace;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;


/**
 * Tracking structure for for Engines
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:41 AM
 */
public class EngineInfo extends Base {

    /**
     * An actual Engine Plug in interface
     */
    private CDSEnginePlugInIFace engine;
    /**
     * A optional id
     */
    private String id = "";

    // For mongodb serialization
    private ObjectId _id;

    /**
     * The Engines environment
     */
    private String environment;
    /**
     * The Name of the Engine
     */
    private String name;
    /**
     * The Type of the Engine
     */
    private String type;
    /**
     * The Version of the engine
     */
    private String version;

    /**
     * Default Constructor
     */
    public EngineInfo() {
    }

    /**
     * Simple Constructor
     * 
     * @param engine
     */
    public EngineInfo(CDSEnginePlugInIFace engine) {
        this.engine = engine;

    }

    /**
     * The actual engine instance
     * 
     * @return
     */
    public CDSEnginePlugInIFace getEngine() {
        return engine;
    }

    /**
     * Documentation on the runtime environment (RFU)
     * 
     * @return
     */
    public String getEnvironment() {
        return environment;
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
     * Set the Id of the intent mapping
     * 
     * @param id
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * The type of Engine
     * 
     * @return
     */
    public String getType() {
        return type;
    }

    public String getVersion() {
        return version;
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
    @JsonSubTypes({
            @Type(value = com.cognitive.cds.invocation.engineplugins.DroolsLocal.class),
            @Type(value = com.cognitive.cds.invocation.engineplugins.DroolsRemote.class),
            @Type(value = com.cognitive.cds.invocation.engineplugins.MockEngine.class),
            @Type(value = com.cognitive.cds.invocation.engineplugins.OpenCDS.class) })
    public void setEngine(CDSEnginePlugInIFace engine) {
        this.engine = engine;
    }

    /**
     * 
     * @param newVal
     */
    public void setEnvironment(String newVal) {
        environment = newVal;
    }

    /**
     * 
     * @param newVal
     */
    public void setName(String newVal) {
        name = newVal;
    }

    /**
     * 
     * @param newVal
     */
    public void setType(String newVal) {
        type = newVal;
    }

    /**
     * 
     * @param newVal
     */
    public void setVersion(String newVal) {
        version = newVal;
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
                String id = (String)((TextNode) _id).asText();
                if (id != null) {
                    this._id = new ObjectId(id);
                }
            }
        }
    }

}
