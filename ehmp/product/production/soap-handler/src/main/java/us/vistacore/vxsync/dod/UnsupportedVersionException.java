package us.vistacore.vxsync.dod;


public class UnsupportedVersionException extends RuntimeException {
    public UnsupportedVersionException(JMeadowsVersion version) {
        super("Unsupported version of jMeadows - " + version.toString());
    }
}
