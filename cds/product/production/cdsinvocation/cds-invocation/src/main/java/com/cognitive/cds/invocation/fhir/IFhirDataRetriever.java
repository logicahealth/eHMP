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

import java.util.List;

import ca.uhn.fhir.model.dstu2.resource.Bundle;

import com.cognitive.cds.invocation.exceptions.DataRetrievalException;

/**
 * Interface to (1) retrieves all required FHIR data (2) and bundle all data to
 * single atom result for return.
 * 
 * @author tnguyen
 */
public interface IFhirDataRetriever {

    /**
     * Create a Bundle of resources per given queries and authenticated info.
     * 
     * @param queries
     * @return
     * @throws com.cognitive.cds.invocation.exceptions.DataRetrievalException
     */
    public Bundle getFhirData(List<String> queries) throws DataRetrievalException;
}
