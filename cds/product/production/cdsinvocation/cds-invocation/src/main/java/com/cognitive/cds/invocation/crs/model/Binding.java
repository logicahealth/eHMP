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
package com.cognitive.cds.invocation.crs.model;

import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Generated("org.jsonschema2pojo")
@JsonPropertyOrder({
    "code",
    "system",
    "orderable",
    "preferred",
    "site"
})
public class Binding {

    @JsonProperty("code")
    private Code code;
    @JsonProperty("system")
    private System system;
    @JsonProperty("orderable")
    private Orderable orderable;
    @JsonProperty("preferred")
    private Preferred preferred;
    @JsonProperty("site")
    private Site site;

    /**
     * 
     * @return
     *     The code
     */
    @JsonProperty("code")
    public Code getCode() {
        return code;
    }

    /**
     * 
     * @param code
     *     The code
     */
    @JsonProperty("code")
    public void setCode(Code code) {
        this.code = code;
    }

    /**
     * 
     * @return
     *     The system
     */
    @JsonProperty("system")
    public System getSystem() {
        return system;
    }

    /**
     * 
     * @param system
     *     The system
     */
    @JsonProperty("system")
    public void setSystem(System system) {
        this.system = system;
    }

    /**
     * 
     * @return
     *     The orderable
     */
    @JsonProperty("orderable")
    public Orderable getOrderable() {
        return orderable;
    }

    /**
     * 
     * @param orderable
     *     The orderable
     */
    @JsonProperty("orderable")
    public void setOrderable(Orderable orderable) {
        this.orderable = orderable;
    }

    /**
     * 
     * @return
     *     The preferred
     */
    @JsonProperty("preferred")
    public Preferred getPreferred() {
        return preferred;
    }

    /**
     * 
     * @param preferred
     *     The preferred
     */
    @JsonProperty("preferred")
    public void setPreferred(Preferred preferred) {
        this.preferred = preferred;
    }

    /**
     * 
     * @return
     *     The site
     */
    @JsonProperty("site")
    public Site getSite() {
        return site;
    }

    /**
     * 
     * @param site
     *     The site
     */
    @JsonProperty("site")
    public void setSite(Site site) {
        this.site = site;
    }

}
