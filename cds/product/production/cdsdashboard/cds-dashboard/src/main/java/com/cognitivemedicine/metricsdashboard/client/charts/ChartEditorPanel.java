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
package com.cognitivemedicine.metricsdashboard.client.charts;

import java.util.ArrayList;
import java.util.List;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardController;
import com.cognitivemedicine.metricsdashboard.client.widgets.CalendarPicker;
import com.cognitivemedicine.metricsdashboard.client.widgets.MultiSelectListBox;
import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.ChartType;
import com.cognitivemedicine.metricsservice.model.DashboardSettings;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Period;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.user.client.ui.CheckBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A panel for building chart configurations
 * 
 * @author sschechter
 * 
 */
public class ChartEditorPanel extends VerticalPanel {

    private static final String ALL_METRICS = "All Metrics";
    private TextBox titleBox;
    private ListBox periodList;
    private CalendarPicker datetimePicker;
    private ListBox granularityList;
    private ListBox metricGroupList;
    private MultiSelectListBox availableMetricsList;
    private ListBox chartTypeList;
    private CheckBox liveUpdatesCheckBox;
    private VerticalPanel mainPanel;
    // private TextArea notesArea;

    private ChartWidget parentWidget;
    private DashboardController controller;
    private ChartSettings currentSettings;

    public ChartEditorPanel(ChartWidget parent, DashboardController dashboardController, DashboardSettings dashboardSettings, ChartSettings chartSettings) {
        this.parentWidget = parent;
        this.controller = dashboardController;

        String parentId = parent.getElement().getId();

        titleBox = new TextBox();
        titleBox.getElement().setId(parentId + "chartTitleBox");

        periodList = new ListBox();
        periodList.setVisibleItemCount(1);
        periodList.getElement().setId(parentId + "periodList");
        for (Period p : Period.values()) {
            periodList.addItem(p.getDisplayValue(), p.getSymbol());
        }

        datetimePicker = new CalendarPicker(parentId, true);

        granularityList = new ListBox();
        granularityList.setVisibleItemCount(1);
        granularityList.getElement().setId(parentId + "granularityList");
        granularityList.addItem("", "");
        for (Granularity g : Granularity.values()) {
            granularityList.addItem(g.getDisplayValue(), g.getSymbol());
        }

        metricGroupList = new ListBox();
        metricGroupList.setVisibleItemCount(1);
        metricGroupList.getElement().setId(parentId + "groupList");
//        for (MetricGroup g : controller.getMetricsGroups().values()) {
//            metricGroupList.addItem(g.getName(), g.getName());
//        }
        metricGroupList.addItem(ALL_METRICS);
        for (String g : controller.getMetaGroupMap().keySet()) {
            metricGroupList.addItem(g, g);
        }
        metricGroupList.addChangeHandler(new ChangeHandler() {
            @Override
            public void onChange(ChangeEvent event) {
                metricGroupListChanged();
            }
        });

        availableMetricsList = new MultiSelectListBox();
        availableMetricsList.setVisibleItemCount(6);
        availableMetricsList.getElement().setId(parentId + "availableMetricsList");
//        for (Metric m : controller.getAvailableMetrics().values()) {
//            availableMetricsList.addItem(m.getName(), m.getName());
//        }
        for (MetaDefinition m : controller.getMetaDefinitions()) {
            availableMetricsList.addItem(m.toString(), m.toString());
        }
        

        chartTypeList = new ListBox();
        chartTypeList.setVisibleItemCount(1);
        chartTypeList.getElement().setId(parentId + "chartTypeList");
        for (ChartType c : ChartType.values()) {
            chartTypeList.addItem(c.name());
        }

        liveUpdatesCheckBox = new CheckBox("Live Updates");
        liveUpdatesCheckBox.getElement().setId(parentId + "liveUpdatesCheckBox");

        if (chartSettings != null) {
            loadChartSettings(chartSettings);
        }

        dashboardSettingsUpdated(dashboardSettings);

        mainPanel = new VerticalPanel();
        mainPanel.setSpacing(4);
        mainPanel.setHorizontalAlignment(HasHorizontalAlignment.ALIGN_CENTER);
        // this.add(createFormPanel("Title", titleBox));
        HorizontalPanel titlePanel = new HorizontalPanel();
        HTML titleLabel = new HTML("Title" + ": ");
        titleLabel.setWidth("115px");
        titleBox.setWidth("265px");
        titlePanel.add(titleLabel);
        titlePanel.add(titleBox);
        titlePanel.setCellHorizontalAlignment(titleLabel, HasHorizontalAlignment.ALIGN_RIGHT);
        mainPanel.add(titlePanel);
        mainPanel.add(new HTML("<hr>"));
        mainPanel.add(createFormPanel("Metric", metricGroupList));
        mainPanel.add(createFormPanel("Supported Queries", availableMetricsList));
//        mainPanel.add(createFormPanel("Chart Type", chartTypeList));
        mainPanel.add(new HTML("<hr>"));
        mainPanel.add(createFormPanel("Period", periodList));
        mainPanel.add(datetimePicker);
        mainPanel.add(new HTML("<hr>"));
        mainPanel.add(createFormPanel("Granularity", granularityList));
        // mainPanel.add(new HTML("<hr>"));
        HorizontalPanel updatePanel = new HorizontalPanel();
        HTML updateLabel = new HTML("Live Updates: ");
        updateLabel.setWidth("115px");
//        titleBox.setWidth("190px");
        // updatePanel.add(updateLabel);
        updatePanel.add(liveUpdatesCheckBox);
        updatePanel.setCellHorizontalAlignment(updateLabel, HasHorizontalAlignment.ALIGN_RIGHT);
        // mainPanel.add(updatePanel);

        this.setHeight("100%");
        this.setWidth("100%");
        this.add(mainPanel);
        this.setCellHorizontalAlignment(mainPanel, HasHorizontalAlignment.ALIGN_CENTER);
        this.setCellVerticalAlignment(mainPanel, HasVerticalAlignment.ALIGN_MIDDLE);

        // this.add(new HTML(, liveUpdatesCheckBox));
        // this.add(buttonPanel);
        // this.setCellHorizontalAlignment(buttonPanel,HasHorizontalAlignment.ALIGN_CENTER);
    }

    /**
     * Instantiate the UI fields with pre-configured values
     * 
     * @param chartSettings
     */
    private void loadChartSettings(ChartSettings chartSettings) {
        titleBox.setText(chartSettings.getTitle());
        Period p = chartSettings.getPeriod();
        if (p != null) {
            setListBoxValue(periodList, p.getDisplayValue());
        } else {
            setListBoxValue(periodList, Period.D1.getSymbol());
        }
        Granularity g = chartSettings.getGranularity();
        if (g != null) {
            setListBoxValue(granularityList, g.getDisplayValue());
        } else {
            setListBoxValue(granularityList, "");
        }

        datetimePicker.setAmPm(chartSettings.getAmPm());
        datetimePicker.setHours(chartSettings.getHours());
        datetimePicker.setMinutes(chartSettings.getMinutes());
        datetimePicker.setDate(chartSettings.getEndDate());

        setListBoxValue(metricGroupList, String.valueOf(chartSettings.getMetricGroupId()));
        if (chartSettings.getSelectedMetaDefinitions() != null && chartSettings.getSelectedMetaDefinitions().size() > 0) {
            setListBoxValue(availableMetricsList, chartSettings.getSelectedMetaDefinitions().get(0).getDefinitionId());
        }
        setListBoxValue(chartTypeList, chartSettings.getChartType().name());
        currentSettings = chartSettings;
        liveUpdatesCheckBox.setValue(chartSettings.isLiveUpdates());
    }

    protected void metricGroupListChanged() {
        String id = metricGroupList.getValue(metricGroupList.getSelectedIndex());
//        List<Metric> metricsInGroup = controller.getMetricsInGroup(id);

        availableMetricsList.clear();
        // Set the new list
//        for (Metric m : metricsInGroup) {
//            if (m != null) {
//                availableMetricsList.addItem(m.getName(), m.getName());
//            } else {
//                System.err.println("Metric name is null");
//            }
//        }
        
        boolean showMetricName = false;
        List<MetaDefinition> metricsInGroup;
        if(id.equals(ALL_METRICS)){
            metricsInGroup = controller.getMetaDefinitions();
            showMetricName = true;
        }
        else{
            metricsInGroup = controller.getMetaDefinitionsInGroup(id);
        }
         
        for (MetaDefinition m : metricsInGroup) {
            if (m != null) {
                availableMetricsList.addItem(m.toString(showMetricName), m.toString());
            }
        }
    }

    private HorizontalPanel createFormPanel(String fieldName, ListBox list) {
        HorizontalPanel panel = new HorizontalPanel();
        HTML nameLabel = new HTML(fieldName + ": ");
        nameLabel.setWidth("115px");
        list.setWidth("275px");
        // panel.setCellHorizontalAlignment(nameLabel, HasHorizontalAlignment.ALIGN_RIGHT);
        // this.setCellVerticalAlignment(checkBox, HasVerticalAlignment.ALIGN_MIDDLE);
        panel.add(nameLabel);
        panel.add(list);
        panel.setCellHorizontalAlignment(nameLabel, HasHorizontalAlignment.ALIGN_RIGHT);
        return panel;
    }

    private void setListBoxValue(ListBox list, String value) {
        for (int i = 0; i < list.getItemCount(); i++) {
            if (list.getValue(i).equals(value)) {
                list.setSelectedIndex(i);
                return;
            }
        }
    }

    public boolean getLiveUpdates() {
        return liveUpdatesCheckBox.getValue();
    }

    /**
     * Builds a ChartSettings object from the UI settings configured by the user
     * 
     * @return The settings used to build a chart
     */
    public ChartSettings getChartSettings() {
        if (currentSettings == null) {
            currentSettings = new ChartSettings();
        }
        currentSettings.setTitle(titleBox.getText());
        currentSettings.setPeriod(Period.fromValue(periodList.getValue(periodList.getSelectedIndex())));
        currentSettings.setGranularity(Granularity.fromValue(granularityList.getValue(granularityList.getSelectedIndex())));
        currentSettings.setMetricGroupId(metricGroupList.getValue(metricGroupList.getSelectedIndex()));
//        currentSettings.setChartType(ChartType.valueOf(chartTypeList.getValue(chartTypeList.getSelectedIndex())));
        currentSettings.setChartType(ChartType.COMBO);
        long endPeriod = datetimePicker.getDatetime();
        //Round datetime to known intervals 
        //(ie: 1 Hour granularity will return results at 8:00, 9:00, 10:00, and not 8:14, 9:14, 10:14 etc.)
        Granularity g = currentSettings.getGranularity() != null ? currentSettings.getGranularity() : Granularity.M1;
//        endPeriod = DateUtils.truncateDate(new Date(endPeriod), g).getTime();
        
        currentSettings.setEndPeriod(endPeriod);
        currentSettings.setStartPeriod(endPeriod - currentSettings.getPeriod().getMilliseconds());
        currentSettings.setAmPm(datetimePicker.getAmPm());
        currentSettings.setHours(datetimePicker.getHours());
        currentSettings.setMinutes(datetimePicker.getMinutes());
        currentSettings.setEndDate(datetimePicker.getDate());

        List<String> selectedItems = availableMetricsList.getSelectedItems();
        ArrayList<MetaDefinition> metaDefinitions = new ArrayList<MetaDefinition>();
        for(String s : selectedItems){
            if(controller.getMetaDefinitionsMap().get(s) != null){
                metaDefinitions.add(controller.getMetaDefinitionsMap().get(s));
            }
        }
        currentSettings.setSelectedMetaDefinitions(metaDefinitions);
        
        return currentSettings;
    }

    /**
     * The master Dashboard settings were updated, so the changes need to be reflected here
     * 
     * @param settings
     */
    public void dashboardSettingsUpdated(DashboardSettings settings) {
        if (settings.getPeriod() != null) {
            for (int i = 0; i < periodList.getItemCount(); i++) {
                if (periodList.getValue(i).equals(settings.getPeriod().getSymbol())) {
                    periodList.setSelectedIndex(i);
                    datetimePicker.setAmPm(settings.getAmPm());
                    datetimePicker.setHours(settings.getHours());
                    datetimePicker.setMinutes(settings.getMinutes());
                    datetimePicker.setDate(settings.getEndDate());
                    System.err.println(settings.getEndDate());
                    break;
                }
            }
            periodList.setEnabled(false);
            datetimePicker.setEnabled(false);
        } else {
            periodList.setEnabled(true);
            datetimePicker.setEnabled(true);
        }

        if (settings.isGranularitySelected() && settings.getGranularity() == null) {
            granularityList.setSelectedIndex(0);
            granularityList.setEnabled(false);
        } else if (settings.isGranularitySelected() && settings.getGranularity() != null) {
            for (int i = 0; i < granularityList.getItemCount(); i++) {
                if (granularityList.getValue(i).equals(settings.getGranularity().getSymbol())) {
                    granularityList.setSelectedIndex(i);
                    break;
                }
            }
            granularityList.setEnabled(false);
        } else {
            granularityList.setEnabled(true);
        }
    }

}
