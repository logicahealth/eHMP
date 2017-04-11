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
package com.cognitive.cds.invocation;

import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.dstu2.resource.ValueSet;

import com.cognitive.cds.invocation.crs.CRSResolver;
import com.cognitive.cds.invocation.crs.model.LabSparqlResults;
import com.cognitive.cds.invocation.crs.model.orderables.LabOrderableSparqlResult;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.exceptions.DataValidationException;
import com.cognitive.cds.invocation.execution.model.Coding;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisite;
import com.cognitive.cds.invocation.execution.model.ConsultPrerequisites;
import com.cognitive.cds.invocation.execution.model.Prerequisite;
import com.cognitive.cds.invocation.execution.model.Remediation;
import com.cognitive.cds.invocation.model.CallMetrics;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.EngineInfo;
import com.cognitive.cds.invocation.model.FaultInfo;
import com.cognitive.cds.invocation.model.Future;
import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.InvocationConstants.StatusCodes;
import com.cognitive.cds.invocation.model.InvocationMapping;
import com.cognitive.cds.invocation.model.InvocationTarget;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.model.StatusCode;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Core implementation of the CDSInvocationIFace.
 *
 * @see CDSInvocationIFace
 *
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:40 AM
 */
public class CDSInvoker implements CDSInvocationIFace {

	private static final Logger LOGGER = LoggerFactory.getLogger(CDSInvoker.class);

    // Configuration Variables
	// Defined in the beans
	private Map<String, EngineInfo> enginesMap;
	private Map<String, IntentMapping> intentsMap;

	private List<CDSMetricsIFace> metricCollectors;
	private RepositoryLookupIFace repositoryLookupAgent;

	private DataModelHandlerIFace defaultDataModelHandler;

	private String dataModelHandlerBeanName;
    private CRSResolver crsResolver;

	@Autowired
	private ApplicationContext springCtx;

	/**
	 * This is technically still optional since we could provide the engine url via the setter. If the setter is not
	 * used, then it's assumed that we should try to use the EngineInstanceStateManager.
	 */
	@Autowired(required = false)
	private EngineInstanceStateManagementIFace eism;

	public CDSInvoker() {

	}

	@PostConstruct
	protected void initalize() {
		if (defaultDataModelHandler == null && dataModelHandlerBeanName != null && !dataModelHandlerBeanName.isEmpty()) {
			defaultDataModelHandler = (DataModelHandlerIFace) springCtx.getBean(dataModelHandlerBeanName);
		}
	}

	/**
	 * Get a unique call Id for this request. This Id should be used to tied together results and metrics.
	 *
	 * @return A unique call Id
	 */
	protected String generateCallId() {
		java.util.UUID uuid = java.util.UUID.randomUUID();

		return uuid.toString();
	}

	/**
	 * Synchronous invocation of rules processing.
	 *
	 * @param invocationTarget Structure describing what should be invoked
	 * @param context The Context in which the execution occurs
	 * @param parameters Supplemental data parameters specific to the call
	 * @param dataModel The Data model to pass in to the reasoning model.
	 *
	 * Todo:
	 *
	 * 1) Investigate the changing the dataModel to Object or Serializable
	 *
	 */
	@Override
	public ResultBundle invoke(InvocationTarget invocationTarget, Context context, Properties parameters, Object inputDataModel) {

		String serializedDataModel = "";

		// Initialize the results bundle
		ResultBundle resultBundle = new ResultBundle();
		//ResultBundle newResultBundle = new ResultBundle(); // final resultbundle to send out.
		StatusCode status = StatusCode.SUCCESS;
		List<FaultInfo> faultList = new ArrayList<FaultInfo>();
		resultBundle.setFaultInfo(faultList);
		resultBundle.setStatus(status);
		
		HashMap<String, LabOrderableSparqlResult> enterpriseToLocalCodeMap = new HashMap<>();
		HashMap<String, Remediation> remediationMap = new HashMap<>();

		List<String> intentList = invocationTarget.getIntentsSet();

		// Require an intent
		if (intentList == null || intentList.isEmpty()) {
			populateInvocationTargetIntentError(resultBundle, faultList);
			return resultBundle;
		}

        // ===================================
		// Create Call Id .. seed per name
		// ===================================
		String callId = generateCallId();

        // ===================================
		// Create starting metrics list to send it down chain - Ideally non
		// blocking
		// ===================================
		List<CallMetrics> metrics = new ArrayList<>();

        // =========================================
		// START TIME
		// PREP and ADD METRIC TO LIST TO SEND LATER
		// =========================================
		// Create a common metric name when multiple intents are used
		String metricInvokeId = StringUtils.join(intentList, ',');

		addMetric(metrics, context, "invoke", "", "begin", metricInvokeId, callId, invocationTarget);

		// FUTURE Fetch context specific behaviors here
		for (Iterator<String> iterator = intentList.iterator(); iterator.hasNext();) {            
			String intent = iterator.next();

			// FUTURE Add logic for remote stored intents
			IntentMapping intentMapping = intentsMap.get(intent);

			// retrieve intent information from the repository
			if (intentMapping == null && repositoryLookupAgent != null) {
				intentMapping = repositoryLookupAgent.lookupIntent(intent);
			}

			LOGGER.debug("Loaded intent {}", intent);

			// Any intent that is missing is a fault
			if (intentMapping == null) {
                // We should log the fault to the bundle and update the status
				// code as required. We should then try the next intent

				// Log the event
				LOGGER.error("Undefined CDS Invocation on intent " + intent);
				status = StatusCode.USE_NOT_RECOGNIZED;
				resultBundle.setStatus(status);
				addIntentMappingError(resultBundle);
				continue;
			}

			List<String> intents = invocationTarget.getIntentsSet();
			if (intents != null && intents.contains(intent)) {
				LOGGER.debug("Processing intent {}", intent);

                // FUTURE Split this into a multi-threaded process
				// Logic to update an intent -
				List<InvocationMapping> invocationMappingList;

				if (intentMapping.getGovernance() != null) {
					List<InvocationMapping> mappings = Collections.unmodifiableList(intentMapping.getInvocations());
					// Supplement The mapping based on the
					invocationMappingList = intentMapping.getGovernance().apply(mappings, invocationTarget, context, parameters, intent, intentMapping);
				} else {
                    // Ok no special governace - Check if there are supplemental
					// external calls - If so they are applied to every quested
					// intent.

					if (invocationTarget.getSupplementalMappings() != null) {
						invocationMappingList = new ArrayList<InvocationMapping>(invocationTarget.getSupplementalMappings().size() + intentMapping.getInvocations().size());
						invocationMappingList.addAll(invocationTarget.getSupplementalMappings());
						invocationMappingList.addAll(intentMapping.getInvocations());
					} else {
						// Nothing special - Use the stock mapping
						invocationMappingList = intentMapping.getInvocations();
					}
				}

                // ----------------- LOOP THRU EACH INVOCATION -----------------
				
				if (invocationMappingList == null) {
					//WHEN NO INTENT MAPS are given
					//newResultBundle = resultBundle;
				} else {
					for (Iterator<InvocationMapping> iterator2 = invocationMappingList.iterator(); iterator2.hasNext();) {
						InvocationMapping invocationMapping = iterator2.next();
	
						String engine = invocationMapping.getEngineName();
						List<Rule> ruleList = invocationMapping.getRules();
						EngineInfo engineInfo = enginesMap.get(engine);
	
						// retrieve engine information from the repository
						if (engineInfo == null && repositoryLookupAgent != null) {
							engineInfo = repositoryLookupAgent.lookupEngine(engine);
						}
	
						if (engineInfo == null) {
							// Add an engine fault and continue to the next intent
							addConfigurationError(resultBundle, engine, intent);
							break;
						}
	
						LOGGER.debug("Use Engine {}", engine);
	
						// Grab the default data model builder
						DataModelHandlerIFace dmHandler = this.defaultDataModelHandler;
	                    // FUTURE: Add Data model switch logic
						
						// get list of all Prerequisite, if any
	                    List<Prerequisite> allPrereqs = invocationMapping.getPrerequisites();
	                    
	                    if(allPrereqs != null && !allPrereqs.isEmpty() ) {
	                    	allPrereqs.forEach(prerequisite -> {
	                    		remediationMap.put(prerequisite.getCoding().getCode(), prerequisite.getRemediation());
	                    	});
	                    }
						// FUTURE: Added Context and Subject Specific Rules
						if (invocationTarget.getMode() == InvocationMode.Normal) {
							if (dmHandler == null) {
								LOGGER.error("Attempt to use normal mode without a Data Handler");
							}
	
							// Determine if data validation is on for this mapping
							boolean validate = false;
							if (invocationTarget.isDataModelValidationEnabled() || invocationMapping.isValidateDataModel()) {
								validate = true;
							}
	
	                        //------------------------------------------------
	                        // Process Prerequistes as needed only
	                        //------------------------------------------------
	                        if ( invocationMapping.getCrsResolverRequired() != null && invocationMapping.getCrsResolverRequired() ) {
	                            // Initialize parameters if none are incoming, else can continue on and add to object as needed.
	                            if (parameters == null) {
	                                parameters = new Properties();
	                            }
	                            // check the availability of CRS service
	                            if( !checkServiceAvailable(crsResolver.getCRSClient().getCRSServer()) ) {
	                            	createCrsConnectionError(resultBundle);
	                            	continue;
	                            }
	                            else {
		                            executeSparqlQuery(context.getLocation().getId(), parameters, enterpriseToLocalCodeMap, allPrereqs);
	                            }
	                        }
	                        
							try {
								serializedDataModel = dmHandler.buildDataModel(invocationTarget.getMode(), invocationMapping.getDataQueries(), context, parameters, inputDataModel, validate);
							} catch (DataRetrievalException e) {
								this.addDataFetchError(resultBundle, e);
								continue;
							} catch (DataValidationException e) {
								this.addDataValidationError(resultBundle, e);
								continue;
							}
						}
	
	                    // =========================================
						// RULE START TIME
						// PREP and ADD METRIC TO LIST TO SEND LATER
						// =========================================
						addMetric(metrics, context, "engine", engineInfo.getName(), "begin", metricInvokeId, callId, invocationTarget);
	
						try {
							LOGGER.debug("Calling Engine");
	
							CDSEnginePlugInIFace cdsEngine = engineInfo.getEngine();
	
							//get a physical instance either from config or mongodb...
							engineInfo.getName();
	
							// Handle normal vs Raw Invoke
							ResultBundle engineBundle;
							if (invocationTarget.getMode() != InvocationMode.Raw) {
								engineBundle = cdsEngine.invoke(ruleList, serializedDataModel, callId, eism);
							} else {
								engineBundle = cdsEngine.invokeRaw(ruleList, inputDataModel, callId, eism);
							}
	                        // We always copy the result bundle since it the main
							// one may already have errors in it
							LOGGER.debug("Engine Done");
	
							// Copy any faults
							if (engineBundle.getFaultInfo() != null) {
								resultBundle.getFaultInfo().addAll(engineBundle.getFaultInfo());
							}
	
							// Copy any results
							if (engineBundle.getResults() != null) {
								LOGGER.debug("Handling results");
	
								if (invocationTarget.getMode() != InvocationMode.Raw) {
									LOGGER.debug("Normal mode Result handling");
	
									// Pick apart the return data and normalize
									dmHandler.translateResults(engineBundle.getResults(), resultBundle);
								} else {
									LOGGER.debug("Raw Mode Result Han1dling");
	
									resultBundle.getResults().addAll(engineBundle.getResults());
								}
							}
							
							// =========================================
							// resultBundle.results[].body at this time will contain the
							// objects as a result of the Rules processing.
							// If the Intent being processed has prerequistes,
							// then wrap the rule results in a ConsultPrerequisites object.
							// =========================================
	                        if ((allPrereqs != null) && !allPrereqs.isEmpty() ) {
	                        	resultBundle = this.buildConsultPrerequiste(resultBundle, enterpriseToLocalCodeMap, remediationMap, invocationMapping.getCrsResolverRequired());
	                        } 

							StatusCode cd = resultBundle.getStatus();
							if (cd != null) {
								if (cd.getCode().compareTo(StatusCodes.SUCCESS.getCode()) != 0) {
									LOGGER.debug("Status updated to indicate a fault");
	
	                                // Ok the engine failed
									// First we check if the existing bundle is
									// ok...
									if (resultBundle.getStatus().getCode().compareTo(StatusCodes.SUCCESS.getCode()) == 0) {
	                                    // If so we switch the status to the current
										// state
										resultBundle.setStatus(cd);
									} else {
	                                    // If not then we switch the status to
										// multiple faults
										resultBundle.setStatus(StatusCode.MULTIPLE_FAULTS);
									}
	
								}
							}
	
						} catch (Exception ex) {
							LOGGER.error("Error processing engine " + engineInfo.getName(), ex);
						}
						
						
	                    // =========================================
						// RULE END TIME
						// PREP and ADD METRIC TO LIST TO SEND LATER
						// =========================================
						// time = use the default current time in prepMetric.
						addMetric(metrics, context, "engine", engineInfo.getName(), "end", metricInvokeId, callId, invocationTarget);
						
					} //end-for each invocations
				}
				
			}//endif have intents
				
		} //end-for all Intents 

        // =========================================
		// END TIME
		// PREP and ADD METRIC TO LIST TO SEND LATER
		// =========================================
		addMetric(metrics, context, "invoke", "", "end", metricInvokeId, callId, invocationTarget);

		reportMetrics(metrics, resultBundle, invocationTarget);

		return resultBundle;
	}

	private void executeSparqlQuery(String siteCode, Properties parameters,
			HashMap<String, LabOrderableSparqlResult> enterpriseToLocalLabCodeMap, List<Prerequisite> allPrereqs) {
		allPrereqs.forEach( prereq -> { 
			LabSparqlResults valueSetResults = null;
		    LabOrderableSparqlResult labOrderableResult = null;
		    try {
		        valueSetResults    = crsResolver.executeLabResultQuery(siteCode, prereq);
		        labOrderableResult = crsResolver.executeOrderableQuery(siteCode, prereq) ;
		        labOrderableResult.setSiteCode(siteCode);
		        enterpriseToLocalLabCodeMap.put(prereq.getCoding().getCode(), labOrderableResult);
		    } catch (IOException ex) {
		        LOGGER.error("Error executing Sparql " +  ex);
		    }
		    ValueSet vs = crsResolver.convertToValueSet(valueSetResults, prereq);    
		    parameters.put(prereq.getDisplay(), vs);
		});
	}

	private void createCrsConnectionError(ResultBundle resultBundle) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = "Couldn't connect to CRS server : " + crsResolver.getCRSClient().getCRSServer()  ;
		fault.setFault(errorMessage);
		resultBundle.getFaultInfo().add(fault);
		updateBundleStatus(resultBundle, StatusCode.CONFIGURATION_ERROR);
		LOGGER.error(errorMessage);
	}

	/**
	 * 
	 * @param resultBundleOut
	 * @throws IOException
	 */
    public ResultBundle buildConsultPrerequiste(ResultBundle resultBundleOut, HashMap<String, LabOrderableSparqlResult> enterpriseToLocalCodeMap, HashMap<String, Remediation> remediationMap,  boolean remedationNeeded  ) throws IOException {
        //------------------------------------------------------------
        // GIVEN a ResultBundle from OpenCDS, 
        // extract the body and create a ConsultPrerequisites object from it.
        //------------------------------------------------------------

    	//PREPING new ResultBundle and it's single Result object to populate and return.
    	ResultBundle newResultBundle = new ResultBundle();
    	newResultBundle.setFaultInfo(resultBundleOut.getFaultInfo());
    	newResultBundle.setStatus(resultBundleOut.getStatus());
    	
        Result newResult = new Result();
        if( resultBundleOut.getResults() != null && !resultBundleOut.getResults().isEmpty()) {
	        newResult.setCallId(resultBundleOut.getResults().get(0).getCallId());
	        newResult.setGeneratedBy(resultBundleOut.getResults().get(0).getGeneratedBy());
	        newResult.setProvenance(resultBundleOut.getResults().get(0).getProvenance());
	        newResult.setTitle(resultBundleOut.getResults().get(0).getTitle());
	        newResult.setType(resultBundleOut.getResults().get(0).getType());
        }
        //--------------------------------------------------------------
        // BUILD a single consult from engineBundle body content (Obsverations)
		// Loop through bundle (Observation) entries and for each
		//		create a ConsultPrerequisite object
		// 		then add to ConsultPrerequisites list
        //--------------------------------------------------------------
        ConsultPrerequisites consultList = new ConsultPrerequisites();
        
        for ( Result result : resultBundleOut.getResults()) {
        	
        	Observation obs = (Observation) result.getBody();
        	ConsultPrerequisite aConsult = new ConsultPrerequisite();
        	
        	aConsult.setDuration(getExtValuePerCategory(obs.getUndeclaredModifierExtensions(), "duration"));
        	String enterpriseConceptCode = null;
	        Coding coding = new Coding();
		    if(obs.getIdentifier() != null && !obs.getIdentifier().isEmpty()) {
		    	enterpriseConceptCode = obs.getIdentifier().get(0).getValue();
		        coding.setCode(obs.getIdentifier().get(0).getValue());
		        coding.setSystem(obs.getIdentifier().get(0).getSystem());
		        coding.setDisplay(obs.getComments());
		        aConsult.setCoding(coding);
	        }
	
	        aConsult.setStatus(getExtValuePerCategory(obs.getUndeclaredModifierExtensions(), "status"));
	        aConsult.setDetail(obs);
	        
	        // Remove all the extensions that were added from the rule to pass 'status', 'duration' and 'Output'
	        List<ExtensionDt> extensions = obs.getUndeclaredModifierExtensions();
	        extensions.clear();
	    
	        LabOrderableSparqlResult labOrderable = enterpriseToLocalCodeMap.get(enterpriseConceptCode);
	        Coding remediationCoding = new Coding();
	        
	        if( labOrderable != null && labOrderable.getResults() != null && !labOrderable.getResults().getBindings().isEmpty() && 
	        	labOrderable.getResults().getBindings().get(0).getSiteOrderCode() != null ) {
	        	String localCode = labOrderable.getResults().getBindings().get(0).getSiteOrderCode().getValue();
	        	remediationCoding.setCode(localCode);
	        	remediationCoding.setDisplay(obs.getComments());
	        	remediationCoding.setSystem("urn:oid:2.16.840.1.113883.6.233:" + labOrderable.getSiteCode() );
	        	remediationMap.get(enterpriseConceptCode).setCoding(remediationCoding);
                }
	        aConsult.setRemediation(remediationMap.get(enterpriseConceptCode));
	        consultList.getPrerequisites().add(aConsult);
        }
        
        newResult.setBody(consultList);
        newResultBundle.getResults().add(newResult);
        
        return newResultBundle;
    }

    private String getExtValuePerCategory(List<ExtensionDt> modExts, String category) {
    	String value = "";
    	
    	// Loop through all extensions to find the related category ext item 
    	
    	for (ExtensionDt ext : modExts) {
    		if (ext.getUrlAsString().endsWith(category)) {
    			value = ext.getValueAsPrimitive().getValueAsString();
    			break;
    		}
    	}
    	
    	return value;
    }
	
	/*
	 * Private Function to log an Invalid Input Data.
	 */
	private void populateInvocationTargetIntentError(ResultBundle resultBundle, List<FaultInfo> faultList) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getMessage() + " , " + InvocationConstants.INTENT_NOT_PROVIDED;
		fault.setFault(errorMessage);
		faultList.add(fault);
		resultBundle.setFaultInfo(faultList);

		resultBundle.setStatus(StatusCode.INVALID_INPUT_DATA);
		LOGGER.error(errorMessage);
	}

	/*
	 * Private Function to log an Invalid Use
	 */
	/**
	 * Update a bundle status - If there is already a fault the change the overall status to multiple faults
	 *
	 * @param status
	 */
	private void updateBundleStatus(ResultBundle resultBundle, StatusCode status) {
		if (resultBundle.getStatus().getCode() != StatusCode.SUCCESS.getCode()) {
			resultBundle.setStatus(status);

		} else if (resultBundle.getStatus().getCode() != status.getCode()) {
			resultBundle.setStatus(StatusCode.MULTIPLE_FAULTS);
		}
	}

	private void addIntentMappingError(ResultBundle resultBundle) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = InvocationConstants.StatusCodes.USE_NOT_RECOGNIZED.getMessage() + " , " + InvocationConstants.INTENT_NOT_CONFIGURED;
		fault.setFault(errorMessage);
		resultBundle.getFaultInfo().add(fault);
	}

	private void addConfigurationError(ResultBundle resultBundle, String engineName, String intent) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = InvocationConstants.StatusCodes.CONFIGURATION_ERROR + ", Engine = " + engineName + ", Intent = " + intent;
		fault.setFault(errorMessage);
		resultBundle.getFaultInfo().add(fault);
		updateBundleStatus(resultBundle, StatusCode.CONFIGURATION_ERROR);
		LOGGER.error(errorMessage);
	}

	private void addDataFetchError(ResultBundle resultBundle, DataRetrievalException exp) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = null;
		if (exp.getMessage().contains(InvocationConstants.HTTP_AUTHORIZATION_ERROR_CODE)) {
			errorMessage = InvocationConstants.StatusCodes.AUTHENICATION_ERROR.getMessage() + " , " + exp.getMessage();
			resultBundle.setStatus(StatusCode.AUTHENICATION_ERROR);
		} else {
			errorMessage = InvocationConstants.StatusCodes.DATA_SERVER_NOT_AVAILABLE.getMessage() + " , Fetch Error: " + exp.getMessage();
			resultBundle.setStatus(StatusCode.DATA_SERVER_NOT_AVAILABLE);
		}

		fault.setFault(errorMessage);
		resultBundle.getFaultInfo().add(fault);
		LOGGER.error(errorMessage, exp);
	}

	private void addDataValidationError(ResultBundle resultBundle, DataValidationException exp) {
		FaultInfo fault = new FaultInfo();
		String errorMessage = InvocationConstants.StatusCodes.INVALID_INPUT_DATA.getMessage() + " , Validation Error: " + exp.getMessage();
		resultBundle.setStatus(StatusCode.INVALID_INPUT_DATA);

		fault.setFault(errorMessage);
		resultBundle.getFaultInfo().add(fault);
		LOGGER.error(errorMessage, exp);
	}

	private void reportMetrics(List<CallMetrics> metrics, ResultBundle bundle, InvocationTarget invocationTarget) {

        // First we generate a Summary metric
		// It is assumed that the metrics list follow the invocation order
		if (metrics != null) {
			int size = metrics.size();
			CallMetrics start = metrics.get(0);
			CallMetrics end = metrics.get(size - 1);
			CallMetrics summary = new CallMetrics();
			summary.setCallId(start.getCallId());
			summary.setContext(start.getContext());
			summary.setOrigin("");
			summary.setInvocation(start.getInvocation());
			summary.setTime(new Timestamp(Calendar.getInstance().getTime().getTime()));
			summary.setType("invoke");
			summary.setEvent("summary");
			summary.setTotalResults(bundle.getResults().size());
			summary.setInvocationType(invocationTarget.getType());
			long totalDuration = end.getTime().getTime() - start.getTime().getTime();
			summary.getTimings().put("total", new Long(totalDuration));

			// Calculate total call duration
			if (size > 3) {
                // Here we can assume one or more engines are called
				// The time in engines is the is the total duration from the
				// time the first engine is called until
				// The last engine completes.
				CallMetrics engineStart = metrics.get(1);
				CallMetrics engineEnd = metrics.get(size - 2);
				long setupTime = engineStart.getTime().getTime() - start.getTime().getTime();
				summary.getTimings().put("callSetup", new Long(setupTime));

                // There is a small possibility of two or more engines
				// starting but none of them generating an end event.
				// The following code guards against that condition
				if (engineEnd.getEvent().compareTo("end") == 0) {
					long timeInEngines = engineEnd.getTime().getTime() - engineStart.getTime().getTime();
					summary.getTimings().put("inEngines", new Long(timeInEngines));
					long resultTime = end.getTime().getTime() - engineEnd.getTime().getTime();
					summary.getTimings().put("handlingResults", new Long(resultTime));
				}
			}
			if (size == 3) {
                // We have a fault in an engine and thus missing data for engine
				// timing
				CallMetrics engineStart = metrics.get(1);
				long setupTime = engineStart.getTime().getTime() - start.getTime().getTime();
				summary.getTimings().put("callSetup", new Long(setupTime));

			} else {
                // We have either one or two boundary points
				// For Now we have no special metric to place here.
			}
			metrics.add(summary);
		}

		sendMetricsToCollectors(metrics);

	}

	/**
	 * Helper function to send metrics to the collection chain - Exposed so that the calling context may report other
	 * metrics to the same sources
	 *
	 * @param metrics
	 */
	@Override
	public void sendMetricsToCollectors(List<CallMetrics> metrics) {
		// FUTURE make this a non-blocking task.
		if (metricCollectors != null) {
			Iterator<CDSMetricsIFace> iter = metricCollectors.iterator();
			while (iter.hasNext()) {
				CDSMetricsIFace metric = iter.next();
				metric.updateMetrics(metrics);

			}
		}
	}

	private void addMetric(List<CallMetrics> metrics, Context ctx, String type, String origin, String event, String invocation, String callId, InvocationTarget invocationTarget) {
		metrics.add(new CallMetrics(type, origin, event, invocation, ctx, callId, new Timestamp(Calendar.getInstance().getTime().getTime()), invocationTarget.type));
	}

	private boolean checkServiceAvailable(String connectionString) {
		HttpURLConnection conn;
		boolean status = false;
		try {
			URL url = new URL(connectionString);
			conn = (HttpURLConnection) url.openConnection();
			conn.setConnectTimeout(1000);
			conn.connect();
			if (conn.getResponseCode() == 200) {
				return true;
			}
		} catch (IOException e) {
			LOGGER.debug("Couldn't connect to server : " + connectionString);
		}
		return status;
	}
	/**
	 * ************** Future Operation Stubs ********************
	 */
	@Override
	public void getAvailableRules() {

	}

	@Override
	public void introduceData() {

	}

	/**
	 * The following is a stub for the deferred invocation mechanism. TDB Support optional
	 */
	@Override
	public Future invokeDeferred() {
		return null;
	}

	/**
	 * The following is a stub for the async results retrieval
	 */
	@Override
	public ResultBundle retrieveResults() {
		return null;
	}

	/**
	 * ************** Properties for Operational Configuration ********************
	 */
	/**
	 * CDS Engine Map used for String configuration
	 *
	 * @return A map if CDS engines
	 */
	public Map<String, EngineInfo> getEnginesMap() {
		return enginesMap;
	}

	public void setEnginesMap(Map<String, EngineInfo> enginesMap) {
		this.enginesMap = enginesMap;
	}

	/**
	 * The Usage intents for the invoker to be aware of. Used by Spring Configuration
	 *
	 * @return The intent map
	 */
	public Map<String, IntentMapping> getIntentsMap() {
		return intentsMap;
	}

	public void setIntentsMap(Map<String, IntentMapping> intentsMap) {
		this.intentsMap = intentsMap;
	}

	/**
	 * The mapping of metrics collection engines used. Used by Spring Configuration.
	 *
	 * @return
	 */
	public List<CDSMetricsIFace> getMetricCollectors() {
		return metricCollectors;
	}

	public void setMetricCollectors(List<CDSMetricsIFace> metricCollectors) {
		this.metricCollectors = metricCollectors;
	}

	public String getDataModelHandlerBeanName() {
		return dataModelHandlerBeanName;
	}

	public void setDataModelHandlerBeanName(String dataModelHandlerBeanName) {
		this.dataModelHandlerBeanName = dataModelHandlerBeanName;
	}

	/**
	 * @return the repositoryLookupAgent
	 */
	public RepositoryLookupIFace getRepositoryLookupAgent() {
		return repositoryLookupAgent;
	}

	/**
	 * @param repositoryLookupAgent
	 */
	public void setRepositoryLookupAgent(RepositoryLookupIFace repositoryLookupAgent) {
		this.repositoryLookupAgent = repositoryLookupAgent;
	}
    
    
	public CRSResolver getResolver() {
		return this.crsResolver;
	}

	public void setResolver(CRSResolver resolver) {
		this.crsResolver = resolver;
	}

}
