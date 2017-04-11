package org.opencds.service.evaluate;

import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.common.interfaces.ResultSetBuilder;
import org.opencds.common.structures.EvaluationRequestKMItem;
import org.opencds.config.api.ss.ExitPoint;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.Bundle;
import ca.uhn.fhir.parser.IParser;

/**
*
* @author Tadesse Sefer
* @author Phillip Warner
* 
*/
public class FhirExitPoint implements ExitPoint {
    private static Log log = LogFactory.getLog(FhirExitPoint.class);
	private final FhirContext fhirContext;
    
    public FhirExitPoint() {
    	fhirContext = new FhirContext();
    }

    @Override
    public String buildOutput(ResultSetBuilder<?> resultSetBuilder, Map<String, List<?>> results, EvaluationRequestKMItem dssRequestKMItem) {
        String payloadMessage = null;
        Bundle bundle = null;
        try {
        	bundle = (Bundle) resultSetBuilder.buildResultSet(results, dssRequestKMItem);
        	IParser jsonParser = fhirContext.newJsonParser();
        	payloadMessage = jsonParser.encodeBundleToString(bundle);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new OpenCDSRuntimeException("OpenCDS encountered Exception when building fhir output: " + e.getMessage(), e);
        }
        return payloadMessage;
    }

}
