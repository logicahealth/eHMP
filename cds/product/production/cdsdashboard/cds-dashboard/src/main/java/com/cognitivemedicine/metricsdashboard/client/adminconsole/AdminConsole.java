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
package com.cognitivemedicine.metricsdashboard.client.adminconsole;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardController;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.google.gwt.dom.client.Style.Unit;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TabLayoutPanel;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A container for administrative functions
 * 
 * @author sschechter
 *
 */
public class AdminConsole extends DialogBox {

  private DashboardController controller;
  private TabLayoutPanel tabPanel;

  public AdminConsole(DashboardController controller) {
    this.controller = controller;
    tabPanel = new TabLayoutPanel(2.5, Unit.EM);
    tabPanel.setAnimationDuration(200);
    // tabPanel.getElement().getStyle().setMarginBottom(10.0, Unit.PX);

    HTML metricGroupText = new HTML("METRIC GROUPS");
    tabPanel.add(new MetricsTab(controller), metricGroupText);

    HTML rolesText = new HTML("ROLES");
    tabPanel.add(new RolesTab(controller), rolesText);

    // Add a tab
    HTML moreInfo = new HTML("CHARTS");
    tabPanel.add(new ChartsTab(controller), moreInfo);

    // Return the content
    tabPanel.selectTab(0);
    // tabPanel.ensureDebugId("cwTabPanel");

    HorizontalPanel buttonPanel = new HorizontalPanel();
    // buttonPanel.setWidth("20%");
    buttonPanel.setSpacing(4);
    Image image = new Image(MdConstants.IMG_OK_CHECK);
    image.setSize("24px", "24px");
    PushButton saveButton = new PushButton(image);

    saveButton.addClickHandler(new ClickHandler() {
      public void onClick(ClickEvent event) {
        AdminConsole.this.hide();
      }
    });

    image = new Image(MdConstants.IMG_CANCEL_X);
    image.setSize("24px", "24px");
    PushButton closeButton = new PushButton(image);
    closeButton.setTitle("Cancel");
    closeButton.addClickHandler(new ClickHandler() {

      @Override
      public void onClick(ClickEvent event) {
        AdminConsole.this.hide();
      }
    });
    buttonPanel.add(saveButton);
    buttonPanel.add(closeButton);

    VerticalPanel mainPanel = new VerticalPanel();
    // mainPanel.setHorizontalAlignment(HasHorizontalAlignment.ALIGN_CENTER);
    mainPanel.add(tabPanel);
    mainPanel.add(buttonPanel);

    mainPanel.setCellHorizontalAlignment(buttonPanel, HasHorizontalAlignment.ALIGN_CENTER);

    tabPanel.setHeight("400px");
    tabPanel.setWidth("700px");

    this.setHeight("400px");
    this.setWidth("550px");
    this.setText("Admin Console");
    this.setWidget(mainPanel);
    this.setModal(true);
    this.setGlassEnabled(true);

    this.center();
  }
}
