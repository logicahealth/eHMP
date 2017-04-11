package us.vistacore.asu.rules;

/**
 * Created by kumblep on 11/10/15.
 */
public class DocPermissionResult {

    private String actionName;
    private boolean hasPermission;

    public DocPermissionResult(String name,boolean permission){
        this.actionName=name;
        this.hasPermission=permission;
    }

    public String getActionName() {
        return actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public boolean isHasPermission() {
        return hasPermission;
    }

    public void setHasPermission(boolean hasPermission) {
        this.hasPermission = hasPermission;
    }

}
