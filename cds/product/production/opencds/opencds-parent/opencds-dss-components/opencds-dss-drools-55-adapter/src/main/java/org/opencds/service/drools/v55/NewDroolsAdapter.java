package org.opencds.service.drools.v55;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.drools.KnowledgeBase;
import org.drools.command.Command;
import org.drools.command.CommandFactory;
import org.drools.runtime.ExecutionResults;
import org.drools.runtime.StatelessKnowledgeSession;
import org.omg.dss.DSSRuntimeExceptionFault;
import org.opencds.config.api.ExecutionEngineAdapter;
import org.opencds.config.api.ExecutionEngineContext;

public class NewDroolsAdapter implements ExecutionEngineAdapter<List<Command<?>>, ExecutionResults, KnowledgeBase> {
    private static Log log = LogFactory.getLog(NewDroolsAdapter.class);

    @Override
    public ExecutionEngineContext<List<Command<?>>, ExecutionResults> execute(KnowledgeBase knowledgeBase,
            ExecutionEngineContext<List<Command<?>>, ExecutionResults> context) throws DSSRuntimeExceptionFault {
        ExecutionResults results = null;
        try {
            StatelessKnowledgeSession statelessKnowledgeSession = knowledgeBase.newStatelessKnowledgeSession();
            log.debug("KM (Drools) execution...");
            results = statelessKnowledgeSession.execute(CommandFactory.newBatchExecution(context.getInput()));
            context.setResults(results);
            log.debug("KM (Drools) execution done.");
        } catch (Exception e) {
            String err = "OpenCDS call to Drools.execute failed with error: " + e.getMessage();
            log.error(err, e);
            throw new DSSRuntimeExceptionFault(err);
        }

        return context;
    }

}
