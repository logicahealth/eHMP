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
package com.cognitivemedicine.metricsdashboard.client.charts;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;

/**
 * This GrainMatrix is used to store the results from a single or multi-metric query, organized by time
 * 
 * @author sschechter
 * 
 */
public class GrainMatrix {

    private TreeMap<Long, HashMap<String, Datapoint>> metricMap;
    private ChartWidget chartWidget;
    private ArrayList<String> requestQueue;
    private ChartSettings chartSettings;
    private ArrayList<MetaDefinition> metaDefinitions;

    /**
     * Initialize the grain matrix by creating maps for every datetime expected back in the results
     * 
     * @param chartSettings
     */
    public GrainMatrix(ChartSettings chartSettings, ChartWidget chartWidget) {
        this.metaDefinitions = (ArrayList<MetaDefinition>)chartSettings.getSelectedMetaDefinitions();
        this.chartSettings = chartSettings;
        this.chartWidget = chartWidget;

        metricMap = new TreeMap<Long, HashMap<String, Datapoint>>();

        requestQueue = new ArrayList<String>();
        for (MetaDefinition m : chartSettings.getSelectedMetaDefinitions()) {
            requestQueue.add(m.toString());
        }
        
//        Granularity granularity = chartSettings.getGranularity();
//        long startPeriod = chartSettings.getStartPeriod();
//        long endPeriod = chartSettings.getEndPeriod();
//
        // If there is a granularity specified, create a default value for every time slice
//        if (chartSettings.getGranularity() != null) {
//            HashMap<String, Datapoint> innerMap;
//            for (long i = startPeriod; i <= endPeriod; i = i + granularity.getMilliseconds()) {
//                for (MetaDefinition m : chartSettings.getSelectedMetaDefinitions()) {
//                    innerMap = metricMap.get(i);
//                    if (innerMap == null) {
//                        innerMap = new HashMap<String, Datapoint>();
//                    }
//                    innerMap.put(m.toString(), new Datapoint());
//                    metricMap.put(i, innerMap);
//                }
//            }
//        }
    }

    /**
     * Aggregate the results from individual /metrics queries. Once all the results are received, notify the chart viewer to display
     * 
     * @param metricId
     *            - the id of the metric definition
     * @param data
     *            - the results received
     */
    public void metricsReceived(MetaDefinition metaDefinition, List<Datapoint> data) {
        HashMap<String, Datapoint> map;
        for (Datapoint d : data) {
            map = metricMap.get(d.getDatetime());
            if (map != null) {
                //Split the aggregated data into 
                map.put(metaDefinition.toString(), d);
            } else {
                // There is no granularity specified, create maps for the results
                map = new HashMap<String, Datapoint>();
                map.put(metaDefinition.toString(), d);
                metricMap.put(d.getDatetime(), map);
            }
        }
        // Pop the metric id of the received result off of the result queue
        requestQueue.remove(metaDefinition.toString());

        // When we have no more results to wait for, finish updating the chart
        if (requestQueue.size() == 0) {
            chartWidget.finishLoadingMetrics();
        }
    }

    public ChartSettings getChartSettings() {
        return chartSettings;
    }

    public ArrayList<String> getRequestQueue() {
        return requestQueue;
    }

    public ArrayList<MetaDefinition> getMetaDefinitions() {
        return metaDefinitions;
    }

    public TreeMap<Long, HashMap<String, Datapoint>> getMetricMap() {
        return metricMap;
    }
}
