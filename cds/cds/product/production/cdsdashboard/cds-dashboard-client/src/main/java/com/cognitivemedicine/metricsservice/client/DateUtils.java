/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
package com.cognitivemedicine.metricsservice.client;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import com.cognitivemedicine.metricsservice.model.Granularity;

/**
 * A utility class for rounding dates upwards towards the next granularity
 * inverval
 * 
 * Example: Date = 4:05:12 PM Granularity = 15 sec, result = 4:05:15 PM
 * Granularity = 1 min, result = 4:06:00 PM Granularity = 1 hour, result =
 * 5:00:00 PM
 * 
 * @author sschechter
 *
 */
public class DateUtils {

    public static long roundDate(long datetime, Granularity granularity) {

        // Truncate milliseconds first
        // String ds = String.valueOf(date);
        // ds = ds.substring(0, ds.length()-3) + "000";

        LocalDateTime dateTime = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        // DateTime dateTime = new DateTime(ds);

        // LocalDateTime dateTime = new LocalDateTime(Long.parseLong(ds));

        switch (granularity) {
        case S15:
            dateTime = truncateTo15Sec(dateTime);
            break;
        case M1:
            dateTime = truncateToMin(dateTime);
            break;
        case M15:
            dateTime = truncateTo15Min(dateTime);
            break;
        case H1:
            dateTime = truncateToHour(dateTime);
            break;
        case H8:
            dateTime = truncateTo8Hour(dateTime);
            break;
        case D1:
            dateTime = truncateToDay(dateTime);
            break;
        case W1:
            dateTime = truncateToWeek(dateTime);
            break;
        case D30:
            dateTime = truncateToMonth(dateTime);
            break;
        case Y1:
            dateTime = truncateToYear(dateTime);
            break;
        default:
            dateTime = truncateToMin(dateTime);
            break;
        }

        // System.err.println("timeToEpochSecond: " +
        // (dateTime.toEpochSecond(ZoneOffset.UTC) * 1000))
        // dateTime
        // System.err.println("DT: " + dateTime);

        return dateTime.toEpochSecond(ZoneOffset.UTC) * 1000;
        // endPeriod = dateTime.atZone(ZoneId.).toEpochSecond() * 1000;
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateTo15Sec(LocalDateTime dateTime) {
        int modulo = dateTime.getSecond() / 15;
        return dateTime.truncatedTo(ChronoUnit.MINUTES).plusSeconds(15 * modulo);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToMin(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.MINUTES);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateTo15Min(LocalDateTime dateTime) {
        int modulo = dateTime.getMinute() / 15;
        return dateTime.truncatedTo(ChronoUnit.HOURS).plusMinutes(15 * modulo);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToHour(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.HOURS);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateTo8Hour(LocalDateTime dateTime) {
        int modulo = dateTime.getHour() / 8;
        return dateTime.truncatedTo(ChronoUnit.HOURS).plusHours(8 * modulo);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToDay(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.DAYS);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToWeek(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.DAYS).withDayOfMonth(1);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToMonth(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.DAYS).withDayOfMonth(1);
    }

    /**
     * Takes given date and returns date rounded to nearest minute
     */
    public static LocalDateTime truncateToYear(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.DAYS).withDayOfYear(1);
    }

    public static void main(String[] args) {
        Date date = new Date(System.currentTimeMillis());

        System.err.println("DATE: " + date);

        long now = System.currentTimeMillis();
        // - (Granularity.W1.getMilliseconds()*10)
        for (Granularity g : Granularity.values()) {
            System.err.println(g.getDisplayValue() + ": " + new Date(roundDate(now, g)));
        }
    }
}
