package us.vistacore.asu.rules;

import us.vistacore.asu.dao.AbstractPOMObject;
import us.vistacore.asu.dao.JdsCollectionName;
import com.fasterxml.jackson.annotation.JsonProperty;

/*
import gov.va.cpe.vpr.pom.AbstractPOMObject;
import gov.va.cpe.vpr.pom.jds.JdsCollectionName;
*/

import java.util.Map;

/**
 * Representation of ASU rules.
 *
 * @see "VistA FileMan USR AUTHORIZATION/SUBSCRIPTION(8930.1)"
 */
@JdsCollectionName("asu-rule")
public class AsuRuleDef extends AbstractPOMObject {
    private String actionName;
    private String actionUid;
    private String docDefName;
    private String docDefUid;
    private String isAnd;
    private String localId;
    private String statusName;
    private String statusUid;
    private String userClassName;
    private String userClassUid;
    private String userRoleName;
    private String userRoleUid;
    private String description;

    public void setActionUid(String actionUid) {
        this.actionUid = actionUid;
    }

    public void setDocDefName(String docDefName) {
        this.docDefName = docDefName;
    }

    public void setDocDefUid(String docDefUid) {
        this.docDefUid = docDefUid;
    }

    public void setIsAnd(String isAnd) {
        this.isAnd = isAnd;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public void setStatusUid(String statusUid) {
        this.statusUid = statusUid;
    }

    public void setUserClassName(String userClassName) {
        this.userClassName = userClassName;
    }

    public void setUserClassUid(String userClassUid) {
        this.userClassUid = userClassUid;
    }

    public void setUserRoleName(String userRoleName) {
        this.userRoleName = userRoleName;
    }

    public void setUserRoleUid(String userRoleUid) {
        this.userRoleUid = userRoleUid;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public AsuRuleDef() {
        super();
    }

    public AsuRuleDef(Map<String, Object> vals) {
        super(vals);
    }

    public String getStatusName() {
        return statusName;
    }

    public String getStatusUid() {
        return statusUid;
    }

    public String getUserClassName() {
        return userClassName;
    }

    public String getUserClassUid() {
        return userClassUid;
    }

    public String getUserRoleName() {
        return userRoleName;
    }

    public String getUserRoleUid() {
        return userRoleUid;
    }

    public String getDocDefUid() {
        return docDefUid;
    }

    public String getDocDefName() {
        return docDefName;
    }

    public String getActionUid() {
        return actionUid;
    }

    public String getActionName() {
        return actionName;
    }

    public String getDescription() {
        return description;
    }

    @JsonProperty("isAnd")
    public String isAnd() {
        return isAnd;
    }

    @Override
    public String getSummary() {
        return getDescription();
    }
}
