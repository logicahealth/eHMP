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

    private static final Logger log = LoggerFactory.getLogger(ASURules.class);

    // Static instance shared across all threads
    private static ASURules asuRulesInstance;

    // The instance that has been refreshed from JDS and that will become the new asuRulesInstance
    private static ASURules refreshedAsuRulesInstance;

    private List<AsuRuleDef> asuRules;
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
        asuRules = dao.findAll(AsuRuleDef.class);
        loadDocumentDefinitionHierarchy(dao); 
    }

    private ASURules(List<AsuRuleDef> asuRules, Map<String,String> parentDocDefinitions) {
        this.asuRules = asuRules;
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
        String docDefUid=documentDetails.getDocDefUid();
        String docStatus=documentDetails.getDocStatus();

        ArrayList<String> parentDocDefUids = buildParentDocList(docDefUid);
        List<String> parentDocDefNames = getParentLoggingDocDefString(parentDocDefUids);

        String documentName = null;
        if (isThereADocumentElement(docDefUid)) {
            documentName = getDisplayName(docDefUid);
        }

        ArrayList<AsuRuleDef> matchedRules = new ArrayList<AsuRuleDef>();
        if (log.isInfoEnabled()) {
            log.info("asu rules.size " + asuRules.size());
        }

        for (AsuRuleDef asuRule : asuRules) {
            if (doesActionNameMatch(asuRule,actionName)) {
                if (doesDocumentStatusMatch(docStatus, asuRule)) {
                    matchedRules.add(asuRule);
                }
            }
        }

        if (NullChecker.isNullish(matchedRules)) {
            if (log.isInfoEnabled()) {
                logDetails(true, " NO MATCHING RULE FOUND FOR ACTION NAME AND DOC STATUS. ", documentDetails,actionName, documentName, parentDocDefNames);
            }

            return false;
        }

        return isRulePresent(documentDetails,matchedRules,actionName, documentName, parentDocDefNames, parentDocDefUids);
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

    private boolean isRulePresent(ASUDocumentDetails documentDetails, ArrayList<AsuRuleDef> matchedRules, String actionName, String documentName, List<String> parentDocDefNames, ArrayList<String> parentDocDefUids) {

        if (log.isInfoEnabled()) {
            log.info("asu matchedRules.size for document " + documentName + " " + documentDetails.getDocDefUid() + " " + matchedRules.size());
        }

        ArrayList<AsuRuleDef> matchedDocDefRules = getMatchedDocDefRules(matchedRules, documentDetails.getDocDefUid());
        if(doesRulesExist(matchedDocDefRules))
        {
            for (AsuRuleDef asuRule : matchedDocDefRules)
            {
                if (isMatchRoleClass(documentDetails, asuRule, actionName, documentName, parentDocDefNames)) {
                    return true;
                }
            }
            logDetails(true, " isAnd condition is NOT satisfied. ", documentDetails, actionName, documentName, parentDocDefNames);

            return false;
        }
        else
        {
            for (String currDocDefUid : parentDocDefUids)
            {
                matchedDocDefRules = getMatchedDocDefRules(matchedRules, currDocDefUid);

                if (doesRulesExist(matchedDocDefRules))
                {

                    for (AsuRuleDef asuRule : matchedDocDefRules)
                    {
                        if (isMatchRoleClass(documentDetails, asuRule, actionName, documentName, parentDocDefNames))
                        {
                            return true;
                        }
                    }
                    logDetails(true, " isAnd condition is NOT satisfied. ", documentDetails, actionName, documentName, parentDocDefNames);
                    return false;
                }
            }
            logDetails(true, " No matching rule was found for the doc-def of the current or parent documents. ", documentDetails, actionName, documentName, parentDocDefNames);
        }
        return false;
    }

    private boolean doesRulesExist(ArrayList<AsuRuleDef>  asuRules) {
        if(asuRules==null){
            return false;
        }
        if(asuRules.size()==0){
            return false;
        }
        return true;
    }

    private ArrayList<AsuRuleDef> getMatchedDocDefRules(ArrayList<AsuRuleDef> matchedRules, String currDocDefUid) {
        ArrayList<AsuRuleDef> matchedDocDefRules = new ArrayList<AsuRuleDef>();
        for (AsuRuleDef asuRule : matchedRules)
        {
             if (NullChecker.isNotNullish(asuRule.getDocDefUid()) && NullChecker.isNotNullish(currDocDefUid)
                    && asuRule.getDocDefUid().equals(currDocDefUid))
            {
                matchedDocDefRules.add(asuRule);

            }
        }
        return matchedDocDefRules;
    }

    private boolean isMatchRoleClass(ASUDocumentDetails documentDetails, AsuRuleDef asuRule, String actionName, String documentName, List<String> parentDocDefNames) {

        boolean isMatchClassUid = isMatchClassUid(documentDetails.getUserClassUids(), asuRule);
        boolean isMatchRoleName = isMatchRoleName(documentDetails.getRoleNames(), asuRule);

        if (isAnd(asuRule, true))
        {
            if (isMatchClassUid && isMatchRoleName) {
                logMatchRoleClassDetails(isMatchClassUid, isMatchRoleName, asuRule, documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ", "true", false, actionName, documentName, parentDocDefNames);
                return true;
            }
            return false;
        }

        if (isAnd(asuRule, false)) {
            if (isMatchClassUid || isMatchRoleName) {
                logMatchRoleClassDetails(isMatchClassUid,isMatchRoleName,asuRule,documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ", "false", false, actionName, documentName, parentDocDefNames);
                return true;
            }
            return false;
        }
        return false;
    }

    private boolean doesRuleExist(AsuRuleDef asuRule) {
        return asuRule != null;
    }


    private boolean isAnd(AsuRuleDef asuRule, boolean value) {
        return NullChecker.isNotNullish(asuRule.isAnd())
                && asuRule.isAnd().equalsIgnoreCase(Boolean.toString(value));
    }

    private boolean isMatchClassUid(ArrayList<String> userClassUids, AsuRuleDef asuRule) {
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

    private boolean isMatchRoleName(ArrayList<String> roleNames, AsuRuleDef asuRule) {
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
                documentRoleName.trim().toUpperCase().equals(ruleRoleName.trim().toUpperCase())) {
            return true;
        }
        return false;
    }

    private boolean doesDocumentStatusMatch(String docStatus, AsuRuleDef asuRule) {
        return NullChecker.isNotNullish(asuRule.getStatusName()) && asuRule.getStatusName().equalsIgnoreCase(docStatus);
    }


    private boolean doesActionNameMatch(AsuRuleDef asuRule, String actionName) {
        return doesRuleExist(asuRule) && NullChecker.isNotNullish(asuRule.getActionName()) && asuRule.getActionName().toUpperCase().equals(actionName);
    }


    private String getDisplayName(String docDefUid) {
        return docDefinitionUidMap.get(docDefUid).getDisplayName();
    }


    private boolean isThereADocumentElement(String docDefUid) {
        return docDefinitionUidMap != null && docDefinitionUidMap.get(docDefUid) != null;
    }


    private void logDetails(boolean failure, String successFailureReason, ASUDocumentDetails documentDetails, String actionName, String documentName, List<String>parentDocDefNames)
    {
        StringBuilder sb=new StringBuilder();
        sb.append("\n\r \n\r");

        if(failure && NullChecker.isNotNullish(documentName))
        {
            sb.append(" Rule evaluation FAILED for document ").append(documentName.toUpperCase()).append(" - Action Name: ").append(actionName);
        }
        else
        {
            if( NullChecker.isNotNullish(documentName))
            {
                sb.append(" Rule evaluation PASSED for document ").append(documentName.toUpperCase()).append(" - Action Name: ").append(actionName);
            }
        }
        sb.append(documentDetails.toString());
        sb.append(" \n\r PARENT DOCUMENTS: ").append(parentDocDefNames.toString());
        sb.append(successFailureReason);
        sb.append("\n\r");
        if (log.isInfoEnabled()) {
            log.info(sb.toString());
        }
    }

    private void logMatchRoleClassDetails(boolean isMatchClassUid, boolean isMatchRoleName, AsuRuleDef asuRule,
                                          ASUDocumentDetails documentDetails, String reason, String isAnd, boolean failure, String actionName, String documentName, List<String> parentDocDefNames)
    {
        String sb = (" \n\r isAnd: " + isAnd) +
                " isMatchClassUid: " + isMatchClassUid +
                " isMatchRoleName: " + isMatchRoleName +
                " \n\r Rule: " + asuRule.getUid() + " - " + asuRule.getDescription() +
                " \n\r " + reason;

        logDetails(failure, sb, documentDetails, actionName, documentName, parentDocDefNames);
    }

    /**
     * This method returns all the parents for a @docUid. There can be one or more.
     *
     * @param docUid - child doc uid
     * @return The list of patent doc uids.
     */
    private ArrayList<String> buildParentDocList(String docUid) {
        ArrayList<String> parentDocList = new ArrayList<String>();

        String parentDocUid = getParentDoc(docUid);

        if (parentDocUid != null)
            parentDocList.add(parentDocUid);

        while (parentDocUid != null) {
            parentDocUid = getParentDoc(parentDocUid);

            if (parentDocUid != null)
                parentDocList.add(parentDocUid);
        }

        return parentDocList;
    }

    private String getParentDoc(String childDocUid) {
        return parentDocDefinitions.get(childDocUid);
    }

    private List<String> getParentLoggingDocDefString(ArrayList<String> docDefUids) {
        String docName = "";
        List<String> sb = new ArrayList<String>();
        if (NullChecker.isNotNullish(docDefUids)) {
            for (String docDefUid : docDefUids) {
                if (isThereADocumentElement(docDefUid)) {
                    docName = getDisplayName(docDefUid);
                }
                sb.add(" " + docDefUid + " " + docName);
            }
        }
        return sb;
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
