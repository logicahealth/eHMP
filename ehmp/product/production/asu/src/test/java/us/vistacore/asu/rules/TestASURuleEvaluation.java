package us.vistacore.asu.rules;

import us.vistacore.asu.dao.JdsDao;

import static org.junit.Assert.*;

import org.mockito.Matchers;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
    private ASURuleEvaluation asuRuleEvaluation;
    private JdsDao dao;

    public TestASURuleEvaluation() {
        asuRuleEvaluation = new ASURuleEvaluation();
        JdsDao dao = mock(JdsDao.class);
        when(dao.findAll(eq(AsuRuleDef.class))).thenReturn(populateRules());
        when(dao.findAll(eq(DocumentDefinition.class))).thenReturn(populateDocDefinitions());

        asuRuleEvaluation.injectDao(dao);    }

    /**
     * Test that the ASURules instance is properly instantiated and refreshed
     */
    @Test
    public void testGetRulesInstance() {
        // Ensure the first call to getRulesInstance instantiates and returns a non-null ASURules object
        ASURules asuRules = ASURules.getRulesInstance(dao);
        assertNotNull(asuRules);

        // Refresh the rules
        asuRuleEvaluation.refresh();

        // Get the ASURules object again and make sure it is non-null and also different from the first object
        ASURules refreshedAsuRules = ASURules.getRulesInstance(dao);
        assertNotNull(refreshedAsuRules);
        assertNotEquals(asuRules,refreshedAsuRules);
    }

    //Test success for isAnd=true. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndTrueSuccess() {

        assertFalse(asuRuleEvaluation.isRulePresent(getCrisisCompleted(), "VIEW"));

        ASUDocumentDetails crisisDocument = getCrisisCompleted();

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
    public void testisAndTrueFailure() {

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
    public void testisAndFalseSuccess() {
        assertTrue(asuRuleEvaluation.isRulePresent(getProgressNoteCompleted(), "VIEW"));
    }

    //Test failure for isAnd=false. If a rule exists for the lower level document and higher level document
    // (for same action name and status), the evaluation passes/fails at the lower level and does not go to the higher level
    @Test
    public void testisAndFalseFailure() {
        System.out.println("testisAndFalseFailure");
        assertFalse(asuRuleEvaluation.isRulePresent(getProgressNoteCompletedForDifferentSite(), "VIEW"));
    }

    //Test success for parent document heirarchy.
    // If a rule for the current document does not exist test if parent document rules gets evaluated..

    @Test
    public void testParentDocRuleEvaluationSuccess() {
        assertTrue(asuRuleEvaluation.isRulePresent(getCrisisNoteCompleted(), "VIEW"));
    }

    //Test failure for parent document heirarchy.
    // If a rule for the current document does not exist test if parent document rules gets evaluated.

    @Test
    public void testParentDocRuleEvaluationFailure() {
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
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:3");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getAdvanceDirective()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:27");
        documentDetails.setDocStatus("UNCOSIGNED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getProgressNoteCompletedForDifferentSite()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:3");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }


    private ASUDocumentDetails getCrisisCompleted()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:117");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getCrisisUnsigned()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:117");
        documentDetails.setDocStatus("UNSIGNED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }


    private ASUDocumentDetails getCrisisNoteCompleted()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:30");
        documentDetails.setDocStatus("COMPLETED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private ASUDocumentDetails getPhysicianProgressUnsigned()
    {
        ASUDocumentDetails documentDetails=new ASUDocumentDetails();
        documentDetails.setDocDefUid("urn:va:doc-def:SITE:307");
        documentDetails.setDocStatus("UNSIGNED");

        ArrayList<String> userClassUids =new ArrayList<String>();
        userClassUids.add("urn:va:asu-class:SITE:561");
        documentDetails.setUserClassUids(userClassUids);
        return documentDetails;
    }

    private List<DocumentDefinition> populateDocDefinitions() {
        List<DocumentDefinition> docDefList = new ArrayList<DocumentDefinition>();

        DocumentDefinition uid3 = new DocumentDefinition();
        uid3.setData("uid", "urn:va:doc-def:SITE:3");
        docDefList.add(uid3);
        DocumentDefinition uid30 = new DocumentDefinition();
        uid30.setData("uid", "urn:va:doc-def:SITE:30");
        docDefList.add(uid30);
        DocumentDefinition uid38 = new DocumentDefinition();
        uid38.setData("uid", "urn:va:doc-def:SITE:38");
        docDefList.add(uid38);
        DocumentDefinition uid117 = new DocumentDefinition();
        uid117.setData("uid", "urn:va:doc-def:SITE:117");
        docDefList.add(uid117);
        DocumentDefinition uid150 = new DocumentDefinition();
        uid150.setData("uid", "urn:va:doc-def:SITE:150");
        docDefList.add(uid150);
        DocumentDefinition uid307 = new DocumentDefinition();
        uid307.setData("uid", "urn:va:doc-def:SITE:307");
        docDefList.add(uid307);

        // Add children
        List<Map<String,Object>> uid3Items = new ArrayList<Map<String,Object>>();
        Map<String,Object> uid3Child30Item = new HashMap<String,Object>();
        uid3Child30Item.put("uid",uid30.getUid());
        uid3Items.add(uid3Child30Item);
        uid3.setData("item",uid3Items);
        assertTrue(uid3.getItems().size() == 1);

        List<Map<String,Object>> uid30Items = new ArrayList<Map<String,Object>>();
        Map<String,Object> uid30Child117Item = new HashMap<String,Object>();
        uid30Child117Item.put("uid",uid117.getUid());
        uid30Items.add(uid30Child117Item);
        uid30.setData("item",uid30Items);
        assertTrue(uid30.getItems().size() == 1);

        List<Map<String,Object>> uid38Items = new ArrayList<Map<String,Object>>();
        Map<String,Object> uid38Child3Item = new HashMap<String,Object>();
        uid38Child3Item.put("uid",uid3.getUid());
        uid38Items.add(uid38Child3Item);
        uid38.setData("item",uid38Items);
        assertTrue(uid38.getItems().size() == 1);

        List<Map<String,Object>> uid150Items = new ArrayList<Map<String,Object>>();
        Map<String,Object> uid150Child307Item = new HashMap<String,Object>();
        uid150Child307Item.put("uid",uid307.getUid());
        uid150Items.add(uid150Child307Item);
        uid150.setData("item",uid150Items);
        assertTrue(uid150.getItems().size() == 1);

        return docDefList;
    }

    private List<AsuRuleDef> populateRules()
    {
        List<AsuRuleDef> asuRules=new ArrayList<AsuRuleDef>();

        AsuRuleDef asuRuleClinicalDocument=new AsuRuleDef();
        asuRuleClinicalDocument.setDocDefUid("urn:va:doc-def:SITE:38");
        asuRuleClinicalDocument.setActionName("VIEW");
        asuRuleClinicalDocument.setIsAnd("false");
        asuRuleClinicalDocument.setStatusName("COMPLETED");
        asuRuleClinicalDocument.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleClinicalDocument.setDescription("A Clinical Documents with a status of completed can be viewed by USER");
        asuRules.add(asuRuleClinicalDocument);

        AsuRuleDef asuRuleProgressNote=new AsuRuleDef();
        asuRuleProgressNote.setDocDefUid("urn:va:doc-def:SITE:3");
        asuRuleProgressNote.setActionName("VIEW");
        asuRuleProgressNote.setIsAnd("false");
        asuRuleProgressNote.setStatusName("COMPLETED");
        asuRuleProgressNote.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleProgressNote.setDescription("A Progress Note with a status of completed can be viewed by USER");
        asuRules.add(asuRuleProgressNote);

        //NO RULE SHOULD BE ADDED FOR CRISIS NOTES - urn:va:doc-def:SITE:30

        AsuRuleDef asuRuleCrisis=new AsuRuleDef();
        asuRuleCrisis.setDocDefUid("urn:va:doc-def:SITE:117");
        asuRuleCrisis.setActionName("VIEW");
        asuRuleCrisis.setIsAnd("true");
        asuRuleCrisis.setStatusName("COMPLETED");
        asuRuleCrisis.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleCrisis.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisis.setDescription("A CRISIS with a status of completed can be viewed by USER");
        asuRules.add(asuRuleCrisis);

        AsuRuleDef asuRuleCrisisEditRecord=new AsuRuleDef();
        asuRuleCrisisEditRecord.setDocDefUid("urn:va:doc-def:SITE:117");
        asuRuleCrisisEditRecord.setActionName("EDIT RECORD");
        asuRuleCrisisEditRecord.setIsAnd("true");
        asuRuleCrisisEditRecord.setStatusName("COMPLETED");
        asuRuleCrisisEditRecord.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleCrisisEditRecord.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisisEditRecord.setDescription("A CRISIS with a status of completed can perform EDIT RECORD by USER");
        asuRules.add(asuRuleCrisisEditRecord);


        AsuRuleDef asuRuleCrisisUnsigned=new AsuRuleDef();
        asuRuleCrisisUnsigned.setDocDefUid("urn:va:doc-def:SITE:244");
        asuRuleCrisisUnsigned.setActionName("VIEW");
        asuRuleCrisisUnsigned.setIsAnd("false");
        asuRuleCrisisUnsigned.setStatusName("UNSIGNED");
        asuRuleCrisisUnsigned.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleCrisisUnsigned.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleCrisisUnsigned.setDescription("A DISCHARGE SUMMARY with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleCrisisUnsigned);

        //NO RULE SHOULD BE ADDED FOR PHYSICIAN PROGRESS - urn:va:doc-def:SITE:307

        //DOCTOTS NOTE UNSIGNED
        AsuRuleDef asuRuleDocNoteUnsignedisAndTrue=new AsuRuleDef();
        asuRuleDocNoteUnsignedisAndTrue.setDocDefUid("urn:va:doc-def:SITE:150");
        asuRuleDocNoteUnsignedisAndTrue.setActionName("VIEW");
        asuRuleDocNoteUnsignedisAndTrue.setIsAnd("true");
        asuRuleDocNoteUnsignedisAndTrue.setStatusName("UNSIGNED");
        asuRuleDocNoteUnsignedisAndTrue.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleDocNoteUnsignedisAndTrue.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleDocNoteUnsignedisAndTrue.setDescription("A DOCTORS NOTES with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleDocNoteUnsignedisAndTrue);

        //DOCTOTS NOTE UNSIGNED

        AsuRuleDef asuRuleDocNoteUnsignedisAndFalse=new AsuRuleDef();
        asuRuleDocNoteUnsignedisAndFalse.setDocDefUid("urn:va:doc-def:SITE:150");
        asuRuleDocNoteUnsignedisAndFalse.setActionName("VIEW");
        asuRuleDocNoteUnsignedisAndFalse.setIsAnd("false");
        asuRuleDocNoteUnsignedisAndFalse.setStatusName("UNSIGNED");
        asuRuleDocNoteUnsignedisAndFalse.setUserClassUid("urn:va:asu-class:SITE:561");
        asuRuleDocNoteUnsignedisAndFalse.setUserRoleName("AUTHOR/DICTATOR");
        asuRuleDocNoteUnsignedisAndFalse.setDescription("A DOCTORS NOTES with a status of UNSIGNED can be viewed by USER");
        asuRules.add(asuRuleDocNoteUnsignedisAndFalse);

        return asuRules;
    }
}
