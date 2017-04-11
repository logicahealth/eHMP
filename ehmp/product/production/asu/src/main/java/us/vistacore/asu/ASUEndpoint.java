package us.vistacore.asu;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import us.vistacore.asu.rules.ASURuleEvaluation;
import us.vistacore.asu.rules.ASUDocumentDetails;
import us.vistacore.asu.rules.DocPermissionResult;
import us.vistacore.asu.util.NullChecker;
import java.util.ArrayList;

@RestController
@RequestMapping(value = "${uri.rules}")

public class ASUEndpoint {

    private static final Logger log = LoggerFactory.getLogger(ASUEndpoint.class);
    private static final String ACTION_NAME_VIEW="VIEW";

    @Autowired
    private ASURuleEvaluation asu;

    @RequestMapping(value = "${uri.refresh}", method = RequestMethod.GET)
    public String refresh()
    {
        try
        {
            asu.refresh();
            return "ASU rules succesfully refreshed";
        }
        catch(Exception e)
        {
            log.error("AsuEndpoint.refresh - Unable to refresh ASU rules "+e);
            return "ASU rules refresh failed";
        }
    }

    /*
    This end point checks if a logged in user in GUI can access a document. This end point
    checks for actionName='VIEW' permissions.

    @return value - true - User can access the document
                    false - user cannot access the document.
     */

    @RequestMapping(value = "${uri.accessDocument}",
            consumes = "application/json",method = RequestMethod.POST
    )
    public boolean accessDocument(@RequestBody ASUDocumentDetails documentDetails) throws Exception {

        validateRuleEvaluationParameters(documentDetails.getUserClassUids(), documentDetails.getDocDefUid()
                , documentDetails.getDocStatus());

        return asu.isRulePresent(documentDetails,ASUEndpoint.ACTION_NAME_VIEW);
    }

    /*
   This end point checks if a logged in user in GUI can access a document. This end point
    checks for a list of actionNames (eg: VIEW, EDIT RECORD, AMENDMENT, ENTRY) etc.

   @return ArrayList<AccessDocumentResult>. A user can perform an action if hasPermission in AccessDocumentResult is true
    */
    @RequestMapping(value = "${uri.getDocPermissions}",
            consumes = "application/json",method = RequestMethod.POST
    )
    public ArrayList<DocPermissionResult> getDocPermissions(@RequestBody ASUDocumentDetails documentDetails) throws Exception {
        validateRuleEvaluationParameters(documentDetails.getUserClassUids(), documentDetails.getDocDefUid()
                , documentDetails.getDocStatus());
        validateRuleEvaluationParameters(documentDetails.getActionNames());

        return asu.isRulePresentForActionNames(documentDetails, documentDetails.getActionNames());
    }


    private void validateRuleEvaluationParameters(ArrayList<String> userClassUids,String docDefUid,String docStatus)
            throws Exception {
        if(NullChecker.isNullish(userClassUids))
            throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - classUid cannot be empty.");

        if(userClassUids.get(0).length()==0)
            throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - classUid cannot be empty.");

        if(NullChecker.isNullish(docDefUid))
            throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - docDefUid cannot be empty.");

        if(NullChecker.isNullish(docStatus))
            throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - docStatus cannot be empty.");
    }

    private void validateRuleEvaluationParameters(ArrayList<String> actionNames) throws Exception
    {
        if(NullChecker.isNullish(actionNames))
            throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - actionNames cannot be empty.");

        for(int i=0;i<actionNames.size();i++)
        {
            if(NullChecker.isNullish(actionNames.get(i))){
                throw new Exception("ASUEndPoint.validateRuleEvaluationParameters: ASU rules evaluation - one or more actionName is empty.");
            }
        }
    }

}
