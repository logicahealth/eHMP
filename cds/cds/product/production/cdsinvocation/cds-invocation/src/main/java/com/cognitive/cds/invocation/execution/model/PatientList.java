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
package com.cognitive.cds.invocation.execution.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

public class PatientList {
    private Pidhistory[] pidhistory;

    private String scope;

    private String[] patients;

    private String _id;

    private Definition definition;

    private String name;

    private String owner;

    private String date;

    /**
     *
     * @return
     */
    public Pidhistory[] getPidhistory() {
        return pidhistory;
    }

    /**
     *
     * @param pidhistory
     */
    public void setPidhistory(Pidhistory[] pidhistory) {
        this.pidhistory = pidhistory;
    }

    /**
     *
     * @return
     */
    public String getScope() {
        return scope;
    }

    /**
     *
     * @param scope
     */
    public void setScope(String scope) {
        this.scope = scope;
    }

    /**
     *
     * @return
     */
    public String[] getPatients() {
        return patients;
    }

    /**
     *
     * @param patients
     */
    public void setPatients(String[] patients) {
        this.patients = patients;
    }

    /**
     *
     * @return
     */
    public String get_id() {
        return _id;
    }

    /**
     *
     * @param _id
     */
    @JsonIgnore
    public void set_id(String _id) {
        this._id = _id;
    }

    /**
     * @param _id
     *            the _id to set
     */
    @JsonProperty("_id")
    public void set_id_json(Object _id) {
        if (_id instanceof ObjectNode) {
            _id = ((ObjectNode) _id).findValue("$oid");
            if (_id != null && (_id instanceof TextNode)) {
                _id = (String) ((TextNode) _id).asText();
            }
        }
        this._id = (String) _id;
    }

    /**
     *
     * @return
     */
    public Definition getDefinition() {
        return definition;
    }

    /**
     *
     * @param definition
     */
    public void setDefinition(Definition definition) {
        this.definition = definition;
    }

    /**
     *
     * @return
     */
    public String getName() {
        return name;
    }

    /**
     *
     * @param name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     *
     * @return
     */
    public String getOwner() {
        return owner;
    }

    /**
     *
     * @param owner
     */
    public void setOwner(String owner) {
        this.owner = owner;
    }

    /**
     *
     * @return
     */
    public String getDate() {
        return date;
    }

    /**
     *
     * @param date
     */
    @JsonIgnore
    public void setDate(String date) {
        this.date = date;
    }

    @JsonProperty("date")
    public void setDateDate(Object date) {
        if (date instanceof ObjectNode) {
            date = ((ObjectNode) date).findValue("$date");
            if (date != null && (date instanceof TextNode)) {
                date = (String) ((TextNode) date).asText();
            } else if (date != null && (date instanceof LongNode)) {
                date = (String) new Date(((LongNode) date).longValue())
                        .toString();
            }
        }
        this.date = (String) date;
    }

    @Override
    public String toString() {
        return "ClassPojo [pidhistory = " + pidhistory + ", scope = " + scope
                + ", patients = " + patients + ", _id = " + _id
                + ", definition = " + definition + ", name = " + name
                + ", owner = " + owner + ", date = " + date + "]";
    }
}
