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
package com.cognitive.cds.invocation.workproduct.model;

import com.cognitive.cds.invocation.model.Base;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import java.util.ArrayList;
import java.util.List;
import org.bson.types.ObjectId;
/**
 * General Work product storage structure
 * 
 * @author jgoodnough
 *
 */
public class WorkProductWrapper extends Base {

    /**
     * A unique id 
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId _id;

    /**
     * Assignments
    */
    private List<WorkProductAssignment> assignments = new ArrayList<WorkProductAssignment>();

    /**
    * WorkProduct
    */
    private WorkProduct workproduct;

    /**
     * @return the assignments
     */
    public List<WorkProductAssignment> getAssignments() {
        return assignments;
    }

    /**
     * @param assignments the assignments to set
     */
    public void setAssignments(List<WorkProductAssignment> assignments) {
        this.assignments = assignments;
    }

    /**
     * @return the workProduct
     */
    public WorkProduct getWorkproduct() {
        return workproduct;
    }

    /**
     * @param workProduct the workProduct to set
     */
    public void setWorkproduct(WorkProduct workproduct) {
        this.workproduct = workproduct;
    }

    /**
     * @return the id
     */
    public ObjectId get_id() {
        return _id;
    }
    
    /**
     * @param _id
     *            the _id to set
     */
    public void set_id(Object _id) {
        if (_id instanceof ObjectNode) {
            _id = ((ObjectNode) _id).findValue("$oid");
            if (_id != null && (_id instanceof TextNode)) {
                _id = (String)((TextNode) _id).asText();
            }
        }
        System.out.println("ID: " + _id);
        this._id =  new ObjectId((String)_id);
    }

}
