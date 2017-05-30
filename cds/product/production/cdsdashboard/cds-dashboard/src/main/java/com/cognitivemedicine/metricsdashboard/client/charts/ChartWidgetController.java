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
package com.cognitivemedicine.metricsdashboard.client.charts;

import java.util.ArrayList;

import com.cognitivemedicine.metricsservice.model.DashboardSettings;

/**
 * Tracks all open chart widgets and listens for dashboard level settings updates
 * 
 * @author sschechter
 * 
 */
public class ChartWidgetController {

    ArrayList<ChartWidget> widgets;

    public ChartWidgetController() {
        widgets = new ArrayList<ChartWidget>();
    }

    public void disposeWidgets() {
        for (ChartWidget w : widgets) {
            w.hide();
        }
        widgets = new ArrayList<ChartWidget>();
    }

    public ArrayList<ChartWidget> getWidgets() {
        return widgets;
    }

    public void removeWidget(ChartWidget w) {
        widgets.remove(w);
        w.hide();
    }

    /**
     * When Dashboard level settings are updated, update each chart configuration
     * 
     * @param settings
     *            the new dashboard level settings
     */
    public void dashboardSettingsUpdated(DashboardSettings settings) {
        for (ChartWidget w : widgets) {
            w.dashboardSettingsUpdated(settings);
        }
    }
}
