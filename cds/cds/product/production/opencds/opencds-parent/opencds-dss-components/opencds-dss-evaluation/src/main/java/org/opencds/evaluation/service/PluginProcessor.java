package org.opencds.evaluation.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.config.api.EvaluationContext;
import org.opencds.config.api.KnowledgeRepository;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.model.PluginId;
import org.opencds.config.util.EntityIdentifierUtil;
import org.opencds.plugin.OpencdsPlugin;
import org.opencds.plugin.PluginContext;
import org.opencds.plugin.PluginContext.PostProcessPluginContext;
import org.opencds.plugin.PluginContext.PreProcessPluginContext;
import org.opencds.plugin.SupportingData;

public class PluginProcessor {
    private static final Log log = LogFactory.getLog(PluginProcessor.class);

    public static <D> void preProcess(KnowledgeRepository knowledgeRepository, KnowledgeModule knowledgeModule,
            Map<String, org.opencds.plugin.SupportingData> supportingData, EvaluationContext context) {
        log.debug("Plugin pre-processing...");
        List<PluginId> plugins = knowledgeRepository.getPluginPackageService().getAllPluginIds();
        List<PluginId> allPreProcessPluginIds = knowledgeModule.getPreProcessPluginIds();
        if (allPreProcessPluginIds != null) {
            for (PluginId pluginId : plugins) {
                if (allPreProcessPluginIds.contains(pluginId)) {
                    log.debug("applying plugin: " + pluginId.toString());
                    OpencdsPlugin<PreProcessPluginContext> opencdsPlugin = knowledgeRepository
                            .getPluginPackageService().load(pluginId);
                    PreProcessPluginContext preContext = PluginContext.createPreProcessPluginContext(
                            context.getAllFactLists(), context.getNamedObjects(), context.getGlobals(),
                            filterSupportingData(pluginId, supportingData),
                            knowledgeRepository.getPluginDataCache(pluginId));
                    opencdsPlugin.execute(preContext);
                }
            }
        }
        log.debug("Plugin pre-processing done.");
    }

    public static Map<String, SupportingData> filterSupportingData(PluginId pluginId,
            Map<String, SupportingData> supportingData) {
        Map<String, SupportingData> filteredSD = new HashMap<>();
        for (Map.Entry<String, SupportingData> sdEntry : supportingData.entrySet()) {
            if (sdEntry.getValue().getLoadedByPluginId().equals(EntityIdentifierUtil.makeEIString(pluginId))) {
                filteredSD.put(sdEntry.getKey(), sdEntry.getValue());
            }
        }
        return filteredSD;
    }

    public static void postProcess(KnowledgeRepository knowledgeRepository, KnowledgeModule knowledgeModule,
            Map<String, org.opencds.plugin.SupportingData> supportingData, EvaluationContext context, Map<String, List<?>> resultFactLists) {
        log.debug("Plugin post-processing...");
        List<PluginId> plugins = knowledgeRepository.getPluginPackageService().getAllPluginIds();
        List<PluginId> allPostProcessPluginIds = knowledgeModule.getPostProcessPluginIds();
        if (allPostProcessPluginIds != null) {
            for (PluginId pluginId : plugins) {
                if (allPostProcessPluginIds.contains(pluginId)) {
                    log.debug("applying plugin: " + pluginId.toString());
                    OpencdsPlugin<PostProcessPluginContext> opencdsPlugin = knowledgeRepository
                            .getPluginPackageService().load(pluginId);
                    PostProcessPluginContext postContext = PluginContext.createPostProcessPluginContext(
                            context.getAllFactLists(), context.getNamedObjects(), context.getAssertions(),
                            resultFactLists, filterSupportingData(pluginId, supportingData),
                            knowledgeRepository.getPluginDataCache(pluginId));
                    opencdsPlugin.execute(postContext);
                }
            }
        }
        log.debug("Plugin post-processing done.");
    }

}
