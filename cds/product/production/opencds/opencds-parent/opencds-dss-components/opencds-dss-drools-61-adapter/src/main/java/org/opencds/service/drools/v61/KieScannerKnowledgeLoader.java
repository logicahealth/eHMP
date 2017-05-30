package org.opencds.service.drools.v61;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.kie.api.KieServices;
import org.kie.api.builder.KieScanner;
import org.kie.api.builder.ReleaseId;
import org.kie.api.runtime.KieContainer;
import org.opencds.config.api.KnowledgeLoader;
import org.opencds.config.api.model.KMId;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.service.KnowledgePackageService;
import org.opencds.config.util.URIUtil;

public class KieScannerKnowledgeLoader implements KnowledgeLoader<KieContainer> {
    private static final Log log = LogFactory.getLog(KieScannerKnowledgeLoader.class);

    @Override
    public KieContainer loadKnowledgePackage(KnowledgePackageService knowledgePackageService,
            KnowledgeModule knowledgeModule) {
    	
    	String kmidString = knowledgeModule.getPackageId();
    	KMId kmId = URIUtil.getKMId(kmidString);    
		KieServices ks = KieServices.Factory.get();
		ReleaseId releaseId = ks.newReleaseId(kmId.getScopingEntityId(), kmId.getBusinessId(), kmId.getVersion());
		KieContainer kContainer = ks.newKieContainer(releaseId);
		
		KieScanner kScan = ks.newKieScanner(kContainer);
		kScan.scanNow();
		
		knowledgePackageService.putPackage(knowledgeModule, kContainer);		
        log.debug("Loaded KnowledgeModule package; kmId= " + knowledgeModule.getKMId());
        return kContainer;
    }

}
