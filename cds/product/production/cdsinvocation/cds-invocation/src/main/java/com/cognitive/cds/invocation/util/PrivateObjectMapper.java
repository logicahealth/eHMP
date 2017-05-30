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

package com.cognitive.cds.invocation.util;

import java.text.DateFormat;

import com.fasterxml.jackson.annotation.JsonTypeInfo.As;
import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.DeserializationConfig;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationConfig;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * Protection wrapper for the ObjectMapped - Prevent reconfiguration on the
 * shared instances
 * 
 * @author jgoodnough
 *
 */
class PrivateObjectMapper extends ObjectMapper {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    protected PrivateObjectMapper() {
        super();
    }

    private boolean locked = false;

    /**
     * Lock down the configuration
     */
    protected void lock() {
        locked = true;
    }

    private void checkLock() {
        if (locked) {
            throw new AttemptToModifyLockedObjectException("Attempt to update a locked ObjectMapper");
        }
    }

    @Override
    public ObjectMapper configure(DeserializationFeature f, boolean state) {
        checkLock();
        return super.configure(f, state);
    }

    @Override
    public ObjectMapper configure(Feature f, boolean state) {
        checkLock();
        return super.configure(f, state);
    }

    @Override
    public ObjectMapper configure(com.fasterxml.jackson.core.JsonGenerator.Feature f, boolean state) {
        checkLock();
        return super.configure(f, state);
    }

    @Override
    public ObjectMapper configure(MapperFeature f, boolean state) {
        checkLock();
        return super.configure(f, state);
    }

    @Override
    public ObjectMapper configure(SerializationFeature f, boolean state) {
        checkLock();
        return super.configure(f, state);
    }

    @Override
    public ObjectMapper disable(DeserializationFeature first, DeserializationFeature... f) {
        checkLock();
        return super.disable(first, f);
    }

    @Override
    public ObjectMapper disable(DeserializationFeature feature) {
        checkLock();
        return super.disable(feature);
    }

    @Override
    public ObjectMapper disable(Feature... arg0) {
        checkLock();
        return super.disable(arg0);
    }

    @Override
    public ObjectMapper disable(com.fasterxml.jackson.core.JsonGenerator.Feature... arg0) {
        checkLock();
        return super.disable(arg0);
    }

    @Override
    public ObjectMapper disable(MapperFeature... f) {
        checkLock();
        return super.disable(f);
    }

    @Override
    public ObjectMapper disable(SerializationFeature first, SerializationFeature... f) {
        checkLock();
        return super.disable(first, f);
    }

    @Override
    public ObjectMapper disable(SerializationFeature f) {
        checkLock();
        return super.disable(f);
    }

    @Override
    public ObjectMapper disableDefaultTyping() {
        checkLock();// TODO Auto-generated method stub
        return super.disableDefaultTyping();
    }

    @Override
    public ObjectMapper enable(DeserializationFeature first, DeserializationFeature... f) {
        checkLock();
        return super.enable(first, f);
    }

    @Override
    public ObjectMapper enable(DeserializationFeature feature) {
        checkLock();
        return super.enable(feature);
    }

    @Override
    public ObjectMapper enable(Feature... arg0) {
        checkLock();
        return super.enable(arg0);
    }

    @Override
    public ObjectMapper enable(com.fasterxml.jackson.core.JsonGenerator.Feature... arg0) {
        checkLock();
        return super.enable(arg0);
    }

    @Override
    public ObjectMapper enable(MapperFeature... f) {
        checkLock();
        return super.enable(f);
    }

    @Override
    public ObjectMapper enable(SerializationFeature first, SerializationFeature... f) {
        checkLock();
        return super.enable(first, f);
    }

    @Override
    public ObjectMapper enable(SerializationFeature f) {
        checkLock();
        return super.enable(f);
    }

    @Override
    public ObjectMapper enableDefaultTyping() {
        checkLock();
        return super.enableDefaultTyping();
    }

    @Override
    public ObjectMapper enableDefaultTyping(DefaultTyping applicability, As includeAs) {
        checkLock();
        return super.enableDefaultTyping(applicability, includeAs);
    }

    @Override
    public ObjectMapper enableDefaultTyping(DefaultTyping dti) {
        checkLock();
        return super.enableDefaultTyping(dti);
    }

    @Override
    public ObjectMapper enableDefaultTypingAsProperty(DefaultTyping applicability, String propertyName) {
        checkLock();
        return super.enableDefaultTypingAsProperty(applicability, propertyName);
    }

    @Override
    public ObjectMapper setConfig(DeserializationConfig config) {
        checkLock();
        return super.setConfig(config);
    }

    @Override
    public ObjectMapper setConfig(SerializationConfig config) {
        checkLock();
        return super.setConfig(config);
    }

    @Override
    public ObjectMapper setDateFormat(DateFormat dateFormat) {
        checkLock();
        return super.setDateFormat(dateFormat);
    }

    protected class AttemptToModifyLockedObjectException extends RuntimeException {
        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        AttemptToModifyLockedObjectException(String msg) {
            super(msg);
        }
    }
}
