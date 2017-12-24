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
package com.cognitive.cds.invocation.fhir;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;

import com.cognitive.cds.invocation.DataModelHandlerIFace;
import com.cognitive.cds.invocation.InvocationMode;
import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.exceptions.DataValidationException;
import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.model.ResultBundle;
import com.cognitive.cds.invocation.util.FhirUtils;

import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.base.resource.BaseOperationOutcome.BaseIssue;
import ca.uhn.fhir.model.dstu2.resource.BaseResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.resource.Bundle.Entry;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.primitive.CodeDt;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.model.primitive.StringDt;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationResult;

/**
 * This support class is used to fetch and bundle data request and break apart
 * bundles
 * 
 * @see DataModelHandlerIFace
 * 
 * @author jgoodnough
 *
 */
public abstract class FHIRJSONDataModelHandler implements DataModelHandlerIFace {

    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(FHIRJSONDataModelHandler.class);
    public static final String DATANATURE = "http://org.cognitive.cds.invocation.fhir.datanature";
    public static final String PARAMETERNAME = "http://org.cognitive.cds.invocation.fhir.parametername";
    
    private static final Pattern DATE_PARAM = Pattern.compile("date=##(.+)-(.+)##");
    private static final Pattern PERIOD_PARAM = Pattern.compile("(\\d+)([h|d|w|m|y])");
    private static final DateTimeFormatter DATEFORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:00");

    // Use <lookup-method name="createFhirDataRetriever" bean="theService" />
    // When defining this bean. This will allow a prototype scoped
    // FhirDataRetrievrer to be used.

    @Override
    public String buildDataModel(InvocationMode mode, List<String> queries, Context ctx, Map<String, Object> parameter, Object inputDataModel, boolean validate)
            throws DataRetrievalException, DataValidationException {

        IFhirDataRetriever retriever = createFhirDataRetriever();
        // FUTURE - If mode is DomainExclude figure out what domains to skip and
        // update the queries if possible

        // Process the queries into a list of actual queries
        ArrayList<String> actualQueries = new ArrayList<>();
        if (queries != null) {
            Iterator<String> qryItr = queries.iterator();
            while (qryItr.hasNext()) {

                String query = qryItr.next();

                // FUTURE Exclude query if required

                // FUTURE - Base this on a better way of handling variables and
                // add more variable types
                // Right now we just handle a ##SUBJECT.ID## In the future we
                // should update the syntax and variable scope.
                StringBuffer test = new StringBuffer(query.replaceAll("##SUBJECT.ID##", ctx.getSubject().getId()));
                test = resolveDateParams(test);
                actualQueries.add(test.toString());
            }
        }
        // FUTURE: In the future take advantage of a query cache

        Bundle bundle = retriever.getFhirData(actualQueries);
        // By contract the bundle should now exist - even it if is empty

        IParser jsonParser = FhirUtils.newJsonParser();

        // Handle the input data
        if (inputDataModel != null) {
            Bundle inputBundle = null;
            // Deal with the input form and make sure it is a Bundle
            if (inputDataModel instanceof String) {
                String model = (String) inputDataModel;
                if (!model.isEmpty()) {
                    IParser p = FhirUtils.newJsonParser();
                    try {
                        IResource rsc = p.parseResource((String) model);
                        if (rsc instanceof Bundle) {
                            inputBundle = (Bundle) rsc;
                        } else {
                            inputBundle = createBundleWithOneResource(rsc);
                        }
                    } catch (DataFormatException e) {
                        throw new DataRetrievalException("Invalid Input Data Model Type, String does not parse as a FHIR JSON object");
                    }
                }
            } else if (inputDataModel instanceof Bundle) {
                inputBundle = (Bundle) inputDataModel;
            } else if (inputDataModel instanceof IResource) {
                inputBundle = createBundleWithOneResource((IResource) inputDataModel);
            } else {
                throw new DataRetrievalException("Invalid Input Data Model Type, Type pass in is " + inputDataModel.getClass().getName());

            }

            // Protect against inputBundle not being defined (e.g. a Empty
            // string was passed in)
            if (inputBundle != null) {
                // Handle the mode and the merge the data
                switch (mode) {
                    case Normal: {
                        // Input Data model addition to the base query model

                        // Copy in the bundle entries
                        Iterator<Entry> bItr = inputBundle.getEntry().iterator();
                        while (bItr.hasNext()) {
                            Entry be = bItr.next();
                            bundle.getEntry().add(be);
                        }
                        break;
                    }
                    case FlagInput: {
                        // Input data model is copied and each resource is
                        // flagged
                        // as input
                        Iterator<Entry> bItr = inputBundle.getEntry().iterator();
                        while (bItr.hasNext()) {

                            Entry be = bItr.next();
                            BaseResource br;
                            IResource rsc = be.getResource();
                            if (rsc instanceof BaseResource) {
                                br = (BaseResource) be.getResource();
                            } else {
                                logger.error("Attempting to process a odd resource type - Likely a HAPI library issue, type = " + rsc.getClass().getName());
                                throw new DataRetrievalException("Bad input data model resource, type = " + rsc.getClass().getName());
                            }

                            ExtensionDt extDN = new ExtensionDt();
                            extDN.setUrl(DATANATURE);
                            extDN.setModifier(true);
                            CodeDt cd = new CodeDt();
                            cd.setValueAsString(FhirDataNature.Input.toString());
                            extDN.setValue(cd);
                            br.addUndeclaredExtension(extDN);
                            bundle.addEntry().setResource(br);

                        }

                        break;
                    }
                    case DomainExclude: {
                        // Note: Not currently required.
                        // FUTURE: Implement - Find the domains included in the
                        // input, remove and that slipped through the query and
                        // add
                        // the ones found in the input
                        // Algorithm:
                        // We assume that some might have slipped trough an
                        // earlier
                        // query filter
                        // Determine the domains in the input data model
                        // Remove any resources for the filtered domains
                        // Copy in the input Resources
                        break;
                    }
                    case Overlay: {
                        // Note: Not currently required
                        // FUTURE: Implement the overlay algorithm
                        // Algorithm:
                        // For each inputResource scan the data set for a
                        // matching
                        // resource
                        // Match criteria would be an extension on resource
                        // elements
                        // (a regex or xpath like structure)
                        // Scan would first build a criteria set
                        // Then when a matching resource of the requested type
                        // is
                        // found the criteria would be evaluated
                        // If found replace it based on the input data and
                        // extensions
                        // If not found check if the extension should add it
                        // anyway.
                        break;
                    }
                    default:
                        break;

                }
            }
        }

        if (parameter != null) {
            for (String key : parameter.keySet()) {
                Object value = parameter.get(key);
                if (value instanceof BaseResource) {
                    BaseResource br = (BaseResource) value;
                    addInputParameterToBundle(bundle, key.toString(), br);
                } else if (value instanceof String) {
                    // Try to parse it as a resource
                    try {
                        IResource irsc = FhirUtils.newJsonParser().parseResource((String) value);
                        if (irsc instanceof BaseResource) {
                            addInputParameterToBundle(bundle, key.toString(), (BaseResource) irsc);
                        } else {
                            throw new DataRetrievalException("Bad input data parameter resource, name = " + key.toString() + ", type = " + irsc.getClass().getName());
                        }
                    } catch (DataFormatException e) {
                        // FUTURE: Add to a generic mapping structure
                        throw new DataRetrievalException("Invalid Input Parameter, String does not parse as a FHIR JSON object, Parameter name = " + key.toString());
                    }
                } else {
                    // FUTURE: Add to a generic mapping structure
                    logger.warn("Non FHIR Parameter passed as resource: Key = " + key.toString());
                }
            }

        }

        if (validate) {
            FhirValidator validator = FhirUtils.getContext().newValidator();
            ValidationResult result = validator.validateWithResult(bundle);
            if (!result.isSuccessful()) {
                logger.error("Validation failed " + result.getOperationOutcome().getIssueFirstRep().getDetailsElement().toString());
                DataValidationException exp = new DataValidationException("FHIR data validation failed");
                Iterator<? extends BaseIssue> itr = result.getOperationOutcome().getIssue().iterator();
                while (itr.hasNext()) {
                    exp.addFault(itr.next().getDetailsElement().toString());
                }
                throw exp;
            }
        }
        String out = jsonParser.encodeResourceToString(bundle);
        logger.debug("encodded data length = " + out.length());

        return out;
    }

    public abstract IFhirDataRetriever createFhirDataRetriever();

    /**
     * 
     * For FHIR JSON we break apart the bundle into separate FHIR results as
     * json. Later stages may project this info,
     * 
     */
    @Override
    public void translateResults(List<Result> results, ResultBundle resultBundleOut) {
        Iterator<Result> itr = results.iterator();
        while (itr.hasNext()) {
            Result result = itr.next();
            IParser jsonParser = FhirUtils.newJsonParser();
            Bundle bundle = null;
            // The body is expected to be a FHIR Json Bundle decoded
            if (result.getBody() instanceof String) {

                bundle = (Bundle) jsonParser.parseResource((String) result.getBody());
                logger.debug("bundle parsed, bundle size = " + bundle.getEntry().size());
            } else if (result.getBody() instanceof Bundle) {
                bundle = (Bundle) result.getBody();
            }

            if (bundle != null) {
                // Loop each Entry and
                Iterator<Entry> bItr = bundle.getEntry().iterator();
                while (bItr.hasNext()) {
                    Entry be = bItr.next();
                    Result out = new Result();
                    // First the Passthru elements
                    out.setCallId(result.getCallId());
                    out.setGeneratedBy(result.getGeneratedBy());
                    out.setProvenance(result.getProvenance());
                    out.setTitle(result.getTitle());
                    // Now the element specific
                    out.setType(be.getResource().getClass().getSimpleName());
                    out.setBody(be.getResource());
                    resultBundleOut.getResults().add(out);

                }
            } else if (result.getBody() instanceof IResource) {
                Result out = new Result();
                // First the Passthru elements
                out.setCallId(result.getCallId());
                out.setGeneratedBy(result.getGeneratedBy());
                out.setProvenance(result.getProvenance());
                out.setTitle(result.getTitle());
                // Now the element specific
                out.setType(result.getBody().getClass().getSimpleName());
                out.setBody(result.getBody());
                resultBundleOut.getResults().add(out);
            } else {
                logger.warn("Result passed that is not FHIR resource, class " + result.getBody().getClass().getCanonicalName());
            }
        }
    }

    private Bundle createBundleWithOneResource(IResource rsc) {
        Bundle bundle = new Bundle();

        java.util.UUID uuid = java.util.UUID.randomUUID();
        bundle.setId(new IdDt(uuid.toString()));
        // bundle.getUpdated().setTimeZone(TimeZone.getDefault());
        bundle.setType(BundleTypeEnum.COLLECTION);
        // bundle.setTotal(1); //Total is only valid on search and history
        // bundles!
        bundle.setBase("");

        // bundle.getAuthorName().setValue("CDS Invocation");

        bundle.addEntry().setResource(rsc);
        return bundle;
    }

    /**
     * Helper function to all a resource as a input
     * 
     * @param bundle
     * @param name
     * @param br
     */
    protected void addInputParameterToBundle(Bundle bundle, String name, BaseResource br) {
        ExtensionDt extDN = new ExtensionDt();
        extDN.setUrl(DATANATURE);
        extDN.setModifier(true);
        CodeDt cd = new CodeDt();
        cd.setValueAsString(FhirDataNature.Input.toString());
        extDN.setValue(cd);
        br.addUndeclaredExtension(extDN);

        ExtensionDt extName = new ExtensionDt();
        extName.setUrl(PARAMETERNAME);
        extName.setModifier(true);
        StringDt nameDt = new StringDt(name);
        extName.setValue(nameDt);
        br.addUndeclaredExtension(extName);

        bundle.addEntry().setResource(br);
    }
    
    
    StringBuffer resolveDateParams(StringBuffer input) {
    	Matcher matcher = DATE_PARAM.matcher(input);
    	while(matcher.find()) {
    		String operation = resolveOperation(matcher.group(1));
    		String date = resolvePeriodToDate(matcher.group(2));
    		input.replace(matcher.start(), matcher.end(), "date" + operation + date);
    	}
    	return input;
    }
    
    /**
     * Returns equality for string
     * @param op
     * @return
     */
    String resolveOperation(String op) {
    	switch(op) {
	    	case "dateEqual": return "=";
	    	case "dateLessThan": return "=" + urlEncode("<");
	    	case "dateLessThanOrEqual": return "=" + urlEncode("<") + "=";
	    	case "dateGreaterThan": return "=" + urlEncode(">") ;
	    	case "dateGreaterThanOrEqual": return "=" + urlEncode(">") +  "=";
    	}
    	return "=";
    }
    
    /**
     * Calculates a date from a given period (e.g. 60d).  The period format must be XXh|d|m|y
     * where XX is a parseable integer and a letter indicating one of the following:
     * 	d = days
     * 	w = weeks
     * 	m = months
     *  y = years
     * 	
     * @param period
     * @return
     */
    String resolvePeriodToDate(String period) {
    	LocalDateTime dateTime = LocalDateTime.now();
    	Matcher matcher = PERIOD_PARAM.matcher(period);
    	if(matcher.matches()) {
    		int duration = Integer.parseInt(matcher.group(1));
	    	switch(matcher.group(2)) {
	    	case "h" : dateTime = dateTime.minusHours(duration); break;
	    	case "d" : dateTime = dateTime.minusDays(duration); break;
	    	case "w" : dateTime = dateTime.minusWeeks(duration); break;
	    	case "m" : dateTime = dateTime.minusMonths(duration); break;
	    	case "y" : dateTime = dateTime.minusYears(duration); break;
	    	}
    	}
    	return dateTime.format(DATEFORMAT);
    }
    
    public String urlEncode(String s){
    	String encoded = "";
    	try {
			encoded = URLEncoder.encode(s, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			logger.debug(e.getLocalizedMessage());
		}
    	return encoded;
    }
}
