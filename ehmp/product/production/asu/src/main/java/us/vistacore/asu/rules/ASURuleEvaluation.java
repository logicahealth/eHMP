package us.vistacore.asu.rules;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import us.vistacore.asu.dao.JdsDao;

import java.util.ArrayList;

@Component

/**
 Created by kumblep on 11/11/15.

 This class checks if a matching rule can be found from the passed input

 This is a sample rule from JDS. The passed input values must match a rule in the rule set in JDS for a user to be able
 to view the document.
 {
 "stampTime": "20150522232603",
 "actionName": "VIEW",
 "actionUid": "urn:va:doc-action:SITE:7",
 "description": "A clinical document with a status of Uncosigned may be viewed by individuals enrolled under the User Class, Clinical Service Chief.",
 "docDefName": "CLINICAL DOCUMENTS",
 "docDefUid": "urn:va:doc-def:SITE:38",
 "isAnd": false,
 "localId": 100,
 "statusName": "UNCOSIGNED",
 "statusUid": "urn:va:doc-status:SITE:6",
 "uid": "urn:va:asu-rule:SITE:100",
 "userClassName": "CLINICAL SERVICE CHIEF",
 "userClassUid": "urn:va:asu-class:SITE:554"
 "userRoleName": "EXPECTED COSIGNER",
 "userRoleUid": "urn:va:asu-role:SITE:4"
 }

 **/

public class ASURuleEvaluation {

    @Autowired
    private JdsDao dao;

    /**
     * Refresh the rules from JDS using a Data Access Object
     */
    public synchronized void refresh() {
        ASURules.refreshRules(dao);
    }

    /**
     * @return value - true - This means the user can view the document. If false the user cannot view the document.
     */
    public boolean isRulePresent(ASUDocumentDetails documentDetails, String actionName) {
        // Get the current ASU rules
        ASURules asuRules = ASURules.getRulesInstance(dao);

        // Evaluate the rules
        return asuRules.isRulePresent(documentDetails, actionName);
    }

    public ArrayList<DocPermissionResult> isRulePresentForActionNames(ASUDocumentDetails documentDetails, ArrayList<String> actionNames) {
        // Get the current ASU rules
        ASURules asuRules = ASURules.getRulesInstance(dao);

        // Evaluate the rules
        return asuRules.isRulePresentForActionNames(documentDetails, actionNames);
    }

    public void injectDao(JdsDao d) {
        this.dao = d;
    }
}
