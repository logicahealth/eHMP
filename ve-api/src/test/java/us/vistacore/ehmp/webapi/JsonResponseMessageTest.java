package us.vistacore.ehmp.webapi;

import com.google.common.collect.ImmutableList;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import javax.ws.rs.core.Response;
import java.util.Collection;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

@RunWith(Parameterized.class)
public class JsonResponseMessageTest {

    private final Response.Status status;
    private final String message;
    private final String expected;

    /**
     * Static data generator for Parameterized JUnit Test
     */
    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]>builder()
            .add(new Object[]{Response.Status.ACCEPTED,
                    "Good to Go!",
                    "{\"status\":\"ACCEPTED\",\"message\":\"Good to Go!\"}"})
            .add(new Object[]{Response.Status.BAD_REQUEST,
                    "That is NOT OK!",
                    "{\"status\":\"BAD_REQUEST\",\"message\":\"That is NOT OK!\"}"})
            .build();
    }

    public JsonResponseMessageTest(Response.Status status, String message, String expected) {
        this.status = status;
        this.message = message;
        this.expected = expected;
    }

    @Test
    public void testToJson() {
        JsonResponseMessage jsonMessage = new JsonResponseMessage(this.status, this.message);
        assertThat(jsonMessage.toJson(), is(equalTo(this.expected)));
    }
}
