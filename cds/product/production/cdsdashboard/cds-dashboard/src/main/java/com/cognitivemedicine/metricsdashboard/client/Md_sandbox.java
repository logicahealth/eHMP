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
package com.cognitivemedicine.metricsdashboard.client;

import java.util.List;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardController;
import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardMainPanel;
import com.cognitivemedicine.metricsdashboard.client.dialogs.AuthenticationDialog;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.authentication.AuthRequest;
import com.cognitivemedicine.metricsservice.model.authentication.AuthResponse;
import com.cognitivemedicine.metricsservice.model.authentication.Site;
import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.user.client.Cookies;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.RootPanel;

/**
 * Entry point classes define <code>onModuleLoad()</code>.
 * 
 * @author sschechter
 * 
 */
public class Md_sandbox implements EntryPoint {

  private DashboardMainPanel mainPanel;
  private DashboardController controller;
  private AuthenticationDialog authDialog;

  private String rdkAuthCookie;

  /**
   * Show the authentication dialog when the application loads
   */
  public void onModuleLoad() {
    controller = new DashboardController(this);
    controller.fetchSites();
  }

  public void siteListLoaded(List<Site> siteList) {
    if (siteList != null && siteList.size() > 0) {
      authDialog = new AuthenticationDialog(this, siteList);

      String cookie = Cookies.getCookie(MdConstants.RDK_COOKIE);
      System.err.println(cookie);

      if (cookie == null) {
        authDialog.center();
      } else {
        controller.reauthenticate();
      }
    } else {
      siteListLoadFailed();
    }
  }

  public void siteListLoadFailed() {
    Window
        .alert("FATAL ERROR: Site list data could not be found.  This system may be incorrectly configured. Please contact your system administrator.");
  }

  /**
   * Attempt to login with given credentials
   * 
   * @param request
   *          Credential information
   */
  public void login(AuthRequest request) {
    controller.authenticate(request);
  }

  /**
   * Finish loading the application after the user has been successfully authenticated
   */
  public void loginSuccess(AuthResponse response, String rdkAuthCookie) {
    this.rdkAuthCookie = rdkAuthCookie;
    Cookies.setCookie(MdConstants.RDK_COOKIE, rdkAuthCookie);
    authDialog.hide();
    mainPanel = new DashboardMainPanel();
    controller.loadCdsDashboard(mainPanel);
    RootPanel.get("mainContainer").add(mainPanel);
  }

  /**
   * The user couldn't log in so display an error message, and allow them to try again
   */
  public void loginFailed(String message) {
    if (message != null) {
      Window.alert("Could not log in.  Please check your credentials and try again");
    }
  }

  /**
   * After a user times out, they should be prompted with credentials again
   */
  public void promptCredentials() {
    controller.getWidgetController().disposeWidgets();
    if (mainPanel != null) {
      RootPanel.get("mainContainer").remove(mainPanel);
    }
    authDialog.show();
  }
}
