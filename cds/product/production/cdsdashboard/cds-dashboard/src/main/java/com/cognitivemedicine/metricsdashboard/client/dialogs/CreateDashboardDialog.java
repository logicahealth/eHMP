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
package com.cognitivemedicine.metricsdashboard.client.dialogs;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardMainPanel;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.Dashboard;
import com.cognitivemedicine.metricsservice.model.DashboardSettings;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.KeyUpEvent;
import com.google.gwt.event.dom.client.KeyUpHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A dialog box used to create a Dashboard
 * 
 * @author sschechter
 * 
 */
public class CreateDashboardDialog extends DialogBox {

  private PushButton createButton;
  private PushButton cancelButton;
  private DashboardMainPanel parent;
  private TextArea notesArea;
  private TextBox nameBox;

  public CreateDashboardDialog(DashboardMainPanel parent) {
    this.parent = parent;
    init();
  }

  private void init() {
    this.setWidth("375px");
    this.setText("Create New Dashboard");

    VerticalPanel dialogVPanel = new VerticalPanel();
    dialogVPanel.add(new HTML("<b>Name:</b>"));
    nameBox = new TextBox();
    nameBox.getElement().setId("createDashboardNameTextBox");
    nameBox.setWidth("290px");
    nameBox.addKeyUpHandler(new KeyUpHandler() {
      @Override
      public void onKeyUp(KeyUpEvent event) {
        createButton.setEnabled(nameBox.getValue().length() > 0);
      }
    });
    notesArea = new TextArea();
    notesArea.setWidth("290px");
    notesArea.getElement().setId("createDashboardNotesArea");
    dialogVPanel.add(nameBox);
    dialogVPanel.add(new HTML("<br><b>Dashboard Notes:</b>"));
    dialogVPanel.add(notesArea);
    dialogVPanel.setHorizontalAlignment(VerticalPanel.ALIGN_RIGHT);
    // // Add a close button at the bottom of the dialog
    Image image = new Image(MdConstants.IMG_OK_CHECK);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    createButton = new PushButton(image);
    createButton.setEnabled(false);
    createButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    createButton.getElement().setId("createDashboardOkButton");
    createButton.setTitle("Create new dashboard");
    createButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        createButtonClicked();
      }
    });
    image = new Image(MdConstants.IMG_CANCEL_X);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    cancelButton = new PushButton(image);
    cancelButton.getElement().setId("createDashboardCancelButton");
    cancelButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    cancelButton.setTitle("Cancel");
    cancelButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        CreateDashboardDialog.this.hide();
      }
    });

    HorizontalPanel dialogButtonPanel = new HorizontalPanel();
    dialogButtonPanel.setSpacing(8);
    dialogButtonPanel.add(createButton);
    dialogButtonPanel.add(cancelButton);
    dialogVPanel.add(dialogButtonPanel);

    dialogVPanel.setSpacing(4);
    dialogVPanel.setCellHorizontalAlignment(dialogButtonPanel, HasHorizontalAlignment.ALIGN_CENTER);
    dialogVPanel.setCellVerticalAlignment(dialogButtonPanel, HasVerticalAlignment.ALIGN_MIDDLE);
    this.setWidget(dialogVPanel);
    this.setGlassEnabled(true);
    this.setModal(true);
    this.center();
    nameBox.setFocus(true);
  }

  protected void createButtonClicked() {
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
    dashboard.setName(name);
    dashboard.setDescription(notesArea.getText());
    // TODO grab from authenticated user
    dashboard.setUserId("testuser");
    dashboard.setDashboardSettings(new DashboardSettings());
    parent.getController().createDashboard(dashboard);
    CreateDashboardDialog.this.hide();
  }

}
