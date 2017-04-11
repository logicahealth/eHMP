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
package com.cognitivemedicine.metricsdashboard.client.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Metric;

/**
 * The DefinitionFactory takes in a list of metric definitions retrieved from the server and splits
 * them into multiple query permutations based on certain attributes in the definition
 * 
 * @author sschechter
 *
 */
public class DefinitionFactory {

  private static HashMap<String, Metric> definitions;
  private static ArrayList<MetaDefinition> metaDefinitions;

  /**
   * Takes a list of definitions and creates
   * 
   * @param definitions
   * @return
   */
  public static ArrayList<MetaDefinition> buildMetaDefinitions(HashMap<String, Metric> definitions) {
    DefinitionFactory.definitions = definitions;
    DefinitionFactory.metaDefinitions = new ArrayList<MetaDefinition>();

    MetaDefinition m;
    for (Metric d : definitions.values()) {
      if (d.getName() == null || d.get_id() == null) {
        continue;
      }

      m = new MetaDefinition();
      m.setName(d.getName());
      m.setDefinitionId(d.get_id());
      metaDefinitions.add(m);
    }

    metaDefinitions = buildOrigins(metaDefinitions);
    metaDefinitions = buildMethodNames(metaDefinitions);
    metaDefinitions = buildInvocationTypes(metaDefinitions);

    Collections.sort(metaDefinitions, new MetaDefinitionComparator());

    return metaDefinitions;
  }

  /**
   * builds new MetaDefinition permutations based on the origins supported by the metric
   * 
   * @param list
   * @return
   */
  private static ArrayList<MetaDefinition> buildOrigins(ArrayList<MetaDefinition> list) {
    Metric definition;
    MetaDefinition newDef = new MetaDefinition();
    ArrayList<MetaDefinition> toAdd = new ArrayList<MetaDefinition>();
    for (MetaDefinition m : list) {
      definition = definitions.get(m.getDefinitionId());
      if (definition == null || definition.getOrigins() == null) {
        continue;
      }

      for (String origin : definition.getOrigins()) {
        newDef = (MetaDefinition) m.copy();
        newDef.setOrigin(origin);
        toAdd.add(newDef);
      }
      if (definition.getOrigins().size() > 0) {
        m.setOrigin("All Origins");
      }
    }
    list.addAll(toAdd);
    return list;
  }

  /**
   * builds new MetaDefinition permutations based on the statistical method names supported by the
   * metric
   * 
   * @param list
   * @return
   */
  private static ArrayList<MetaDefinition> buildMethodNames(ArrayList<MetaDefinition> list) {
    Metric definition;
    ArrayList<MetaDefinition> toAdd = new ArrayList<MetaDefinition>();
    // Remove the original MetaDefinition because there is no ALL option for methodNames
    ArrayList<MetaDefinition> toRemove = new ArrayList<MetaDefinition>();
    MetaDefinition newDef = new MetaDefinition();
    for (MetaDefinition m : list) {
      definition = definitions.get(m.getDefinitionId());
      if (definition == null || definition.getAggregation() == null) {
        continue;
      }

      for (String method : definition.getAggregation()) {
        newDef = (MetaDefinition) m.copy();
        newDef.setMethodName(method);
        toAdd.add(newDef);
      }
      toRemove.add(m);
    }
    list.removeAll(toRemove);
    list.addAll(toAdd);
    return list;
  }

  /**
   * builds new MetaDefinition permutations based on the invocation types supported by the metric
   * 
   * @param list
   * @return
   */
  private static ArrayList<MetaDefinition> buildInvocationTypes(ArrayList<MetaDefinition> list) {
    Metric definition;
    ArrayList<MetaDefinition> toAdd = new ArrayList<MetaDefinition>();
    MetaDefinition newDef = new MetaDefinition();
    for (MetaDefinition m : list) {
      definition = definitions.get(m.getDefinitionId());
      definition = definitions.get(m.getDefinitionId());
      if (definition == null || definition.getInvocationTypes() == null) {
        continue;
      }

      for (String flow : definition.getInvocationTypes()) {
        newDef = (MetaDefinition) m.copy();
        newDef.setInvocationType(flow);
        toAdd.add(newDef);
      }
      if (definition.getInvocationTypes().size() > 0) {
        m.setInvocationType("All Invocation Types");
      }
    }
    list.addAll(toAdd);
    return list;
  }
}
