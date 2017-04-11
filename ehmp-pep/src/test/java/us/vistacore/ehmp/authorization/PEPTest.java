package us.vistacore.ehmp.authorization;

import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfiguration;
import us.vistacore.aps.VistaConfigurationDispenser;
import us.vistacore.asm.VistaRpcClient;
import us.vistacore.asm.VistaRpcResponse;
import us.vistacore.test.TestUtils;

import com.axiomatics.sdk.connections.PDPConnection;
import com.axiomatics.sdk.connections.PDPConnectionException;
import com.axiomatics.sdk.context.SDKResponse;
import com.axiomatics.sdk.context.XacmlObjectStateException;
import com.axiomatics.xacml.Advice;
import com.axiomatics.xacml.reqresp.Request;
import com.axiomatics.xacml.reqresp.Result;

import java.util.HashSet;
import java.util.Set;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PEPTest {

    @Mock private PDPConnection pdpconn;

    @Mock private VistaRpcClient rpcClient;
    @Mock private VistaRpcResponse rpcResponse;

    @Mock private SDKResponse permitResponse;
    @Mock private SDKResponse denyResponse;
    @Mock private SDKResponse breakGlassResponse;

    @Mock private VistaConfigurationDispenser vistaConfigurations;
    @Mock private VistaConfiguration vistaConfiguration;

    @Mock private Advice breakGlassAdvice;
    @Mock private Advice nullIdAdvice;
    @Mock private Advice wrongIdAdvice;

    // Actual, non mocked objects.
    private final ApsConfiguration apsConfiguration = TestUtils.getApsConfiguration();
    private final PEPUser pepUser = TestUtils.getPEPUser();
    private PEP pep;
    private Set<Advice> breakGlassAdviceSet;

    @Before
    public void setup() {
        Mockito.when(vistaConfigurations.bySiteCode(Mockito.anyString())).thenReturn(vistaConfiguration);
        Mockito.when(vistaConfiguration.getPort()).thenReturn("9210");
        Mockito.when(vistaConfiguration.getHost()).thenReturn("10.2.2.101");

        Mockito.when(rpcClient.getPatientAttributes(Mockito.anyString())).thenReturn(rpcResponse);
        Mockito.when(rpcClient.getUserAttributes()).thenReturn(rpcResponse);
        Mockito.when(vistaConfigurations.getRpcClient(Mockito.any(PEPUser.class), Mockito.anyString())).thenReturn(rpcClient);

        Mockito.when(permitResponse.getDecision()).thenReturn(Result.DECISION_PERMIT);
        Mockito.when(denyResponse.getDecision()).thenReturn(Result.DECISION_DENY);
        Mockito.when(breakGlassResponse.getDecision()).thenReturn(Result.DECISION_DENY);

        Mockito.when(breakGlassAdvice.getId()).thenReturn("breakglass");
        Mockito.when(wrongIdAdvice.getId()).thenReturn("bogusadvice");

        breakGlassAdviceSet = new HashSet<Advice>();
        breakGlassAdviceSet.add(breakGlassAdvice);
        breakGlassAdviceSet.add(nullIdAdvice);
        breakGlassAdviceSet.add(wrongIdAdvice);
        Mockito.doReturn(breakGlassAdviceSet).when(breakGlassResponse).getAdvice();

        pep = new PEP(pdpconn, vistaConfigurations, apsConfiguration);
    }

    @Test
    public void testPermit() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(permitResponse);
        Assert.assertEquals(DecisionInfo.Value.PERMIT, pep.authorize("urn:va:patient:789A:20:20", false, pepUser).getDecisionValue());
    }

    @Test
    public void testCachedDecision() throws PDPConnectionException {
        testPermit();
        testPermit();
    }

    @Test
    public void testDeny() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(denyResponse);
        Assert.assertEquals(DecisionInfo.Value.DENY, pep.authorize("urn:va:patient:789A:20:20", false, pepUser).getDecisionValue());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testError() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenThrow(PDPConnectionException.class);
        Assert.assertEquals(DecisionInfo.Value.ERROR, pep.authorize("urn:va:patient:789A:20:20", false, pepUser).getDecisionValue());
    }

    @Test
    public void testBreakGlass() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(breakGlassResponse);
        Assert.assertEquals(DecisionInfo.Value.WARN, pep.authorize("urn:va:patient:789A:20:20", false, pepUser).getDecisionValue());
    }

    @Test
    public void testBreakGlassWithWrongDecisionCode() throws PDPConnectionException {
        Mockito.when(breakGlassResponse.getDecision()).thenReturn(Result.DECISION_PERMIT);
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(breakGlassResponse);

        DecisionInfo decision = pep.authorize("urn:va:patient:789A:20:20", false, pepUser);
        Assert.assertEquals(DecisionInfo.Value.ERROR, decision.getDecisionValue());
        Assert.assertEquals("Attempted to apply the \"Break Glass\" warning Advice to a decision other than \"Deny\".", decision.getDecisionMessage());
    }

    @Test
    public void testNullDfn() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(denyResponse);
        Assert.assertEquals(DecisionInfo.Value.DENY, pep.authorize(null, false, pepUser).getDecisionValue());
    }

    @Test
    public void testNullAuthCache() throws PDPConnectionException {
        pep = new PEP(pdpconn, vistaConfigurations, apsConfiguration, null);
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(denyResponse);
        Assert.assertEquals(DecisionInfo.Value.DENY, pep.authorize(null, false, pepUser).getDecisionValue());
    }

    @Test
    public void testNullUser() throws PDPConnectionException {
        Mockito.when(pdpconn.evaluate(Mockito.any(Request.class))).thenReturn(denyResponse);
        Assert.assertEquals(DecisionInfo.Value.ERROR, pep.authorize(null, false, null).getDecisionValue());
    }

    // BH: should we at least be checking the cache size?
    @Test
    public void testClearCache() {
        pep.clearCache();
    }

    @Test
    public void testClearCachedUser() {
        pep.clearCachedUser("pid");
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testXacmlObjectStateException() {
        // This might be thrown by XacmlRequestBuilder.buildRequest().
        // We don't have access to the builder to make it throw the exception, but there's a call to VistaConfigurationDispenser.getRpcClient(PEPUser, String) in the try block, so we can use that to hit the catch block.
        Mockito.when(vistaConfigurations.getRpcClient(Mockito.any(PEPUser.class), Mockito.anyString())).thenThrow(XacmlObjectStateException.class);

        DecisionInfo decision = pep.authorize("urn:va:patient:789A:20:20", false, pepUser);
        Assert.assertEquals(DecisionInfo.Value.ERROR, decision.getDecisionValue());
        Assert.assertEquals("Error building XACML Request", decision.getDecisionMessage());
    }

}
