package us.vistacore.ehmp.webapi;

import org.hl7.fhir.instance.model.AdverseReaction;
import org.hl7.fhir.instance.model.Conformance;
import org.hl7.fhir.instance.model.DiagnosticReport;
import org.hl7.fhir.instance.model.Observation;
import org.hl7.fhir.instance.model.Patient;
import org.hl7.fhir.instance.model.Resource;

/**
 * A utility class for defining the eHMP FHIR Conformance resource.
 *
 * See base conformance at http://www.hl7.org/implement/standards/fhir/conformance-base.json.html
 */
public final class FhirConformance {

    private FhirConformance() { }

    /**
     * Returns a generated FHIR Conformance resource
     * @return a FHIR Conformance for the eHMP FHIR API
     */
    public static Conformance build() {
        Conformance conformance = new Conformance();
        Conformance.ConformanceRestComponent conformanceRestComponent = conformance.addRest();
        conformanceRestComponent.setModeSimple(Conformance.RestfulConformanceMode.server);
        addPatient(conformanceRestComponent);
        addAdverseReaction(conformanceRestComponent);
        addDiagnositicReport(conformanceRestComponent);
        addObservation(conformanceRestComponent);
        return conformance;
    }

    private static void addPatient(Conformance.ConformanceRestComponent conformanceRestComponent) {
        Conformance.ConformanceRestResourceComponent conformanceRestResourceComponent = conformanceRestComponent.addResource();
        conformanceRestResourceComponent.setTypeSimple(Patient.class.getSimpleName());
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.read);
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.searchtype);
        addSearchParamComponent(conformanceRestResourceComponent, new Patient(), "name", Conformance.SearchParamType.string);
        addSearchParamComponent(conformanceRestResourceComponent, new Patient(), "identifier", Conformance.SearchParamType.string);
    }

    private static void addAdverseReaction(Conformance.ConformanceRestComponent conformanceRestComponent) {
        Conformance.ConformanceRestResourceComponent conformanceRestResourceComponent = conformanceRestComponent.addResource();
        conformanceRestResourceComponent.setTypeSimple(AdverseReaction.class.getSimpleName());
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.read);
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.searchtype);
        addSearchParamComponent(conformanceRestResourceComponent, new AdverseReaction(), "subject", Conformance.SearchParamType.reference);
    }

    private static void addDiagnositicReport(Conformance.ConformanceRestComponent conformanceRestComponent) {
        Conformance.ConformanceRestResourceComponent conformanceRestResourceComponent = conformanceRestComponent.addResource();
        conformanceRestResourceComponent.setTypeSimple(DiagnosticReport.class.getSimpleName());
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.read);
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.searchtype);
        addSearchParamComponent(conformanceRestResourceComponent, new DiagnosticReport(), "subject", Conformance.SearchParamType.reference);

        // add SearchParam for 'domain'
        Conformance.ConformanceRestResourceSearchParamComponent domainParam = conformanceRestResourceComponent.addSearchParam();
        domainParam.setNameSimple("domain");
        domainParam.setTypeSimple(Conformance.SearchParamType.string);
//        domainParam.setDocumentationSimple(new DiagnosticReport().getChildByName("serviceCategory").getDefinition());
        domainParam.setDocumentationSimple("The VPR Domain of the desired Diagnostic Reports. The values are a subset of the diagnostic service section value set");
    }

    private static void addObservation(Conformance.ConformanceRestComponent conformanceRestComponent) {
        Conformance.ConformanceRestResourceComponent conformanceRestResourceComponent = conformanceRestComponent.addResource();
        conformanceRestResourceComponent.setTypeSimple(Observation.class.getSimpleName());
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.read);
        conformanceRestResourceComponent.addOperation().setCodeSimple(Conformance.TypeRestfulOperation.searchtype);
        addSearchParamComponent(conformanceRestResourceComponent, new Observation(), "subject", Conformance.SearchParamType.reference);
    }

    private static <T extends Resource> void addSearchParamComponent(Conformance.ConformanceRestResourceComponent conformanceRestResourceComponent, T resourceClass, String name, Conformance.SearchParamType searchParamType) {
        Conformance.ConformanceRestResourceSearchParamComponent conformanceRestResourceSearchParamComponent = conformanceRestResourceComponent.addSearchParam();
        conformanceRestResourceSearchParamComponent.setNameSimple(name);
        conformanceRestResourceSearchParamComponent.setTypeSimple(searchParamType);
        conformanceRestResourceSearchParamComponent.setDocumentationSimple(resourceClass.getChildByName(name).getDefinition());
    }

}
