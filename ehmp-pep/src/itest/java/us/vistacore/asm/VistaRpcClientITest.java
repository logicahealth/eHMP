package us.vistacore.asm;

import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

@Ignore("Duplicate integration test in vista-rpc-resource/src/itest")
public class VistaRpcClientITest {

    private VistaRpcClient client;

    private String vistaHost = "10.2.2.101";
    private int vistaPort = 9210;

    private String accessCode = "lu1234";
    private String verifyCode = "lu1234!!";
    private String context = "XUPROGMODE";

    private String sensitivePatient = "20";
    private String insensitivePatient = "100615";

    @Before
    public void prepare() {
        client = new VistaRpcClient(vistaHost, vistaPort, accessCode, verifyCode, context);
    }

    @After
    public void cleanup() {
        client = null;
    }

    @Test
    public void verifyPatientSensitivePositiveResult() {
        VistaRpcResponse resp = client.getPatientAttributes(sensitivePatient);
        assertTrue(resp.get("sensitive").compareTo("true") == 0);
    }

    @Test
    public void verifyPatientSensitiveNegativeResult() {
        VistaRpcResponse resp = client.getPatientAttributes(insensitivePatient);
        assertTrue(resp.get("sensitive").compareTo("false") == 0);
    }

    @Test
    public void testUserAttributes() {
        VistaRpcResponse resp = client.getUserAttributes();
        assertTrue(resp.get("cprsCorTabs") != null);
        assertTrue(resp.get("cprsRptTabs") != null);
    }

}
