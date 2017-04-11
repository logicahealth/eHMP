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

import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.PushButton;

/**
 * A toolstrip bar for the dashboard
 * 
 * @author sschechter
 * 
 */
public class DashboardToolStripBar extends HorizontalPanel {

  private PushButton newDashboardButton;
  private PushButton saveButton;
  private PushButton saveAsButton;
  private PushButton deleteButton;
  private PushButton newChartButton;
  private PushButton newColumnButton;
  private PushButton refreshDataButton;

  private DashboardMainPanel parent;

  public enum ButtonSelectionState {
    DASHBOARD_SELECTED, DASHBOARD_DESELECTED;
  }

  public DashboardToolStripBar(DashboardMainPanel parent) {
    this.parent = parent;
    init();
  }

  /**
   * Create the toolstrip panel for the Dashboard editor buttons
   */
  private void init() {

    Image image = new Image(MdConstants.IMG_LINE_CHART);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    newChartButton = new PushButton(image);
    newChartButton.getElement().setId("newChartButton");
    newChartButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    newChartButton.setTitle("New Chart");
    newChartButton.setEnabled(false);
    newChartButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.newWidgetButtonCLicked();
      }
    });

    image = new Image(MdConstants.IMG_REFRESH);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    refreshDataButton = new PushButton(image);
    refreshDataButton.getElement().setId("refreshDataButton");
    refreshDataButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    refreshDataButton.setTitle("Refresh Data");
    refreshDataButton.setEnabled(false);
    refreshDataButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.refreshDataButtonClicked();
      }
    });

    // // TODO hidden for now, may come back
    // image = new Image("imgs/new-column.png");
    // image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    // newColumnButton = new PushButton(image);
    // newColumnButton.getElement().setId("newColumnButton");
    // newColumnButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    // newColumnButton.setTitle("New Column");
    // newColumnButton.addClickHandler(new ClickHandler() {
    // @Override
    // public void onClick(ClickEvent event) {
    // // parent.newColumnButtonClicked();
    // }
    // });

    image = new Image(MdConstants.IMG_NEW_DASHBOARD);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    newDashboardButton = new PushButton(image);
    newDashboardButton.getElement().setId("newDashboardButton");
    newDashboardButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    newDashboardButton.setTitle("New Dashboard");
    newDashboardButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.createDashboardButtonClicked();
      }
    });

    image = new Image(MdConstants.IMG_SAVE);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    saveButton = new PushButton(image);
    saveButton.getElement().setId("saveButton");
    saveButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    saveButton.setTitle("Save Dashboard");
    saveButton.setEnabled(false);
    saveButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.saveButtonClicked();
      }
    });

    image = new Image(MdConstants.IMG_SAVE_AS);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    saveAsButton = new PushButton(image);
    saveAsButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    saveAsButton.setTitle("Save Dashboard As");
    saveAsButton.getElement().setId("saveAsButton");
    saveAsButton.setEnabled(false);
    saveAsButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.saveAsButtonClicked();
      }
    });

    image = new Image(MdConstants.IMG_DELETE);
    image.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    deleteButton = new PushButton(image);
    deleteButton.setSize(MdConstants.IMG_SIZE, MdConstants.IMG_SIZE);
    deleteButton.getElement().setId("DeleteDashboardButton");
    deleteButton.setTitle("Delete Selected Dashboard");
    deleteButton.setEnabled(false);
    deleteButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        parent.deleteButtonClicked();
      }
    });

    this.setSpacing(4);
    this.add(newDashboardButton);
    this.add(saveButton);
    this.add(saveAsButton);
    this.add(deleteButton);
    this.add(refreshDataButton);
    this.add(newChartButton);
  }

  /**
   * A utility method for updating the enabled button state for each button, depending on the
   * current state of the dashboard
   * 
   * @param state
   *          The button state the dashboard is in
   */
  public void updateButtonState(ButtonSelectionState state) {
    // There may end up being more button states than this
    switch (state) {
    case DASHBOARD_SELECTED:
      deleteButton.setEnabled(true);
      saveButton.setEnabled(true);
      saveAsButton.setEnabled(true);
      newChartButton.setEnabled(true);
      refreshDataButton.setEnabled(true);
      break;
    case DASHBOARD_DESELECTED:
      deleteButton.setEnabled(false);
      saveButton.setEnabled(false);
      saveAsButton.setEnabled(false);
      newChartButton.setEnabled(false);
      refreshDataButton.setEnabled(false);
      break;
    }
  }
}
