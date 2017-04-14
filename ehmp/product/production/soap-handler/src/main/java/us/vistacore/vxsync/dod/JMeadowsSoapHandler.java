package us.vistacore.vxsync.dod;

import javax.ws.rs.core.Response;

public interface JMeadowsSoapHandler {
    String SITE_CODE_1 = "2.16.840.1.113883.3.42.10002.100001.8";
    String SITE_CODE_2 = "2.16.840.1.113883.3.42.10009.100001.13";

    String getJMeadowsAllergy(String edipi);

    String getJMeadowsLab(String edipi);

    String getJMeadowsAppointment(String edipi);

    String getJMeadowsImmunization(String edipi);

    String getJMeadowsEncounter(String edipi);

    String getJMeadowsDemographics(String edipi);

    String getJMeadowsConsult(String edipi);

    String getJMeadowsMedication(String edipi);

    String getJMeadowsOrder(String edipi);

    String getJMeadowsProblem(String edipi);

    String getJMeadowsRadiology(String edipi);

    String getJMeadowsVital(String edipi);

    String getJMeadowsProgressNote(String edipi);

    String getJMeadowsDischargeSummary(String edipi);

    Response getJMeadowsDocument(String uri);

    String getVlerDocuments(String edipi);
}
