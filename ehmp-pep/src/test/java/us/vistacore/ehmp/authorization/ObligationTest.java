package us.vistacore.ehmp.authorization;

import org.junit.Assert;
import org.junit.Test;

public class ObligationTest {

    @Test
    public void testConstructWithQuestionMark() {
        Obligation o = new Obligation("obligation text", "string?");

        Assert.assertEquals("string?&_ack=true", o.getAccept());
        Assert.assertEquals("User must acknowledge record access audit.", o.getObligation());
        Assert.assertEquals("obligation text", o.getPrompt());
    }

    @Test
    public void testConstructWithoutQuestionMark() {
        Obligation o = new Obligation("obligation text", "string");
        Assert.assertEquals("string?_ack=true", o.getAccept());
        Assert.assertEquals("User must acknowledge record access audit.", o.getObligation());
        Assert.assertEquals("obligation text", o.getPrompt());
    }

    @Test
    public void testToJson() {
        Obligation o = new Obligation("obligation text", "string");
        Assert.assertEquals("{\"obligation\":\"User must acknowledge record access audit.\",\"prompt\":\"obligation text\",\"accept\":\"string?_ack\\u003dtrue\"}", o.toJson());
    }

    @Test
    public void testToXml() {
        Obligation o = new Obligation("obligation text", "string?");
        Assert.assertEquals("<obligation>User must acknowledge record access audit.</obligation><accept>string?&amp;_ack=true</accept><prompt>obligation text</prompt>", o.toXml());
    }

    @Test
    public void testSetters() {
        Obligation o = new Obligation("obligation text", "string?");
        o.setAccept("accept");
        Assert.assertEquals("accept", o.getAccept());
        o.setObligation("obligation text");
        Assert.assertEquals("obligation text", o.getObligation());

    }

}
