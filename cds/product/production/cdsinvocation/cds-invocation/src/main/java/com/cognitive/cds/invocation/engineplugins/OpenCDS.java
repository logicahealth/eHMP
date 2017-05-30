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
package com.cognitive.cds.invocation.engineplugins;

import java.io.IOException;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.namespace.QName;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

//import org.codehaus.jackson.JsonNode;
//import org.codehaus.jackson.map.ObjectMapper;
import org.omg.dss.DSSRuntimeExceptionFault;
import org.omg.dss.DecisionSupportService;
import org.omg.dss.Evaluation;
import org.omg.dss.EvaluationExceptionFault;
import org.omg.dss.InvalidDriDataFormatExceptionFault;
import org.omg.dss.InvalidTimeZoneOffsetExceptionFault;
import org.omg.dss.RequiredDataNotProvidedExceptionFault;
import org.omg.dss.UnrecognizedLanguageExceptionFault;
import org.omg.dss.UnrecognizedScopedEntityExceptionFault;
import org.omg.dss.UnsupportedLanguageExceptionFault;
import org.omg.dss.common.EntityIdentifier;
import org.omg.dss.common.InteractionIdentifier;
import org.omg.dss.common.ItemIdentifier;
import org.omg.dss.common.SemanticPayload;
import org.omg.dss.evaluation.Evaluate;
import org.omg.dss.evaluation.EvaluateResponse;
import org.omg.dss.evaluation.requestresponse.DataRequirementItemData;
import org.omg.dss.evaluation.requestresponse.EvaluationRequest;
import org.omg.dss.evaluation.requestresponse.KMEvaluationRequest;
import org.opencds.vmr.v1_0.schema.CD;
import org.opencds.vmr.v1_0.schema.CDSInput;
import org.opencds.vmr.v1_0.schema.CDSOutput;
import org.opencds.vmr.v1_0.schema.EncounterEvent;
import org.opencds.vmr.v1_0.schema.EvaluatedPerson;
import org.opencds.vmr.v1_0.schema.EvaluatedPerson.ClinicalStatements.EncounterEvents;
import org.opencds.vmr.v1_0.schema.EvaluatedPerson.Demographics;
import org.opencds.vmr.v1_0.schema.II;
import org.opencds.vmr.v1_0.schema.IVLTS;
import org.opencds.vmr.v1_0.schema.TS;
import org.opencds.vmr.v1_0.schema.VMR;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.CDSEnginePlugInIFace;
import com.cognitive.cds.invocation.EngineInstanceStateManagementIFace;
import com.cognitive.cds.invocation.ProjectProperties;
import com.cognitive.cds.invocation.model.EngineInstanceState;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.model.StatusCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Main OpenCDS Call Plug in
 *
 * @author Tadessa Sefer, Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 *
 * Todos:
 *
 * 1) Check Error Handling 2) Update for instance pooling - Allow the configuration include multiple endpoints
 *
 */
public class OpenCDS implements CDSEnginePlugInIFace {

	private static final Logger logger = LoggerFactory.getLogger(OpenCDS.class);

	private static final QName SERVICE_NAME = new QName(
		"http://www.omg.org/spec/CDSS/201105/dssWsdl",
		"DecisionSupportService");
	public static final String OPEN_CDS = "openCDS";

	// Common Property Keys used by Rules configuration for OpenCDS
	public static final String KEY_RULE_SCOPING_ENTITY_ID = "scopingEntityId";
	public static final String KEY_RULE_BUSINESS_ID = "businessId";
	public static final String KEY_RULE_VERSION = "version";

	public static final String KEY_INFO_MODEL_VERSION = "INFO_MODEL_VERSION";
	public static final String KEY_INFO_MODEL_BUSINESS_ID = "INFO_MODEL_BUSINESS_ID";
	public static final String KEY_INFO_MODEL_ENTITY_ID = "INFO_MODEL_ENTITY_ID";

    // Default the Model to FHIR unless otherwise configured by the Rule or Engine
	private String defaultModelScopingEntityId = "org.opencds.fhir";
	private String defaultModelBusinessId = "FHIR";
	private String defaultModelVersion = "1.0";
	private final String type = "OpenCDS";

	private String endPoint;
	
	/**
	 * Connection Timeout in milliseconds
	 */
	private int connectionTimeout = 2000;
	
	/**
	 * Variables only used in test code below...
	 */
	private static final String INPUT_ID_ROOT = "2.16.840.1.113883.3.1829.11.1.1.1";
	private static final String TEMPLATE_ID_ROOT = "2.16.840.1.113883.3.1829.11.1.2.1";
	private static final String ROOT_ID = "2.16.840.1.113883.3.348.61.7";
	private static final String ROOT_EXTENSION = "100104";
	private static final String GENDER_CODE_SYSTEM = "2.16.840.1.113883.1.11.1";
	private static final String EVENT_TIME = "20100602101010";
	private static final String CONCEPT_CODE = "2.16.840.1.113883.1.11.1";

	public OpenCDS() {
	}

	@Override
	public void finalize() throws Throwable {
	}

	@Override
	public void introduceData() {
	}

	@Override
	public ResultBundle invokeRaw(List<Rule> rules, Object data, String callId,
		EngineInstanceStateManagementIFace eism) {
		ResultBundle resultBundle;
		if (data instanceof String) {
			resultBundle = this.invoke(rules, (String) data, callId, eism);
		} else {
			resultBundle = new ResultBundle();
			resultBundle.setFaultInfo(new ArrayList<FaultInfo>());
			resultBundle.setStatus(StatusCode.USE_NOT_RECOGNIZED);

			// FUTURE: Implement raw mode OpenCDS serialization
		}
		return resultBundle;
	}

	/**
	 *
	 * @param engineInstanceState
	 * @return String url representing the provided engineInstanceState, or null in the event that the
	 * engineInstanceState is null.
	 */
	public String buildOpenCDSEndpointUrl(EngineInstanceState engineInstanceState) {

		if (engineInstanceState == null) {
			return null;
		}

		//example: http://IP            /opencds-decision-support-service
		StringBuilder sb = new StringBuilder("http://");
		sb.append(engineInstanceState.getHost() + ":");
		sb.append(engineInstanceState.getPort() + "/opencds-decision-support-service");

		logger.debug("endpoint looked up from (test) registry: " + sb.toString());

		return sb.toString();
	}

	/**
	 *
	 * @return an EngineInstanceState from the list of active engine instance states of this type, or null if there are
	 * none.
	 */
	public EngineInstanceState getEngineInstance(EngineInstanceStateManagementIFace eism) {
		logger.debug("in getEngineInstance()...");
		//get our list and pick one at random
		List<EngineInstanceState> engineInstanceStates = eism.getActiveEngineInstancesByType(type);

        //FUTURE:  use a more legitmate load balancing scheme
		//FUTURE:  do we want to add more elements of data to the state or make other config options?  protocol, url, etc.
		int index = (int) (Math.random() * engineInstanceStates.size());
		logger.debug("selected index of engine type " + type + ": " + index);

		if (engineInstanceStates.size() > 0) {
			return engineInstanceStates.get(index);
		} else {
			//if we have no engines that match the required type - return null.
			return null;
		}
	}

	public boolean updateEngineInstanceState(
		EngineInstanceStateManagementIFace eism, EngineInstanceState engineInstanceState) {
		logger.debug("in updateEngineInstanceState...");
		return eism.updateEngineInstanceState(engineInstanceState);

	}

	/**
	 * Invoke a OpenCDS rules engine
	 *
	 * @param rules
	 * @param data Based64 Encoded Blob
	 * @param callId
	 * @return A Result Bundle of decode results
	 */
	@Override
	public ResultBundle invoke(List<Rule> rules, String data, String callId, EngineInstanceStateManagementIFace eism) {
		logger.debug("in invoke(...)");

		ResultBundle resultBundle = new ResultBundle();
		List<FaultInfo> faultList = new ArrayList<>();
		StatusCode status = StatusCode.SUCCESS;

		String theEndPoint = null;

		URL wsdl = null;
		DecisionSupportService opencdsService = null;
		Evaluation evaluationPort = null;
		EngineInstanceState eis = null;

		//if an engine endpoint was provided via config, use it.  Otherwise, use registry.
		if (endPoint != null) {
			theEndPoint = endPoint;
			logger.debug("endpoint provided by config file: " + endPoint);
		} else {
			if (eism != null) { //if we don't have this either, let theEndPoint stay null.
				eis = getEngineInstance(eism);
				theEndPoint = buildOpenCDSEndpointUrl(eis);
				logger.debug("endpoint provided by engine registry: " + endPoint);
			}
		}

		if (opencdsService == null && theEndPoint != null) {
			boolean success = false;
            //FUTURE:  in the event of an extremely unlikely edge case it might 
			//be good to put a max retry count on loops like the one below.

			//do/while - try to get a working connection as long as we have connections left to try.
			do {
				try {
					URL url = new URL(theEndPoint);
					logger.debug("attempting to contact endpoint: " + theEndPoint);
					HttpURLConnection conn = (HttpURLConnection) url.openConnection();
					conn.setConnectTimeout(connectionTimeout);
					conn.connect();
					if (conn.getResponseCode() == 200) {
						wsdl = new URL(theEndPoint + "/evaluate?wsdl");
						opencdsService = new DecisionSupportService(wsdl, SERVICE_NAME);
						evaluationPort = opencdsService.getEvaluate();
					}
					success = true;

				} catch (Exception e) {
					logger.error("Error openning connection", e);
					theEndPoint = null; // using this to break the loop unless we have more.
					if (eis != null) { //if we're using the dynamic registry...
						eis.setStatus(false);
						updateEngineInstanceState(eism, eis);
						eis = getEngineInstance(eism);
						theEndPoint = buildOpenCDSEndpointUrl(eis);
					}
				}
				//if we don't succeed, try to get another one and go again if possible.
			} while (theEndPoint != null && !success);
			logger.debug("Retry loop completed.  Success:" + success);
		}

		if (wsdl == null || opencdsService == null) {
			FaultInfo fault = new FaultInfo();
			status = StatusCode.RULES_ENGINE_NOT_AVAILABLE;
			fault.setFault(InvocationConstants.StatusCodes.RULES_ENGINE_NOT_AVAILABLE.getMessage() + " " + theEndPoint);
			faultList.add(fault);
			resultBundle.setFaultInfo(faultList);
			resultBundle.setStatus(status);
			return resultBundle;
		}

		if (rules == null || rules.isEmpty()) {
			FaultInfo fault = new FaultInfo();
			status = StatusCode.GENERAL_RULES_FAILURE;
			fault.setFault(InvocationConstants.StatusCodes.GENERAL_RULES_FAILURE
				.getMessage()
				+ ", "
				+ InvocationConstants.NO_RULE_CONFIGURED);
			faultList.add(fault);
			resultBundle.setFaultInfo(faultList);
			resultBundle.setStatus(status);
			return resultBundle;
		}
		for (Iterator<Rule> iterator = rules.iterator(); iterator.hasNext();) {
			Rule rule = iterator.next();
			InteractionIdentifier interactionId = new InteractionIdentifier();
			EvaluationRequest evaluationRequest = new EvaluationRequest();

			interactionId.setInteractionId(callId);
			interactionId.setScopingEntityId(callId);

			evaluationRequest.setClientLanguage("");
			evaluationRequest.setClientTimeZoneOffset("");

			KMEvaluationRequest kmEvalRequst = new KMEvaluationRequest();

			kmEvalRequst.setKmId(new EntityIdentifier());
			Properties ruleProps = rule.getProperties();

			// FUTURE Implement Rule Defaults
			kmEvalRequst.getKmId().setScopingEntityId(ruleProps.getProperty(KEY_RULE_SCOPING_ENTITY_ID));
			kmEvalRequst.getKmId().setBusinessId(ruleProps.getProperty(KEY_RULE_BUSINESS_ID));
			kmEvalRequst.getKmId().setVersion(ruleProps.getProperty(KEY_RULE_VERSION));
			evaluationRequest.getKmEvaluationRequest().add(kmEvalRequst);

			DataRequirementItemData itemData = new DataRequirementItemData();
			itemData.setDriId(new ItemIdentifier());
			itemData.getDriId().setItemId(rule.getId());

			itemData.getDriId().setContainingEntityId(new EntityIdentifier());
			itemData.getDriId().getContainingEntityId().setScopingEntityId(
				ruleProps.getProperty(KEY_RULE_SCOPING_ENTITY_ID));
			itemData.getDriId().getContainingEntityId().setBusinessId(ruleProps.getProperty(KEY_RULE_BUSINESS_ID));
			itemData.getDriId().getContainingEntityId().setVersion(ruleProps.getProperty(KEY_RULE_VERSION));
			SemanticPayload payload = new SemanticPayload();

			EntityIdentifier ei = new EntityIdentifier();
			ei.setScopingEntityId(rule.getProperties().getProperty(KEY_INFO_MODEL_ENTITY_ID, defaultModelScopingEntityId));
			ei.setBusinessId(rule.getProperties().getProperty(KEY_INFO_MODEL_BUSINESS_ID, defaultModelBusinessId));
			ei.setVersion(rule.getProperties().getProperty(KEY_INFO_MODEL_VERSION, defaultModelVersion));
			payload.setInformationModelSSId(ei);

			itemData.setData(payload);

            // Next three lines disabled and replaced by the simple
			// data.getBytes - I think it is equivalent
			// byte[] encoded = null;
			// encoded = Base64.encode(data.getBytes());
			// byte[] decoded = Base64.decode(encoded);
			// System.out.println("OpenCDS Payload = "+data);
			// Payload is assumed to be Base64 Encoded already, we might change
			// this.
			byte[] decoded = data.getBytes();
			itemData.getData().getBase64EncodedPayload().add(decoded);

			evaluationRequest.getDataRequirementItemData().add(itemData);

			Evaluate evaluate = new Evaluate();
			evaluate.setEvaluationRequest(evaluationRequest);
			evaluate.setInteractionId(interactionId);
			String returnDataDecoded = null;
			try {
				EvaluateResponse response = evaluationPort.evaluate(evaluate);
                // FUTURE - Can OpenCDS return multiple response and if so we
				// should handle them
				byte[] returnData = response.getEvaluationResponse()
					.getFinalKMEvaluationResponse().get(0)
					.getKmEvaluationResultData().get(0).getData()
					.getBase64EncodedPayload().get(0);
				returnDataDecoded = new String(returnData);

			} catch (InvalidTimeZoneOffsetExceptionFault e) {
				logger.error("Expected exception: InvalidTimeZoneOffsetExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("InvalidTimeZoneOffsetExceptionFault has occurred");
				faultList.add(fault);
			} catch (EvaluationExceptionFault e) {
				logger.error("Expected exception: EvaluationExceptionFault has occurred. " + e.getMessage());
				status = StatusCode.GENERAL_RULES_FAILURE;
				FaultInfo fault = new FaultInfo();
				fault.setFault(InvocationConstants.StatusCodes.GENERAL_RULES_FAILURE.getMessage());
				faultList.add(fault);
				resultBundle.setStatus(status);
			} catch (InvalidDriDataFormatExceptionFault e) {
				logger.error("Expected exception: InvalidDriDataFormatExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("InvalidDriDataFormatExceptionFault has occurred.");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			} catch (UnrecognizedLanguageExceptionFault e) {
				logger.error("Expected exception: UnrecognizedLanguageExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("UnrecognizedLanguageExceptionFault has occurred.");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			} catch (UnrecognizedScopedEntityExceptionFault e) {
				logger.error("Expected exception: UnrecognizedScopedEntityExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("UnrecognizedScopedEntityExceptionFault has occurred.");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			} catch (DSSRuntimeExceptionFault e) {
				logger.error("Expected exception: DSSRuntimeExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("InvalidTimeZoneOffsetExceptionFault has occurred");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			} catch (UnsupportedLanguageExceptionFault e) {
				logger.error("Expected exception: UnsupportedLanguageExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("UnsupportedLanguageExceptionFault has occurred.");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			} catch (RequiredDataNotProvidedExceptionFault e) {
				logger.error("Expected exception: RequiredDataNotProvidedExceptionFault has occurred.");
				FaultInfo fault = new FaultInfo();
				fault.setFault("RequiredDataNotProvidedExceptionFault has occurred.");
				faultList.add(fault);
				resultBundle.setStatus(StatusCode.GENERAL_RULES_FAILURE);
			}
			if (faultList != null && !faultList.isEmpty()) {
				resultBundle.setFaultInfo(faultList);
				return resultBundle;
			}

			Result result = new Result();
			result.setBody(returnDataDecoded);
			result.setCallId(callId);
			result.setGeneratedBy("OpenCDS");
			List<Result> results = new ArrayList<>();
			results.add(result);
			resultBundle.setResults(results);
		}
		return resultBundle;
	}

	public String getEndPoint() {
		return endPoint;
	}

	public void setEndPoint(String endPoint) {
		if (endPoint.startsWith("@")) {
			this.endPoint = ProjectProperties.getInstance().getProperty(
				endPoint.substring(1));
		} else {
			this.endPoint = endPoint;
		}
	}

	public String getDefaultModelScopingEntityId() {
		return defaultModelScopingEntityId;
	}

	public void setDefaultModelScopingEntityId(
		String defaultModelScopingEntityId) {
		this.defaultModelScopingEntityId = defaultModelScopingEntityId;
	}

	public String getDefaultModelBusinessId() {
		return defaultModelBusinessId;
	}

	public void setDefaultModelBusinessId(String defaultModelBusinessId) {
		this.defaultModelBusinessId = defaultModelBusinessId;
	}

	public String getDefaultModelVersion() {
		return defaultModelVersion;
	}

	public void setDefaultModelVersion(String defaultModelVersion) {
		this.defaultModelVersion = defaultModelVersion;
	}

	public int getConnectionTimeout() {
		return connectionTimeout;
	}

	public void setConnectionTimeout(int connectionTimeout) {
		this.connectionTimeout = connectionTimeout;
	}

	public String jaxbMarshal(CDSInput jaxbObj)
		throws javax.xml.bind.JAXBException, java.io.IOException {
		java.io.StringWriter sw = new java.io.StringWriter();
		javax.xml.bind.JAXBContext jaxbCtx = javax.xml.bind.JAXBContext
			.newInstance(jaxbObj.getClass().getPackage().getName());
		javax.xml.bind.Marshaller marshaller = jaxbCtx.createMarshaller();
		marshaller.setProperty(javax.xml.bind.Marshaller.JAXB_ENCODING, "UTF-8");

		marshaller.setProperty(javax.xml.bind.Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
		marshaller.setProperty(Marshaller.JAXB_FRAGMENT, Boolean.TRUE); // to
		// remove
		// standalone="yes"
		// from
		// the
		// xml
		marshaller.marshal(new JAXBElement<CDSInput>(new QName("", "cdsInput"), CDSInput.class, jaxbObj), sw);
		sw.close();
		return sw.toString();
	}

	/**
	 * This method deserialize the vmr xml string to CDSOutput data model
	 *
	 * @param vmrXml - The VMR xml output coming from OpenCDS
	 * @return CDSoutput data model
	 */
	public CDSOutput unmarshal(String xmlString) {
		CDSOutput output = null;
		try {
			JAXBContext jaxbContext = JAXBContext.newInstance(CDSOutput.class);
			Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
			XMLInputFactory factory = XMLInputFactory.newFactory();

			XMLStreamReader streamReader = factory.createXMLStreamReader(new StringReader(xmlString));
			JAXBElement<CDSOutput> root = jaxbUnmarshaller.unmarshal(streamReader, CDSOutput.class);
			output = root.getValue();
		} catch (XMLStreamException e) {
			logger.error("Couldn't read the cdsoutput xml.");
		} catch (JAXBException e) {
			logger.error("Couldn't unmarshal the cdsoutput xml to CDSOutput object.");
		}
		return output;
	}

	public String parseVprJsonToVmrXml(String json) {
		String vmrXML = null;
		ObjectMapper mapper = new ObjectMapper();

		JsonNode rootNode = null;
		try {
			rootNode = mapper.readTree(json);
		} catch (IOException e) {
			logger.error("Couldn't read the json vpr data.");
		}

		JsonNode dataNode = rootNode.path("data");
		JsonNode itemsNode = dataNode.path("items");
		if (itemsNode != null && itemsNode.has(0)) {
			JsonNode item = itemsNode.get(0);
			String birthDate = item.path("birthDate").asText();
			String gender = item.path("genderCode").asText();
			JsonNode exposureNode = item.path("exposure");
			if (exposureNode.isMissingNode()) {
				vmrXML = marshalToVmrXml("Unknown", birthDate, "" + gender.charAt(gender.length() - 1));
				return vmrXML;
			}
			for (Iterator<JsonNode> iterator = exposureNode.iterator(); iterator.hasNext();) {
				JsonNode exposure = iterator.next();
				String uid = exposure.path("uid").asText();
				// uid: "urn:va:agent-orange:N"
				if (uid.contains("agent-orange")) {
					String name = exposure.path("name").asText();
					if (name != null) {
						vmrXML = marshalToVmrXml(name, birthDate, "" + gender.charAt(gender.length() - 1));
						return vmrXML;
					}
				}
			}
		}
		return vmrXML;
	}
	
	private String marshalToVmrXml(String exposure, String birthTime, String sex) {
		CDSInput input = new CDSInput();
		II inputId = new II();
		inputId.setRoot(INPUT_ID_ROOT);
		input.getTemplateId().add(inputId);

		VMR vmr = new VMR();
		II templateId = new II();
		templateId.setRoot(TEMPLATE_ID_ROOT);
		vmr.getTemplateId().add(templateId);
		EvaluatedPerson patient = new EvaluatedPerson();
		II rootId = new II();
		rootId.setRoot(ROOT_ID);
		rootId.setExtension(ROOT_EXTENSION);
		patient.setId(rootId);
		Demographics dem = new Demographics();
		TS ts = new TS();
		ts.setValue(birthTime);
		dem.setBirthTime(ts);
		CD gender = new CD();
		gender.setCode(sex);
		gender.setCodeSystem(GENDER_CODE_SYSTEM);
		gender.setOriginalText(sex);
		dem.setGender(gender);
		patient.setDemographics(dem);
		EvaluatedPerson.ClinicalStatements statements = new EvaluatedPerson.ClinicalStatements();

		EncounterEvents ees = new EvaluatedPerson.ClinicalStatements.EncounterEvents();
		EncounterEvent ee = new EncounterEvent();
		ee.setId(rootId);
		IVLTS eventTime = new IVLTS();
		eventTime.setLow(EVENT_TIME);
		eventTime.setHigh(EVENT_TIME);
		ee.setEncounterEventTime(eventTime);

		CD concept = new CD();
		concept.setCode(CONCEPT_CODE);
		concept.setCodeSystem("snomed");
		concept.setCodeSystemName("snomed");
		concept.setDisplayName(exposure);
		concept.setOriginalText("agent-orange");
		ee.setEncounterType(concept);
		ees.getEncounterEvent().add(ee);
		statements.setEncounterEvents(ees);

		patient.setClinicalStatements(statements);
		vmr.setPatient(patient);
		input.setVmrInput(vmr);
		String result = null;
		try {
			result = jaxbMarshal(input);
		} catch (JAXBException | IOException e) {
			logger.error("CDSInput couldn't be marshalled to xml.");
		}

		return result;
	}

}
