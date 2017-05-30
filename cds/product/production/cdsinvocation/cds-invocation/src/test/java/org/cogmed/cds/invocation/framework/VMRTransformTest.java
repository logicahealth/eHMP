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
package org.cogmed.cds.invocation.framework;

import java.io.IOException;
import java.io.StringReader;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.namespace.QName;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.opencds.vmr.v1_0.schema.CD;
import org.opencds.vmr.v1_0.schema.CDSInput;
import org.opencds.vmr.v1_0.schema.EvaluatedPerson;
import org.opencds.vmr.v1_0.schema.II;
import org.opencds.vmr.v1_0.schema.TS;
import org.opencds.vmr.v1_0.schema.VMR;
import org.opencds.vmr.v1_0.schema.EvaluatedPerson.Demographics;

import com.cognitive.cds.invocation.engineplugins.OpenCDS;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class VMRTransformTest extends TestCase {
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public VMRTransformTest( String testName ) {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite() {
        return new TestSuite( VMRTransformTest.class );
    }

    /**
     * Rigourous Test :-)
     */
    public void testCDSInputToXML() {
    	try {
			 
			JAXBContext jaxbContext = JAXBContext.newInstance(CDSInput.class);
			Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
	 
			// output pretty printed
			jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
	 
			//jaxbMarshaller.marshal(customer, file);
			CDSInput input = new CDSInput();
			II inputId = new II();
			inputId.setRoot("2.16.840.1.113883.3.1829.11.1.1.1");
			input.getTemplateId().add(inputId);
			
			VMR vmr = new VMR();
			II templateId = new II();
			templateId.setRoot("2.16.840.1.113883.3.1829.11.1.2.1");
			vmr. getTemplateId().add(templateId);
			EvaluatedPerson patient = new EvaluatedPerson();
			II rootId = new II();
			rootId.setRoot("2.16.840.1.113883.3.348.61.7");
			rootId.setExtension("100104");
			patient.setId(rootId);
			Demographics dem = new Demographics();
			TS birthTime = new TS();
			birthTime.setValue("19450407");
			dem.setBirthTime(birthTime);
			CD gender = new CD();
			gender.setCode("M");
			gender.setCodeSystem("2.16.840.1.113883.1.11.1");
			gender.setOriginalText("M");
			dem.setGender(gender);
			patient.setDemographics(dem);
			EvaluatedPerson.ClinicalStatements statements = new EvaluatedPerson.ClinicalStatements();
			patient.setClinicalStatements(statements);
			vmr.setPatient(patient);
			input.setVmrInput(vmr);
			
			OpenCDS opencds = new OpenCDS();
			String xmlInput = opencds.jaxbMarshal(input);
			CDSInput cdsInput = unmarshalCDSInput(xmlInput);
			assertTrue(cdsInput.getVmrInput().getPatient().getDemographics().getGender().getCode().equals("M"));
	 
		    } catch (JAXBException | IOException e) {
		    	  e.printStackTrace();
		}
    }
    
    private CDSInput unmarshalCDSInput(String xmlString){
        CDSInput output = null;
    	try {
			JAXBContext jaxbContext = JAXBContext.newInstance(CDSInput.class);
	        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
	        XMLInputFactory factory = XMLInputFactory.newFactory(); 
	       
			XMLStreamReader streamReader = factory.createXMLStreamReader(new StringReader(xmlString));
			JAXBElement<CDSInput> root = jaxbUnmarshaller.unmarshal(streamReader, CDSInput.class);
	         output = root.getValue();
		} 
		catch (XMLStreamException e) {
				e.printStackTrace();
			}
		catch (JAXBException e) {
				e.printStackTrace();
			  }  
		return output;
	}
    private String jaxbMarshal(CDSInput jaxbObj) throws javax.xml.bind.JAXBException, java.io.IOException {
		java.io.StringWriter sw = new java.io.StringWriter();
		javax.xml.bind.JAXBContext jaxbCtx = javax.xml.bind.JAXBContext.newInstance(jaxbObj.getClass().getPackage().getName());
		javax.xml.bind.Marshaller marshaller = jaxbCtx.createMarshaller();
		marshaller.setProperty(javax.xml.bind.Marshaller.JAXB_ENCODING, "UTF-8");
		
		marshaller.setProperty(javax.xml.bind.Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
		marshaller.setProperty(Marshaller.JAXB_FRAGMENT, Boolean.TRUE); // to remove standalone="yes" from the xml
		marshaller.marshal(new JAXBElement(new QName("", "cdsInput"), CDSInput.class, jaxbObj), sw);
		sw.close();
		return sw.toString();
		}
    public void testParseVprJsonToVmrXML(){
    	String vprJson = "{\"apiVersion\":\"1.0\",\"data\":{\"updated\":20140825152246,\"totalItems\":1,\"currentItemCount\":1,\"items\":[{\"address\":[{\"city\":\"Any Town\",\"line1\":\"Any Street\",\"state\":\"WV\",\"use\":\"H\",\"zip\":\"99998-0071\"}],\"birthDate\":\"19350407\",\"briefId\":\"T0010\",\"contact\":[{\"name\":\"VETERAN,BROTHER\",\"summary\":\"VETERAN,BROTHER\",\"typeCode\":\"urn:va:pat-contact:NOK\",\"typeName\":\"Next of Kin\"}],\"cwadf\":\"AD\",\"disability\":[{\"disPercent\":30,\"name\":\"SUPRAVENTRICULAR ARRHYTHMIAS\",\"serviceConnected\":true,\"summary\":\"PatientDisability{uid='null'}\"},{\"disPercent\":10,\"name\":\"AUDITORY CANAL DISEASE\",\"serviceConnected\":true,\"summary\":\"PatientDisability{uid='null'}\"}],\"displayName\":\"Ten,Patient\",\"exposure\":[{\"name\":\"Unknown\",\"uid\":\"urn:va:mst:U\"},{\"name\":\"No\",\"uid\":\"urn:va:agent-orange:N\"},{\"name\":\"No\",\"uid\":\"urn:va:sw-asia:N\"},{\"name\":\"No\",\"uid\":\"urn:va:combat-vet:N\"},{\"name\":\"Unknown\",\"uid\":\"urn:va:head-neck-cancer:U\"},{\"name\":\"No\",\"uid\":\"urn:va:ionizing-radiation:N\"}],\"facility\":[{\"code\":\"500\",\"homeSite\":false,\"latestDate\":\"20020408\",\"localPatientId\":\"8\",\"name\":\"CAMP MASTER\",\"summary\":\"CAMP MASTER\",\"systemId\":\"9E7A\"},{\"code\":\"987\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"ASPEN (CMM)\",\"summary\":\"ASPEN (CMM)\"},{\"code\":\"988\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"BOCA RATON (CEE)\",\"summary\":\"BOCA RATON (CEE)\"},{\"code\":\"989\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"PARK CITY  (CII)\",\"summary\":\"PARK CITY  (CII)\"},{\"code\":\"990\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"SOUTH BEND (CKK)\",\"summary\":\"SOUTH BEND (CKK)\"},{\"code\":\"991\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"JAMESTOWN (CJJ)\",\"summary\":\"JAMESTOWN (CJJ)\"},{\"code\":\"992\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"LAREDO (CHH)\",\"summary\":\"LAREDO (CHH)\"},{\"code\":\"993\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"YUMA  (CGG)\",\"summary\":\"YUMA  (CGG)\"},{\"code\":\"994\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"LUBBOCK (CDD)\",\"summary\":\"LUBBOCK (CDD)\"},{\"code\":\"995\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"CENTRAL CITY (CCC)\",\"summary\":\"CENTRAL CITY (CCC)\"},{\"code\":\"996\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"CHAMPAIGN (CFF)\",\"summary\":\"CHAMPAIGN (CFF)\"},{\"code\":\"997\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"CHARLESTON (CBB)\",\"summary\":\"CHARLESTON (CBB)\"},{\"code\":\"998\",\"homeSite\":true,\"latestDate\":\"20010101\",\"name\":\"ABILENE (CAA)\",\"summary\":\"ABILENE (CAA)\"},{\"code\":\"999\",\"homeSite\":false,\"latestDate\":\"20010101\",\"name\":\"LYNCHBURG (CLL)\",\"summary\":\"LYNCHBURG (CLL)\"}],\"familyName\":\"TEN\",\"fullName\":\"TEN,PATIENT\",\"genderCode\":\"urn:va:pat-gender:M\",\"genderName\":\"Male\",\"givenNames\":\"PATIENT\",\"homeFacility\":{\"code\":\"998\",\"homeSite\":true,\"latestDate\":\"20010101\",\"name\":\"ABILENE (CAA)\",\"summary\":\"ABILENE (CAA)\"},\"icn\":\"10110V004877\",\"insurance\":[{\"companyName\":\"MEDICARE\",\"groupNumber\":\"\",\"id\":\"8;2\",\"policyHolder\":\"OTHER\",\"policyType\":\"\",\"summary\":\"MEDICARE ()\"},{\"companyName\":\"HEALTH INSURANCE PLUS\",\"effectiveDate\":\"29201010\",\"groupNumber\":\"415\",\"id\":\"8;1\",\"policyHolder\":\"SELF\",\"policyType\":\"TRICARE\",\"summary\":\"HEALTH INSURANCE PLUS (TRICARE)\"},{\"companyName\":\"PRIVATE INSURANCE CO INC\",\"groupNumber\":\"\",\"id\":\"8;3\",\"policyHolder\":\"OTHER\",\"policyType\":\"\",\"summary\":\"PRIVATE INSURANCE CO INC ()\"}],\"last4\":\"0010\",\"last5\":\"T0010\",\"localId\":\"8\",\"lrdfn\":\"24\",\"maritalStatusCode\":\"urn:va:pat-maritalStatus:S\",\"maritalStatusName\":\"Never Married\",\"pid\":\"9E7A;8\",\"religionCode\":\"urn:va:pat-religion:24\",\"religionName\":\"PROTESTANT\",\"scPercent\":\"20\",\"sensitive\":false,\"serviceConnected\":true,\"ssn\":\"666000010\",\"summary\":\"gov.va.cpe.vpr.PatientDemographics{pids=[10110V004877, 500;8, 666000010, 9E7A;8]}\",\"syncErrorCount\":0,\"teamInfo\":{\"associateProvider\":{\"name\":\"unassigned\"},\"attendingProvider\":{\"name\":\"unassigned\"},\"inpatientProvider\":{\"name\":\"unassigned\"},\"mhCoordinator\":{\"mhPosition\":\"unassigned\",\"mhTeam\":\"unassigned\",\"name\":\"unassigned\"},\"primaryProvider\":{\"name\":\"unassigned\"},\"team\":{\"name\":\"unassigned\"},\"text\":\"No Primary Care Team Assigned. No Primary Care Provider Assigned. No Associate Provider Assigned.\"},\"telecom\":[{\"use\":\"WP\",\"value\":\"(222)555-7777\"},{\"use\":\"H\",\"value\":\"(222)555-7777\"}],\"uid\":\"urn:va:patient:9E7A:8:8\",\"veteran\":true}]}}";
    	OpenCDS opencds = new OpenCDS();
    	//String vmr = StringEscapeUtils.unescapeJson(vmrJson);
    	String vmrXml   = opencds.parseVprJsonToVmrXml(vprJson);
    	CDSInput input  = unmarshal(vmrXml);
    	assertTrue(input.getVmrInput().getPatient().getDemographics().getGender().getCode().equals("M"));
    	assertTrue(input.getVmrInput().getPatient().getDemographics().getBirthTime().getValue().equals("19350407"));
    }
    public CDSInput unmarshal(String xmlString){
		 CDSInput input = null;
		 try {
			JAXBContext jaxbContext = JAXBContext.newInstance(CDSInput.class);
	        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
	        XMLInputFactory factory = XMLInputFactory.newFactory(); 
	       
			XMLStreamReader streamReader = factory.createXMLStreamReader(new StringReader(xmlString));
			JAXBElement<CDSInput> root = jaxbUnmarshaller.unmarshal(streamReader, CDSInput.class);
	        input = root.getValue();
		 } 
		 catch (XMLStreamException e) {
			 System.out.println("Couldn't read the cdsinput xml.");
			}
		 catch (JAXBException e) {
			 System.out.println("Couldn't unmarshal the cdsoutput xml to CDSInput object.");;
			  }
		 		
	        return input;
	}
	
}
