package us.vistacore.asu.rules;

import java.util.ArrayList;
import us.vistacore.asu.util.NullChecker;

import javax.validation.constraints.Null;


/**
 * Created by kumblep on 11/10/15.
 */
public class ASUDocumentDetails {

    //This contains one or more current class uid and parent class uids of the current class
    private ArrayList<String> userClassUids;
    private ArrayList<String> roleNames;
    private String docDefUid;
    private String docStatus;
    private ArrayList <String> actionNames;


    public ArrayList<String> getActionNames() {
        return actionNames;
    }

    public void setActionNames(ArrayList<String> actionNames) {
        this.actionNames = actionNames;
    }

    public ArrayList<String> getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(ArrayList<String> roleNames) {
        this.roleNames = roleNames;
    }

    public String getDocDefUid() {
        return docDefUid;
    }

    public void setDocDefUid(String docDefUid) {
        this.docDefUid = docDefUid;
    }

    public String getDocStatus() {
        return docStatus;
    }

    public void setDocStatus(String docStatus) {
        this.docStatus = docStatus;
    }


    public ArrayList<String> getUserClassUids() {
        return userClassUids;
    }

    public void setUserClassUids(ArrayList<String> userClassUids) {
        this.userClassUids = userClassUids;
    }
}
