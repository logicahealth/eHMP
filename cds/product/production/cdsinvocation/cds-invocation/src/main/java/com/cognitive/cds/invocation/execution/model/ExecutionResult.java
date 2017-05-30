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
package com.cognitive.cds.invocation.execution.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.cognitive.cds.invocation.model.StatusCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Object to hold the resulting info about a job execution.
 * 
 * @author jgoodnough
 *
 */
public class ExecutionResult {
    private StatusCode status;
    private int totalSubjectsProcessed;
    private int totalResults;
    private long totalRuntme;
    private List<ExecutionFault> faults;
    private Date startTime;
    private Date endTime;

    public ExecutionResult() {
        status = StatusCode.SUCCESS;
        setFaults(new ArrayList<ExecutionFault>());
    }

    /**
     * @return the status
     */
    public StatusCode getStatus() {
        return status;
    }

    /**
     * @param status
     *            the status to set
     */
    public void setStatus(StatusCode status) {
        this.status = status;
    }

    /**
     * @return the totalResults
     */
    public int getTotalResults() {
        return totalResults;
    }

    /**
     * @param totalResults
     *            the totalResults to set
     */
    public void setTotalResults(int totalResults) {
        this.totalResults = totalResults;
    }

    /**
     * @return the faults
     */
    public List<ExecutionFault> getFaults() {
        return faults;
    }

    /**
     * @param faults
     *            the faults to set
     */
    public void setFaults(List<ExecutionFault> faults) {
        this.faults = faults;
    }

    /**
     * @return the totalSubjectsProcessed
     */
    public int getTotalSubjectsProcessed() {
        return totalSubjectsProcessed;
    }

    /**
     * @param totalSubjectsProcessed
     *            the totalSubjectsProcessed to set
     */
    public void setTotalSubjectsProcessed(int totalSubjectsProcessed) {
        this.totalSubjectsProcessed = totalSubjectsProcessed;
    }

    /**
     * @return the totalRuntme
     */
    public long getTotalRuntme() {
        return totalRuntme;
    }

    /**
     * @param totalRuntme
     *            the totalRuntme to set
     */
    public void setTotalRuntme(long totalRuntme) {
        this.totalRuntme = totalRuntme;
    }

    public Date getStartTime() {
        return startTime;
    }

    /**
     * 
     * @param startTime
     */
    @JsonIgnore
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    @JsonProperty("startTime")
    public void setStartTimeDate(Double startTime) {
        this.startTime = new Date(startTime.longValue());
    }

    /**
     * 
     * @return
     */
    public Date getEndTime() {
        return endTime;
    }

    /**
     * 
     * @param endTime
     */
    @JsonIgnore
    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    @JsonProperty("endTime")
    public void setEndTimeDate(Double endTime) {
        this.endTime = new Date(endTime.longValue());
    }

}
