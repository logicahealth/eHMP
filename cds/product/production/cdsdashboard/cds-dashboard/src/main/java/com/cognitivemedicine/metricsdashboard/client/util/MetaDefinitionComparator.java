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
package com.cognitivemedicine.metricsdashboard.client.util;

import java.util.Comparator;

import com.cognitivemedicine.metricsservice.model.MetaDefinition;

/**
 * This comparator is used to determine the order that MetaDefinitions will appear in the Metric
 * query selection dropdown list
 * 
 * @author sschechter
 *
 */
public class MetaDefinitionComparator implements Comparator<MetaDefinition> {

  @Override
  public int compare(MetaDefinition o1, MetaDefinition o2) {

    int result;

    result = o1.getName().compareTo(o2.getName());
    if (result != 0)
      return result;

    if (o1.getOrigin() == null && o2.getOrigin() != null) {
      result = -1;
    } else if (o1.getOrigin() != null && o2.getOrigin() == null) {
      result = 1;
    } else if (o1.getOrigin() == null && o2.getOrigin() == null) {
      result = 0;
    } else {
      result = o1.getOrigin().compareTo(o2.getOrigin());
    }
    if (result != 0)
      return result;

    if (o1.getInvocationType() == null && o2.getInvocationType() != null) {
      result = -1;
    } else if (o1.getInvocationType() != null && o2.getInvocationType() == null) {
      result = 1;
    } else if (o1.getInvocationType() == null && o2.getInvocationType() == null) {
      result = 0;
    } else {
      result = o1.getInvocationType().compareTo(o2.getInvocationType());
    }
    if (result != 0)
      return result;

    result = o1.getMethodName().compareTo(o2.getMethodName());

    return result;
  }

}
