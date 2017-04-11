package org.opencds.config.service.rest.util;

import org.opencds.config.api.model.KMId;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.service.KnowledgeModuleService;

public class KMIdUtil {
    
    public static boolean found(KnowledgeModuleService kmService, KMId kmId) {
        return find(kmService, kmId) != null;
    }

    public static KnowledgeModule find(KnowledgeModuleService kmService, KMId kmId) {
        return kmService.find(kmId);
    }

}
