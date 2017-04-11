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
package com.cognitive.cds.invocation.crs;

import ca.uhn.fhir.model.dstu2.composite.IdentifierDt;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.Response;

import org.apache.cxf.helpers.IOUtils;
import org.apache.cxf.jaxrs.client.WebClient;
import org.slf4j.Logger;

import ca.uhn.fhir.model.dstu2.resource.ValueSet;
import ca.uhn.fhir.model.dstu2.resource.ValueSet.Expansion;
import ca.uhn.fhir.model.dstu2.resource.ValueSet.ExpansionContains;
import ca.uhn.fhir.model.dstu2.valueset.ConformanceResourceStatusEnum;
import ca.uhn.fhir.model.primitive.DateTimeDt;

import com.cognitive.cds.invocation.crs.model.Binding;
import com.cognitive.cds.invocation.crs.model.LabSparqlResults;
import com.cognitive.cds.invocation.crs.model.orderables.LabOrderableSparqlResult;
import com.cognitive.cds.invocation.execution.model.Prerequisite;
import com.cognitive.cds.invocation.util.JsonUtils;

/*
 * 
 *  CRSResolver has the functions to
 *  handle list of CRSPrerequisites and return a FHIR ValueSet.
 *  
 *  For each prerequisite concept a SPARQL query is performed. The query is setup 
 *  to return a JSON formatted result which is deserialized. This Object can
 *  then be converted to a FHIR ValueSet.
 *
 *  For more specifics about the SPARQL template store and other features of CRSReslover please review 
 *  the documentation at:  https://wiki.vistacore.us/pages/viewpage.action?pageId=15210471
 * 
 */

public class CRSResolver {
	
	private static final Logger LOGGER = org.slf4j.LoggerFactory.getLogger(CRSResolver.class);
    private CRSClient crsClient;
    private Map<String, String> sparqlQueryMap = new HashMap<String, String>();

    /**
     * @return the crsClient
     */
    public CRSClient getCRSClient() {
        return crsClient;
    }

    /**
     * @param crsClient
     *            the crsClient to set
     */
    public void setCRSClient(CRSClient crsClient) {
        this.crsClient = crsClient;
    }
    
	public LabOrderableSparqlResult executeOrderableQuery(String siteCode, Prerequisite requisite)
			throws IOException {
		String result = null;
		LabOrderableSparqlResult queryResult = null;
		Response response;

		String queryString = sparqlQueryMap.get(requisite.getRemediationQuery());
		if (queryString == null) {
			queryString = getSparqlQuery(requisite.getRemediationQuery());
			sparqlQueryMap.put(requisite.getRemediationQuery(), queryString);
		}

		queryString = String.format(queryString, siteCode, requisite.getCoding().getCode());

		WebClient client = this.crsClient.getClient();
		client.resetQuery();
		client.replacePath(this.crsClient.getQueryPath());
		response = client.accept("application/sparql-results+json").type("application/sparql-results+json")
				.header("Content-Type", "application/sparql-query").post(queryString);
		int status = response.getStatus();
		if (status != 200) {
			throw new IOException("SPARQL failed, status code: " + status);
		}

		if (response.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
			InputStream in = (InputStream) response.getEntity();
			result = IOUtils.toString(in, "UTF-8");
			queryResult = JsonUtils.getMapper().readValue(result,
					LabOrderableSparqlResult.class);
		}
		return queryResult;

	}
    
	public LabSparqlResults executeLabResultQuery(String siteCode, Prerequisite requisite) throws IOException {
		String result = null;
		LabSparqlResults queryResult = null;
		Response response;

		String queryString = sparqlQueryMap.get(requisite.getValueSetQuery());
		if (queryString == null) {
			queryString = getSparqlQuery(requisite.getValueSetQuery());
			sparqlQueryMap.put(requisite.getValueSetQuery(), queryString);
		}
		queryString = String.format(queryString, siteCode, requisite.getCoding().getCode());
		WebClient client = this.crsClient.getClient();
		client.resetQuery();
		client.replacePath(this.crsClient.getQueryPath());
		response = client.accept("application/sparql-results+json").type("application/sparql-results+json")
				.header("Content-Type", "application/sparql-query").post(queryString);
		int status = response.getStatus();
		if (status != 200) {
			throw new IOException("SPARQL failed, status code: " + status);
		}

		if (response.getStatusInfo().getFamily() == Response.Status.Family.SUCCESSFUL) {
			InputStream in = (InputStream) response.getEntity();
			result = IOUtils.toString(in, "UTF-8");
			queryResult = JsonUtils.getMapper().readValue(result, LabSparqlResults.class);
		}
		return queryResult;
	}
    /**
     * This will convert from a single Sparql Resultset into a single FHIR ValueSet resource
     * @param result
     * @return 
     */
    public ValueSet convertToValueSet(LabSparqlResults result, Prerequisite prereq) {
        
        String ident = "urn.cds.crs.valueset";
       
        List<ExpansionContains> containList = new ArrayList<ExpansionContains>();
        Expansion expan = new Expansion();
        expan.setIdentifier(ident);
        expan.setTimestamp(DateTimeDt.withCurrentTime());
        expan.setContains(containList);
        
        ValueSet vs = new ValueSet();
        
        // Set the top level prereq details
        vs.setName(prereq.getDisplay());
        vs.setDescription(prereq.getCoding().getDisplay()); 
        
        // Set the query code level details for this prereq
        IdentifierDt vsIdent = new IdentifierDt();
        vsIdent.setSystem(prereq.getCoding().getSystem());
        vsIdent.setValue(prereq.getCoding().getCode());
        vs.setIdentifier(vsIdent);
        
        //set up value set required fields
        vs.setStatus(ConformanceResourceStatusEnum.ACTIVE);
        vs.setExpansion(expan);
        
        addBindings(containList, result.getResults().getBindings());
        return vs; 
    }

    /*
     * Add the code and system values to the ValueSets contains list
     */
    private void addBindings(List<ExpansionContains> containList, List<Binding> bindings) {

        ExpansionContains contains = null;
        for (Binding binding : bindings) {
            String cStr = binding.getCode().getValue();
            String sStr = binding.getSystem().getValue();
            contains = new ExpansionContains();
            contains.setCode(cStr);
            contains.setSystem(sStr);
            containList.add(contains);
        }
    }
    
    private String getSparqlQuery(String fileName){
  	  String result = "";
  	  ClassLoader classLoader = getClass().getClassLoader();
  	  try {
  		result = IOUtils.toString(classLoader.getResourceAsStream(fileName));
  	  } catch (IOException e) {
  		LOGGER.debug("Couldn't read resoruce : " + fileName + " " + e.getMessage());
  	  }
  	  return result;
    }
}
