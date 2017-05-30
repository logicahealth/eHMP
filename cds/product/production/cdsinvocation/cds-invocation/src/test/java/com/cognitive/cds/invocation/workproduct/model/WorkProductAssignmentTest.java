/*******************************************************************************
 *
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
 *
 *******************************************************************************/
package com.cognitive.cds.invocation.workproduct.model;

import static org.junit.Assert.*;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.junit.Test;

import com.cognitive.cds.invocation.model.User;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class WorkProductAssignmentTest {

    private final String expectedWPA1 = "{" + "\"priority\":76," + "\"readStatus\":false," + "\"user\":{" + "\"codeSystem\":\"VA:ProviderId\"," + "\"entityType\":\"User\"," + "\"id\":\"1100032\","
            + "\"name\":\"Optional\"," + "\"type\":\"Provider\"" + "}," + "\"workProductId\":\"2929289789573\"," + "\"workProductType\":\"CDSAdvice\"" + "}";

    @Test
    public void testToJsonString() throws IOException, ParseException {

        WorkProductAssignment wpa = new WorkProductAssignment();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");

        Date dueDate = formatter.parse("4/10/2015/13:15:00");
        wpa.setDueDate(dueDate);

        Date expirationDate = formatter.parse("5/10/2015/13:15:00");
        wpa.setExpirationDate(expirationDate);

        wpa.setWorkProductType("CDSAdvice");
        wpa.setReadStatus(false);
        User usr = new User();
        usr.setCodeSystem("VA:ProviderId");
        usr.setType("Provider");
        usr.setId("1100032");
        usr.setName("Optional");
        wpa.setUser(usr);
        wpa.setPriority(76);
        wpa.setWorkProductId("2929289789573");

        String json = createWPA1().toJsonString();
        System.out.println(json);
        
		JsonParser parser = new JsonParser();
		JsonElement o1 = parser.parse(expectedWPA1);
		JsonElement o2 = parser.parse(json);
		assertEquals(o1, o2);
    }

    public void dumpAll() throws IOException, ParseException {
        System.out.println(createWPA1().toJsonString());
        System.out.println(createWPA2().toJsonString());
        System.out.println(createWPA3().toJsonString());

    }

    private WorkProductAssignment createWPA1() throws ParseException {
        WorkProductAssignment wpa = new WorkProductAssignment();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");

        Date dueDate = formatter.parse("4/10/2015/13:15:00");
        wpa.setDueDate(dueDate);

        Date expirationDate = formatter.parse("5/10/2015/13:15:00");
        wpa.setExpirationDate(expirationDate);

        wpa.setWorkProductType("CDSAdvice");
        wpa.setReadStatus(false);
        User usr = new User();
        usr.setCodeSystem("VA:ProviderId");
        usr.setType("Provider");
        usr.setId("1100032");
        usr.setName("Optional");
        wpa.setUser(usr);
        wpa.setPriority(76);
        wpa.setWorkProductId("2929289789573");
        return wpa;
    }

    private WorkProductAssignment createWPA2() throws ParseException {
        WorkProductAssignment wpa = new WorkProductAssignment();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");

        Date dueDate = formatter.parse("4/13/2015/13:15:00");
        wpa.setDueDate(dueDate);

        Date expirationDate = formatter.parse("5/22/2015/13:15:00");
        wpa.setExpirationDate(expirationDate);

        wpa.setWorkProductType("Proposal");
        wpa.setReadStatus(false);
        User usr = new User();
        usr.setCodeSystem("VA:ProviderId");
        usr.setType("Provider");
        usr.setId("1100032");
        usr.setName("Optional");
        wpa.setUser(usr);
        wpa.setPriority(45);
        wpa.setWorkProductId("2629289789573");
        return wpa;
    }

    private WorkProductAssignment createWPA3() throws ParseException {
        WorkProductAssignment wpa = new WorkProductAssignment();
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy/hh:mm:ss");

        Date dueDate = formatter.parse("4/3/2015/11:15:00");
        wpa.setDueDate(dueDate);

        Date expirationDate = formatter.parse("6/22/2015/13:15:00");
        wpa.setExpirationDate(expirationDate);

        wpa.setWorkProductType("CDSAdvise");
        wpa.setReadStatus(false);
        User usr = new User();
        usr.setCodeSystem("VA:ProviderId");
        usr.setType("Provider");
        usr.setId("1100032");
        usr.setName("Optional");
        wpa.setUser(usr);
        wpa.setPriority(45);
        wpa.setWorkProductId("3429289789573");
        return wpa;
    }
}
