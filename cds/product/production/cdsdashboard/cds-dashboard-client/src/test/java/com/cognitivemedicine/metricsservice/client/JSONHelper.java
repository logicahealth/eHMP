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
package com.cognitivemedicine.metricsservice.client;

import java.text.DateFormat;
import java.util.ArrayList;

import com.cognitivemedicine.metricsservice.model.Metric;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class JSONHelper {

    public static void main(String[] args) {

        Metric metric = new Metric();
        // metric.set_id("1");
        metric.setName("IT Metric 1");
        metric.setDescription("This is some IT Metric");

        // JSONObject jsonObj = new JSONObject( person );
        // System.out.println( jsonObj );
        Gson gson = new GsonBuilder()
        // .registerTypeAdapter(Id.class, new IdTypeAdapter())
                .enableComplexMapKeySerialization().serializeNulls().setDateFormat(DateFormat.LONG)
                // .setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE)
                .setPrettyPrinting().setVersion(1.0).create();

        System.err.println(gson.toJson(metric));

        ArrayList<Metric> metrics = new ArrayList<Metric>();
        metrics.add(metric);

        System.err.println(gson.toJson(metrics));

//        Config config = new Config();
//
//        ArrayList<Origin> origins = new ArrayList<Origin>();
//        ArrayList<String> flows = new ArrayList<String>();
//        ArrayList<String> methods = new ArrayList<String>();
//
//        Origin origin = new Origin();
//        origin.setName("System A");
//        origins.add(origin);
//        origin = new Origin();
//        origin.setName("System B");
//        origins.add(origin);
//        origin = new Origin();
//        origin.setName("System C");
//        origins.add(origin);
//        flows.add("Generated Online");
//        flows.add("Generated Offine");
//        methods.add("Count");
//        methods.add("Min");
//        methods.add("Mean");
//        methods.add("Max");
//        methods.add("Sum");
//
//        config.setOrigins(origins);
//        config.setInvocationTypes(flows);
//        config.setStatisticalMethods(methods);
//
//        MetricsServiceResponse<Config> response = new MetricsServiceResponse<>();
//        response.setPayload(config);
        
//        System.err.println(gson.toJson(response));
    }
}
