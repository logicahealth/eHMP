/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.cognitive.cds.invocation.parse;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class PojoWrapper {

    String wrapperId;
    List<Pojo> pojo;
    
    @JsonIgnore  //This annotation will allow this attribute to NOT be serialized
    String comment;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public PojoWrapper() {
        
		this.pojo = new LinkedList<Pojo>();
    }

    public PojoWrapper(String wrapperId) {
        this.wrapperId = wrapperId;
    }

	public List<Pojo> getPojo() {
		return pojo;
	}

	public void setPojo(List<Pojo> pojo) {
		this.pojo = pojo;
	}
//    public Pojo getPojo() {
//        return pojo;
//    }
//
//    public void setPojo(Pojo pojo) {
//        this.pojo = pojo;
//    }

    public String getWrapperId() {
        return wrapperId;
    }

    public void setWrapperId(String wrapperId) {
        this.wrapperId = wrapperId;
    }

}
