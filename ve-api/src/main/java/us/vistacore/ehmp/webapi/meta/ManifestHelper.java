package us.vistacore.ehmp.webapi.meta;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.jar.Attributes;
import java.util.jar.Manifest;

public class ManifestHelper {
    private Logger logger = LoggerFactory.getLogger(ManifestHelper.class);
    private static String implementationCommitHash;

    public String getImplementationCommitHash() throws IOException {

        if (implementationCommitHash == null) {
            Manifest manifest = getManifestObject();

            Attributes attr = manifest.getMainAttributes();
            implementationCommitHash = attr.getValue("Implementation-CommitHash");
        }

        return implementationCommitHash;
    }

    private static String implementationVersion;

    public String getImplementationVersion() throws IOException {

        if (implementationVersion == null) {
            Manifest manifest = getManifestObject();

            Attributes attr = manifest.getMainAttributes();
            implementationVersion = attr.getValue(Attributes.Name.IMPLEMENTATION_VERSION);
        }

        return implementationVersion;
    }

    public String get(String attribute) throws IOException {
        return getManifestObject().getMainAttributes().getValue(new Attributes.Name(attribute));
    }

    protected Manifest getManifestObject() throws IOException {
        Manifest manifest = null;
        InputStream manifestStream = null;
        try {
            Class<ManifestHelper> clazz = ManifestHelper.class;
            String className = clazz.getSimpleName() + ".class";
            String classPath = clazz.getResource(className).toString();
            if (!classPath.startsWith("jar")) {
              throw new RuntimeException("Was expecting the classpath to start with jar: " + classPath);
            }
            String manifestPath = classPath.substring(0, classPath.lastIndexOf("!") + 1) + "/META-INF/MANIFEST.MF";
            manifest = new Manifest(new URL(manifestPath).openStream());
        } finally {
            if (manifestStream != null) {
                try {
                    manifestStream.close();
                } catch (Exception e) {
                    logger.error("Could not close manifestfile ", e);
                }
            }
        }
        return manifest;
    }

}
