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
package com.cognitivemedicine.metricsdashboard.client.dialogs;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardMainPanel;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.KeyUpEvent;
import com.google.gwt.event.dom.client.KeyUpHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A simple Save As dialog box
 * 
 * @author sschechter
 * 
 */
public class SaveAsDashboardDialog extends DialogBox {
  private PushButton createButton;
  private PushButton cancelButton;
  private DashboardMainPanel parent;
  private TextBox nameBox;
  private String existingTitle;

  public SaveAsDashboardDialog(DashboardMainPanel parent, String existingTitle) {
    this.parent = parent;
    this.existingTitle = existingTitle;
    init();
  }

  private void init() {
    this.setWidth("300px");
    // dialogBox.ensureDebugId("cwDialogBox");
    this.setText("Save As");

    VerticalPanel dialogVPanel = new VerticalPanel();
    dialogVPanel.add(new HTML("<b>Dashboard Name:</b>"));
    nameBox = new TextBox();
    nameBox.setWidth("265px");
    nameBox.setValue("Copy of " + existingTitle);
    nameBox.getElement().setId("saveAsNameBox");
    nameBox.addKeyUpHandler(new KeyUpHandler() {
      @Override
      public void onKeyUp(KeyUpEvent event) {
        createButton.setEnabled(nameBox.getValue().length() > 0);
      }
    });
    dialogVPanel.add(nameBox);
    dialogVPanel.setHorizontalAlignment(VerticalPanel.ALIGN_RIGHT);

    Image image = new Image(MdConstants.IMG_OK_CHECK);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    createButton = new PushButton(image);
    createButton.setTitle("Save Dashboard");
    createButton.getElement().setId("saveAsOkButton");
    createButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        createButtonClicked();
      }
    });

    image = new Image(MdConstants.IMG_CANCEL_X);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    cancelButton = new PushButton(image);
    cancelButton.setTitle("Cancel");
    cancelButton.getElement().setId("saveAsOkButton");
    cancelButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        SaveAsDashboardDialog.this.hide();
      }
    });

    HorizontalPanel dialogButtonPanel = new HorizontalPanel();
    dialogVPanel.setSpacing(4);
    dialogButtonPanel.add(createButton);
    dialogButtonPanel.add(cancelButton);
    dialogVPanel.add(dialogButtonPanel);

    this.setGlassEnabled(true);
    this.setWidget(dialogVPanel);
    this.setModal(true);
    this.center();
    nameBox.setFocus(true);
    nameBox.selectAll();
  }

  private void createButtonClicked() {
    String name = nameBox.getText();
    if (name == null || name.trim().length() == 0) {
      Window.alert("You must enter a name");
      return;
    }
    for (Dashboard d : parent.getController().getDashboards().values()) {
      if (d.getName().equalsIgnoreCase(name)) {
        Window.alert("A dashboard with this name already exists");
        return;
      }
    }

    Dashboard dashboard = new Dashboard();
    dashboard.setName(nameBox.getText());
    dashboard.setDescription(parent.getNotes());
    dashboard.setCharts(parent.getDashboardCharts());
    dashboard.setDashboardSettings(parent.getSettingsPanel().getDashboardSettings());
    dashboard.setUserId("testuser");
    // currentDashboard.setUserId("USERID"); //TODO
    // currentDashboard.setCategory(category);
    // dashboardListBox.getValue(dashboardListBox.getSelectedIndex());
    parent.getController().createDashboard(dashboard);
    SaveAsDashboardDialog.this.hide();
  }
}
