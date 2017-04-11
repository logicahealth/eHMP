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


    public String toString()
    {
        StringBuilder sb=new StringBuilder();
        sb.append(" \n\r docDefUid: ").append(getDocDefUid());
        sb.append(" \n\r docStatus: ").append(getDocStatus());

        if(NullChecker.isNotNullish(getActionNames()))
        {
            sb.append(" \n\r actionNamesList: ").append(getActionNames().toString());
        }
        if(NullChecker.isNotNullish(getUserClassUids()))
        {
            sb.append(" \n\r userClassUids: ").append(getUserClassUids().toString());
        }
        else
        {
            sb.append(" \n\r userClassUids: null ");
        }

        if(NullChecker.isNotNullish(getRoleNames()))
        {
            sb.append(" \n\r roleNames: ").append(getRoleNames().toString());
        }
        else
        {
            sb.append(" \n\r roleNames: null ");
        }

        return sb.toString();
    }
}
