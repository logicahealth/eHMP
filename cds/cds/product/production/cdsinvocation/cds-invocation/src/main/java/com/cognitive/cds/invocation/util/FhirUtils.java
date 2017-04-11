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

package com.cognitive.cds.invocation.util;

/**
 * Support class for FHIR
 */
import com.cognitive.cds.invocation.fhir.FhirDataNature;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.dstu2.resource.BaseResource;
import ca.uhn.fhir.model.primitive.CodeDt;
import ca.uhn.fhir.model.primitive.StringDt;
import ca.uhn.fhir.parser.IParser;

/**
 * Helper utilities for dealing wioth FHIR data
 * 
 * @author jgoodnough
 *
 */
public class FhirUtils {
    private static FhirContext fhirCtx;

    /**
     * Constant to define the Data Nature Extension
     */
    public static final String DATANATURE = "http://org.cognitive.cds.invocation.fhir.datanature";
    /**
     * Constant to define the parameter name extension
     */
    public static final String PARAMETERNAME = "http://org.cognitive.cds.invocation.fhir.parametername";

    static {
        fhirCtx = FhirContext.forDstu2();
    }

    /**
     * Get the Standard FHIR Context
     * 
     * @return
     */
    static public FhirContext getContext() {
        return fhirCtx;
    }

    /**
     * Gets a new FHIR JSON parser Note: At this the investigation of if this
     * parser is thread safe has not been done so for now we assume that is is
     * not.
     * 
     * @return
     */
    static public IParser newJsonParser() {
        return fhirCtx.newJsonParser();
    }

    /**
     * Marks a FHIR resource as a named input parameter
     * 
     * @param br
     * @param name
     */
    static public void MarkAsParameter(BaseResource br, String name) {

        MarkAsInput(br);

        ExtensionDt extName = new ExtensionDt();
        extName.setUrl(PARAMETERNAME);
        extName.setModifier(true);
        StringDt nameDt = new StringDt(name);
        extName.setValue(nameDt);
        br.addUndeclaredExtension(extName);
    }

    /**
     * Marks a FHIR resource with the extensions to to flag it as input.
     * 
     * @param br
     */
    static public void MarkAsInput(BaseResource br) {
        ExtensionDt extDN = new ExtensionDt();
        extDN.setUrl(DATANATURE);
        extDN.setModifier(true);
        CodeDt cd = new CodeDt();
        cd.setValueAsString(FhirDataNature.Input.toString());
        extDN.setValue(cd);
        br.addUndeclaredExtension(extDN);
    }
}
