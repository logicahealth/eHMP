package org.opencds.config.api;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.opencds.common.structures.EvaluationRequestDataItem;
import org.opencds.common.structures.EvaluationRequestKMItem;

public class EvaluationContext {
    private final Date evalTime;
    private final String clientLanguage;
    private final String clientTimeZoneOffset;
    private final Set<String> assertions;
    private final Map<String, Object> namedObjects;
    private final Map<String, Object> globals;
    private final Map<Class<?>, List<?>> allFactLists;
    private final String primaryProcess;

    private EvaluationContext(Date evalTime, String clientLanguage, String clientTimeZoneOffset,
            Set<String> assertions, Map<String, Object> namedObjects, Map<String, Object> globals,
            Map<Class<?>, List<?>> allFactLists, String primaryProcess) {
        this.evalTime = evalTime;
        this.clientLanguage = clientLanguage;
        this.clientTimeZoneOffset = clientTimeZoneOffset;
        this.assertions = assertions;
        this.namedObjects = namedObjects;
        this.globals = globals;
        this.allFactLists = allFactLists;
        this.primaryProcess = primaryProcess;
    }

    public static EvaluationContext create(EvaluationRequestKMItem evaluationRequestKMItem, String primaryProcess) {
        EvaluationRequestDataItem evalRequestDataItem = evaluationRequestKMItem.getEvaluationRequestDataItem();
        // TODO: validate input
        return new EvaluationContext(evalRequestDataItem.getEvalTime(), evalRequestDataItem.getClientLanguage(),
                evalRequestDataItem.getClientTimeZoneOffset(), 
                new HashSet<String>(), new HashMap<String, Object>(), new HashMap<String, Object>(),
                evaluationRequestKMItem.getAllFactLists(), primaryProcess);
    }

    public Date getEvalTime() {
        return evalTime;
    }

    public String getClientLanguage() {
        return clientLanguage;
    }

    public String getClientTimeZoneOffset() {
        return clientTimeZoneOffset;
    }

    public Set<String> getAssertions() {
        return assertions;
    }

    public Map<String, Object> getNamedObjects() {
        return namedObjects;
    }

    public Map<String, Object> getGlobals() {
        return globals;
    }

    public Map<Class<?>, List<?>> getAllFactLists() {
        return allFactLists;
    }

    public String getPrimaryProcess() {
        return primaryProcess;
    }

}
