package us.vistacore.asu.rules;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import us.vistacore.asu.dao.JdsDao;
import us.vistacore.asu.util.NullChecker;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component

/**
 Created by kumblep on 11/11/15.

 This class checks if a matching rule can be found from the passed input

 This is a sample rule from JDS. The passed input values must match a rule in the rule set in JDS for a user to be able
 to view the document.
 {
 "stampTime": "20150522232603",
 "actionName": "VIEW",
 "actionUid": "urn:va:doc-action:9E7A:7",
 "description": "A clinical document with a status of Uncosigned may be viewed by individuals enrolled under the User Class, Clinical Service Chief.",
 "docDefName": "CLINICAL DOCUMENTS",
 "docDefUid": "urn:va:doc-def:9E7A:38",
 "isAnd": false,
 "localId": 100,
 "statusName": "UNCOSIGNED",
 "statusUid": "urn:va:doc-status:9E7A:6",
 "uid": "urn:va:asu-rule:9E7A:100",
 "userClassName": "CLINICAL SERVICE CHIEF",
 "userClassUid": "urn:va:asu-class:9E7A:554"
 "userRoleName": "EXPECTED COSIGNER",
 "userRoleUid": "urn:va:asu-role:9E7A:4"
 }

 **/

public class ASURuleEvaluation {

    public static List<AsuRuleDef> asuRules;
    public static Map<String, String> parentDocDefinitions;
    public static Map<String, DocumentDefinition> docDefinitionUidMap;
    private static final Logger log = LoggerFactory.getLogger(ASURuleEvaluation.class);
    private static final String ACTION_NAME_VEW = "VIEW";
    private ArrayList<String> parentDocDefUids;
    private List<String> parentDocDefNames;
    private String documentName;


    @Autowired
    private JdsDao dao;


    public synchronized void refresh() {
        asuRules = dao.findAll(AsuRuleDef.class);
        loadDocumentDefinitionHierarchy();
    }

    /**
     * @return value - true - This means the user can view the document. If false the user cannot view the document.
     * @userClassUids - contains the class name of the current logged in GUI user along with all the parent @class names of the current logged in user
     * @userRoleNames - contains the list of document role names
     * @docDefUid - contains the unique id of a document
     * @docStatus - contains the document status
     */

    public boolean isRulePresent(ASUDocumentDetails documentDetails,String actionName) {


        if (NullChecker.isNullish(asuRules)) {
            refresh();
        }
        String docDefUid=documentDetails.getDocDefUid();
        String docStatus=documentDetails.getDocStatus();

        parentDocDefUids = buildParentDocList(docDefUid);
        parentDocDefNames = getParentLoggingDocDefString(parentDocDefUids);

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
                logDetails(true, " NO MATCHING RULE FOUND FOR ACTION NAME AND DOC STATUS. ", documentDetails,actionName);
            }

            return false;
        }

        return isRulePresent(documentDetails,matchedRules,actionName);
    }

    private boolean isRulePresent(ASUDocumentDetails documentDetails,ArrayList<AsuRuleDef> matchedRules,String actionName) {

        if (log.isInfoEnabled()) {
            log.info("asu matchedRules.size for document " + documentName + " " + documentDetails.getDocDefUid() + " " + matchedRules.size());
        }

        ArrayList<AsuRuleDef> matchedDocDefRules = getMatchedDocDefRules(matchedRules, documentDetails.getDocDefUid());
        if(doesRulesExist(matchedDocDefRules))
        {
            for (AsuRuleDef asuRule : matchedDocDefRules)
            {
                if (isMatchRoleClass(documentDetails,asuRule,actionName)) {
                    return true;
                }
            }
            logDetails(true, " isAnd condition is NOT satisfied. ", documentDetails, actionName);

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
                        if (isMatchRoleClass(documentDetails,asuRule,actionName))
                        {
                            return true;
                        }
                    }
                    logDetails(true, " isAnd condition is NOT satisfied. ", documentDetails, actionName);
                    return false;
                }
            }
            logDetails(true, " No matching rule was found for the doc-def of the current or parent documents. ", documentDetails, actionName);
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

    private boolean isMatchRoleClass(ASUDocumentDetails documentDetails,AsuRuleDef asuRule,String actionName) {

        boolean isMatchClassUid = isMatchClassUid(documentDetails.getUserClassUids(), asuRule);
        boolean isMatchRoleName = isMatchRoleName(documentDetails.getRoleNames(), asuRule);

        if (isAnd(asuRule, true))
        {
            if (isMatchClassUid && isMatchRoleName) {
                logMatchRoleClassDetails(isMatchClassUid,isMatchRoleName,asuRule,documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ","true",false,actionName);
                return true;
            }
            return false;
        }

        if (isAnd(asuRule, false)) {
            if (isMatchClassUid || isMatchRoleName) {
                logMatchRoleClassDetails(isMatchClassUid,isMatchRoleName,asuRule,documentDetails,
                        " isAnd AND OTHER CONDITIONS ARE SATISFIED. ","false",false,actionName);
                return true;
            }
            return false;
        }
        return false;
    }


    public ArrayList<DocPermissionResult> isRulePresentForActionNames(ASUDocumentDetails documentDetails,ArrayList<String> actionNames)
    {
        ArrayList<DocPermissionResult> docPermissionResults=new ArrayList();
        boolean result;
        for(int j=0;j<actionNames.size();j++)
        {
            result=isRulePresent(documentDetails, actionNames.get(j));
            docPermissionResults.add(new DocPermissionResult(actionNames.get(j), result));
        }
        return docPermissionResults;
    }


    private boolean doesRuleExist(AsuRuleDef asuRule) {
        return asuRule != null;
    }


    private boolean isAnd(AsuRuleDef asuRule, boolean value) {
        return NullChecker.isNotNullish(asuRule.isAnd())
                && asuRule.isAnd().equalsIgnoreCase(new Boolean(value).toString());
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

    private boolean doesDocumentStatusMatch(String docStatus,
                                            AsuRuleDef asuRule) {
        return NullChecker.isNotNullish(asuRule.getStatusName()) && asuRule.getStatusName().equalsIgnoreCase(docStatus);
    }


    private boolean doesActionNameMatch(AsuRuleDef asuRule,String actionName) {
        return doesRuleExist(asuRule) && NullChecker.isNotNullish(asuRule.getActionName()) && asuRule.getActionName().toUpperCase().equals(actionName);
    }


    private String getDisplayName(String docDefUid) {
        return docDefinitionUidMap.get(docDefUid).getDisplayName();
    }


    private boolean isThereADocumentElement(String docDefUid) {
        return docDefinitionUidMap != null && docDefinitionUidMap.get(docDefUid) != null;
    }


    private void logDetails(boolean failure,String successFailureReason,ASUDocumentDetails documentDetails,String actionName)
    {
        StringBuffer sb=new StringBuffer();
        sb.append("\n\r \n\r");

        if(failure && NullChecker.isNotNullish(documentName))
        {
            sb.append(" Rule evaluation FAILED for document "+documentName.toUpperCase()+" - Action Name: "+actionName);
        }
        else
        {
            if( NullChecker.isNotNullish(documentName))
            {
                sb.append(" Rule evaluation PASSED for document "+documentName.toUpperCase()+" - Action Name: "+actionName);
            }
        }
        sb.append(documentDetails.toString());
        sb.append(" \n\r PARENT DOCUMENTS: "+parentDocDefNames.toString());
        sb.append(successFailureReason);
        sb.append("\n\r");
        if (log.isInfoEnabled()) {
            log.info(sb.toString());
        }
    }

    private void logMatchRoleClassDetails(boolean isMatchClassUid,boolean isMatchRoleName,AsuRuleDef asuRule,
                                          ASUDocumentDetails documentDetails,String reason,String isAnd,boolean failure,String actionName)
    {
        StringBuffer sb=new StringBuffer();
        sb.append(" \n\r isAnd: "+ isAnd);
        sb.append(" isMatchClassUid: "+isMatchClassUid);
        sb.append(" isMatchRoleName: "+isMatchRoleName);
        sb.append(" \n\r Rule: "+ asuRule.getUid() + " - " + asuRule.getDescription());
        sb.append(" \n\r "+ reason);

        logDetails(failure, sb.toString(), documentDetails, actionName);
    }


    private void loadDocumentDefinitionHierarchy() {

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

}
