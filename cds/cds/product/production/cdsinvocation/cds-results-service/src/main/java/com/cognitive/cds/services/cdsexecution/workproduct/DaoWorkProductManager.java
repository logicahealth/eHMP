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
package com.cognitive.cds.services.cdsexecution.workproduct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.mongo.WorkProductDao;
import com.cognitive.cds.invocation.mongo.WorkProductSubscriptionDao;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductAssignment;
import com.cognitive.cds.invocation.workproduct.model.WorkProductSubscription;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.List;

public class DaoWorkProductManager implements WorkProductManagementIFace {

    private static final Logger logger = LoggerFactory.getLogger(DaoWorkProductManager.class);

    private WorkProductDao workProductDao;
    private WorkProductSubscriptionDao workProductSubscriptionDao;

    @Override
    public boolean assignWorkProduct(WorkProductAssignment wpa, boolean override) {

        String userId = wpa.getUser().getId();
        WorkProductSubscription wps;

        wps = workProductSubscriptionDao.getWorkProductSubscription(userId);

        String workProductId = wpa.getWorkProductId();

        WorkProduct wp = workProductDao.getWorkProduct(workProductId).getWorkproduct();

        // Keep track of what we're testing for.
        boolean priorityOk = false;
        boolean specialtyOk = false;
        boolean typeOk = false;

        if (!override) {
            List<String> categories = wp.getCategories();
            if (wps != null) {
                List<Integer> specialties = wps.getSpecialty();
                for (String category : categories) {
                    for (Integer specialty : specialties) {
                        // TODO - might want to align these as numbers or
                        // strings?
                        if (category.equalsIgnoreCase(specialty.toString())) {
                            specialtyOk = true;
                            // TODO - test breaking here for performance.
                        }
                    }
                }
                String priority = wps.getPriority();
                int minimumPriority = 0;
                switch (priority) {
                case "ALL":
                    minimumPriority = 0;
                    break;
                case "CRI":
                    minimumPriority = 81;
                    break;
                case "URG":
                    minimumPriority = 61;
                    break;
                default:
                    minimumPriority = 0;
                }

                if (wpa.getPriority() >= minimumPriority) {
                    priorityOk = true;
                }

                String workProductType;
                switch (wpa.getWorkProductType().toLowerCase()) {
                case "proposal":
                    workProductType = "P";
                    break;
                case "advice":
                    workProductType = "A";
                    break;
                case "reminder":
                    workProductType = "R";
                    break;
                default:
                    throw new IllegalArgumentException("Invalid " + "work product type encountered: " + wpa.getWorkProductType().toLowerCase());
                }

                List<String> subscribedTypes = wps.getType();
                for (String subscribedType : subscribedTypes) {
                    // if(subscribedType.equalsIgnoreCase(workProductType)) { //
                    if (subscribedType.equalsIgnoreCase(wpa.getWorkProductType().toLowerCase())) {
                        typeOk = true;
                    }
                }
            }

        } else {

            // override is true - lets give everything a greenlight.
            priorityOk = true;
            specialtyOk = true;
            typeOk = true;

        }

        if (priorityOk && specialtyOk && typeOk) {
            try {
                boolean response = workProductDao.insertAssignment(wpa);
                // Nothing to map here for success, so if no errors, true?
                return true;
            } catch (JsonProcessingException jpe) {
                logger.debug("JsonProcessingException returned from WorkproductDao", jpe);
                return false;
            }

        } else {

            return false;

        }

    }

    @Override
    public String storeWorkProduct(WorkProduct wp) {

        try {
            String id = workProductDao.saveWorkProduct(wp);
            return id;
        } catch (JsonProcessingException jpe) {
            logger.debug("JsonProcessingException returned from WorkproductDao", jpe);
            return null;
        }
    }

    /**
     * @return the workProductDao
     */
    public WorkProductDao getWorkProductDao() {
        return workProductDao;
    }

    /**
     * @param workProductDao
     *            the workProductDao to set
     */
    public void setWorkProductDao(WorkProductDao workProductDao) {
        this.workProductDao = workProductDao;
    }

    /**
     * @return the workProductSubscriptionDao
     */
    public WorkProductSubscriptionDao getWorkProductSubscriptionDao() {
        return workProductSubscriptionDao;
    }

    /**
     * @param workProductSubscriptionDao
     *            the workProductSubscriptionDao to set
     */
    public void setWorkProductSubscriptionDao(WorkProductSubscriptionDao workProductSubscriptionDao) {
        this.workProductSubscriptionDao = workProductSubscriptionDao;
    }

}
