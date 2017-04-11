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
package com.cognitivemedicine.metricsservice.model.authentication;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Response object for authorization request
 * 
 * @author sschechter
 *
 */
public class AuthResponse implements Serializable {

    private boolean disabled;
    private boolean divisionSelect;
    private Map<String, String> duz;
    private String facility;
    private String firstname;
    private String lastname;
    private List<String> permissions;
    private List<Pcmm> pcmm;
    private boolean requiresReset;
    private String section;
    private String site;
    private String title;
    private boolean provider;

    public boolean isDisabled() {
        return disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }

    public boolean isDivisionSelect() {
        return divisionSelect;
    }

    public void setDivisionSelect(boolean divisionSelect) {
        this.divisionSelect = divisionSelect;
    }

    public Map<String, String> getDuz() {
        return duz;
    }

    public void setDuz(Map<String, String> duz) {
        this.duz = duz;
    }

    public String getFacility() {
        return facility;
    }

    public void setFacility(String facility) {
        this.facility = facility;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public List<Pcmm> getPcmm() {
        return pcmm;
    }

    public void setPcmm(List<Pcmm> pcmm) {
        this.pcmm = pcmm;
    }

    public boolean isRequiresReset() {
        return requiresReset;
    }

    public void setRequiresReset(boolean requiresReset) {
        this.requiresReset = requiresReset;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isProvider() {
        return provider;
    }

    public void setProvider(boolean provider) {
        this.provider = provider;
    }
}
