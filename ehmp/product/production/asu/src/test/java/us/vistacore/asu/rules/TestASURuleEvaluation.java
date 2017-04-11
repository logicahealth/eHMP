package us.vistacore.asu.rules;

import static org.junit.Assert.*;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;


/**
 * Created by kumblep on 11/11/15.
 */
public class TestASURuleEvaluation
{
    ASURuleEvaluation asuRuleEvaluation=new ASURuleEvaluation();
    Map<String,String> parentDocDefinitions=new HashMap<String, String>();

    public TestASURuleEvaluation()
    {
        //put (child,parent)
        parentDocDefinitions.put("urn:va:doc-def:9E7A:3","urn:va:doc-def:9E7A:38");
        parentDocDefinitions.put("urn:va:doc-def:9E7A:30","urn:va:doc-def:9E7A:3");
        parentDocDefinitions.put("urn:va:doc-def:9E7A:117","urn:va:doc-def:9E7A:30");
        parentDocDefinitions.put("urn:va:doc-def:9E7A:307","urn:va:doc-def:9E7A:150");

        ASURuleEvaluation.parentDocDefinitions=parentDocDefinitions;
        ASURuleEvaluation.asuRules=populateRules();
    }


    //Test success for isAnd=true. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndTrueSuccess(){

        assertFalse(asuRuleEvaluation.isRulePresent(getCrisisCompleted(), "VIEW"));

        ASUDocumentDetails crisisDocument= getCrisisCompleted();

        ArrayList roleNames=new ArrayList();
        roleNames.add("EXPECTED COSIGNER");
        roleNames.add("TRANSCRIBER");
        roleNames.add("AUTHOR/DICTATOR");
        crisisDocument.setRoleNames(roleNames);
        assertTrue(asuRuleEvaluation.isRulePresent(crisisDocument, "VIEW"));
    }

    //Test failure for isAnd=true. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndTrueFailure(){

        assertFalse(asuRuleEvaluation.isRulePresent(getCrisisCompleted(), "VIEW"));

        ASUDocumentDetails crisisDocument= getCrisisCompleted();

        ArrayList roleNames=new ArrayList();
        roleNames.add("EXPECTED COSIGNER");
        roleNames.add("TRANSCRIBER");
        roleNames.add("AUTHOR/DICTATOR");
        crisisDocument.setRoleNames(roleNames);
        assertTrue(asuRuleEvaluation.isRulePresent(crisisDocument, "VIEW"));
   }

    //Test success for isAnd=false. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndFalseSuccess()
    {
        assertTrue(asuRuleEvaluation.isRulePresent(getProgressNoteCompleted(), "VIEW"));
    }

    //Test failure for isAnd=false. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndFalseFailure()
    {
        System.out.println("testisAndFalseFailure");
        assertFalse(asuRuleEvaluation.isRulePresent(getProgressNoteCompletedForDifferentSite(), "VIEW"));
    }



    //Test success for parent document heirarchy.
    // If a rule for the current document does not exist test if parent document rules gets evaluated..

    @Test
    public void testParentDocRuleEvaluationSuccess()
    {
          assertTrue(asuRuleEvaluation.isRulePresent(getCrisisNoteCompleted(), "VIEW"));
    }

    //Test failure for parent document heirarchy.
    // If a rule for the current document does not exist test if parent document rules gets evaluated.

    @Test
    public void testParentDocRuleEvaluationFailure()
    {
        assertFalse(asuRuleEvaluation.isRulePresent(getCrisisUnsigned(), "VIEW"));
    }

    @Test
    public void testMatchDocStatusFailure()
    {
        System.out.println("testMatchDocStatusFailure");

        assertFalse(asuRuleEvaluation.isRulePresent(getAdvanceDirective(), "VIEW"));
    }

    @Test
    public void testMatchActionNameFailure()
    {
        System.out.println("testMatchActionNameFailure");

        assertFalse(asuRuleEvaluation.isRulePresent(getProgressNoteCompleted(), "DELETE RECORD"));
    }

    @Test
    public void testMultipleRulesInALevelSuccess()
    {
         assertTrue(asuRuleEvaluation.isRulePresent(getPhysicianProgressUnsigned(), "VIEW"));
    }

    @Test
    public void testMultipleActionNames()
    {
        ArrayList<String> actionNames=new ArrayList<String>();

        actionNames.add("VIEW");
        actionNames.add("EDIT RECORD");
        actionNames.add("SIGNATURE");
        actionNames.add("VERIFICATION");

        ASUDocumentDetails crisisDocument= getCrisisCompleted();

        ArrayList roleNames=new ArrayList();
        roleNames.add("AUTHOR/DICTATOR");
        crisisDocument.setRoleNames(roleNames);

        ArrayList<DocPermissionResult> docPermissionResults=asuRuleEvaluation.isRulePresentForActionNames(crisisDocument, actionNames);

        assertEquals(docPermissionResults.get(0).isHasPermission(),true);
        assertEquals(docPermissionResults.get(1).isHasPermission(),true);
        assertEquals(docPermissionResults.get(2).isHasPermission(),false);
        assertEquals(docPermissionResults.get(3).isHasPermission(),false);
    }






    private ASUDocumentDetails getProgressNoteCompleted()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:3");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getAdvanceDirective()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:27");
        documentDetails.setDocStatus("UNCOSIGNED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getProgressNoteCompletedForDifferentSite()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:3");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:C877:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }


    private ASUDocumentDetails getCrisisCompleted()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:117");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getCrisisUnsigned()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:117");
        documentDetails.setDocStatus("UNSIGNED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }


    private ASUDocumentDetails getCrisisNoteCompleted()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:30");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getPhysicianProgressUnsigned()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:9E7A:307");
        documentDetails.setDocStatus("UNSIGNED");

        ArrayList userClassUids=new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:9E7A:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }




    private List<AsuRuleDef> populateRules()
    {
        List<AsuRuleDef> asuRules=new ArrayList<AsuRuleDef>();

        AsuRuleDef asuRuleClinicalDocument=new AsuRuleDef();
        asuRuleClinicalDocument.setDocDefUid("urn:va:doc-def:9E7A:38");
        asuRuleClinicalDocument.setActionName("VIEW");
        asuRuleClinicalDocument.setIsAnd("false");
        asuRuleClinicalDocument.setStatusName("COMPLETED");
        asuRuleClinicalDocument.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleClinicalDocument.setDescription("A Clinical Documents with a status of completed can be viewed by USER");
        asuRules.add(asuRuleClinicalDocument);

        AsuRuleDef asuRuleProgressNote=new AsuRuleDef();
        asuRuleProgressNote.setDocDefUid("urn:va:doc-def:9E7A:3");
        asuRuleProgressNote.setActionName("VIEW");
        asuRuleProgressNote.setIsAnd("false");
        asuRuleProgressNote.setStatusName("COMPLETED");
        asuRuleProgressNote.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleProgressNote.setDescription("A Progress Note with a status of completed can be viewed by USER");
        asuRules.add(asuRuleProgressNote);

        //NO RULE SHOULD BE ADDED FOR CRISIS NOTES - urn:va:doc-def:9E7A:30

        AsuRuleDef asuRuleCrisis=new AsuRuleDef();
        asuRuleCrisis.setDocDefUid("urn:va:doc-def:9E7A:117");
        asuRuleCrisis.setActionName("VIEW");
        asuRuleCrisis.setIsAnd("true");
        asuRuleCrisis.setStatusName("COMPLETED");
        asuRuleCrisis.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleCrisis.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisis.setDescription("A CRISIS with a status of completed can be viewed by USER");
        asuRules.add(asuRuleCrisis);

        AsuRuleDef asuRuleCrisisEditRecord=new AsuRuleDef();
        asuRuleCrisisEditRecord.setDocDefUid("urn:va:doc-def:9E7A:117");
        asuRuleCrisisEditRecord.setActionName("EDIT RECORD");
        asuRuleCrisisEditRecord.setIsAnd("true");
        asuRuleCrisisEditRecord.setStatusName("COMPLETED");
        asuRuleCrisisEditRecord.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleCrisisEditRecord.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisisEditRecord.setDescription("A CRISIS with a status of completed can perform EDIT RECORD by USER");
        asuRules.add(asuRuleCrisisEditRecord);


        AsuRuleDef asuRuleCrisisUnsigned=new AsuRuleDef();
        asuRuleCrisisUnsigned.setDocDefUid("urn:va:doc-def:9E7A:244");
        asuRuleCrisisUnsigned.setActionName("VIEW");
        asuRuleCrisisUnsigned.setIsAnd("false");
        asuRuleCrisisUnsigned.setStatusName("UNSIGNED");
        asuRuleCrisisUnsigned.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleCrisisUnsigned.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisisUnsigned.setDescription("A DISCHARGE SUMMARY with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleCrisisUnsigned);

        //NO RULE SHOULD BE ADDED FOR PHYSICIAN PROGRESS - urn:va:doc-def:9E7A:307

        //DOCTOTS NOTE UNSIGNED
        AsuRuleDef asuRuleDocNoteUnsignedisAndTrue=new AsuRuleDef();
        asuRuleDocNoteUnsignedisAndTrue.setDocDefUid("urn:va:doc-def:9E7A:150");
        asuRuleDocNoteUnsignedisAndTrue.setActionName("VIEW");
        asuRuleDocNoteUnsignedisAndTrue.setIsAnd("true");
        asuRuleDocNoteUnsignedisAndTrue.setStatusName("UNSIGNED");
        asuRuleDocNoteUnsignedisAndTrue.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleDocNoteUnsignedisAndTrue.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleDocNoteUnsignedisAndTrue.setDescription("A DOCTORS NOTES with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleDocNoteUnsignedisAndTrue);

        //DOCTOTS NOTE UNSIGNED

        AsuRuleDef asuRuleDocNoteUnsignedisAndFalse=new AsuRuleDef();
        asuRuleDocNoteUnsignedisAndFalse.setDocDefUid("urn:va:doc-def:9E7A:150");
        asuRuleDocNoteUnsignedisAndFalse.setActionName("VIEW");
        asuRuleDocNoteUnsignedisAndFalse.setIsAnd("false");
        asuRuleDocNoteUnsignedisAndFalse.setStatusName("UNSIGNED");
        asuRuleDocNoteUnsignedisAndFalse.setUserClassUid("urn:va:asu-class:9E7A:561");
        asuRuleDocNoteUnsignedisAndFalse.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleDocNoteUnsignedisAndFalse.setDescription("A DOCTORS NOTES with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleDocNoteUnsignedisAndFalse);




        return asuRules;
    }
}
