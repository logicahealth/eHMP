package us.vistacore.asu.rules;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.asu.dao.JdsDao;
import us.vistacore.asu.util.NullChecker;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ASURules {

    private enum MatchResult {
        FOUND, NO_MATCH, NO_CANDIDATES
    }

    private static final Logger log = LoggerFactory.getLogger(ASURules.class);

    // Static instance shared across all threads
    private volatile static ASURules asuRulesInstance;

    // The instance that has been refreshed from JDS and that will become the new asuRulesInstance
    private volatile static ASURules refreshedAsuRulesInstance;

    private Map<String, List<AsuRuleDef>> asuRules;
    private Map<String, String> parentDocDefinitions;
    private Map<String, DocumentDefinition> docDefinitionUidMap;

    // Class-level, synchronized method to protect access to the current instance of rules
    public static ASURules getRulesInstance(JdsDao dao) {
        // The rules instance may be empty on the initial call
        if (asuRulesInstance == null) {
            synchronized(ASURules.class) {
                // Check again after getting the lock in case another thread got there first
                if (asuRulesInstance == null) {
                    asuRulesInstance = new ASURules(dao);
                }
            }
        }
        // If there are new rules to use get the class-level lock and update the rules
        else if (refreshedAsuRulesInstance != null) {
            synchronized(ASURules.class) {
                // Check again after getting the lock in case another thread got there first
                if (refreshedAsuRulesInstance != null) {
                    asuRulesInstance = refreshedAsuRulesInstance;
                    refreshedAsuRulesInstance = null;
                }
            }
        }
        return asuRulesInstance;
    }

    // Class-level method to refresh the rules
    // The rules are first created in a new object, then that object is set as the current rules instance within a synchronized block
    public static void refreshRules(JdsDao dao) {
        // Don't lock until after we have buiult the rules since this can take some time
        ASURules rules = new ASURules(dao);
        // Only set the refreshed rules after we've finished building
        refreshedAsuRulesInstance = rules;
    }

    // Constructor is private to prevent instantiation by anything other than the refresh method above
    private ASURules(JdsDao dao) {
        List<AsuRuleDef> asuRules = dao.findAll(AsuRuleDef.class);
        splitAsuRulesByDocDefUid(asuRules);
        loadDocumentDefinitionHierarchy(dao);
    }

    private ASURules(List<AsuRuleDef> asuRules, Map<String,String> parentDocDefinitions) {
        splitAsuRulesByDocDefUid(asuRules);
        this.parentDocDefinitions = parentDocDefinitions;
    }

       /**
     * @return value - true - This means the user can view the document. If false the user cannot view the document.
     * @userClassUids - contains the class name of the current logged in GUI user along with all the parent @class names of the current logged in user
     * @userRoleNames - contains the list of document role names
     * @docDefUid - contains the unique id of a document
     * @docStatus - contains the document status
     */

    public boolean isRulePresent(ASUDocumentDetails documentDetails, String actionName) {
        if (log.isInfoEnabled()) {
            log.info("asu rules.size " + asuRules.size());
        }

        String docDefUid = documentDetails.getDocDefUid();
        String docStatus = documentDetails.getDocStatus();
        String documentName = getDisplayName(docDefUid);

        MatchResult matchResult = findMatch(documentDetails, docDefUid, actionName);
        while (matchResult == MatchResult.NO_CANDIDATES) {
            docDefUid = getParentDoc(docDefUid);
            if (docDefUid == null) {
            	break;
            }
            matchResult = findMatch(documentDetails, docDefUid, actionName);
        }

        if (log.isInfoEnabled()) {
            if (matchResult == MatchResult.NO_CANDIDATES) {
                logDetails(true, " No matching rule was found for the doc-def of the current or parent documents. ", documentDetails, actionName);
            } else if (matchResult == MatchResult.NO_MATCH) {
                logDetails(true, " isAnd condition is NOT satisfied. ", documentDetails, actionName);
            }
        }

        return matchResult == MatchResult.FOUND;
    }

    public ArrayList<DocPermissionResult> isRulePresentForActionNames(ASUDocumentDetails documentDetails, ArrayList<String> actionNames) {
        ArrayList<DocPermissionResult> docPermissionResults=new ArrayList<DocPermissionResult>();
        boolean result;
        for (String actionName : actionNames) {
            result = isRulePresent(documentDetails, actionName);
            docPermissionResults.add(new DocPermissionResult(actionName, result));
        }
        return docPermissionResults;
    }

    private MatchResult findMatch(ASUDocumentDetails documentDetails, String docDefUid, String actionName) {
        List<AsuRuleDef> fromRules = this.asuRules.get(docDefUid);
        if (NullChecker.isNullish(fromRules)) {
            return MatchResult.NO_CANDIDATES;
        }

        String docStatus = documentDetails.getDocStatus();
        boolean hasCandidates = false;
        for (AsuRuleDef rule : fromRules) {
            if (doesActionNameMatch(rule, actionName) && doesDocumentStatusMatch(docStatus, rule)) {
                hasCandidates = true;

                boolean isMatchClassUid = isMatchClassUid(documentDetails.getUserClassUids(), rule);
                boolean isMatchRoleName = isMatchRoleName(documentDetails.getRoleNames(), rule);

                if (isAnd(rule, true) && isMatchClassUid && isMatchRoleName) {
                    logSuccessfulMatch(isMatchClassUid, isMatchRoleName, rule, documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ", actionName);
                    return MatchResult.FOUND;
                } else if (isAnd(rule, false) && (isMatchClassUid || isMatchRoleName)) {
                    logSuccessfulMatch(isMatchClassUid, isMatchRoleName, rule, documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ", actionName);
                    return MatchResult.FOUND;
                }
            }
        }

        return hasCandidates ? MatchResult.NO_MATCH : MatchResult.NO_CANDIDATES;
    }

    private boolean doesRuleExist(AsuRuleDef asuRule) {
        return asuRule != null;
    }


    private boolean isAnd(AsuRuleDef asuRule, boolean value) {
        return NullChecker.isNotNullish(asuRule.isAnd())
                && asuRule.isAnd().equalsIgnoreCase(Boolean.toString(value));
    }

    private boolean isMatchClassUid(List<String> userClassUids, AsuRuleDef asuRule) {
        if (NullChecker.isNullish(userClassUids))
            return false;

        for (String classUid : userClassUids) {
            if (doesTheClassUidMatch(asuRule, classUid)) {
                return true;
            }
        }
        return false;
    }

    private boolean doesTheClassUidMatch(AsuRuleDef asuRule, String classUid) {
        return NullChecker.isNotNullish(classUid)
                && NullChecker.isNotNullish(asuRule.getUserClassUid())
                && asuRule.getUserClassUid().equals(classUid);
    }

    private boolean isMatchRoleName(List<String> roleNames, AsuRuleDef asuRule) {
        if (NullChecker.isNullish(roleNames))
            return false;

        for (String roleName : roleNames) {
            if (isMatchRoleName(roleName, asuRule.getUserRoleName())) {
                return true;
            }
        }

        return false;
    }

    private boolean isMatchRoleName(String documentRoleName, String ruleRoleName) {
        if (NullChecker.isNotNullish(documentRoleName) &&
                NullChecker.isNotNullish(ruleRoleName) &&
                documentRoleName.trim().equalsIgnoreCase(ruleRoleName.trim())) {
            return true;
        }
        return false;
    }

    private boolean doesDocumentStatusMatch(String docStatus, AsuRuleDef asuRule) {
        return NullChecker.isNotNullish(asuRule.getStatusName()) && asuRule.getStatusName().equalsIgnoreCase(docStatus);
    }


    private boolean doesActionNameMatch(AsuRuleDef asuRule, String actionName) {
        return doesRuleExist(asuRule) && NullChecker.isNotNullish(asuRule.getActionName()) && asuRule.getActionName().equalsIgnoreCase(actionName);
    }


    private String getDisplayName(String docDefUid) {
        if (docDefinitionUidMap != null) {
            DocumentDefinition definition = docDefinitionUidMap.get(docDefUid);
            if (definition != null) {
                return definition.getDisplayName();
            }
        }
        return null;
    }


    private void logDetails(boolean failure, String successFailureReason, ASUDocumentDetails documentDetails, String actionName)
    {
        if (!log.isInfoEnabled()) {
            return;
        }

        StringBuilder sb = new StringBuilder();
        appendDetails(failure, documentDetails, actionName, sb);
        sb.append(successFailureReason);
        sb.append("\r\n");

        log.info(sb.toString());
    }

    private void appendDetails(boolean failure, ASUDocumentDetails documentDetails, String actionName, StringBuilder sb)
    {
        String docDefUid = documentDetails.getDocDefUid();
        String documentName = getDisplayName(docDefUid);

        sb.append("\r\n \r\n");

        if (NullChecker.isNotNullish(documentName)) {
            if (failure) {
                sb.append(" Rule evaluation FAILED for document ");
            } else {
                sb.append(" Rule evaluation PASSED for document ");
            }
            sb.append(documentName.toUpperCase());
            sb.append(" - Action Name: ");
            sb.append(avoidLogForging(actionName));
        }
        appendDocumentDetails(documentDetails, sb);
        sb.append(" \r\n PARENT DOCUMENTS: ");
        docDefUid = getParentDoc(docDefUid);
        while (docDefUid != null) {
            sb.append(" ");
            sb.append(docDefUid);
            documentName = getDisplayName(docDefUid);
            if (documentName != null) {
                sb.append(" ");
                sb.append(documentName);
            }
            docDefUid = getParentDoc(docDefUid);
        }
    }

    private void appendDocumentDetails(ASUDocumentDetails documentDetails, StringBuilder sb) {
        sb.append(" \r\n docDefUid: ").append(avoidLogForging(documentDetails.getDocDefUid()));
        sb.append(" \r\n docStatus: ").append(avoidLogForging(documentDetails.getDocStatus()));

        if (NullChecker.isNotNullish(documentDetails.getActionNames())) {
            sb.append(" \r\n actionNamesList: ").append(avoidLogForging(documentDetails.getActionNames().toString()));
        }
        if (NullChecker.isNotNullish(documentDetails.getUserClassUids())) {
            sb.append(" \r\n userClassUids: ").append(avoidLogForging(documentDetails.getUserClassUids().toString()));
        } else {
            sb.append(" \r\n userClassUids: null ");
        }

        if (NullChecker.isNotNullish(documentDetails.getRoleNames())) {
            sb.append(" \r\n roleNames: ").append(avoidLogForging(documentDetails.getRoleNames().toString()));
        } else {
            sb.append(" \r\n roleNames: null ");
        }
    }

    private void logSuccessfulMatch(boolean isMatchClassUid, boolean isMatchRoleName,
            AsuRuleDef asuRule, ASUDocumentDetails documentDetails, String reason, String actionName)
    {
        if (!log.isInfoEnabled()) {
            return;
        }

        boolean isAnd = isAnd(asuRule, true);

        StringBuilder sb = new StringBuilder();

        appendDetails(false, documentDetails, actionName, sb);

        sb.append(" \r\n isAnd: ");
        sb.append(isAnd);
        sb.append(" isMatchClassUid: ");
        sb.append(isMatchClassUid);
        sb.append(" isMatchRoleName: ");
        sb.append(isMatchRoleName);
        sb.append(" \r\n Rule: ");
        sb.append(asuRule.getUid());
        sb.append(" - ");
        sb.append(asuRule.getDescription());
        sb.append(" \r\n ");
        sb.append(reason);
        sb.append("\r\n");

        log.info(sb.toString());
    }

    private String avoidLogForging(String s) {
        if (s != null) {
            s = s.replace('\n', '_').replace('\r', '_');
        }
        return s;
    }

    private String getParentDoc(String childDocUid) {
        return parentDocDefinitions.get(childDocUid);
    }

    private void splitAsuRulesByDocDefUid(List<AsuRuleDef> rules) {
        this.asuRules = new HashMap<String, List<AsuRuleDef>>();
        for (AsuRuleDef rule : rules) {
            if (!this.asuRules.containsKey(rule.getDocDefUid())) {
                this.asuRules.put(rule.getDocDefUid(), new ArrayList<AsuRuleDef>());
            }
            this.asuRules.get(rule.getDocDefUid()).add(rule);
        }
    }

    private void loadDocumentDefinitionHierarchy(JdsDao dao) {
        //Map <child docDefUid, parent docDefUid>
        parentDocDefinitions = new HashMap<String, String>();

        docDefinitionUidMap = new HashMap<String, DocumentDefinition>();

        List<DocumentDefinition> all = dao.findAll(DocumentDefinition.class);

        for (DocumentDefinition parentDocDef : all) {

            docDefinitionUidMap.put(parentDocDef.getUid(), parentDocDef);

            if (parentDocDef.getItems() != null && !parentDocDef.getItems().isEmpty()) {
                for (Map<String, Object> childDocDef : parentDocDef.getItems()) {
                    parentDocDefinitions.put((String) childDocDef.get("uid"), parentDocDef.getUid());
                }
            }
        }
    }
}
