package us.vistacore.ehmp.util;

import com.google.common.collect.ImmutableList;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Collection;
import java.util.GregorianCalendar;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;

@RunWith(Parameterized.class)
public class VistaUtilsTest {

    private String fmDateString;
    private Calendar expectedCalendar;
    private boolean isValid;

    public VistaUtilsTest(String fmDateString, Calendar expectedCalendar, boolean isValid) {
        this.fmDateString = fmDateString;
        this.expectedCalendar = expectedCalendar;
        this.isValid = isValid;
    }

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]>builder()
            .add(new Object[]{"3071221", createCalendar(2007, 11, 21), true})
            .add(new Object[]{"3100208", createCalendar(2010, 1, 8), true})

            // leap year
            .add(new Object[]{"3080229", createCalendar(2008, 1, 29), true})
            // hour only
            .add(new Object[]{"310020812", createCalendar(2010, 1, 8, 12, 0, 0), true})

            // hours and minutes
            .add(new Object[]{"31002081212", createCalendar(2010, 1, 8, 12, 12, 0), true})

            // hours, minutes, and seconds
            .add(new Object[]{"3100208121212", createCalendar(2010, 1, 8, 12, 12, 12), true})

            // hour only
            .add(new Object[]{"3100208.12", createCalendar(2010, 1, 8, 12, 0, 0), true})

            // hours and minutes
            .add(new Object[]{"3100208.1212", createCalendar(2010, 1, 8, 12, 12, 0), true})

            // hours, minutes, and seconds
            .add(new Object[]{"3100208.121212", createCalendar(2010, 1, 8, 12, 12, 12), true})

            // hour with trailing 0 dropped
            //.add(new Object[]{"31002081", createCalendar(2010, 1, 8, 10, 0, 0), true})

            // minutes with trailing 0 dropped
            //.add(new Object[]{"3100208101", createCalendar(2010, 1, 8, 10, 10, 0), true})

            // seconds with trailing 0 dropped
            //.add(new Object[]{"310020810101", createCalendar(2010, 1, 8, 10, 10, 10), true})
            .build();
    }

    @Test
    public void testFmDatetimeToDateDate() throws ParseException {
        if (this.isValid) {
            assertThat("Date conversion failed for " + fmDateString, VistaUtils.fmDatetimeToDateDate(this.fmDateString).getTime(), is(equalTo(expectedCalendar.getTime())));
        }
    }

    @Test
    public void testNull() throws ParseException {
        assertNull(VistaUtils.fmDatetimeToDateDate(null));
    }

    @Test
    public void testEmpty() throws ParseException {
        assertNull(VistaUtils.fmDatetimeToDateDate(""));
    }

    @Test(expected = ParseException.class)
    public void testInvalid() throws ParseException {
        assertNull(VistaUtils.fmDatetimeToDateDate("3100299"));
    }

    private static Calendar createCalendar(int year, int month, int day) {
        return createCalendar(year, month, day, 0, 0, 0);
    }

    private static Calendar createCalendar(int year, int month, int day, int hour, int minute, int second) {
        Calendar calendar = GregorianCalendar.getInstance();
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.set(year, month, day, hour, minute, second);
        return calendar;
    }


}
