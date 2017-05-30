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
import java.util.List;

import org.springframework.beans.factory.annotation.Required;

import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.core.JsonProcessingException;

/**
 * The ExecutionRequest class is used to define the essential qualities of
 * reasoning job against a set of subjects. This object binds the invocation
 * target information, the based context for execution, and the list of subject
 * to execute the request against.
 * 
 * In essence this class specifies the parameters required to class the invoke
 * method for the CDSInvocationIFace
 * 
 * @see com.cognitive.cds.invocation.CDSInvocationIFace
 * 
 *      In the future this class might be extended to include specific
 *      properties and a supplemental data model.
 * 
 * @author jgoodnough
 *
 */
public class ExecutionRequest {
	private Context baseContext;
	private String jobId;
	private List<String> subjectIds = new ArrayList<>();
	private List<SubjectListReference> subjectListReferences;
	private InvocationTarget target;

	/**
	 * Defines the initial context used for all requests in the job. The actual
	 * execution context is this context combined with context specific to the
	 * subject being evaluated. Information in the baseContext includes the user
	 * on which behalf the job is run, the clinical context etc... See the
	 * general invocation framework Context object for more details.
	 * 
	 * @see
	 * @return the baseContext
	 */
	public Context getBaseContext() {
		return baseContext;
	}

	/**
	 * The Id of the job
	 * 
	 * @return the jobId
	 */
	public String getJobId() {
		return jobId;
	}

	/**
	 * List of subjects (e.g. patients) to evaluate. Either this member or the
	 * subListReferences should be present Specifying both is allowed
	 * 
	 * @return the subjects
	 */
	public List<String> getSubjectIds() {
		return subjectIds;
	}

	/**
	 * List of Subject List to evaluate. Either this member of the subjectIds
	 * should have contents
	 * 
	 * @return the subjectListReferences
	 */
	public List<SubjectListReference> getSubjectListReferences() {
		return subjectListReferences;
	}

	/**
	 * A Standard invocation target that specifies the intent of the reasoning
	 * invocation. This is the standard structure from the invocation framework
	 * and includes list of intents to reason over, the type of execution, and
	 * the mode of execution, as well as supplemental rules mappings.
	 * 
	 * @return the target
	 */
	public InvocationTarget getTarget() {
		return target;
	}

	/**
	 * Defines the initial context used for all requests in the job.
	 * 
	 * @param baseContext
	 *            the baseContext to set
	 */
	@Required
	public void setBaseContext(Context baseContext) {
		this.baseContext = baseContext;
	}

	/**
	 * An optional identifier for a job
	 * 
	 * @param jobId
	 *            the jobId to set
	 */
	public void setJobId(String jobId) {
		this.jobId = jobId;
	}

	/**
	 * List of subject to evaluate. Either this member or the subListReferences
	 * should be present Specifying both is allowed
	 * 
	 * @param subjects
	 *            the subjects to set
	 */
	public void setSubjectIds(List<String> subjectIds) {
		this.subjectIds = subjectIds;
	}

	/**
	 * List of Subject List to evaluate. Either this member of the subjectIds
	 * should have contents. This is a list of list identifiers for that can be
	 * looked by the correct subject type list resolver. For example a list of
	 * patients lists to look up.
	 * 
	 * @param subjectListReferences
	 *            the subjectListReferences to set
	 */
	public void setSubjectListReferences(
	        List<SubjectListReference> subjectListReferences) {
		this.subjectListReferences = subjectListReferences;
	}

	/**
	 * A Standard invocation target that specifies the intent of the reasoning
	 * invocation. This is the standard structure from the invocation framework
	 * and includes list of intents to reason over, the type of execution, and
	 * the mode of execution, as well as supplemental rules mappings.
	 * 
	 * @param target
	 *            the target to set
	 */
	@Required
	public void setTarget(InvocationTarget target) {
		this.target = target;
	}

	/**
	 * Get the JSON representation of this call metric
	 * 
	 * @return JSON representation of Metric
	 * @throws JsonProcessingException
	 */
	public String toJsonString() throws JsonProcessingException {
		return JsonUtils.toJsonString(this);
	}
}
