package org.opencds.config.api;

/**
 * 
 * @author phillip
 *
 * @param <Input> the input type required/used by the {@link ExecutionEngineAdapter}.
 * @param <Output> the output type produced by the {@link ExecutionEngineAdapter}.
 * @param <KnowledgePackage> the knowledge package type used by the {@link ExecutionEngineAdapter}. 
 */
public interface ExecutionEngineAdapter<Input, Output, KnowledgePackage> {
    ExecutionEngineContext<Input, Output> execute(KnowledgePackage knowledgePackage,
            ExecutionEngineContext<Input, Output> context) throws Exception;
}
