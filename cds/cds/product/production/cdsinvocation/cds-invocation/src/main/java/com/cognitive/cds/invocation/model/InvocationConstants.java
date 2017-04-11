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
package com.cognitive.cds.invocation.model;

public class InvocationConstants {
    public static final String ADVICE = "advice";
    public static final String REMINDER = "reminder";
    public static final String PROPOSAL = "proposal";
    public static final String INTENT_NOT_CONFIGURED = "The intent or reason for the invocation is not configured in the CDS service.";
    public static final String INTENT_NOT_PROVIDED = "No Intent Provided.";
    public static final String NO_RULE_CONFIGURED = "No rules configured for the openCDS engine.";
    public static final String HTTP_AUTHORIZATION_ERROR_CODE = "401";

    public enum StatusCodes {
        SUCCESS("0", "Success", 0), USE_NOT_RECOGNIZED("1", "Use not recognized ", 1), GENERAL_RULES_FAILURE("2", "General Rules processing failure ", 2), INVALID_INPUT_DATA("3",
                "Invalid Input Data ", 3), INVALID_OUTPUT_DATA("4", "Invalid Output Data ", 4), RULES_ENGINE_NOT_AVAILABLE("5", "Rules Engine is not available ", 5), SYSTEM_ERROR("6",
                "System Error. This indicates a low level system error ", 6), DATA_SERVER_NOT_AVAILABLE("7", "Data server is not available ", 7), NO_RULES_FIRED("8", "No rule fired ", 8), MULTIPLE_FAULTS(
                "9", "Multiples Rules Execution Faults occured ", 9), AUTHENICATION_ERROR("10", "Error Authenticating access to RDK", 10), CONFIGURATION_ERROR("11", "Error in configutation", 11);

        private final String code;
        private final String message;
        private final int value;

        StatusCodes(String code, String message, int value) {
            this.code = code;
            this.message = message;
            this.value = value;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

        public int getValue() {
            return value;
        }
    }
}
