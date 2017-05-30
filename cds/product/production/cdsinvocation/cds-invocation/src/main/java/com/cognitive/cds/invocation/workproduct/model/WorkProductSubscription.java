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

package com.cognitive.cds.invocation.workproduct.model;

import com.cognitive.cds.invocation.model.Base;
import java.util.ArrayList;
import java.util.List;


/**
 *
 * @author Jeremy Fox
 */
public class WorkProductSubscription extends Base {
    
    //may or may not need to consider the actual MongoID here.  These are
    //managed by userId, so it might not be needed.
    
    private String user;
    
    private String priority;
    private List<String> type = new ArrayList<String>();
    private List<Integer> specialty = new ArrayList<Integer>();

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    /**
     * @return the type
     */
    public List<String> getType() {
        return type;
    }

    /**
     * @param type the type to set
     */
    public void setType(List<String> type) {
        this.type = type;
    }

    /**
     * @return the specialty
     */
    public List<Integer> getSpecialty() {
        return specialty;
    }

    /**
     * @param specialty the specialty to set
     */
    public void setSpecialty(List<Integer> specialty) {
        this.specialty = specialty;
    }


}
