package org.opencds.evaluation.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.structures.EvaluationRequestKMItem;
import org.opencds.common.structures.EvaluationResponseKMItem;
import org.opencds.config.api.KnowledgeRepository;
import org.opencds.dss.evaluate.Evaluater;

public class EvaluaterCallable implements Callable<EvaluationResponseKMItem> {
    private static final Log log = LogFactory.getLog(EvaluaterCallable.class);
    
    private final Evaluater evaluater;
    private final KnowledgeRepository knowledgeRepository;
    private final EvaluationRequestKMItem evaluationRequestKMItem;
    
    public EvaluaterCallable(Evaluater evaluater, KnowledgeRepository knowledgeRepository, EvaluationRequestKMItem evaluationRequestKMItem) {
        this.evaluater = evaluater;
        this.knowledgeRepository = knowledgeRepository;
        this.evaluationRequestKMItem = evaluationRequestKMItem;
    }
    
    @Override
    public EvaluationResponseKMItem call() throws Exception {
        Map<String, List<?>> resultFactLists = evaluater.getOneResponse(knowledgeRepository, evaluationRequestKMItem);
        return new EvaluationResponseKMItem(resultFactLists, evaluationRequestKMItem);
    }

}
