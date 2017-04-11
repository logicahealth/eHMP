package us.vistacore.vxsync.dod;


public enum JMeadowsVersion {

    V_2_3_0, V_2_3_1, V_2_3_3_0_2;

    public static JMeadowsVersion getVersion(String version) {
        switch (version) {
            default:
            case "2.3.0":
                return V_2_3_0;
            case "2.3.1":
                return V_2_3_1;
            case "2.3.3.0.2":
                return V_2_3_3_0_2;
        }
    }
}
