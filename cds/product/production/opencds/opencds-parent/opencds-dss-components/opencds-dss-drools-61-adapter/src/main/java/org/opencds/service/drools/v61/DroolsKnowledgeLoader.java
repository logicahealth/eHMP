package org.opencds.service.drools.v61;

import java.io.InputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.kie.api.io.ResourceType;
import org.kie.internal.KnowledgeBase;
import org.kie.internal.KnowledgeBaseFactory;
import org.kie.internal.builder.KnowledgeBuilder;
import org.kie.internal.builder.KnowledgeBuilderFactory;
import org.kie.internal.io.ResourceFactory;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.config.api.KnowledgeLoader;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.service.KnowledgePackageService;

public class DroolsKnowledgeLoader implements KnowledgeLoader<KnowledgeBase> {
    private static final Log log = LogFactory.getLog(DroolsKnowledgeLoader.class);

    @Override
    public KnowledgeBase loadKnowledgePackage(KnowledgePackageService knowledgePackageService,
            KnowledgeModule knowledgeModule) {
        KnowledgeBase knowledgeBase = KnowledgeBaseFactory.newKnowledgeBase();
        KnowledgeBuilder knowledgeBuilder = KnowledgeBuilderFactory.newKnowledgeBuilder();
        InputStream packageInputStream = knowledgePackageService.getPackageInputStream(knowledgeModule);
        if (packageInputStream != null) {
            knowledgeBuilder.add(ResourceFactory.newInputStreamResource(packageInputStream),
                    ResourceType.getResourceType(knowledgeModule.getPackageType()));
            if (knowledgeBuilder.hasErrors()) {
                throw new OpenCDSRuntimeException("KnowledgeBuilder had errors on build of: '"
                        + knowledgeModule.getKMId() + "', " + knowledgeBuilder.getErrors().toString());
            }
            if (knowledgeBuilder.getKnowledgePackages().size() == 0) {
                throw new OpenCDSRuntimeException(
                        "KnowledgeBuilder did not find any VALID '.drl', '.bpmn' or '.pkg' files for: '"
                                + knowledgeModule.getKMId() + "', " + knowledgeBuilder.getErrors().toString());
            }
            knowledgeBase.addKnowledgePackages(knowledgeBuilder.getKnowledgePackages());
            knowledgePackageService.putPackage(knowledgeModule, knowledgeBase);
        } else {
            throw new OpenCDSRuntimeException(
                    "KnowledgeModule package cannot be found (possibly due to misconfiguration?); packageId= "
                            + knowledgeModule.getPackageId() + ", packageType= " + knowledgeModule.getPackageType());
        }
        log.debug("Loaded KnowledgeModule package; kmId= " + knowledgeModule.getKMId());
        return knowledgeBase;
    }

}
