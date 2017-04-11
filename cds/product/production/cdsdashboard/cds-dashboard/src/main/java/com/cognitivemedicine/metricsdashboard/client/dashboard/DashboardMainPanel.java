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

import java.util.ArrayList;
import java.util.List;

import com.cognitivemedicine.metricsdashboard.client.adminconsole.AdminConsole;
import com.cognitivemedicine.metricsdashboard.client.charts.ChartWidget;
import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardToolStripBar.ButtonSelectionState;
import com.cognitivemedicine.metricsdashboard.client.dialogs.CreateDashboardDialog;
import com.cognitivemedicine.metricsdashboard.client.dialogs.DeleteDashboardDialog;
import com.cognitivemedicine.metricsdashboard.client.dialogs.SaveAsDashboardDialog;
import com.cognitivemedicine.metricsdashboard.client.widgets.Alerts;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.ChartSettings;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.cognitivemedicine.metricsservice.model.Role;
import com.google.gwt.dom.client.Style.Cursor;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.DecoratorPanel;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.VerticalPanel;

public class DashboardMainPanel extends DecoratorPanel {

  private HTML titleLabel;

  private DecoratorPanel editorDecorator;
  private DashboardSettingsPanel settingsPanel;
  private DashboardToolStripBar toolstripPanel;
  private ListBox dashboardListBox;
  private PushButton adminConsoleButton;
  private TextArea notesArea;

  private DashboardController controller;

  private Dashboard currentDashboard;
  private VerticalPanel mainPanel;

  public DashboardMainPanel() {
    initUi();
  }

  private void initUi() {
    mainPanel = new VerticalPanel();
    mainPanel.setWidth("300px");
    mainPanel.setSpacing(4);

    VerticalPanel titlePanel = new VerticalPanel();
    titlePanel.setWidth("100%");
    HorizontalPanel logoutPanel = new HorizontalPanel();
    Image logoutImage = new Image(MdConstants.IMG_LOGOUT);
    logoutImage.getElement().getStyle().setCursor(Cursor.POINTER);
    logoutImage.setSize("16px", "16px");
    logoutImage.setTitle("Log Out");
    logoutImage.getElement().getStyle().setProperty("cursor", "hand");
    logoutImage.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        controller.logOut();
      }
    });

    HTML logOutLabel = new HTML("<u><font size=-2>Log Out </font></u>");
    logOutLabel.setHeight("10px");
    // logOutLabel.setStyleName("logoutButton");
    logOutLabel.setStylePrimaryName("logoutButton");
    logOutLabel.getElement().getStyle().setProperty("right", "5px");
    // logOutLabel.getElement().getStyle().setProperty("cursor", "hand");
    logOutLabel.getElement().getStyle().setCursor(Cursor.POINTER);
    logOutLabel.setWidth("100%");
    logOutLabel.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        controller.logOut();
      }
    });

    logoutPanel.add(logOutLabel);
    logoutPanel.add(logoutImage);
    logoutPanel.setSpacing(2);

    logoutPanel.setCellHorizontalAlignment(logoutImage, HasHorizontalAlignment.ALIGN_RIGHT);
    logoutPanel.setCellHorizontalAlignment(logOutLabel, HasHorizontalAlignment.ALIGN_RIGHT);

    titlePanel.getElement().getStyle().setProperty("marginLeft", "50");
    titleLabel = new HTML("<font size=4>&nbsp;</font>");
    titleLabel.getElement().setId("dashboardTitleLabel");

    titlePanel.add(logoutPanel);
    titlePanel.add(titleLabel);

    titlePanel.setCellHorizontalAlignment(logoutPanel, HasHorizontalAlignment.ALIGN_RIGHT);

    DecoratorPanel titleDecor = new DecoratorPanel();
    titleDecor.setWidth("250px");
    titleDecor.setHeight("30px");
    mainPanel.add(titlePanel);

    mainPanel.setCellVerticalAlignment(logOutLabel, HasVerticalAlignment.ALIGN_MIDDLE);
    mainPanel.setCellHorizontalAlignment(logOutLabel, HasHorizontalAlignment.ALIGN_RIGHT);
    mainPanel.setCellHorizontalAlignment(titleLabel, HasHorizontalAlignment.ALIGN_LEFT);
    mainPanel.setCellVerticalAlignment(titleLabel, HasVerticalAlignment.ALIGN_MIDDLE);

    Image image = new Image(MdConstants.IMG_TOOLS);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    adminConsoleButton = new PushButton(image);
    adminConsoleButton.getElement().setId("adminConsoleButton");
    adminConsoleButton.setSize("50px", MdConstants.IMG_SIZE);
    adminConsoleButton.setTitle("Show Admin Console");
    adminConsoleButton.setEnabled(false);
    adminConsoleButton.addClickHandler(new ClickHandler() {

      @Override
      public void onClick(ClickEvent event) {
        AdminConsole console = new AdminConsole(controller);
      }
    });

    editorDecorator = new DecoratorPanel();
    editorDecorator.setTitle("Dashboard Editor");
    editorDecorator.setWidth("315px");

    toolstripPanel = new DashboardToolStripBar(this);

    dashboardListBox = new ListBox(false);
    dashboardListBox.getElement().setId("dashboardListBox");
    dashboardListBox.setWidth("295px");
    dashboardListBox.setVisibleItemCount(10);
    dashboardListBox.addChangeHandler(new ChangeHandler() {
      @Override
      public void onChange(ChangeEvent event) {
        dashboardListChanged();
      }
    });

    notesArea = new TextArea();
    notesArea.setVisibleLines(2);
    notesArea.setWidth("290px");
    notesArea.setHeight("50px");
    notesArea.getElement().setId("notesTextArea");

    VerticalPanel editorVerticalPanel = new VerticalPanel();
    editorVerticalPanel.setSpacing(4);
    editorVerticalPanel.add(toolstripPanel);
    editorVerticalPanel.add(dashboardListBox);
    editorVerticalPanel.add(new HTML("<font size=-1><b>Dashboard Notes:</b></font></br>"));
    editorVerticalPanel.add(notesArea);
    editorVerticalPanel.setCellVerticalAlignment(toolstripPanel, HasVerticalAlignment.ALIGN_MIDDLE);
    editorVerticalPanel.setCellHorizontalAlignment(toolstripPanel,
        HasHorizontalAlignment.ALIGN_CENTER);
    editorDecorator.setWidget(editorVerticalPanel);

    settingsPanel = new DashboardSettingsPanel(this);

    mainPanel.add(editorDecorator);
    mainPanel.add(settingsPanel);
    // mainPanel.add(adminConsoleButton);

    mainPanel.setCellVerticalAlignment(editorDecorator, HasVerticalAlignment.ALIGN_MIDDLE);
    mainPanel.setCellHorizontalAlignment(editorDecorator, HasHorizontalAlignment.ALIGN_CENTER);
    mainPanel.setCellVerticalAlignment(settingsPanel, HasVerticalAlignment.ALIGN_TOP);
    mainPanel.setCellHorizontalAlignment(settingsPanel, HasHorizontalAlignment.ALIGN_CENTER);
    mainPanel.setCellVerticalAlignment(adminConsoleButton, HasVerticalAlignment.ALIGN_MIDDLE);
    mainPanel.setCellHorizontalAlignment(adminConsoleButton, HasHorizontalAlignment.ALIGN_CENTER);

    this.add(mainPanel);
  }

  public void refreshDataButtonClicked() {
    for (ChartWidget w : controller.getWidgetController().getWidgets()) {
      w.clickOkButton();
    }
  }

  public void dashboardListChanged() {
    if (dashboardListBox.getSelectedIndex() >= 0) {
      toolstripPanel.updateButtonState(ButtonSelectionState.DASHBOARD_SELECTED);
      String dashboardId = dashboardListBox.getValue(dashboardListBox.getSelectedIndex());
      controller.getWidgetController().disposeWidgets();
      controller.getDashboard(dashboardId);
    } else {
      clearDashboardInfo();
      controller.getWidgetController().disposeWidgets();
    }
  }

  public void finishLoadingDashboards(List<Dashboard> dashboards, String selectedDashboardId) {
    dashboardListBox.clear();
    // Set the new list
    int toSelect = -1;
    for (Dashboard d : dashboards) {
      dashboardListBox.addItem(d.getName(), d.get_id());
      if (selectedDashboardId != null && d.get_id().equals(selectedDashboardId)) {
        toSelect = dashboardListBox.getItemCount() - 1;
      }
    }

    // if(toSelect != null){
    // dashboardListBox.setSelectedIndex(index);
    if (toSelect >= 0) {
      dashboardListBox.setSelectedIndex(toSelect);
      dashboardListChanged();
    }
  }

  /**
   * Is called after the application has finished initializing. Makes functions available that are
   * dependent on the loading of prefrecthed data
   */
  public void finishedLoadingPrefetechedItems() {
    adminConsoleButton.setEnabled(true);
  }

  /**
   * After a dashboard has finished loading from the server, populate the UI and present to the user
   * 
   * @param dashboard
   */
  public void finishLoadingDashboard(Dashboard dashboard) {
    this.currentDashboard = dashboard;

    titleLabel.setHTML("<font size=4><b>" + dashboard.getName() + "</b></font>");
    notesArea.setText(dashboard.getDescription());
    settingsPanel.updateDashboardSettings(dashboard.getDashboardSettings());

    List<ChartSettings> charts = dashboard.getCharts();
    if (charts == null) {
      return;
    }
    List<ChartWidget> widgets = controller.getWidgetController().getWidgets();
    ChartWidget w = null;
    int i = 0;
    for (ChartSettings c : charts) {
      // dialogBox.setWidget(new NewChartPanel(controller,
      // dashboard.getDashboardSettings(), c));
      // dialogBox.show();
      w = new ChartWidget(controller, dashboard.getDashboardSettings(), c);
      w.setPopupPosition(345 + (i * 515), 0);
      widgets.add(w);
      w.show();
      i++;
    }
  }

  /**
   * Clears specific dashboard values after a specific dashboard has been deselected or deleted
   */
  private void clearDashboardInfo() {
    toolstripPanel.updateButtonState(ButtonSelectionState.DASHBOARD_DESELECTED);
    controller.getWidgetController().disposeWidgets();
    titleLabel.setHTML("<font size=4>&nbsp;</font>");
    notesArea.setText("");
    currentDashboard = null;
  }

  public void createDashboardButtonClicked() {
    CreateDashboardDialog dialog = new CreateDashboardDialog(this);
  }

  public void deleteButtonClicked() {
    DeleteDashboardDialog dialog = new DeleteDashboardDialog(this, dashboardListBox);
  }

  public void saveButtonClicked() {
    if (currentDashboard == null) {
      return;
    }
    currentDashboard.setDescription(notesArea.getText());
    currentDashboard.setCharts(getDashboardCharts());
    currentDashboard.setDashboardSettings(settingsPanel.getDashboardSettings());
    currentDashboard.setUserId("testuser");
    // currentDashboard.setUserId("USERID"); //TODO
    // currentDashboard.setCategory(category);
    // dashboardListBox.getValue(dashboardListBox.getSelectedIndex());
    controller.saveDashboard(currentDashboard);
  }

  public List<ChartSettings> getDashboardCharts() {
    List<ChartWidget> dashWidgets = controller.getWidgetController().getWidgets();
    ArrayList<ChartSettings> charts = new ArrayList<ChartSettings>();
    for (ChartWidget w : dashWidgets) {
      charts.add(w.getChartSettings());
    }
    return charts;
  }

  public void saveAsButtonClicked() {
    if (currentDashboard == null) {
      return;
    }
    SaveAsDashboardDialog dialog = new SaveAsDashboardDialog(this, currentDashboard.getName());
  }

  public void newWidgetButtonCLicked() {
    ChartWidget w = new ChartWidget(controller, settingsPanel.getDashboardSettings(), null);
    controller.getWidgetController().getWidgets().add(w);
    w.center();
  }

  public void finishLoadingMetricDefinitions(List<Metric> metricDefinitions) {
    if (metricDefinitions == null || metricDefinitions.size() == 0) {
      Window
          .alert("FATAL ERROR: Metrics data could not be found.  This system may be incorrectly configured. Please contact your system administrator.");
    }
  }

  public void finishLoadingMetricGroups(List<MetricGroup> metricGroups) {

  }

  public void finishLoadingRoles(List<Role> roles) {

  }

  public void finishDashboardUpdate(Dashboard dashboard) {
    Alerts.notify(null, "Success", "Dashboard successfully saved: " + dashboard.getName());
  }

  public void finishDeletingDashboard(String dashboardId) {
    clearDashboardInfo();
    for (int i = 0; i < dashboardListBox.getItemCount(); i++) {
      if (dashboardListBox.getValue(i).equals(dashboardId)) {
        dashboardListBox.removeItem(i);
        return;
      }
    }
  }

  public DashboardController getController() {
    return controller;
  }

  public void setController(DashboardController controller) {
    this.controller = controller;
  }

  public DashboardSettingsPanel getSettingsPanel() {
    return settingsPanel;
  }

  public String getNotes() {
    return notesArea.getValue();
  }
}
