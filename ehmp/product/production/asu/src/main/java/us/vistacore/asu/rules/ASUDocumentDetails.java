package us.vistacore.asu.rules;

import java.util.ArrayList;
import us.vistacore.asu.util.NullChecker;

import javax.validation.constraints.Null;


/**
 * Created by kumblep on 11/10/15.
 */
public class ASUDocumentDetails {

    //This contains one or more current class uid and parent class uids of the current class
    private ArrayList userClassUids;
    private ArrayList roleNames;
    private String docDefUid;
    private String docStatus;
    private ArrayList <String> actionNames;


    public ArrayList<String> getActionNames() {
        return actionNames;
    }

    public void setActionNames(ArrayList<String> actionNames) {
        this.actionNames = actionNames;
    }

    public ArrayList getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(ArrayList roleNames) {
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


    public ArrayList getUserClassUids() {
        return userClassUids;
    }

    public void setUserClassUids(ArrayList userClassUids) {
        this.userClassUids = userClassUids;
    }


    public String toString()
    {
        StringBuffer sb=new StringBuffer();
        sb.append(" \n\r docDefUid: "+getDocDefUid());
        sb.append(" \n\r docStatus: "+getDocStatus());

        if(NullChecker.isNotNullish(getActionNames()))
        {
            sb.append(" \n\r actionNamesList: "+getActionNames().toString());
        }
        if(NullChecker.isNotNullish(getUserClassUids()))
        {
            sb.append(" \n\r userClassUids: "+getUserClassUids().toString());
        }
        else
        {
            sb.append(" \n\r userClassUids: null ");
        }

        if(NullChecker.isNotNullish(getRoleNames()))
        {
            sb.append(" \n\r roleNames: "+getRoleNames().toString());
        }
        else
        {
            sb.append(" \n\r roleNames: null ");
        }

        return sb.toString();
    }
}
