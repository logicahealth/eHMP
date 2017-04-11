package gov.va.jmeadows;

import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.hmp.HmpProperties;
import gov.va.med.jmeadows.webservice.*;
import org.junit.Before;
import org.junit.Test;
import org.springframework.core.env.Environment;
import org.springframework.core.env.StandardEnvironment;

import javax.xml.datatype.DatatypeConfigurationException;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static gov.va.jmeadows.JMeadowsClientUtils.SOURCE_PROTOCOL_DODADAPTER;
import static junit.framework.Assert.assertNotNull;
import static junit.framework.TestCase.assertTrue;
import static junit.framework.TestCase.fail;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class JMeadowsLabServiceTest {

    private String DOD_STATUS_REPORT_FLAG = "DODADAPTER_SOURCE_STATUS_REPORT";

    private JMeadowsData mockJMeadowsClient;
    private JMeadowsLabService jMeadowsLabService;
    private Environment mockEnvironment;

    private String vistaId = "9E7A";
    private String icn = "123456789";
    private String dfn = "4321";
    private String pid = vistaId +";"+ dfn;
    private String uid = "urn:va:patient:"+vistaId+":"+ dfn +":"+ icn;
    private String edipi = "0000000001";

    private String url = "test.url";
    private long timeoutMS = 40000;
    private String userName = "test.username";
    private String userIen = "test.ien";
    private String userSiteCode = "test.sitecode";
    private String userSiteName = "test.sitename";

    private User user;
    private Patient patient;

    /*@Before
    public void setup() {

        mockEnvironment = mock(StandardEnvironment.class);

        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_URL)).thenReturn("http://10.4.4.104/jMeadows/JMeadowsDataService?wsdl");
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_TIMEOUT_MS)).thenReturn("" +4500);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_NAME)).thenReturn("VEHU,TEN");
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_IEN)).thenReturn("20012");
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_SITE_CODE)).thenReturn("200");
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_SITE_NAME)).thenReturn("CAMP MASTER");


        this.mockJMeadowsClient = JMeadowsClientFactory.getInstance(new JMeadowsConfiguration(mockEnvironment));
        this.jMeadowsLabService = new JMeadowsLabService(new JMeadowsConfiguration(mockEnvironment));
        this.jMeadowsLabService.setJMeadowsClient(mockJMeadowsClient);

        user = new User();
        user.setUserIen("20012");
        Site hostSite = new Site();
        hostSite.setSiteCode("200");
        hostSite.setAgency("VA");
        hostSite.setMoniker("CAMP MASTER");
        hostSite.setName("CAMP MASTER");
        user.setHostSite(hostSite);

        patient = new Patient();
        patient.setEDIPI("test.edipi");
    }    */



    @Before
    public void setup() {

        mockEnvironment = mock(StandardEnvironment.class);

        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_URL)).thenReturn(url);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_TIMEOUT_MS)).thenReturn("" + timeoutMS);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_NAME)).thenReturn(userName);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_IEN)).thenReturn(userIen);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_SITE_CODE)).thenReturn(userSiteCode);
        when(mockEnvironment.getProperty(HmpProperties.JMEADOWS_USER_SITE_NAME)).thenReturn(userSiteName);

        this.mockJMeadowsClient = mock(JMeadowsData.class);
        this.jMeadowsLabService = new JMeadowsLabService(new JMeadowsConfiguration(mockEnvironment));
        this.jMeadowsLabService.setJMeadowsClient(mockJMeadowsClient);

        user = new User();
        user.setUserIen("test.ien");
        Site hostSite = new Site();
        hostSite.setSiteCode("test.site.code");
        hostSite.setAgency("VA");
        hostSite.setMoniker("test.moniker");
        hostSite.setName("test.site.name");
        user.setHostSite(hostSite);

        patient = new Patient();
        patient.setEDIPI("test.edipi");
    }

    @Test
     public void testFetchPatientChemistryLabs() {
        try {

            when(this.mockJMeadowsClient.getPatientLabResults(any(JMeadowsQuery.class))).thenReturn(createTestChemLabData());

            JMeadowsQuery query = new JMeadowsQueryBuilder()
                    .user(user)
                    .patient(patient)
                    .build();

            PatientIds patientIds = new PatientIds.Builder()
                    .pid(pid)
                    .icn(icn)
                    .uid(uid)
                    .edipi(edipi)
                    .build();

            List<VistaDataChunk> vistaDataChunkList = jMeadowsLabService.fetchDodPatientChemistryLabs(query, patientIds);

            assertNotNull(vistaDataChunkList);


            assertThat(vistaDataChunkList.size(), is(2));

            List<LabResult> testDataList = createTestChemLabData();

            for(int i = 0; i < vistaDataChunkList.size(); i++)
            {
                VistaDataChunk vistaDataChunk = vistaDataChunkList.get(i);

                assertThat(JMeadowsLabService.DOMAIN_LAB, is(vistaDataChunk.getDomain()));
                assertThat(2, is(vistaDataChunk.getItemCount()));
                assertThat(i+1, is(vistaDataChunk.getItemIndex()));
                assertThat(vistaId, is(vistaDataChunk.getParams().get("vistaId")));
                assertThat(dfn, is(vistaDataChunk.getParams().get("patientDfn")));
                assertThat(vistaId, is(vistaDataChunk.getSystemId()));
                assertThat(dfn, is(vistaDataChunk.getLocalPatientId()));
                assertThat(icn, is(vistaDataChunk.getPatientIcn()));
                assertThat(pid, is(vistaDataChunk.getPatientId()));
                assertThat("vrpcb://9E7A/VPR SYNCHRONIZATION CONTEXT/VPRDJFS API", is(vistaDataChunk.getRpcUri()));
                assertThat(VistaDataChunk.NEW_OR_UPDATE, is(vistaDataChunk.getType()));

                Map<String,Object> jsonMap = vistaDataChunk.getJsonMap();

                LabResult testLab = testDataList.get(i);

                assertThat("DOD", is(jsonMap.get("facilityCode")));
                assertThat(testLab.getFacilityName(), is(jsonMap.get("facilityName")));
                assertThat("urn:va:lab:DOD:"+edipi+":"+testLab.getCdrEventId(), is(jsonMap.get("uid")));
                assertThat(testLab.getTestName(), is(jsonMap.get("displayName")));
                assertThat(testLab.getSpecimen(), is(jsonMap.get("specimen")));
                assertThat(testLab.getOrderId(), is(jsonMap.get("orderId")));
                assertThat(testLab.getResult(), is(jsonMap.get("result")));
                assertThat("Laboratory", is(jsonMap.get("kind")));
                assertThat("urn:va:lab-category:CH", is(jsonMap.get("categoryCode")));
                assertThat(testLab.getTestName(), is(jsonMap.get("typeName")));

                Double low = Double.parseDouble((String) jsonMap.get("low"));
                assertThat(low, notNullValue());

                Double high = Double.parseDouble((String) jsonMap.get("high"));
                assertThat(high, notNullValue());

                assertThat(testLab.getComment(), is(jsonMap.get("comment")));
                assertThat(testLab.getUnits(), is(jsonMap.get("units")));

            }


        } catch (JMeadowsException_Exception e) {
            fail(e.getMessage());
        }
    }


    @Test
    public void testFetchPatientAnatomicPathologiesLabs() {
        try {

            when(this.mockJMeadowsClient.getPatientLabResults(any(JMeadowsQuery.class))).thenReturn(createTestAnatomicPathologyLabData());

            JMeadowsQuery query = new JMeadowsQueryBuilder()
                    .user(user)
                    .patient(patient)
                    .build();

            PatientIds patientIds = new PatientIds.Builder()
                    .pid(pid)
                    .icn(icn)
                    .uid(uid)
                    .edipi(edipi)
                    .build();

            List<VistaDataChunk> vistaDataChunkList = jMeadowsLabService.fetchDodPatientAnatomicPathologyLabs(query, patientIds);

            assertNotNull(vistaDataChunkList);


            assertThat(vistaDataChunkList.size(), is(1));

            List<LabResult> testDataList = createTestAnatomicPathologyLabData();


            for(int i = 0; i < vistaDataChunkList.size(); i++)
            {
                VistaDataChunk vistaDataChunk = vistaDataChunkList.get(i);

                assertThat(JMeadowsLabService.DOMAIN_LAB, is(vistaDataChunk.getDomain()));
                assertThat(1, is(vistaDataChunk.getItemCount()));
                assertThat(i+1, is(vistaDataChunk.getItemIndex()));
                assertThat(vistaId, is(vistaDataChunk.getParams().get("vistaId")));
                assertThat(dfn, is(vistaDataChunk.getParams().get("patientDfn")));
                assertThat(vistaId, is(vistaDataChunk.getSystemId()));
                assertThat(dfn, is(vistaDataChunk.getLocalPatientId()));
                assertThat(icn, is(vistaDataChunk.getPatientIcn()));
                assertThat(pid, is(vistaDataChunk.getPatientId()));
                assertThat("vrpcb://9E7A/VPR SYNCHRONIZATION CONTEXT/VPRDJFS API", is(vistaDataChunk.getRpcUri()));
                assertThat(VistaDataChunk.NEW_OR_UPDATE, is(vistaDataChunk.getType()));

                Map<String,Object> jsonMap = vistaDataChunk.getJsonMap();

                LabResult testLab = testDataList.get(i);
                String labType = getLabType(testLab.getAccession());
                assertThat("DOD", is(jsonMap.get("facilityCode")));
                assertThat(testLab.getFacilityName(), is(jsonMap.get("facilityName")));
                assertThat("urn:va:lab:DOD:"+edipi+":"+testLab.getCdrEventId(), is(jsonMap.get("uid")));
                assertThat(testLab.getTestName(), is(jsonMap.get("displayName")));
                assertThat(testLab.getSpecimen(), is(jsonMap.get("specimen")));
                assertThat(testLab.getOrderId(), is(jsonMap.get("orderId")));
                assertThat(testLab.getResult(), is(jsonMap.get("result")));
                assertThat(getLabCategoryName(labType), is(jsonMap.get("kind")));
                assertThat("urn:va:lab-category:AP", is(jsonMap.get("categoryCode")));
                assertThat(null, is(jsonMap.get("typeName")));
                assertThat(testLab.getComment(), is(jsonMap.get("comment")));


            }


        } catch (JMeadowsException_Exception e) {
            fail(e.getMessage());
        }
    }

   @Test
    public void testNullAndEmptyLabList()
    {
        try {

            //return null list
            when(this.mockJMeadowsClient.getPatientLabResults(any(JMeadowsQuery.class))).thenReturn(null);

            JMeadowsQuery query = new JMeadowsQueryBuilder()
                    .user(user)
                    .patient(patient)
                    .build();

            PatientIds patientIds = new PatientIds.Builder()
                    .pid(pid)
                    .icn(icn)
                    .uid(uid)
                    .edipi(edipi)
                    .build();

            List<VistaDataChunk> vistaDataChunkList = jMeadowsLabService.fetchDodPatientAnatomicPathologyLabs(query, patientIds);

            assertNotNull(vistaDataChunkList);
            assertThat(vistaDataChunkList.size(), is(0));


            //return empty list
            when(this.mockJMeadowsClient.getPatientLabResults(any(JMeadowsQuery.class))).thenReturn(new ArrayList<LabResult>());

            assertNotNull(vistaDataChunkList);
            assertThat(vistaDataChunkList.size(), is(0));

        } catch (JMeadowsException_Exception e) {
            fail(e.getMessage());
        }
    }

    @Test
    public void testParseReferenceRange() {

        Map<String, String> refRangeMap = jMeadowsLabService.parseReferenceRange(".2-1.3");

        assertThat(refRangeMap.get("low"), is("0.2"));
        assertThat(refRangeMap.get("high"), is("1.3"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("6.3-8.2");

        assertThat(refRangeMap.get("low"), is("6.3"));
        assertThat(refRangeMap.get("high"), is("8.2"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("6.3-.22");

        assertThat(refRangeMap.get("low"), is("6.3"));
        assertThat(refRangeMap.get("high"), is("0.22"));

        refRangeMap = jMeadowsLabService.parseReferenceRange(".35-4.94");

        assertThat(refRangeMap.get("low"), is("0.35"));
        assertThat(refRangeMap.get("high"), is("4.94"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("0.0-2.5");

        assertThat(refRangeMap.get("low"), is("0.0"));
        assertThat(refRangeMap.get("high"), is("2.5"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("0-400");

        assertThat(refRangeMap.get("low"), is("0"));
        assertThat(refRangeMap.get("high"), is("400"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("(25-28.5)");

        assertThat(refRangeMap.get("low"), is("25"));
        assertThat(refRangeMap.get("high"), is("28.5"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("0-40.5");

        assertThat(refRangeMap.get("low"), is("0"));
        assertThat(refRangeMap.get("high"), is("40.5"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("2.5-10)");

        assertThat(refRangeMap.get("low"), is("2.5"));
        assertThat(refRangeMap.get("high"), is("10"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("(5 - 200)");

        assertThat(refRangeMap.get("low"), is("5"));
        assertThat(refRangeMap.get("high"), is("200"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("(5.2 - 21.7)");

        assertThat(refRangeMap.get("low"), is("5.2"));
        assertThat(refRangeMap.get("high"), is("21.7"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("(.23 - .5)");

        assertThat(refRangeMap.get("low"), is("0.23"));
        assertThat(refRangeMap.get("high"), is("0.5"));

        refRangeMap = jMeadowsLabService.parseReferenceRange("2.5-somestringvalue");
        assertTrue(refRangeMap.isEmpty());

        refRangeMap = jMeadowsLabService.parseReferenceRange("somestringvalue-22.5");
        assertTrue(refRangeMap.isEmpty());

        refRangeMap = jMeadowsLabService.parseReferenceRange("(string - otherstring)");
        assertTrue(refRangeMap.isEmpty());

        refRangeMap = jMeadowsLabService.parseReferenceRange("NEGATIVE");
        assertTrue(refRangeMap.isEmpty());

        refRangeMap = jMeadowsLabService.parseReferenceRange("null");
        assertTrue(refRangeMap.isEmpty());
    }


    private List<LabResult> createTestAnatomicPathologyLabData()
    {
        Site dodSite = new Site();
        dodSite.setMoniker("DOD");
        dodSite.setSiteCode("DOD");
        dodSite.setName("DOD");

        //anatomic pathology
        LabResult labResult = new LabResult();
        labResult.setAccession("result.accession.2^AP");
        labResult.setTestName("result.test.2");
        labResult.setResult("result.result.2");
        labResult.setHiLoFlag("result.hilo.2");
        labResult.setReferenceRange("(2.2-4.5)");
        labResult.setCdrEventId("987654321");

        XMLGregorianCalendar labDate = null;
        try {
            labDate = DatatypeFactory.newInstance().newXMLGregorianCalendar();
        }catch (DatatypeConfigurationException dce) {
            fail(dce.getMessage());
        }
        labDate.setTime(14, 40, 00);
        labDate.setDay(6);
        labDate.setMonth(3);
        labDate.setYear(2013);

        labResult.setResultDate(labDate);
        labResult.setComment("result.comment.2");
        labResult.setVerifiedBy("result.verfiedby.2");
        labResult.setUnits("result.units.2");
        labResult.setSpecimen("result.specimen.2");
        labResult.setFacilityName("result.facility.2");

        labResult.setSite(dodSite);
        labResult.setSourceProtocol(SOURCE_PROTOCOL_DODADAPTER);

        return Arrays.asList(labResult);
    }

    private List<LabResult> createTestChemLabData()   {

         //create two test lab results

        Site dodSite = new Site();
        dodSite.setMoniker("DOD");
        dodSite.setSiteCode("DOD");
        dodSite.setName("DOD");


        LabResult labResult1 = new LabResult();
        labResult1.setAccession("result.accession.1^CH");

        labResult1.setTestName("result.test.1");
        labResult1.setResult("result.result.1");
        labResult1.setHiLoFlag("result.hilo.1");
        labResult1.setReferenceRange("0-240");
        labResult1.setUnits("results.units.1");

        XMLGregorianCalendar labDate = null;
        try {
            labDate = DatatypeFactory.newInstance().newXMLGregorianCalendar();
        }catch (DatatypeConfigurationException dce) {
            fail(dce.getMessage());
        }
        labDate.setTime(14, 40, 00);
        labDate.setDay(6);
        labDate.setMonth(3);
        labDate.setYear(2013);

        labResult1.setResultDate(labDate);
        labResult1.setComment("result.comment.1");
        labResult1.setVerifiedBy("result.verfiedby.1");
        labResult1.setUnits("result.units.1");
        labResult1.setSpecimen("result.specimen.1");
        labResult1.setFacilityName("result.facility.1");
        labResult1.setCdrEventId("123456789");

        labResult1.setSite(dodSite);
        labResult1.setSourceProtocol(SOURCE_PROTOCOL_DODADAPTER);

        LabResult labResult2 = new LabResult();
        labResult2.setAccession("result.accession.2^CH");
        labResult2.setTestName("result.test.2");
        labResult2.setResult("result.result.2");
        labResult2.setHiLoFlag("result.hilo.2");
        labResult2.setReferenceRange("(10-15)");
        labResult2.setCdrEventId("987654321");
        labResult2.setUnits("result.units.2");

        XMLGregorianCalendar labDate2 = null;
        try {
            labDate2 = DatatypeFactory.newInstance().newXMLGregorianCalendar();
        }catch (DatatypeConfigurationException dce) {
            fail(dce.getMessage());
        }
        labDate2.setTime(12, 30, 20);
        labDate2.setDay(5);
        labDate2.setMonth(6);
        labDate2.setYear(2010);

        labResult2.setResultDate(labDate2);
        labResult2.setComment("result.comment.2");
        labResult2.setVerifiedBy("result.verfiedby.2");
        labResult2.setUnits("result.units.2");
        labResult2.setSpecimen("result.specimen.2");
        labResult2.setFacilityName("result.facility.2");



        labResult2.setSite(dodSite);
        labResult2.setSourceProtocol(SOURCE_PROTOCOL_DODADAPTER);



        return Arrays.asList(labResult1,labResult2);

    }


    private String getLabType(String accession) {
        String labType = null;
        int pos = 0;

        if (accession != null) {
            pos = accession.indexOf('^', -1);
            if (pos >= 0) {
                labType = accession.substring(pos+1).trim();
            }
        }

        return labType;
    }

    private String getLabCategoryName(String labType)
    {
        if(labType != null)
        {
            if(labType.equals("CH"))
                return "Laboratory";
            else if(labType.equals("AP"))
                return "Pathology";
        }


        return "";
    }
}
