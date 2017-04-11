package us.vistacore.vxsync.mvi;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.math.BigInteger;


import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;

import org.hl7.v3.CD;
import org.hl7.v3.CS;
import org.hl7.v3.CommunicationFunctionType;
import org.hl7.v3.EntityClassDevice;
import org.hl7.v3.II;
import org.hl7.v3.MCCIMT000100UV01Device;
import org.hl7.v3.MCCIMT000100UV01Receiver;
import org.hl7.v3.MCCIMT000100UV01Sender;
import org.hl7.v3.PRPAMT201307UV02PatientIdentifier;
import org.hl7.v3.PRPAMT201306UV02LivingSubjectId;
import org.hl7.v3.PRPAMT201306UV02LivingSubjectName;
import org.hl7.v3.PRPAMT201306UV02LivingSubjectBirthTime;
import org.hl7.v3.PRPAMT201306UV02ParameterList;
import org.hl7.v3.EN;
import org.hl7.v3.INT;
import org.hl7.v3.IVLTS;

import org.hl7.v3.TS;

import us.vistacore.vxsync.id.MviId;

public final class MviCommonUtility {

	public static final String ROOT_CODE_1 = "2.16.840.1.113883.4.349";
	public static final String ROOT_CODE_2 = "2.16.840.1.113883.1.6";
	public static final String ROOT_CODE_3 = "2.16.840.1.113883.4.349";
	public static final String ROOT_CODE_4 = "1.2.840.114350.1.13.99997.2.7788";
	public static final String ROOT_CODE_5 = "1.2.840.114350.1.13.99999.4567.34";
	
	private static String senderCode = "200EHMP";
	
	public static void setSenderCode(String code) {
		senderCode = code;
	}
	
	public static PRPAMT201307UV02PatientIdentifier getPatientIdentifierElement(MviId pid) {
		PRPAMT201307UV02PatientIdentifier patientID = new PRPAMT201307UV02PatientIdentifier();
		patientID.setSemanticsText("Patient.Id");
		patientID.getValue().add(createId(ROOT_CODE_1, pid.toString()));
		return patientID;
	}

	public static PRPAMT201306UV02LivingSubjectId getLivingSubjectIdElement(String ssn) {
		PRPAMT201306UV02LivingSubjectId subId = new PRPAMT201306UV02LivingSubjectId();
		subId.setSemanticsText("SSN");
		subId.getValue().add(createId(ROOT_CODE_1, ssn));
		return subId;
	}

	public static void addLivingSubjectIdElementToParameterList(PRPAMT201306UV02ParameterList paramList, String ssn) {
		List<PRPAMT201306UV02LivingSubjectId> livingSubId = paramList.getLivingSubjectId();
		livingSubId.add(getLivingSubjectIdElement(ssn));
	}

	public static void addLivingSubjectNameElementToParameterList(PRPAMT201306UV02ParameterList paramList, String firstName, String lastName) {
		List<PRPAMT201306UV02LivingSubjectName> livingSubId = paramList.getLivingSubjectName();
		livingSubId.add(getLivingSubjectName(firstName, lastName));
	}

	public static void addLivingSubjectBirthTimeElementToParameterList(PRPAMT201306UV02ParameterList paramList, String birthDate) {
		List<PRPAMT201306UV02LivingSubjectBirthTime> livingSubBirthTime = paramList.getLivingSubjectBirthTime();
		PRPAMT201306UV02LivingSubjectBirthTime birthTime = new PRPAMT201306UV02LivingSubjectBirthTime();
		IVLTS birthIVLTS = new IVLTS();
		birthIVLTS.setValue(birthDate);
		birthTime.getValue().add(birthIVLTS);
		birthTime.setSemanticsText("Date of Birth");
		livingSubBirthTime.add(birthTime);
	}

	public static PRPAMT201306UV02LivingSubjectName getLivingSubjectName(String firstName, String lastName) {
		PRPAMT201306UV02LivingSubjectName livingSubName = new PRPAMT201306UV02LivingSubjectName();
		livingSubName.setSemanticsText("Legal Name");
		livingSubName.getValue().add(createEnExplicit(firstName, lastName));
		return livingSubName;
	}

	public static EN createEnExplicit(String firstName, String lastName) {
		EN enExplicit = new EN();
		enExplicit.getUse().add("L");
		// enExplicit.getContent().add(factory.createENGiven(firstName));
		// We should be using the the statement above to add the right XML value, however, our MockMvi does not
		// seem to support full-fledged XML parsing, it seems to have issue with ns2 namespace that above statement generated
		enExplicit.getContent().add(new JAXBElement<String>(new QName("given"), String.class, EN.class, firstName));
		// enExplicit.getContent().add(factory.createENFamily(lastName));
		enExplicit.getContent().add(new JAXBElement<String>(new QName("family"), String.class, EN.class, lastName));
		return enExplicit;
	}

	public static II createId(String root, String extension) {
		II id = new II();
		id.setExtension(extension);
		id.setRoot(root);
		return id;
	}
	
	public static CS createCode(String codeValue) {
		CS code = new CS();
		code.setCode(codeValue);
		return code;
	}
	
	public static CD createCodeElement(String code, String system) {
		CD cd = new CD();
		cd.setCode(code);
		cd.setCodeSystem(system);
		
		return cd;
	}

	public static INT createInt(String  intValue) {
		INT iNT = new INT();
		iNT.setValue(new BigInteger(intValue));
		return iNT;
	}
	
	public static MCCIMT000100UV01Sender getSender(){
		MCCIMT000100UV01Device device = new MCCIMT000100UV01Device();
		device.getId().add(createId(ROOT_CODE_4, senderCode));
		device.setClassCode(EntityClassDevice.DEV);
		device.setDeterminerCode("INSTANCE");
		MCCIMT000100UV01Sender sender = new MCCIMT000100UV01Sender();
		sender.setDevice(device);
		sender.setTypeCode(CommunicationFunctionType.SND);
		
		return sender;
	}
	
	public static MCCIMT000100UV01Receiver getReceiver(){
		MCCIMT000100UV01Receiver receiver = new MCCIMT000100UV01Receiver();
		MCCIMT000100UV01Device device = new MCCIMT000100UV01Device();
		device.setTypeId(createId(ROOT_CODE_3, null));
		device.setClassCode(EntityClassDevice.DEV);
		device.setDeterminerCode("INSTANCE");
		receiver.setDevice(device);
		receiver.setTypeCode(CommunicationFunctionType.RCV);
		
		return receiver;
	}
	
	public static TS getTimestamp(Date date){
		if(date == null) {
			date = new Date();
		}
		DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
		TS timestamp = new TS();
		timestamp.setValue(df.format(date));
		return timestamp;
	}
	
}
