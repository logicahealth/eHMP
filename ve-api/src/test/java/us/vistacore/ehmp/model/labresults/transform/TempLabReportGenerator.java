package us.vistacore.ehmp.model.labresults.transform;

import org.hl7.fhir.instance.model.CodeableConcept;
import org.hl7.fhir.instance.model.Coding;
import org.hl7.fhir.instance.model.DateAndTime;
import org.hl7.fhir.instance.model.DateTime;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Extension;
import org.hl7.fhir.instance.model.Narrative;
import org.hl7.fhir.instance.model.Organization;
import org.hl7.fhir.instance.model.Patient;
import org.hl7.fhir.instance.model.ResourceReference;
import org.hl7.fhir.instance.model.String_;
import org.hl7.fhir.utilities.xhtml.NodeType;
import org.hl7.fhir.utilities.xhtml.XhtmlNode;
import org.junit.Test;
import us.vistacore.ehmp.model.transform.FhirToJson;
import us.vistacore.ehmp.model.transform.FhirToXML;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

public class TempLabReportGenerator {

    @Test
    public void testCyEmSp() {
        DiagnosticReport diagnosticReport = getDiagnosticReport("CY");
        try {
            FhirToXML.transform(diagnosticReport);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            FhirToJson.transform(diagnosticReport);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private DiagnosticReport getDiagnosticReport(String typeValue) {
        DiagnosticReport diagnosticReport = new DiagnosticReport();

        //text{}
        String content = "Collected: <<diagnostic[DateTime]>> <br>"
            + "Report Released: <<issued>> <br>"
            + "Accession: <<extension[externalAccession].value>> <br>";
        XhtmlNode node = new XhtmlNode(NodeType.Element);
        node.setName("div");
        node.addText(content);

        Narrative narrative = new Narrative();
        narrative.setStatusSimple(Narrative.NarrativeStatus.generated);
        narrative.setDiv(node);

        diagnosticReport.setText(narrative);

        //name{}
        //diagnosticReport.setName(getName(typeValue));

        //status
        //If the accession.resulted.value is not null, then DiagnosticeReport:status = 'final', else DiagnosticeReport:status = 'partial'
        diagnosticReport.setStatusSimple(DiagnosticReport.DiagnosticReportStatus.partial);

        //issued
        DateTime issuedDate = new DateTime();
        //issuedDate.setValue("1996-03-27T10:23:00Z");

        issuedDate.setValue(new DateAndTime(new Date()));
        diagnosticReport.setIssued(issuedDate);

        //performer
        Organization org = new Organization();
        org.setNameSimple("500/CAMP MASTER");
        UUID orgReferenceId = UUID.randomUUID();
        org.setXmlId(orgReferenceId.toString());

        //add performer reference
        ResourceReference orgReference = new ResourceReference();
        orgReference.setReferenceSimple("#" + orgReferenceId.toString());
        diagnosticReport.setPerformer(orgReference);

        //add contained subject
        diagnosticReport.getContained().add(org);

        //subject
        Patient patient = new Patient();
        patient.setActiveSimple(Boolean.TRUE);
        UUID patientReferenceId = UUID.randomUUID();
        patient.setXmlId(patientReferenceId.toString());

        //add subject reference
        ResourceReference patientReference = new ResourceReference();
        patientReference.setReferenceSimple("#" + patientReferenceId.toString());
        diagnosticReport.setSubject(patientReference);

        //add contained subject
        diagnosticReport.getContained().add(patient);

        //requestDetail
        //skip

        //serviceCategory
        CodeableConcept serviceCategory = new CodeableConcept();
        Coding serviceCoding = new Coding();
        serviceCoding.setSystemSimple("http://loinc.org");
        serviceCoding.setCodeSimple("urn:lnc:47528-5");
        serviceCoding.setDisplaySimple("Cytopathology");
        serviceCategory.getCoding().add(serviceCoding);
        serviceCategory.setTextSimple("Cytopathology");

        diagnosticReport.setServiceCategory(serviceCategory);

        //diagnostic
        DateTime diagnosticDate = new DateTime();
        try {
            diagnosticDate.setValue(new DateAndTime("1996-03-27T10:23:00Z"));
        } catch (ParseException e1) {
            e1.printStackTrace();
        }
        diagnosticReport.setDiagnostic(diagnosticDate);

        //specimen
        //(Cannot use with current Implementation version)

        //extensions
        Extension externalAccession = new Extension();
        externalAccession.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalAccession");
        String_ externalAccessionStringValue = new String_();
        externalAccessionStringValue.setValue("CH 96 4");
        externalAccession.setValue(externalAccessionStringValue);

        diagnosticReport.getExtensions().add(externalAccession);

        Extension externalDocuments = new Extension();
        externalDocuments.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalDocuments");

        Extension externalDocument0 = new Extension();
        externalDocument0.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalDocument[0]");

        Extension externalDocument0Id = new Extension();
        externalDocument0Id.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalDocument[0].id");

        String_ externalDocument0IdStringValue = new String_();
        externalDocument0IdStringValue.setValue("CY;7039672.999999");
        externalDocument0Id.setValue(externalDocument0IdStringValue);

        Extension externalDocument0LocalTitle = new Extension();
        externalDocument0LocalTitle.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalDocument[0].localTitle");

        String_ externalDocument0LocalTitleStringValue = new String_();
        externalDocument0LocalTitleStringValue.setValue("LR CYTOPATHOLOGY REPORT");
        externalDocument0LocalTitle.setValue(externalDocument0LocalTitleStringValue);

        Extension externalDocument0NationalTitle = new Extension();
        externalDocument0NationalTitle.setUrlSimple("http://vistacore.us/fhir/profiles/@main#externalDocument[0].nationalTitle");

        String_ externalDocument0NationalTitleStringValue = new String_();
        externalDocument0NationalTitleStringValue.setValue("LABORATORY NOTE");
        externalDocument0NationalTitle.setValue(externalDocument0NationalTitleStringValue);

        externalDocument0.getExtensions().add(externalDocument0Id);
        externalDocument0.getExtensions().add(externalDocument0LocalTitle);
        externalDocument0.getExtensions().add(externalDocument0NationalTitle);

        externalDocuments.getExtensions().add(externalDocument0);

        diagnosticReport.getExtensions().add(externalDocuments);

        return diagnosticReport;



    }

}

