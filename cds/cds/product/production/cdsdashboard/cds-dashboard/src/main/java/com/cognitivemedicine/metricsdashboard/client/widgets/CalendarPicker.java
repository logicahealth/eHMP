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
package com.cognitivemedicine.metricsdashboard.client.widgets;

import java.util.Date;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardSettingsPanel.DashboardSettingsUpdatedHandler;
import com.google.gwt.i18n.client.DateTimeFormat;
import com.google.gwt.i18n.client.DateTimeFormat.PredefinedFormat;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.datepicker.client.DateBox;

/**
 * A Widget for selecting date and time values
 * 
 * @author sschechter
 * 
 */
public class CalendarPicker extends VerticalPanel {

  private ListBox amPmList;
  private TextBox minuteBox;
  private ListBox hourList;

  private HorizontalPanel datePanel;
  private HorizontalPanel timePanel;

  private static DateTimeFormat dateFormat = DateTimeFormat.getFormat(PredefinedFormat.DATE_MEDIUM);
  private DateBox dateBox;

  private String idPrefix;
  private boolean isWide;

  public CalendarPicker(String idPrefix, boolean isWide) {
    this.isWide = isWide;
    this.idPrefix = idPrefix;
    // TODO refactor this if necessary
    if (isWide) {
      this.setWidth("375px");
      this.getElement().setId(idPrefix + "Picker");
    } else {
      this.setWidth("290px");
      this.getElement().setId(idPrefix + "Picker");
    }
    // this.setBorderWidth(2);
    this.add(buildDatePickerPanel());
    this.add(buildTimePanel());
  }

  public Widget buildDatePickerPanel() {
    dateBox = new DateBox();
    if (isWide) {
      dateBox.setWidth("260px");
    } else {
      dateBox.setWidth("140px");
    }
    dateBox.setHeight("13px");
    dateBox.getElement().setId(idPrefix + "DateBox");
    dateBox.setFormat(new DateBox.DefaultFormat(dateFormat));

    // Date date = new Date();
    // date.setTime(System.currentTimeMillis() + (1000 * 60 * 60 * 24));
    // dateBox.getDatePicker().setTransientEnabledOnDates(true, date);
    // dateBox.setEnd
    // dateBox.getDatePicker().setYearArrowsVisible(true);
    // dateBox.getDatePicker().setYearAndMonthDropdownVisible(true);
    // dateBox.getDatePicker().setVisibleYearCount(51);

    datePanel = new HorizontalPanel();
    if (isWide) {
      datePanel.setWidth("280px");
    } else {
      datePanel.setWidth("230px");
    }

    datePanel.setSpacing(4);

    HTML label = new HTML("End Date:");
    if (isWide) {
      label.setWidth("115px");
    } else {
      label.setWidth("72px");
    }
    datePanel.add(label);
    datePanel.add(dateBox);

    datePanel.setCellHorizontalAlignment(label, HasHorizontalAlignment.ALIGN_RIGHT);
    return datePanel;
  }

  private HorizontalPanel buildTimePanel() {
    timePanel = new HorizontalPanel();
    if (isWide) {
      timePanel.setWidth("400px");
    } else {
      timePanel.setWidth("230px");
    }
    // timePanel.setWidth("250px");
    timePanel.setSpacing(4);

    hourList = new ListBox();
    hourList.getElement().setId(idPrefix + "HourList");
    hourList.setVisibleItemCount(1);
    for (int i = 1; i <= 12; i++) {
      hourList.addItem(String.valueOf(i));
    }

    minuteBox = new TextBox();
    minuteBox.getElement().setId(idPrefix + "MinutesBox");
    minuteBox.setValue("00");
    minuteBox.setEnabled(false);
    minuteBox.setHeight("13px");

    amPmList = new ListBox();
    amPmList.getElement().setId(idPrefix + "AmPmList");
    amPmList.setVisibleItemCount(1);
    amPmList.addItem("AM");
    amPmList.addItem("PM");

    if (isWide) {
      minuteBox.setWidth("20px");
      amPmList.setWidth("50px");
      hourList.setWidth("45px");
    } else {
      minuteBox.setWidth("20px");
      amPmList.setWidth("50px");
      hourList.setWidth("45px");
    }

    // this.setCellVerticalAlignment(checkBox, HasVerticalAlignment.ALIGN_MIDDLE);
    HTML label = new HTML("End Time:");
    if (isWide) {
      label.setWidth("105px");
    } else {
      label.setWidth("70px");
    }
    timePanel.add(label);
    if (isWide) {
      Label spacer = new Label("");
      spacer.setWidth("20px");
      timePanel.add(spacer);
    }

    timePanel.add(hourList);
    timePanel.add(new HTML(":"));
    timePanel.add(minuteBox);
    timePanel.add(amPmList);

    timePanel.setCellHorizontalAlignment(label, HasHorizontalAlignment.ALIGN_RIGHT);
    return timePanel;
  }

  public void showTime(boolean show) {
    timePanel.setVisible(show);
  }

  public void setDatetime(long datetime) {
    dateBox.getValue().setTime(datetime);
    // TODO set the hours/mins
  }

  /**
   * Returns the exact time this Calendar specifies. If there is no value set, it is assumed that
   * current time should be used
   * 
   * @return a datetime in milliseconds
   */
  public long getDatetime() {
    long datetime = System.currentTimeMillis();
    if (dateBox.getValue() != null) {
      try {
        datetime = dateBox.getValue().getTime();
        Integer hour = Integer.parseInt(hourList.getValue(hourList.getSelectedIndex()));
        if (getAmPm().equals("PM")) {
          hour += 12;
        }
        // System.err.println("OFFSET 1: " + java.util.TimeZone.getDefault().getOffset(datetime));
        // dateBox.getValue().getTimezoneOffset()

        String m = minuteBox.getValue();
        if (m.length() == 2 && m.startsWith("0"))
          m = m.substring(1, 2);
        Integer min = Integer.parseInt(m);

        // TIME ZONE OFFSET
        min = min - dateBox.getValue().getTimezoneOffset();

        // add the hours and minutes to the date
        datetime += (hour * 60 * 60 * 1000) + (min * 60 * 1000);

        // datetime += java.util.TimeZone.getDefault().getOffset(datetime);
        // System.err.println(datetime);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return datetime;
  }

  public String getAmPm() {
    return amPmList.getValue(amPmList.getSelectedIndex());
  }

  public void setAmPm(String value) {
    if (value == null || value.isEmpty()) {
      amPmList.setSelectedIndex(0);
    }
    for (int i = 0; i < amPmList.getItemCount(); i++) {
      if (amPmList.getValue(i).equals(value)) {
        amPmList.setSelectedIndex(i);
        return;
      }
    }
  }

  public String getHours() {
    return hourList.getValue(hourList.getSelectedIndex());
  }

  public void setHours(String value) {
    if (value == null || value.isEmpty()) {
      hourList.setSelectedIndex(11); // for 12 o'clock
    }
    for (int i = 0; i < hourList.getItemCount(); i++) {
      if (hourList.getValue(i).equals(value)) {
        hourList.setSelectedIndex(i);
        return;
      }
    }
  }

  public String getMinutes() {
    return minuteBox.getValue();
  }

  public void setMinutes(String value) {
    if (value == null || value.isEmpty()) {
      minuteBox.setValue("00");
    } else {
      minuteBox.setValue(value);
    }
  }

  public Date getDate() {
    return dateBox.getDatePicker().getValue();
  }

  public void setDate(Date date) {
    dateBox.getDatePicker().setValue(date, true);
  }

  public void setEnabled(boolean enabled) {
    hourList.setEnabled(enabled);
    // TODO this is always disabled for now. Update in future
    minuteBox.setEnabled(false);
    amPmList.setEnabled(enabled);
    dateBox.setEnabled(enabled);
  }

  /**
   * Listens for Dashboard level settings updates and coordinates those changes in this widget
   * 
   * @param handler
   */
  public void addDashboardSettingsUpdatedHandler(DashboardSettingsUpdatedHandler handler) {
    hourList.addChangeHandler(handler);
    minuteBox.addChangeHandler(handler);
    amPmList.addChangeHandler(handler);
    dateBox.addValueChangeHandler(handler);
  }
}
