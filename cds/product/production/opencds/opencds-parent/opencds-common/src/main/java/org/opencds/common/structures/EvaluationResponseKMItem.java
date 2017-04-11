package org.opencds.common.structures;

import java.util.List;
import java.util.Map;

public class EvaluationResponseKMItem {

    private final Map<String, List<?>> resultFactLists;
    private final EvaluationRequestKMItem evaluationRequestKMItem;

    public EvaluationResponseKMItem(Map<String, List<?>> resultFactLists, EvaluationRequestKMItem request) {
        this.resultFactLists = resultFactLists;
        this.evaluationRequestKMItem = request;
    }

    public Map<String, List<?>> getResultFactLists() {
        return resultFactLists;
    }

    public EvaluationRequestKMItem getEvaluationRequestKMItem() {
        return evaluationRequestKMItem;
    }

}
