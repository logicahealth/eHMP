package us.vistacore.ehmp.authorization;

public final class DecisionInfo {

    public enum Value {
        PERMIT, DENY, WARN, ERROR;
    }

    public enum BreakGlassStatus {
        NOT_APPLICABLE, // break glass not applicable
        ATTEMPTED, // warning prior to breaking glass
        SUCCESSFUL // glass has been broken
    }

    // BH: This is set to PERMIT for now to avoid negatively impacting other teams' tests.
    // TODO: Should this change to DENY? Or possibly ERROR?
    public static final Value DEFAULT_VALUE = Value.PERMIT;
    public static final String DEFAULT_MESSAGE = "";
    public static final BreakGlassStatus DEFAULT_BREAK_GLASS_STATUS = BreakGlassStatus.NOT_APPLICABLE;

    private Value decisionValue;
    private String decisionMessage;
    private BreakGlassStatus breakGlassStatus;

    private DecisionInfo() {
        init(DEFAULT_VALUE, DEFAULT_MESSAGE, DEFAULT_BREAK_GLASS_STATUS);
    }

    private DecisionInfo(Value value) {
        init(value, DEFAULT_MESSAGE, DEFAULT_BREAK_GLASS_STATUS);
    }

    private DecisionInfo(Value value, String message, BreakGlassStatus breakGlassStatus) {
        init(value, message, breakGlassStatus);
    }

    private void init(Value value, String message, BreakGlassStatus breakGlassStatus) {

        this.decisionValue = value;

        if (message == null) {
            this.decisionMessage = DEFAULT_MESSAGE;
        } else {
            this.decisionMessage = message;
        }
        if (breakGlassStatus == null) {
            this.breakGlassStatus = DEFAULT_BREAK_GLASS_STATUS;
        } else {
            this.breakGlassStatus = breakGlassStatus;
        }
    }

    public static DecisionInfo defaultInstance() {
        return new DecisionInfo();
    }

    public static DecisionInfo permit() {
        return new DecisionInfo(Value.PERMIT);
    }

    public static DecisionInfo permit(BreakGlassStatus breakGlassStatus) {
        return new DecisionInfo(Value.PERMIT, null, breakGlassStatus);
    }

    public static DecisionInfo permit(String message) {
        return new DecisionInfo(Value.PERMIT, message, BreakGlassStatus.NOT_APPLICABLE);
    }

    public static DecisionInfo permit(String message, BreakGlassStatus breakGlassStatus) {
        return new DecisionInfo(Value.PERMIT, message, breakGlassStatus);
    }

    public static DecisionInfo deny() {
        return new DecisionInfo(Value.DENY);
    }

    public static DecisionInfo deny(String message) {
        return new DecisionInfo(Value.DENY, message, BreakGlassStatus.NOT_APPLICABLE);
    }

    public static DecisionInfo warn() {
        return new DecisionInfo(Value.WARN);
    }

    public static DecisionInfo warn(String message) {
        return new DecisionInfo(Value.WARN, message, BreakGlassStatus.NOT_APPLICABLE);
    }

    public static DecisionInfo warn(String message, BreakGlassStatus breakGlassStatus) {
        return new DecisionInfo(Value.WARN, message, breakGlassStatus);
    }

    public static DecisionInfo error() {
        return new DecisionInfo(Value.ERROR);
    }

    public static DecisionInfo error(String message) {
        return new DecisionInfo(Value.ERROR, message, BreakGlassStatus.NOT_APPLICABLE);
    }

    public Value getDecisionValue() {
        return decisionValue;
    }

    public void setDecisionValue(Value decisionValue) {
        this.decisionValue = decisionValue;
    }

    public String getDecisionMessage() {
        return decisionMessage;
    }

    public void setDecisionMessage(String decisionMessage) {
        this.decisionMessage = decisionMessage;
    }

    public BreakGlassStatus getBreakGlassStatus() {
        return breakGlassStatus;
    }

    public void setBreakGlassStatus(BreakGlassStatus breakGlassStatus) {
        this.breakGlassStatus = breakGlassStatus;
    }

    public DecisionInfo copy() {
        return new DecisionInfo(this.decisionValue, this.decisionMessage, this.breakGlassStatus);
    }

    public void copyFrom(DecisionInfo decision) {
        this.setDecisionValue(decision.getDecisionValue());
        this.setDecisionMessage(decision.getDecisionMessage());
        this.breakGlassStatus = decision.getBreakGlassStatus();
    }
}
