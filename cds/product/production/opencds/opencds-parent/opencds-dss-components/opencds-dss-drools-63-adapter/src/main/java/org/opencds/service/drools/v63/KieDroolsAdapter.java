package org.opencds.service.drools.v63;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.drools.core.impl.KnowledgeBaseImpl;
import org.drools.core.management.DroolsManagementAgent;
import org.kie.api.command.Command;
import org.kie.api.runtime.ExecutionResults;
import org.kie.internal.KnowledgeBase;
import org.kie.internal.command.CommandFactory;
import org.kie.internal.runtime.StatelessKnowledgeSession;
import org.omg.dss.DSSRuntimeExceptionFault;
import org.opencds.config.api.ExecutionEngineAdapter;
import org.opencds.config.api.ExecutionEngineContext;

public class KieDroolsAdapter implements ExecutionEngineAdapter<List<Command<?>>, ExecutionResults, KnowledgeBase> {
    private static Log log = LogFactory.getLog(KieDroolsAdapter.class);

    @Override
    public ExecutionEngineContext<List<Command<?>>, ExecutionResults> execute(KnowledgeBase knowledgeBase,
            ExecutionEngineContext<List<Command<?>>, ExecutionResults> context) throws DSSRuntimeExceptionFault {
        ExecutionResults results = null;
        try {
            StatelessKnowledgeSession statelessKnowledgeSession = knowledgeBase.newStatelessKnowledgeSession();
            log.debug("KM (Drools) execution...");
            // enable the JMX management
            DroolsManagementAgent kmanagement = DroolsManagementAgent.getInstance();
            // registering a Knowledge Base
            kmanagement.registerKnowledgeBase((KnowledgeBaseImpl)knowledgeBase);
            // registering a Stateful Knowledge Session
            
            log.debug("KM (Drools) execution...");
            results = statelessKnowledgeSession.execute(CommandFactory.newBatchExecution((context.getInput())));
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
