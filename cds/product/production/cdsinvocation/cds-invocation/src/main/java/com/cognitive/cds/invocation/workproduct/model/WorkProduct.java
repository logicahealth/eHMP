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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.cognitive.cds.invocation.model.Base;
import com.cognitive.cds.invocation.model.Context;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

/**
 * General Work product storage structure
 * 
 * @author jgoodnough
 *
 */
public class WorkProduct extends Base {

    /**
     * A unique id
     */
    private String id;

    /**
     * The type of work product
     */
    private String type;

    /**
     * The context in which the work product was created
     */
    private Context context;

    /**
     * The invocation that created the work product
     */
    private InvocationInfo invocationInfo;

    /**
     * The date the work product was genrated
     */
    private Date generationDate;

    /**
     * The date the work product expires
     */
    private Date expirationDate;

    /**
     * The priority of the product [0 (low) - to 100 (high)]
     */
    private int priority;

    /**
     * A list of category associated with this work product For example snomed
     * codes of the specialties that relate to the work product
     */
    private List<String> categories = new ArrayList<String>();

    /**
     * A Duplication check key for the work product - Should be calculated such
     * that a medically unique value it created
     */
    private DuplicationCheckKey duplicateCheckKey;

    /**
     * Work Product Payload
     */
    private List<Payload> payload = new ArrayList<Payload>();

    public WorkProduct() {
        this.generationDate = new Date(System.currentTimeMillis());
        this.duplicateCheckKey = new DuplicationCheckKey();
    }

    public WorkProduct(String type, Context context, InvocationInfo invocationInfo, Date expirationDate) {
        this.type = type;
        this.context = context;
        this.invocationInfo = invocationInfo;
        this.expirationDate = expirationDate;
        this.duplicateCheckKey = new DuplicationCheckKey(type, context.getSubject());
        this.generationDate = new Date(System.currentTimeMillis());

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
        duplicateCheckKey.setType(type);
    }

    public Context getContext() {
        return context;
    }

    public void setContext(Context context) {
        this.context = context;
        duplicateCheckKey.setSubject(context.getSubject());
    }

    public InvocationInfo getInvocationInfo() {
        return invocationInfo;
    }

    public void setInvocationInfo(InvocationInfo invocationInfo) {
        this.invocationInfo = invocationInfo;
    }

    /**
     *
     * @return
     */
    public Date getGenerationDate() {
        return generationDate;
    }

    // @JsonIgnore
    public void setGenerationDate(Date generationDate) {
        this.generationDate = generationDate;
    }

    @JsonProperty("generationDate")
    public void setGenerationDateProp(Object date) {
        if (date instanceof ObjectNode) {
            date = ((ObjectNode) date).findValue("$numberLong");
            if (date != null && (date instanceof TextNode)) {
                String textValue = ((TextNode) date).asText();
                this.generationDate = new Date(Long.parseLong(textValue));
            } else if (date != null && (date instanceof LongNode)) {
                long longValue = ((ObjectNode) date).longValue();
                this.generationDate = new Date(longValue);
            }
        }
    }

    public Date getExpirationDate() {
        return expirationDate;
    }

    // @JsonIgnore
    public void setExpirationDate(Date expirationDate) {
        this.expirationDate = expirationDate;
    }

    @JsonProperty("expirationDate")
    public void setExpirationDateProp(Object date) {
        if (date instanceof ObjectNode) {
            date = ((ObjectNode) date).findValue("$numberLong");
            if (date != null && (date instanceof TextNode)) {
                String textValue = ((TextNode) date).asText();
                this.expirationDate = new Date(Long.parseLong(textValue));
            } else if (date != null && (date instanceof LongNode)) {
                long longValue = ((ObjectNode) date).longValue();
                this.expirationDate = new Date(longValue);
            }
        }
    }

    public DuplicationCheckKey getDuplicateCheckKey() {
        return duplicateCheckKey;
    }

    public List<Payload> getPayload() {
        return payload;
    }

    /**
     * @return the priority
     */
    public int getPriority() {
        return priority;
    }

    /**
     * @param priority
     *            the priority to set
     */
    public void setPriority(int priority) {
        this.priority = priority;
    }

    /**
     * @return the categories
     */
    public List<String> getCategories() {
        return categories;
    }

    /**
     * @param categories
     *            the categories to set
     */
    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

}
