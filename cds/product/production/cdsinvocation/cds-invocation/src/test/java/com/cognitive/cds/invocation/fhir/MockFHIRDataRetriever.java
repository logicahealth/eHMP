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

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;

import org.springframework.core.io.Resource;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Bundle;
import ca.uhn.fhir.model.dstu2.valueset.BundleTypeEnum;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.parser.IParser;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;
import com.cognitive.cds.invocation.util.FhirUtils;

/**
 * The MockFHIRDataRetiever can be used to simulate a FHIR data source. The
 * resourceMap is a mapping between a query String and a Resource that
 * represents the a Bundle that will be returned for that query. Only the first
 * requested query is returned by this mock.
 * 
 * @author jgoodnough
 *
 */
public class MockFHIRDataRetriever implements IFhirDataRetriever {

    /**
     * Collection of Resources that reresent Bundles that are keyed by query
     */
    private HashMap<String, Resource> resourceMap = new HashMap<>();

    /**
     * Collection accessor
     * 
     * @return The map
     */
    public HashMap<String, Resource> getResourceMap() {
        return resourceMap;
    }

    /**
     * Set the Map - Mainly used by Spring
     * 
     * @param resourceMap
     */
    public void setResourceMap(HashMap<String, Resource> resourceMap) {
        this.resourceMap = resourceMap;
    }

    
    /**
     * Returns the saved bundle associated with the query. Only thew first query
     * is used and it is the key to the associated bundle.
     * 
     * @param queries
     * @param auth
     * @return
     * @throws InterruptedException
     * @throws IOException
     */
    public Bundle getFhirData(List<String> queries) throws DataRetrievalException {
        Bundle out = null;
        // Grab the first query - Look it up and fetch the bundle associated
        // with it
        String query = null;
        if (queries != null && !queries.isEmpty()) {
            query = queries.get(0);
            Resource rsc = resourceMap.get(query);
            if (rsc != null) {
                // Parse the input stream as a bundle
                IParser p = FhirUtils.newJsonParser();
                InputStreamReader theReader;
                try {
                    theReader = new InputStreamReader(rsc.getInputStream());
                } catch (IOException e) {
                    throw new DataRetrievalException("Error fetching input resource: " + e.getMessage());
                }
                IResource fhirRsc = p.parseResource(theReader);
                if (fhirRsc instanceof ca.uhn.fhir.model.dstu2.resource.Bundle) {
                    ca.uhn.fhir.model.dstu2.resource.Bundle tmp = (ca.uhn.fhir.model.dstu2.resource.Bundle) fhirRsc;

                    out = (Bundle) fhirRsc;
                } else {
                    throw new DataRetrievalException("Invalid Resource Type: " + fhirRsc.getClass().getName());
                }
            }
        }
        if (out == null) {
            out = new Bundle();
            java.util.UUID uuid = java.util.UUID.randomUUID();
            out.setId(new IdDt(uuid.toString()));
            out.setBase("");
            // finalBundle.setTotal(0); //Total is only valid on search and
            // history
            // bundles!
            out.setType(BundleTypeEnum.COLLECTION);
        }
        return out;
    }

}
