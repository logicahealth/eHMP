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
package com.cognitivemedicine.metricsservice.model;

import java.io.Serializable;

/**
 * Contains parameter information needed to query for a /metric
 * 
 * @author sschechter
 *
 */
public class MetaDefinition implements Serializable {
    private String name;
    private String origin;
    private String methodName;
    private String invocationType;
    private String definitionId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public String getInvocationType() {
        return invocationType;
    }

    public void setInvocationType(String invocationType) {
        this.invocationType = invocationType;
    }

    public String getDefinitionId() {
        return definitionId;
    }

    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    @Override
    public String toString() {
        StringBuilder b = new StringBuilder();
        b.append(name);
        if (origin != null) {
            b.append(" - " + origin);
        }
        if (invocationType != null) {
            b.append(" - " + invocationType);
        }
        b.append(" - " + methodName);
        return b.toString();
    }

    public String toString(boolean showName) {
        if (showName) {
            return toString();
        } else {
            StringBuilder b = new StringBuilder();
            if (origin != null) {
                if (b.length() != 0) {
                    b.append(" - " + origin);
                } else {
                    b.append(origin);
                }
            }
            if (invocationType != null) {
                if (b.length() != 0) {
                    b.append(" - " + invocationType);
                } else {
                    b.append(invocationType);
                }
            }
            if (b.length() != 0) {
                b.append(" - " + methodName);
            } else {
                b.append(methodName);
            }
            return b.toString();
        }
    }

    public MetaDefinition copy() {
        MetaDefinition m = new MetaDefinition();
        m.setDefinitionId(this.getDefinitionId());
        m.setInvocationType(this.getInvocationType());
        m.setMethodName(this.getMethodName());
        m.setName(this.getName());
        m.setOrigin(this.getOrigin());
        return m;
    }
}
