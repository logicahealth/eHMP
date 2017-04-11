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
package com.cognitivemedicine.metricsservice.model;

import java.io.Serializable;

/**
 * The duration window to be displayed in a chart
 * 
 * @author sschechter
 *
 */
public enum Period implements Serializable {

    // S15("15s", 1000 * 15)
    // , M1("1m", 1000 * 60)
    // , M5("5m", 1000 * 60 * 5)
    M15("15m", "15 minutes", 1000l * 60l * 15l), H1("1h", "1 hour", 1000l * 60l * 60l), H8("8h", "8 hours", 1000l * 60l * 60l * 8l), D1("1d", "1 day", 1000l * 60l * 60l * 24l), D7("7d", "7 days",
            1000l * 60l * 60l * 24l * 7l), D30("30d", "30 days", 1000l * 60l * 60l * 24l * 30l), Y1("1y", "1 year", 1000l * 60l * 60l * 24l * 365l), Y2("2y", "2 years", 1000l * 60l * 60l * 24l * 365l
            * 2l), Y5("5y", "5 years", 1000l * 60l * 60l * 24l * 365l * 5l);

    private String symbol;
    private String displayValue;
    private long milliseconds;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getDisplayValue() {
        return displayValue;
    }

    public void setDisplayValue(String displayValue) {
        this.displayValue = displayValue;
    }

    public long getMilliseconds() {
        return milliseconds;
    }

    public void setMilliseconds(long milliseconds) {
        this.milliseconds = milliseconds;
    }

    private static final long SECOND = 1000;

    public static Period fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (Period p : values()) {
            if (value.equals(p.getSymbol())) {
                return p;
            }
        }
        return null;
    }

    private Period(String symbol, String displayValue, long milliseconds) {
        this.symbol = symbol;
        this.displayValue = displayValue;
        this.milliseconds = milliseconds;
    }
}
