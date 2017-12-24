/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.services.cdsexecution;

import java.util.ArrayList;

import com.cognitive.cds.invocation.engineplugins.ResultBuilderIFace;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.StatusCode;

public class MockResultsBundle implements ResultBuilderIFace {

	@Override
	public ResultBundle build() {
		String out = "{\"resourceType\":\"Bundle\",\"entry\":[{\"resource\":{\"resourceType\":\"CommunicationRequest\",\"payload\":[{\"contentString\":\"The risk of heart disease increases for men after age 45. This is a FHIR rule.\"}]}},{\"resource\":{\"resourceType\":\"Patient\",\"extension\":[{\"url\":\"http://vistacore.us/fhir/profiles/@main#service-connected\",\"valueCoding\":{\"code\":\"Y\",\"display\":\"Service Connected\"}},{\"url\":\"http://vistacore.us/fhir/profiles/@main#sensitive\",\"valueBoolean\":false},{\"url\":\"http://vistacore.us/fhir/profiles/@main#religion\",\"valueCoding\":{\"code\":\"urn:va:pat-religion:29\",\"display\":\"UNKNOWN/NO PREFERENCE\"}},{\"url\":\"http://vistacore.us/fhir/profiles/@main#service-connected-percent\",\"valueQuantity\":{\"value\":0,\"units\":\"%\"}}],\"text\":{\"status\":\"generated\",\"div\":\"<div>SEVEN,PATIENT. SSN: 666000007</div>\"},\"contained\":[{\"resourceType\":\"Organization\",\"id\":\"284160c8-2d58-448e-d082-fc88044e3f55\",\"identifier\":[{\"label\":\"facility-code\",\"value\":\"998\"}],\"name\":\"ABILENE (CAA)\"}],\"identifier\":[{\"use\":\"official\",\"label\":\"ssn\",\"system\":\"http://hl7.org/fhir/sid/us-ssn\",\"value\":\"666000007\"},{\"label\":\"uid\",\"system\":\"http://vistacore.us/fhir/id/uid\",\"value\":\"urn:va:patient:SITE:253:253\"},{\"label\":\"dfn\",\"system\":\"http://vistacore.us/fhir/id/dfn\",\"value\":\"253\"},{\"label\":\"pid\",\"system\":\"http://vistacore.us/fhir/id/pid\",\"value\":\"SITE;253\"},{\"label\":\"lrdfn\",\"system\":\"http://vistacore.us/fhir/id/lrdfn\",\"value\":\"394\"},{\"label\":\"icn\",\"system\":\"http://vistacore.us/fhir/id/icn\",\"value\":\"10107V395912\"}],\"name\":[{\"use\":\"official\",\"text\":\"SEVEN,PATIENT\",\"family\":[\"SEVEN\"],\"given\":[\"PATIENT\"]}],\"telecom\":[{\"system\":\"phone\",\"value\":\"(222)555-8235\",\"use\":\"home\"},{\"system\":\"phone\",\"value\":\"(222)555-7720\",\"use\":\"work\"}],\"gender\":\"male\",\"birthDate\":\"1935-04-07\",\"address\":[{\"line\":[\"Any Street\"],\"city\":\"Any Town\",\"state\":\"WV\"}],\"maritalStatus\":{\"coding\":[{\"system\":\"http://hl7.org/fhir/v3/MaritalStatus\",\"code\":\"UNK\",\"display\":\"unknown\"}]},\"contact\":[{\"relationship\":[{\"coding\":[{\"system\":\"http://hl7.org/fhir/patient-contact-relationship\",\"code\":\"family\",\"display\":\"Next of Kin\"}],\"text\":\"Next of Kin\"}],\"name\":{\"use\":\"usual\",\"text\":\"VETERAN,BROTHER\"}}],\"managingOrganization\":{\"reference\":\"#284160c8-2d58-448e-d082-fc88044e3f55\"}}}]}";
		ResultBundle bundle = new ResultBundle();
		ArrayList<Result> results = new ArrayList<>();
		Result r1 = new Result();
		r1.setGeneratedBy("OpenCDS");
		r1.setTitle("");
		r1.setProvenance("");
		r1.setBody(out);
		r1.setCallId("Provided By Engine and Invocataion - This should never be seen in a result");
		r1.setType(InvocationConstants.ADVICE);
		results.add(r1);
		bundle.setResults(results);
		bundle.setStatus(StatusCode.SUCCESS);
		return bundle;
	}

}
