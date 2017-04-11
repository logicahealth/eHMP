package us.vistacore.ehmp.util;

import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.authorization.DecisionInfo;
import us.vistacore.ehmp.authorization.Obligation;
import us.vistacore.ehmp.authorization.PEP;
import us.vistacore.ehmp.authorization.PEPUser;
import us.vistacore.ehmp.model.demographics.PatientSelect;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.ws.rs.core.UriInfo;

import org.hl7.fhir.instance.model.Identifier;
import org.hl7.fhir.instance.model.Patient;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

/**
 * Unit tests for {@link AuthorizationUtils} class.
 */
@RunWith(MockitoJUnitRunner.class)
public class AuthorizationUtilsTest {

    @Mock private UriInfo uriInfo;

    @Mock private PEP pep;

    @Mock private PatientSelect kodakPatient;
    @Mock private PatientSelect panoramaPatient;

    @Mock private Identifier kodakIdentifier;
    @Mock private Identifier panoramaIdentifier;

    private final String kodakUid = "urn:va:patient:9E7A:20:20";
    private final String panoramaUid = "urn:va:patient:C877:20:20";

    private List<Identifier> kodakIdentifiers;
    private List<Identifier> panoramaIdentifiers;

    private List<PatientSelect> patients;

    private User user;

    @Before
    public void setup() {
        user = new User("access", "verify", "site", "division", "true", "true");

        Mockito.when(kodakIdentifier.getLabelSimple()).thenReturn("uid");
        Mockito.when(kodakIdentifier.getValueSimple()).thenReturn(kodakUid);
        kodakIdentifiers = new ArrayList<Identifier>();
        kodakIdentifiers.add(kodakIdentifier);
        Mockito.when(kodakPatient.getUid()).thenReturn(kodakUid);

        Mockito.when(panoramaIdentifier.getLabelSimple()).thenReturn("uid");
        Mockito.when(panoramaIdentifier.getValueSimple()).thenReturn(panoramaUid);
        panoramaIdentifiers = new ArrayList<Identifier>();
        panoramaIdentifiers.add(panoramaIdentifier);
        Mockito.when(panoramaPatient.getUid()).thenReturn(panoramaUid);

        patients = new ArrayList<PatientSelect>();
        patients.add(kodakPatient);
        patients.add(panoramaPatient);
    }

    @Test
    public void testDifferentSensitivityLevelsAtDifferentVistAs() throws Exception {
        Mockito.when(pep.authorize(Mockito.eq(kodakUid), Mockito.anyBoolean(), Mockito.any(PEPUser.class))).thenReturn(DecisionInfo.permit());
        Mockito.when(pep.authorize(Mockito.eq(panoramaUid), Mockito.eq(false), Mockito.any(PEPUser.class))).thenReturn(DecisionInfo.warn());
        Mockito.when(pep.authorize(Mockito.eq(panoramaUid), Mockito.eq(true), Mockito.any(PEPUser.class))).thenReturn(DecisionInfo.permit());

        DecisionInfo answer = AuthorizationUtils.authorize(pep, patients, false, user);
        Assert.assertEquals(DecisionInfo.Value.WARN, answer.getDecisionValue());

        answer = AuthorizationUtils.authorize(pep, patients, true, user);
        Assert.assertEquals(DecisionInfo.Value.PERMIT, answer.getDecisionValue());
    }

    @Test
    public void testGetObligationNoQueryParamInUrl() throws Exception {
        String url = "http://www.server.com";
        String obligationText = "obligation_text";

        String expectedJson = "{\"obligation\":\"User must acknowledge record access audit.\",\"prompt\":\"obligation_text\",\"accept\":\"https://www.server.com?_ack\\u003dtrue\"}";
        String expectedXml = "<obligation>User must acknowledge record access audit.</obligation><accept>https://www.server.com?_ack=true</accept><prompt>obligation_text</prompt>";

        Mockito.when(uriInfo.getRequestUri()).thenReturn(new URI(url));

        Obligation theObligation = AuthorizationUtils.getObligation(obligationText, uriInfo);
        Assert.assertEquals(expectedJson, theObligation.toJson());
        Assert.assertEquals(expectedXml, theObligation.toXml());
    }

    @Test
    public void testGetObligationWithQueryParamInUrl() throws Exception {
        String url = "http://www.server.com?param=value";
        String obligationText = "obligation_text";

        String expectedJson = "{\"obligation\":\"User must acknowledge record access audit.\",\"prompt\":\"obligation_text\",\"accept\":\"https://www.server.com?param\\u003dvalue\\u0026_ack\\u003dtrue\"}";
        String expectedXml = "<obligation>User must acknowledge record access audit.</obligation><accept>https://www.server.com?param=value&amp;_ack=true</accept><prompt>obligation_text</prompt>";

        Mockito.when(uriInfo.getRequestUri()).thenReturn(new URI(url));

        Obligation theObligation = AuthorizationUtils.getObligation(obligationText, uriInfo);
        Assert.assertEquals(expectedJson, theObligation.toJson());
        Assert.assertEquals(expectedXml, theObligation.toXml());
    }

}
