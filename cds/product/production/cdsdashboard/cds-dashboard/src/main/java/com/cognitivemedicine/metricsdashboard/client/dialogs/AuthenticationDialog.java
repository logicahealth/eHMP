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

import java.util.List;

import com.cognitivemedicine.metricsdashboard.client.Md_sandbox;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.authentication.AuthRequest;
import com.cognitivemedicine.metricsservice.model.authentication.Site;
import com.google.gwt.core.client.Scheduler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.FocusWidget;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.PasswordTextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * Prompts for authentication credentials
 * 
 * @author sschechter
 *
 */
public class AuthenticationDialog extends DialogBox {

  private Md_sandbox application;
  private HorizontalPanel mainPanel;
  private VerticalPanel warningPanel;
  private VerticalPanel loginPanel;
  private HTML warningMessage;
  private HTML titleLabel;
  private Image vaLogo;

  private ListBox facilityListBox;
  private PasswordTextBox accessCode;
  private PasswordTextBox verifyCode;
  private Button signInButton;

  private static String warningMessageText = "** WARNING ** WARNING ** WARNING ** WARNING ** WARNING ** WARNING"

      + "</br></br>This site is intended to be used by authorized VA network users for viewing and retrieving information only except as otherwise explicitly authorized. "
      + "VA information resides on and transmits through computer systems and networks funded by VA; all use is considered to be understanding and acceptance that there "
      + "is no reasonable expectation of privacy for any data or transmissions on Government Intranet or Extranet (non-public) networks or systems. All transactions that "
      + "occur on this system other than the viewing and downloading of Web site information and all data transmitted through this system are subject to review and action "
      + "including (but not limited to) monitoring, recording, retrieving, copying, auditing, inspecting, investigating, restricting access, blocking, tracking, disclosing "
      + "to authorized personnel, or any other authorized actions by all authorized VA and law enforcement personnel. All use of this system constitutes understanding and "
      + "unconditional acceptance of these terms."

      + "</br></br>Unauthorized attempts or acts to either (1) access, upload, change, or delete information on this system, (2) modify this system, (3) deny access to this system, "
      + "or (4) accrue resources for unauthorized use on this system are strictly prohibited. Such attempts or acts are subject to action that may result in criminal, civil, or "
      + "administrative penalties."

      + "</br></br>** WARNING ** WARNING ** WARNING ** WARNING ** WARNING ** WARNING **";

  public AuthenticationDialog(Md_sandbox application, List<Site> siteList) {
    this.application = application;

    mainPanel = new HorizontalPanel();
    mainPanel.getElement().getStyle().setProperty("backgroundColor", "#477E7E");

    warningPanel = new VerticalPanel();
    warningPanel.setWidth("450px");
    // warningPanel.setWidth("100%");
    warningPanel.setHeight("100%");
    warningPanel.setSpacing(20);
    warningPanel.getElement().getStyle().setProperty("backgroundColor", "#477E7E");

    loginPanel = new VerticalPanel();
    loginPanel.setWidth("450px");
    // loginPanel.setWidth("100%");
    loginPanel.setSpacing(4);
    loginPanel.getElement().getStyle().setProperty("backgroundColor", "#FFFFFF");

    warningMessage = new HTML(warningMessageText);
    warningMessage.getElement().getStyle().setProperty("color", "white");
    warningMessage.getElement().getStyle().setProperty("fontSize", "10px");
    warningMessage.setWordWrap(true);
    warningMessage.setHeight("100%");
    // warningMessage.setWidth("100%");

    titleLabel = new HTML("<h2>CDS METRICS DASHBOARD</h2>");

    vaLogo = new Image(MdConstants.IMG_VA_LOGO);
    vaLogo.setPixelSize(160, 160);
    vaLogo.getElement().getStyle().setProperty("marginTop", "20px");

    facilityListBox = new ListBox();
    facilityListBox.setVisibleItemCount(1);
    facilityListBox.getElement().setId("facilityListBox");
    for (Site s : siteList) {
      facilityListBox.addItem(s.getName(), s.getSiteCode());
    }
    // facilityListBox.setWidth("100%");

    accessCode = new PasswordTextBox();
    accessCode.getElement().setId("accessCode");
    accessCode.setMaxLength(80);
    // accessCode.setWidth("100%");

    verifyCode = new PasswordTextBox();
    verifyCode.getElement().setId("verifyCode");
    verifyCode.setMaxLength(80);
    // verifyCode.setWidth("100%");

    signInButton = new Button("Sign In");
    signInButton.getElement().getStyle().setProperty("background", "#477E7E");
    signInButton.getElement().getStyle().setProperty("color", "white");
    signInButton.getElement().getStyle().setProperty("fontSize", "10px");
    signInButton.addClickHandler(new ClickHandler() {

      @Override
      public void onClick(ClickEvent event) {
        signInButtonClicked();
      }
    });

    warningPanel.add(warningMessage);
    warningPanel.setCellVerticalAlignment(warningMessage, HasVerticalAlignment.ALIGN_MIDDLE);

    loginPanel.add(vaLogo);
    loginPanel.add(titleLabel);
    loginPanel.add(createFormPanel("Select a Facility", facilityListBox));
    loginPanel.add(createFormPanel("Access Code", accessCode));
    loginPanel.add(createFormPanel("Vefify Code", verifyCode));
    loginPanel.add(signInButton);

    loginPanel.setCellHorizontalAlignment(vaLogo, HasHorizontalAlignment.ALIGN_CENTER);
    loginPanel.setCellHorizontalAlignment(titleLabel, HasHorizontalAlignment.ALIGN_CENTER);
    loginPanel.setCellHorizontalAlignment(facilityListBox, HasHorizontalAlignment.ALIGN_CENTER);
    loginPanel.setCellHorizontalAlignment(accessCode, HasHorizontalAlignment.ALIGN_CENTER);
    loginPanel.setCellHorizontalAlignment(verifyCode, HasHorizontalAlignment.ALIGN_CENTER);
    loginPanel.setCellHorizontalAlignment(signInButton, HasHorizontalAlignment.ALIGN_RIGHT);

    mainPanel.add(warningPanel);
    mainPanel.add(loginPanel);

    mainPanel.setCellVerticalAlignment(warningPanel, HasVerticalAlignment.ALIGN_MIDDLE);

    this.setTitle("CDS DASHBOARD LOGIN");
    this.setWidget(mainPanel);
    this.setModal(true);
    this.setGlassEnabled(true);
    this.removeStyleName("gwt-DialogBox");
  }

  @Override
  protected void onLoad() {
    Scheduler.get().scheduleDeferred(new Scheduler.ScheduledCommand() {
      public void execute() {
        AuthenticationDialog.this.center();
      }
    });
  }

  /**
   * Creates a consistent sized panel for form elements
   * 
   * @param fieldName
   * @param widget
   * @return
   */
  private HorizontalPanel createFormPanel(String fieldName, FocusWidget widget) {
    HorizontalPanel panel = new HorizontalPanel();
    panel.setSpacing(4);
    HTML nameLabel = new HTML(fieldName + ": ");
    nameLabel.setWidth("115px");
    // Weird workaround - the PasswordTextBoxes render wider than the ListBoxes, even when set to
    // the same size
    if (widget instanceof ListBox) {
      widget.setWidth("325px");
    } else {
      widget.setWidth("315px");
    }

    panel.add(nameLabel);
    panel.add(widget);
    panel.setCellHorizontalAlignment(nameLabel, HasHorizontalAlignment.ALIGN_RIGHT);
    return panel;
  }

  @Override
  public void show() {
    accessCode.setText("");
    verifyCode.setText("");
    super.show();
  }

  /**
   * Creates an authorization request and attempts to log in to the rdk
   */
  private void signInButtonClicked() {
    AuthRequest request = new AuthRequest();

    // validate and create an object for authentication
    request.setSite(facilityListBox.getValue(facilityListBox.getSelectedIndex()));
    request.setAccessCode(accessCode.getText());
    request.setVerifyCode(verifyCode.getText());

    application.login(request);
  }
}
