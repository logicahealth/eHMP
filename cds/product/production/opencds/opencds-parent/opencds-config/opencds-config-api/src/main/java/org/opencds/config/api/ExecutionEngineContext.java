package org.opencds.config.api;

import java.util.List;
import java.util.Map;

/**
 * 
 * @author phillip
 *
 * @param <Input>
 *            the input type required/used by the {@link ExecutionEngineAdapter}
 *            .
 * @param <Output>
 *            the output type produced by the {@link ExecutionEngineAdapter}.
 */
public interface ExecutionEngineContext<Input, Output> {

    Input getInput();

    void setResults(Output results);

    Map<String, List<?>> getResults();

    void setEvaluationContext(EvaluationContext evaluationContext);
}
