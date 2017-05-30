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
package com.cognitive.cds.invocation.model;

import java.sql.Timestamp;
import java.util.HashMap;

import com.cognitive.cds.invocation.InvocationType;

/**
 * Metrics information about a specific part of the call sequence
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:40 AM
 */
public class CallMetrics extends Base {

	private String type;
	private String origin;
	private String event;
	private Timestamp time;
	private String invocation;
	private Context context;
	private String callId;
	private int totalResults;
	private InvocationType invocationType = InvocationType.Direct;
	
	public HashMap<String, Long> timings;

	/**
	 * General Constructor with data
	 * 
	 * @param type
	 *            invoke or engine or job
	 * @param origin
	 *            engine name (For engine type)
	 * @param event
	 *            Metrics event type (e.g. begin, end, summary)
	 * @param invocation
	 *            the invocation
	 * @param context
	 *            The context in which the metric was gathered
	 * @param callId
	 *            the call Id
	 * @param t
	 *            the time at which it occurs
	 *            
	 * @param 
	 */
	public CallMetrics(String type, String origin, String event, String invocation, Context context, String callId, Timestamp t, InvocationType invocationType) {
		this.type = type;
		this.setOrigin(origin);
		this.event = event;
		this.invocation = invocation;
		this.context = context;
		this.callId = callId;
		this.time = t;
		this.invocationType=invocationType;
		timings = new HashMap<String, Long>();
	}

	public CallMetrics() {
		timings = new HashMap<String, Long>();

	}

	@Override
	public void finalize() throws Throwable {

	}

	/**
	 * Get the type of metric event, for example: begin, end, summary.
	 * 
	 * @return the type of the metrics event
	 */
	public String getEvent() {
		return event;
	}

	/**
	 * Set the type of event for example: begin, end, summary.
	 * 
	 * @param newVal
	 *            The event type
	 */
	public void setEvent(String newVal) {
		event = newVal;
	}

	/**
	 * Get the time at which the metric was generated
	 * 
	 * @return metric generated time
	 */

	public Timestamp getTime() {
		return time;
	}

	/**
	 * Set the time of the metrics event
	 * 
	 * @param newVal
	 *            time of the metrics event
	 */
	public void setTime(Timestamp newVal) {
		time = newVal;
	}

	/**
	 * Get the invocation string used for the metric
	 * 
	 * @return The invocation string used
	 */
	public String getInvocation() {
		return invocation;
	}

	/**
	 * Get the type of metric  (Invoke or Engine or Job)
	 * 
	 * @return the Type
	 */
	public String getType() {
		return type;
	}

	/**
	 * Set the type of the Metric
	 * 
	 * @param newVal
	 *            the Type
	 */
	public void setType(String newVal) {
		type = newVal;
	}

	/**
	 * Set the invocation used to generate the metric
	 * 
	 * @param newVal
	 *            the invocation string used.
	 */
	public void setInvocation(String newVal) {
		invocation = newVal;
	}

	/**
	 * Get the unique invocation call Id used during the invocation used to
	 * generate this metric
	 * 
	 * @return the call Id
	 */
	public String getCallId() {
		return callId;
	}

	/**
	 * Set the Call Id of the Metric
	 * 
	 * @param newVal
	 *            the Call Id assoicated with the Metric
	 */
	public void setCallId(String newVal) {
		callId = newVal;
	}

	/**
	 * Get the context in which the invocation was made
	 * 
	 * @return The context in which the invocation was made
	 */
	public Context getContext() {
		return context;
	}

	/**
	 * Set the context in which the Metric was generated.
	 * 
	 * @param newVal
	 *            The context
	 * 
	 */
	public void setContext(Context newVal) {
		context = newVal;
	}

	/**
	 * Find the number of results returned - applies only to selected event
	 * type. For example summary events will include this field.
	 * 
	 * @return The number of results returned by the Metric context.
	 */
	public int getTotalResults() {
		return totalResults;
	}

	/**
	 * Set the number of results associated with the metrics context.
	 * 
	 * @param totalResults
	 *            number of individual results in this context.
	 */
	public void setTotalResults(int totalResults) {
		this.totalResults = totalResults;
	}

	/**
	 * Get the Timings map - Used by summary type metrics to expose the
	 * millisecond timings of various stages of the execution. The map is keyed
	 * by the by various summary events:
	 * <dl>
	 * <dt>total</dt>
	 * <dd>The Total time processing</dd>
	 * <dt>inEngines</dt>
	 * <dd>The time spent in the CDS engines</dd>
	 * <dt>callSetup</dt>
	 * <dd>The time required to setup the calls to the CDS engines</dd>
	 * <dt>handlingResults
	 * <dt>
	 * <dd>The time spent processing the results after the engines finish</dd>
	 * </dl>
	 * 
	 * @return
	 */
	public HashMap<String, Long> getTimings() {
		return timings;
	}

	/**
	 * Set the timings of the Metric
	 * 
	 * @param timings
	 *            the new timings
	 */
	public void setTimings(HashMap<String, Long> timings) {
		this.timings = timings;
	}


	/**
	 * Get the type of invocation (Direct or Background)
	 * @return
	 */
	public InvocationType getInvocationType() {
		return invocationType;
	}

	/**
	 * 
	 * @param invocationType
	 */
	public void setInvocationType(InvocationType invocationType) {
		this.invocationType = invocationType;
	}

	/**
	 * @return the origin
	 */
	public String getOrigin() {
		return origin;
	}

	/**
	 * @param origin the origin to set
	 */
	public void setOrigin(String origin) {
		this.origin = origin;
	}


}
