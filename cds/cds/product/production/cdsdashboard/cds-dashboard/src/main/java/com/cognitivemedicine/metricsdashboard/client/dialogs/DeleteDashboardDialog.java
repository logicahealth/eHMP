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
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A simple dialog for deleting a dashboard
 * 
 * @author sschechter
 * 
 */
public class DeleteDashboardDialog extends DialogBox {

  private PushButton createButton;
  private PushButton cancelButton;
  private DashboardMainPanel parent;

  private ListBox dashboardListBox;

  public DeleteDashboardDialog(DashboardMainPanel parent, ListBox dashboardListBox) {
    this.parent = parent;
    this.dashboardListBox = dashboardListBox;
    init();
  }

  private void init() {
    this.setWidth("300px");
    this.setText("Delete Dashboard?");

    VerticalPanel dialogVPanel = new VerticalPanel();
    dialogVPanel.setWidth("300px");
    dialogVPanel.setSpacing(8);
    dialogVPanel.add(new HTML("Are you sure you'ld like to delete this Dashboard?</br></br><b>"
        + dashboardListBox.getItemText(dashboardListBox.getSelectedIndex()) + "</b>"));
    dialogVPanel.setHorizontalAlignment(VerticalPanel.ALIGN_CENTER);

    Image image = new Image(MdConstants.IMG_OK_CHECK);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    PushButton okButton = new PushButton(image);
    okButton.getElement().setId("deleteDashboardOkButton");
    okButton.addClickHandler(new ClickHandler() {
      public void onClick(ClickEvent event) {
        String dashboardId = dashboardListBox.getValue(dashboardListBox.getSelectedIndex());
        parent.getController().deleteDashboard(dashboardId);
        DeleteDashboardDialog.this.hide();
      }
    });

    image = new Image(MdConstants.IMG_CANCEL_X);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    PushButton cancelButton = new PushButton(image);
    cancelButton.getElement().setId("deleteDashboardCancelButton");
    cancelButton.setTitle("Cancel");
    cancelButton.addClickHandler(new ClickHandler() {

      @Override
      public void onClick(ClickEvent event) {
        DeleteDashboardDialog.this.hide();
      }
    });

    HorizontalPanel dialogButtonPanel = new HorizontalPanel();
    dialogButtonPanel.setSpacing(4);
    dialogButtonPanel.add(okButton);
    dialogButtonPanel.add(cancelButton);
    dialogVPanel.add(dialogButtonPanel);

    this.setWidget(dialogVPanel);
    this.setModal(true);
    this.setGlassEnabled(true);
    this.center();
  }
}
