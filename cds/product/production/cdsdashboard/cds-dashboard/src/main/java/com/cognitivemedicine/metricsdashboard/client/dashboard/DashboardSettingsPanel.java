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
package com.cognitivemedicine.metricsdashboard.client.dashboard;

import java.util.Date;

import com.cognitivemedicine.metricsdashboard.client.widgets.CalendarPicker;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.DashboardSettings;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.Period;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.logical.shared.ValueChangeEvent;
import com.google.gwt.event.logical.shared.ValueChangeHandler;
import com.google.gwt.user.client.ui.CheckBox;
import com.google.gwt.user.client.ui.DecoratorPanel;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A container for holding Dashboard level configuration settings
 * 
 * @author sschechter
 * 
 */
public class DashboardSettingsPanel extends DecoratorPanel {

  private DashboardMainPanel parent;
  private CalendarPicker datetimePicker;
  private SettingsOption periodSetting;
  private SettingsOption granularitySetting;

  public DashboardSettingsPanel(DashboardMainPanel parent) {
    this.parent = parent;
    init();
  }

  private void init() {

    periodSetting = new SettingsOption("Period");
    periodSetting.getElement().setId("periodSetting");
    periodSetting.getList().getElement().setId("periodSettingListBox");
    periodSetting.getCheckBox().getElement().setId("periodSettingCheckBox");
    ListBox box = periodSetting.getList();
    for (Period p : Period.values()) {
      box.addItem(p.getDisplayValue(), p.getSymbol());
    }
    granularitySetting = new SettingsOption("Granularity");
    granularitySetting.getElement().setId("granularitySetting");
    granularitySetting.getList().getElement().setId("granularitySettingListBox");
    granularitySetting.getCheckBox().getElement().setId("granularitySettingCheckBox");
    box = granularitySetting.getList();
    box.addItem("", "");
    for (Granularity g : Granularity.values()) {
      box.addItem(g.getDisplayValue(), g.getSymbol());
    }

    VerticalPanel settingsPanel = new VerticalPanel();
    settingsPanel.setSpacing(8);
    settingsPanel.setWidth("290px");
    Image helpImage = new Image(MdConstants.IMG_QUESTION_MARK);
    helpImage.setSize("20px", "20px");
    helpImage
        .setTitle("Dashboard level settings override individual chart settings for all charts in this dashboard.");
    HorizontalPanel labelPanel = new HorizontalPanel();

    datetimePicker = new CalendarPicker("dashboard", false);
    datetimePicker.addDashboardSettingsUpdatedHandler(new DashboardSettingsUpdatedHandler());

    labelPanel.add(new HTML("<b>Dashboard Settings</b>"));
    labelPanel.add(helpImage);
    labelPanel.add(new HTML("</br>"));

    settingsPanel.add(labelPanel);
    settingsPanel.add(new HTML("<hr>"));
    settingsPanel.add(periodSetting);
    settingsPanel.add(datetimePicker);
    settingsPanel.add(new HTML("<hr>"));
    settingsPanel.add(granularitySetting);
    // settingsPanel.add(new NumberSpinner(0));

    this.setWidget(settingsPanel);
  }

  /**
   * Updates the dashboard settings panel when a dashboard is loaded
   * 
   * @param settings
   */
  public void updateDashboardSettings(DashboardSettings settings) {
    Granularity g = settings.getGranularity();
    ListBox list = null;
    if (g != null) {
      list = granularitySetting.getList();
      for (int i = 0; i < list.getItemCount(); i++) {
        if (list.getValue(i).equals(g.getSymbol())) {
          list.setSelectedIndex(i);
          granularitySetting.getCheckBox().setValue(true);
          break;
        }
      }
    } else {
      granularitySetting.getCheckBox().setValue(false);
    }

    Period p = settings.getPeriod();
    if (p != null) {
      list = periodSetting.getList();
      for (int i = 0; i < list.getItemCount(); i++) {
        if (list.getValue(i).equals(p.getSymbol())) {
          list.setSelectedIndex(i);
          periodSetting.getCheckBox().setValue(true);
          datetimePicker.setAmPm(settings.getAmPm());
          datetimePicker.setHours(settings.getHours());
          datetimePicker.setMinutes(settings.getMinutes());
          datetimePicker.setDate(settings.getEndDate());
          break;
        }
      }
    } else {
      periodSetting.getCheckBox().setValue(false);
    }
  }

  public DashboardSettings getDashboardSettings() {
    DashboardSettings ds = new DashboardSettings();
    ds.setGranularitySelected(granularitySetting.getCheckBox().getValue());
    ds.setGranularity(Granularity.fromValue(granularitySetting.getValue()));
    ds.setPeriodSelected(periodSetting.getCheckBox().getValue());
    if (periodSetting.getValue() != null) {

      ds.setPeriod(Period.fromValue(periodSetting.getValue()));
      ds.setAmPm(datetimePicker.getAmPm());
      ds.setEndDate(datetimePicker.getDate());
      ds.setHours(datetimePicker.getHours());
      ds.setMinutes(datetimePicker.getMinutes());
      long endPeriod = datetimePicker.getDatetime() != 0 ? datetimePicker.getDatetime() : System
          .currentTimeMillis();
      ds.setEndPeriod(endPeriod);
      ds.setStartPeriod(ds.getEndPeriod() - ds.getPeriod().getMilliseconds());
    }
    return ds;
  }

  private class SettingsOption extends HorizontalPanel {
    private CheckBox checkBox;
    private String name;
    private ListBox list;

    public SettingsOption(String name) {
      DashboardSettingsUpdatedHandler settingsHandler = new DashboardSettingsUpdatedHandler();
      list = new ListBox();
      list.setVisibleItemCount(1);
      list.setWidth("150px");
      list.addChangeHandler(settingsHandler);

      checkBox = new CheckBox();
      checkBox.addClickHandler(settingsHandler);

      HTML nameLabel = new HTML(name + ": ");
      nameLabel.setWidth("75px");
      checkBox.setHeight(String.valueOf(list.getOffsetHeight()) + "px");
      this.add(nameLabel);
      this.add(list);
      this.add(checkBox);
      this.setSpacing(4);
      this.setCellHorizontalAlignment(nameLabel, HasHorizontalAlignment.ALIGN_RIGHT);
      this.setCellVerticalAlignment(checkBox, HasVerticalAlignment.ALIGN_MIDDLE);

      checkBox.setValue(false);
    }

    public boolean isSelected() {
      return checkBox.getValue();
    }

    // We only care about the value if the checkbox is selected, so we'll
    // check the box here instead
    // of every calling instance
    public String getValue() {
      if (checkBox.getValue() == true) {
        return list.getValue(list.getSelectedIndex());
      }
      return null;
    }

    public ListBox getList() {
      return list;
    }

    public CheckBox getCheckBox() {
      return checkBox;
    }
  }

  /**
   * A change handler facade that implements multiple click/change handlers which be used to update
   * dashboard settings
   * 
   * @author sschechter
   * 
   */
  public class DashboardSettingsUpdatedHandler implements ClickHandler, ChangeHandler,
      ValueChangeHandler<Date> {

    @Override
    public void onClick(ClickEvent event) {
      parent.getController().getWidgetController().dashboardSettingsUpdated(getDashboardSettings());
    }

    @Override
    public void onChange(ChangeEvent event) {
      parent.getController().getWidgetController().dashboardSettingsUpdated(getDashboardSettings());
    }

    @Override
    public void onValueChange(ValueChangeEvent<Date> event) {
      parent.getController().getWidgetController().dashboardSettingsUpdated(getDashboardSettings());
    }
  }
}
