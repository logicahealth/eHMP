/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
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

import com.cognitivemedicine.metricsdashboard.client.charts.types.EmptyChartPanel;
import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardController;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.DashboardSettings;
import com.cognitivemedicine.metricsservice.model.Datapoint;
import com.cognitivemedicine.metricsservice.model.Granularity;
import com.cognitivemedicine.metricsservice.model.MetaDefinition;
import com.cognitivemedicine.metricsservice.model.Period;
import com.google.gwt.dom.client.Style.Unit;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TabLayoutPanel;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.googlecode.gwt.charts.client.ChartLoader;

/**
 * A container for configuring, creating and viewing charts
 * 
 * @author sschechter
 * 
 */
public class ChartWidget extends DialogBox {
    private ChartEditorPanel chartEditorPanel;
    private AbstractChartPanel<?, ?> chartViewPanel;
    private VerticalPanel chartContainer;
    private DashboardController controller;
    private TabLayoutPanel tabPanel;
    private static int widgetId = 0; // CLient side counter to create a
    private GrainMatrix grainMatrix;

//    private ArrayList<Metric> selectedMetricList;
    private ArrayList<MetaDefinition> selectedMetaDefinitionList;

    public ChartWidget(DashboardController dashboardController, DashboardSettings dashboardSettings, ChartSettings chartSettings) {
        this.controller = dashboardController;
        String id = "chartWidget" + widgetId++;
        this.getElement().setId(id);
        tabPanel = new TabLayoutPanel(28, Unit.PX);
        tabPanel.setAnimationDuration(100);
        // tabPanel.getElement().getStyle().setMarginBottom(10.0, Unit.PX);
        // tabPanel.ensureDebugId("cwTabPanel");

        this.setText("New Chart");

        HorizontalPanel buttonPanel = new HorizontalPanel();
        buttonPanel.setSpacing(4);
        Image image = new Image(MdConstants.IMG_OK_CHECK);
        image.getElement().setId(id + "OkButtonImage");
        image.setSize("24px", "24px");
        PushButton okButton = new PushButton(image);
        okButton.getElement().setId(this.getElement().getId() + "OkButton");
        okButton.setTitle("Build Chart");
        okButton.addClickHandler(new ClickHandler() {
            public void onClick(ClickEvent event) {
                clickOkButton();
            }
        });

        image = new Image(MdConstants.IMG_CANCEL_X);
        image.setSize("24px", "24px");
        image.getElement().setId(id + "CloseButtonImage");
        PushButton closeButton = new PushButton(image);
        closeButton.getElement().setId(this.getElement().getId() + "CloseButton");
        closeButton.setTitle("Cancel");

        closeButton.addClickHandler(new ClickHandler() {
            @Override
            public void onClick(ClickEvent event) {
                controller.getWidgetController().removeWidget(ChartWidget.this);
            }
        });

        buttonPanel.add(okButton);
        buttonPanel.add(closeButton);

        // HTML metricGroupText = new HTML("EDIT");
        chartEditorPanel = new ChartEditorPanel(this, controller, dashboardSettings, chartSettings);
        // When there is a value for chart settings, it means it was loaded form the server.
        // Click Ok button programatically to load chart
        if (chartSettings != null) {
            clickOkButton();
            setText(chartSettings.getTitle());
        }
        Image editImage = new Image(MdConstants.IMG_PENCIL);
        editImage.getElement().setId("editTabImage");
        editImage.setSize("16px", "16px");
        editImage.getElement().setId("editImage");
        tabPanel.add(chartEditorPanel, editImage);

        // HTML rolesText = new HTML("VIEW");
        Image viewImage = new Image(MdConstants.IMG_VIEW_EYE);
        viewImage.getElement().setId("viewTabImage");
        viewImage.setSize("16px", "16px");
        // chartViewerPanel = new ChartViewerPanel(id);
        chartContainer = new VerticalPanel();
        // Initialize this to an empty panel
        chartViewPanel = new EmptyChartPanel();
        // chartViewPanel.setBorderWidth(2);
        chartViewPanel.setSpacing(2);
        chartViewPanel.setWidth("100%");
        // chartContainer.setBorderWidth(2);
        chartContainer.setSpacing(2);
        chartContainer.setWidth("100%");
        chartContainer.setHeight("100%");

        chartContainer.add(chartViewPanel);
        tabPanel.add(chartContainer, viewImage);

        // Return the content
        tabPanel.selectTab(0);
        tabPanel.getElement().setId(id + "TabPanel");
        tabPanel.setHeight("455px");
        tabPanel.setWidth("505px");

        this.setHeight("530");
        this.setWidth("500px");

        VerticalPanel mainPanel = new VerticalPanel();
        mainPanel.add(tabPanel);
        mainPanel.add(buttonPanel);
        mainPanel.setCellVerticalAlignment(buttonPanel, HasVerticalAlignment.ALIGN_MIDDLE);
        mainPanel.setCellHorizontalAlignment(buttonPanel, HasHorizontalAlignment.ALIGN_CENTER);

        mainPanel.setWidth("100%");
        mainPanel.setHeight("100%");

        this.setWidget(mainPanel);
        this.setModal(false);
    }

    /**
     * When the ok button is clicked by the user (or programmatically), build a grain matrix from configuration settings to store the results, and query for data.
     */
    public void clickOkButton() {
        ChartSettings settings = chartEditorPanel.getChartSettings();

        this.setText(settings.getTitle());
        Period period = settings.getPeriod();
        Granularity granularity = settings.getGranularity();

        if (granularity != null && period.getMilliseconds() < granularity.getMilliseconds()) {
            Window.alert("Period must be a greater than or equal to granularity.");
            return;
        }

        grainMatrix = new GrainMatrix(settings, this);
        for (MetaDefinition meta : grainMatrix.getMetaDefinitions()) {
            controller.getMetrics(meta, grainMatrix);
        }
    }

    /**
     * A chart is built from the results and displayed to the user. This is called when all the expected results of the queried metrics have arrived.
     */
    public void finishLoadingMetrics() {
        chartContainer.clear();
        ChartLoader chartLoader = new ChartLoader(AbstractChartPanelFactory.getChartPackage(grainMatrix.getChartSettings().getChartType()));
        chartLoader.loadApi(new Runnable() {
            @Override
            public void run() {
                chartViewPanel = AbstractChartPanelFactory.createChartPanel(grainMatrix);
                chartViewPanel.draw(grainMatrix);
                chartContainer.add(chartViewPanel.getChart());
            }
        });
        tabPanel.selectTab(chartContainer);
    }

    public ChartSettings getChartSettings() {
        return chartEditorPanel.getChartSettings();
    }

    public void dashboardSettingsUpdated(DashboardSettings s) {
        chartEditorPanel.dashboardSettingsUpdated(s);
    }

    public void metricsReceived(MetaDefinition metaDefinition, List<Datapoint> data) {
        grainMatrix.metricsReceived(metaDefinition, data);
    }
}
