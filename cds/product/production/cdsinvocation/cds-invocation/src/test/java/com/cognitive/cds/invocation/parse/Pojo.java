/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cognitive.cds.invocation.parse;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;

public class Pojo {

    String id;
    Object json;

    public Pojo() {
    }

    public Pojo(String id, String json) {
        this.id = id;
        this.json = json;
    }

    @JsonRawValue
    public String getJson() {
        // default raw value: null or "[]"
        return json == null ? null : json.toString();
    }

    public void setJson(JsonNode node) {
        this.json = node;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
}
