package us.vistacore.ehmp.authorization;

import org.junit.Assert;
import org.junit.Test;

public class DecisionInfoTest {

    public static boolean compare(DecisionInfo a, DecisionInfo b) {
        boolean messageMatch = a.getDecisionMessage().compareTo(b.getDecisionMessage()) == 0;
        boolean decisionMatch = a.getDecisionValue().compareTo(b.getDecisionValue()) == 0;
        boolean breakGlassMatch = a.getBreakGlassStatus().compareTo(b.getBreakGlassStatus()) == 0;
        return messageMatch && decisionMatch && breakGlassMatch;
    }

    @Test
    public void testInit() {
        @SuppressWarnings("unused") DecisionInfo di = DecisionInfo.defaultInstance();

        di = DecisionInfo.permit();
        initAssertions(di, null, null, null);
        di = DecisionInfo.permit(DecisionInfo.BreakGlassStatus.ATTEMPTED);
        initAssertions(di, DecisionInfo.Value.PERMIT, null, DecisionInfo.BreakGlassStatus.ATTEMPTED);
        di = DecisionInfo.permit("message");
        initAssertions(di, null, "message", null);
        di = DecisionInfo.permit("message", DecisionInfo.BreakGlassStatus.ATTEMPTED);
        initAssertions(di, DecisionInfo.Value.PERMIT, "message", DecisionInfo.BreakGlassStatus.ATTEMPTED);

        di = DecisionInfo.deny();
        initAssertions(di, DecisionInfo.Value.DENY, null, null);
        di = DecisionInfo.deny("message");
        initAssertions(di, DecisionInfo.Value.DENY, "message", null);

        di = DecisionInfo.warn();
        initAssertions(di, DecisionInfo.Value.WARN, null, null);
        di = DecisionInfo.warn("message");
        initAssertions(di, DecisionInfo.Value.WARN, "message", null);
        di = DecisionInfo.warn("message", DecisionInfo.BreakGlassStatus.ATTEMPTED);
        initAssertions(di, DecisionInfo.Value.WARN, "message", DecisionInfo.BreakGlassStatus.ATTEMPTED);

        di = DecisionInfo.error();
        initAssertions(di, DecisionInfo.Value.ERROR, null, null);
        di = DecisionInfo.error("message");
        initAssertions(di, DecisionInfo.Value.ERROR, "message", null);
    }

    private void initAssertions(DecisionInfo di, DecisionInfo.Value value, String message, DecisionInfo.BreakGlassStatus breakGlassStatus) {

        if (value == null) {
            value = DecisionInfo.DEFAULT_VALUE;
        }
        if (message == null) {
            message = DecisionInfo.DEFAULT_MESSAGE;
        }
        if (breakGlassStatus == null) {
            breakGlassStatus = DecisionInfo.DEFAULT_BREAK_GLASS_STATUS;
        }

        Assert.assertEquals(value, di.getDecisionValue());
        Assert.assertEquals(message, di.getDecisionMessage());
        Assert.assertEquals(breakGlassStatus, di.getBreakGlassStatus());
    }

    @Test
    public void testSetters() {
        DecisionInfo di = DecisionInfo.defaultInstance();

        di.setDecisionMessage("decisionMessage");
        di.setDecisionValue(DecisionInfo.Value.DENY);
        di.setBreakGlassStatus(DecisionInfo.BreakGlassStatus.SUCCESSFUL);

        Assert.assertEquals("decisionMessage", di.getDecisionMessage());
        Assert.assertEquals(DecisionInfo.Value.DENY, di.getDecisionValue());
        Assert.assertEquals(DecisionInfo.BreakGlassStatus.SUCCESSFUL, di.getBreakGlassStatus());
    }

    @Test
    public void testCopy() {
        DecisionInfo di = DecisionInfo.defaultInstance();
        DecisionInfo copy = di.copy();
        Assert.assertEquals(compare(di, copy), true);
    }

    @Test
    public void testCopyFrom() {
        DecisionInfo di = DecisionInfo.defaultInstance();
        DecisionInfo di2 = DecisionInfo.defaultInstance();
        di.copyFrom(di2);
        Assert.assertEquals(compare(di, di2), true);
    }

}
