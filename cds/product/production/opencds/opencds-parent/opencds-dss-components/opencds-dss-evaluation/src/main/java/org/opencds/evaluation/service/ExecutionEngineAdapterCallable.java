package org.opencds.evaluation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.common.structures.EvaluationRequestKMItem;
import org.opencds.common.structures.EvaluationResponseKMItem;
import org.opencds.config.api.EvaluationContext;
import org.opencds.config.api.ExecutionEngineAdapter;
import org.opencds.config.api.ExecutionEngineContext;
import org.opencds.config.api.KnowledgeRepository;
import org.opencds.config.api.model.ExecutionEngine;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.service.KnowledgeModuleService;

public class ExecutionEngineAdapterCallable implements Callable<EvaluationResponseKMItem> {
    private static final Log log = LogFactory.getLog(ExecutionEngineAdapterCallable.class);

    private final ExecutionEngineAdapter adapter;
    private final ExecutionEngine engine;
    private final KnowledgeRepository knowledgeRepository;
    private final EvaluationRequestKMItem evaluationRequestKMItem;

    public ExecutionEngineAdapterCallable(ExecutionEngineAdapter adapter, ExecutionEngine engine,
            KnowledgeRepository knowledgeRepository, EvaluationRequestKMItem evaluationRequestKMItem) {
        this.adapter = adapter;
        this.engine = engine;
        this.knowledgeRepository = knowledgeRepository;
        this.evaluationRequestKMItem = evaluationRequestKMItem;
    }

    @Override
    public EvaluationResponseKMItem call() throws Exception {
        KnowledgeModuleService knowledgeModuleService = knowledgeRepository.getKnowledgeModuleService();

        String requestedKmId = evaluationRequestKMItem.getRequestedKmId();
        KnowledgeModule knowledgeModule = knowledgeRepository.getKnowledgeModuleService().find(requestedKmId);

        EvaluationContext evaluationCtx = EvaluationContext.create(evaluationRequestKMItem,
                knowledgeModule.getPrimaryProcess());

        Map<String, org.opencds.plugin.SupportingData> supportingData = SupportingDataUtil.getSupportingData(
                knowledgeRepository, knowledgeModule);

        PluginProcessor.preProcess(knowledgeRepository, knowledgeModule, supportingData, evaluationCtx);

        ExecutionEngineContext<?, ?> eeContext = knowledgeRepository.getExecutionEngineService().createContext(engine);
        eeContext.setEvaluationContext(evaluationCtx);

        log.debug("Borrowing package from pool...");
        Object knowledgePackage = knowledgeRepository.getKnowledgePackageService().borrowKnowledgePackage(
                knowledgeModule);
        log.debug("Package borrowed.");
        
        try {
            eeContext = evaluate(knowledgePackage, eeContext);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        } finally {
            log.debug("Returning Package.");
            knowledgeRepository.getKnowledgePackageService().returnKnowledgePackage(knowledgeModule, knowledgePackage);
            log.debug("Package returned.");
        }
        Map<String, List<?>> resultFactLists = eeContext.getResults();

        /*
         * TODO/FIXME: Put this elsewhere...
         */
        /**
         * now process the returned namedObjects and add them to the
         * resultFactLists
         */
        Map<String, Object> namedObjects = evaluationCtx.getNamedObjects();
        if (namedObjects != null) {
            for (String key : namedObjects.keySet()) {
                Object oneNamedObject = namedObjects.get(key);
                if (oneNamedObject != null) {
                    // String className =
                    // oneNamedObject.getClass().getSimpleName();
                    @SuppressWarnings("unchecked")
                    List<Object> oneList = (List<Object>) resultFactLists
                            .get(oneNamedObject.getClass().getSimpleName());
                    if (oneList == null) {
                        oneList = new ArrayList<Object>();
                        oneList.add(oneNamedObject);
                    } else {
                        oneList.add(oneNamedObject);
                    }
                    resultFactLists.put(oneNamedObject.getClass().getSimpleName(), oneList);
                }
            }
        }
        PluginProcessor.postProcess(knowledgeRepository, knowledgeModule, supportingData, evaluationCtx, resultFactLists);

        // return eeContext.getResults();

        return new EvaluationResponseKMItem(resultFactLists, evaluationRequestKMItem);
    }

    private <I, O, P> ExecutionEngineContext<I, O> evaluate(P knowledgePackage, ExecutionEngineContext<I, O> context) {
        try {
            return adapter.execute(knowledgePackage, context);
        } catch (Exception e) {
            throw new OpenCDSRuntimeException(e.getMessage(), e);
        }
    }

}
