package us.vistacore.aps;

import us.vistacore.asm.VistaRpcClient;
import us.vistacore.ehmp.authorization.PEPUser;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VistaConfigurationDispenser {

    private Map<String, VistaConfiguration> siteCodeMap;
    private Map<String, VistaConfiguration> hashCodeMap;

    public VistaConfiguration bySiteCode(String siteCode) {
        return siteCodeMap.get(siteCode);
    }

    public VistaConfiguration byHashCode(String hashCode) {
        return hashCodeMap.get(hashCode);
    }

    public VistaRpcClient getRpcClient(PEPUser user, String siteCode) {
        VistaConfiguration config = bySiteCode(siteCode);
        return new VistaRpcClient(config.getHost(), Integer.parseInt(config.getPort()), user.getAccessCode(), user.getVerifyCode());
    }

    public VistaConfigurationDispenser(List<VistaConfiguration> vistaConfigurations) throws VistaConfigurationDispenserException {
        if (vistaConfigurations.size() == 0) {
            throw new VistaConfigurationDispenserException("Cannot initialize VistaConfigurationDispenser with empty list");
        }

        siteCodeMap = new HashMap<String, VistaConfiguration>();
        hashCodeMap = new HashMap<String, VistaConfiguration>();

        for (VistaConfiguration vistaConfig : vistaConfigurations) {
            siteCodeMap.put(vistaConfig.getSiteCode(), vistaConfig);
            hashCodeMap.put(vistaConfig.getHashCode(), vistaConfig);
        }
    }

}
