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

/**
 * The Invocation Mode is used to specify the data handling expectations of
 * Invocation. In general data is expected to be in the normalized form (e.g.
 * FHIR), however Raw Modes provided to provide a data handling bypass.
 * 
 * In general most calls are expected to be in normal or FlagInput Mode.
 * 
 * @author Jerry Goodnough
 * @version 1.0
 * @created 11-Dec-2014 9:10:42 AM
 */
public enum InvocationMode {
	/**
	 * The input is passed as is to the engines. Data queries are no enabled.
	 */
	Raw,
	/**
	 * Input is normalized to FHIR and the Input data will merge with queries
	 */
	Normal,
	/**
	 * Input is normalized to FHIR and the input data is merged with the queries
	 * having each resource tagged as input. (Not yet supported)
	 */
	FlagInput,
	/**
	 * Input is normalized to FHIR, The Domain of data in the input are excluded
	 * from and normal data queries. (Not yet supported)
	 */
	DomainExclude,
	/**
	 * Input is normalized to FHIR, normal queries are executed and the input
	 * data will seek matching queried data and overwrite matches with the input
	 * copy. (Not yet supported, login for matching is an open issue)
	 */
	Overlay
}
