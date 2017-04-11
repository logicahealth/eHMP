package us.vistacore.aps;

import us.vistacore.asm.VistaRpcClient;
import us.vistacore.ehmp.authorization.PEPUser;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class VistaConfigurationDispenserTest {

    private VistaConfigurationDispenser disp;

    private static String HASH_A = "H1234";
    private static String HASH_B = "H2345";
    private static String SITE_A = "B1234";
    private static String SITE_B = "B2345";
    private static String DIVISION_A = "500";
    private static String DIVISION_B = "500";
    private static String HOST_A = "10.1.1.1";
    private static String HOST_B = "10.1.1.2";
    private static String NAME_A = "configA";
    private static String NAME_B = "configB";

    @Before
    public void before() {
        VistaConfiguration a = new VistaConfiguration(NAME_A, HOST_A, "1091", HASH_A, SITE_A, DIVISION_A);
        VistaConfiguration b = new VistaConfiguration(NAME_B, HOST_B, "1091", HASH_B, SITE_B, DIVISION_B);

        List<VistaConfiguration> vistaConfigs = new ArrayList<VistaConfiguration>();

        vistaConfigs.add(a);
        vistaConfigs.add(b);

        disp = new VistaConfigurationDispenser(vistaConfigs);
    }

    @Test
    public void testHashMapping() {
        VistaConfiguration a = disp.byHashCode(HASH_A);
        VistaConfiguration b = disp.byHashCode(HASH_B);

        Assert.assertTrue(a.getName().compareTo(NAME_A) == 0);
        Assert.assertTrue(b.getName().compareTo(NAME_B) == 0);
    }

    @Test
    public void testSiteMapping() {
        VistaConfiguration a = disp.bySiteCode(SITE_A);
        VistaConfiguration b = disp.bySiteCode(SITE_B);

        Assert.assertTrue(a.getName().compareTo(NAME_A) == 0);
        Assert.assertTrue(b.getName().compareTo(NAME_B) == 0);
    }

    @Test
    public void testEmptyDispenser() {
        List<VistaConfiguration> empty = new ArrayList<VistaConfiguration>();

        try {
            disp = new VistaConfigurationDispenser(empty);
        } catch (VistaConfigurationDispenserException e) {
            Assert.assertTrue(true);
        }
    }

    @Test
    public void testGetRpcClient() {
        PEPUser user = new PEPUser();
        user.setSiteCode(SITE_A);

        VistaRpcClient client = disp.getRpcClient(user, SITE_B);
        Assert.assertNotNull(client);
    }
}
