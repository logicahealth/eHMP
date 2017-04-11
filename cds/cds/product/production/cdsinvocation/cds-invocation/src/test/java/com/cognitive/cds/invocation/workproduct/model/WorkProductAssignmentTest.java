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
