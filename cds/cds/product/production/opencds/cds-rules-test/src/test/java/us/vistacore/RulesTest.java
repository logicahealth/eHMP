package us.vistacore;

import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.junit.BeforeClass;
import org.junit.Test;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.api.Bundle;
import ca.uhn.fhir.model.api.BundleEntry;
import ca.uhn.fhir.model.api.ExtensionDt;
import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.resource.Observation;
import ca.uhn.fhir.model.primitive.CodeDt;
import ca.uhn.fhir.parser.IParser;

public class RulesTest {
	private static Map<String, Object> namedObjects;
	private static KieServices ks;
	private static KieContainer kContainer;
	private static KieSession kSession;
	private static IParser jsonParser;
	private static final Logger logger = LoggerFactory.getLogger(RulesTest.class);

	@BeforeClass
	public static void oneTimeSetUp() {
		namedObjects = new HashMap<String, Object>();
		ks = KieServices.Factory.get();
		kContainer = ks.getKieClasspathContainer();
		kSession = kContainer.newKieSession("ksession-rules");
		kSession.setGlobal("namedObjects", namedObjects);
		FhirContext ctx = FhirContext.forDstu2();
		jsonParser = ctx.newJsonParser();
	}

	@Test
	public void testFobt() {
		try {
			namedObjects.clear();
			String diagnosticReport = getFhirString("diagnostic-report.json");

			Bundle obsBundle = jsonParser.parseBundle(diagnosticReport);
			List<BundleEntry> bundles = obsBundle.getEntries();
			for (Iterator iterator = bundles.iterator(); iterator.hasNext();) {
				BundleEntry bundleEntry = (BundleEntry) iterator.next();
				kSession.insert(bundleEntry.getResource());
			}
			kSession.fireAllRules();
			assertTrue(namedObjects.get("communicationRequest") != null);
		} catch (Throwable t) {
			t.printStackTrace();
		}
	}
	
	@Test
	public void testRheumatologyConsultRule() {
		Map<String, Object> namedObjects = new HashMap<String, Object>();
		try {
			// load up the knowledge base
			KieServices ks = KieServices.Factory.get();
			KieContainer kContainer = ks.getKieClasspathContainer();
			KieSession kSession = kContainer.newKieSession("ksession-rules");

			kSession.setGlobal("namedObjects", namedObjects);
			FhirContext ctx = FhirContext.forDstu2();
			IParser jsonParser = ctx.newJsonParser();
			String diagnosticReport = getFhirString("rf.json");
		   
			Bundle obsBundle = jsonParser.parseBundle(diagnosticReport);
			
			List<BundleEntry> bundles = obsBundle.getEntries();
			for (Iterator iterator = bundles.iterator(); iterator.hasNext();) {
				BundleEntry bundleEntry = (BundleEntry) iterator.next();
				kSession.insert(bundleEntry.getResource());
			}
			kSession.fireAllRules();
		} catch (Throwable t) {
			logger.debug(t.getMessage());
		}
		Observation obs = (Observation) namedObjects.get("rfObs");
		List<ExtensionDt> extensions = obs.getUndeclaredModifierExtensions();
        for (ExtensionDt next : extensions) {
            if ("http://org.cognitive.cds.invocation.fhir.datanature.status".equals(next.getUrlAsString())) {
              CodeDt cd = (CodeDt) next.getValue();
              assertTrue(cd.getValueAsString().equalsIgnoreCase("Passed"));
            }
        }
	}
	@Test
	public void testHypertension() {
		try {
			namedObjects.clear();
			String diagnosticReport = getFhirString("vitals.json");

			Bundle obsBundle = jsonParser.parseBundle(diagnosticReport);
			List<BundleEntry> bundles = obsBundle.getEntries();
			for (Iterator iterator = bundles.iterator(); iterator.hasNext();) {
				BundleEntry bundleEntry = (BundleEntry) iterator.next();

				kSession.insert(bundleEntry.getResource());
				List<? extends IResource> contaned = bundleEntry.getResource().getContained().getContainedResources();
				for (Iterator iterator2 = contaned.iterator(); iterator2.hasNext();) {
					IResource iResource = (IResource) iterator2.next();
					kSession.insert(iResource);
				}
			}
			kSession.fireAllRules();
			assertTrue(namedObjects.get("communicationRequest") != null);
		} catch (Throwable t) {
			t.printStackTrace();
		}

	}

	private String getFhirString(String fileName){
	  	  String result = "";
	  	  ClassLoader classLoader = getClass().getClassLoader();
	  	  try {
	  		result = IOUtils.toString(classLoader.getResourceAsStream(fileName));
	  	  } catch (IOException e) {
	  		logger.debug("Couldn't read resoruce : " + fileName + " " + e.getMessage());
	  	  }
	  	  return result;
	    }
}