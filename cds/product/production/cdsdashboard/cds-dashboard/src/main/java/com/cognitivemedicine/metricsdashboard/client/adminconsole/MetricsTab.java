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
package com.cognitivemedicine.metricsdashboard.client.adminconsole;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.cognitivemedicine.metricsdashboard.client.dashboard.DashboardController;
import com.cognitivemedicine.metricsdashboard.shared.MdConstants;
import com.cognitivemedicine.metricsservice.model.Metric;
import com.cognitivemedicine.metricsservice.model.MetricGroup;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HasVerticalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * This tab is used to create new Metric Groups and associate them with Metrics
 * 
 * @author sschechter
 *
 */
public class MetricsTab extends HorizontalPanel {
  private DashboardController controller;
  private MetricGroup groupList;
  private Metric allMetrics;

  private ListBox allMetricsListBox;
  private ListBox allMetricGroupsListBox;
  private ListBox assignedMetricsListBox;

  private TextBox createGroupTextBox;

  private Button addButton;
  private Button removeButton;
  private Button createGroupButton;

  private boolean isEdited = false;

  public MetricsTab(DashboardController dashController) {
    this.controller = dashController;

    // METRIC GROUPS
    allMetricGroupsListBox = new ListBox();
    allMetricGroupsListBox.setWidth("200px");
    // allMetricGroupsListBox.setWidth("30%");
    allMetricGroupsListBox.setVisibleItemCount(15);
    allMetricGroupsListBox.addChangeHandler(new ChangeHandler() {
      @Override
      public void onChange(ChangeEvent event) {
        String id = allMetricGroupsListBox.getValue(allMetricGroupsListBox.getSelectedIndex());
        // controller.getMetricsGroups().get(id).getMetricList();
        List<Metric> metrics = controller.getMetricsInGroup(id);
        assignedMetricsListBox.clear();
        for (Metric m : metrics) {
          if (m != null) {
            System.err.println("Name: " + m.getName() + " ID: " + m.getName());
            assignedMetricsListBox.addItem(m.getName(), m.get_id());
          }
        }
      }
    });
    Collection<MetricGroup> allMetricGroups = controller.getMetricsGroups().values();
    for (MetricGroup g : allMetricGroups) {
      allMetricGroupsListBox.addItem(g.getName(), g.get_id());
    }

    // METRICS
    allMetricsListBox = new ListBox(true);
    allMetricsListBox.setWidth("200px");
    // allMetricsListBox.setWidth("30%");
    allMetricsListBox.setVisibleItemCount(15);
    Collection<Metric> allMetrics = controller.getAvailableMetrics().values();
    for (Metric m : allMetrics) {
      allMetricsListBox.addItem(m.getName(), m.get_id());
    }

    // ASSIGNED
    assignedMetricsListBox = new ListBox(true);
    assignedMetricsListBox.setWidth("200px");
    // assignedMetricsListBox.setWidth("30%");
    assignedMetricsListBox.setVisibleItemCount(15);

    VerticalPanel buttonPanel = new VerticalPanel();
    buttonPanel.setSpacing(2);
    Image image = new Image(MdConstants.IMG_LEFT_ARROW);
    image.setSize("24px", "24px");
    PushButton addButton = new PushButton(image);
    addButton.getElement().setId("addDefinitionButton");
    addButton.setSize("24px", "24px");
    addButton.setTitle("Add");
    // addButton = new Button("<-- Add");
    addButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        addButtonClicked();
      }
    });

    image = new Image(MdConstants.IMG_RIGHT_ARROW);
    image.setSize("24px", "24px");
    PushButton removeButton = new PushButton(image);
    removeButton.getElement().setId("removeDefinitionButton");
    removeButton.setSize("24px", "24px");
    removeButton.setTitle("Add");
    // removeButton = new Button("Remove -->");
    removeButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        removeButtonClicked();
      }
    });

    buttonPanel.add(addButton);
    buttonPanel.add(removeButton);
    // buttonPanel.setBorderWidth(2);

    // this.setBorderWidth(3);
    // this.setSpacing(2);
    this.setWidth("100%");

    createGroupTextBox = new TextBox();
    // createGroupTextBox.setWidth("*");

    createGroupButton = new Button("Create Group");
    createGroupButton.getElement().setId("createGroupButton");
    createGroupButton.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        if (!(createGroupTextBox.getValue().equals(""))) {
          MetricGroup group = new MetricGroup();
          group.setName(createGroupTextBox.getValue());
          group.setDescription("");
          group.setMetricList(new ArrayList<String>());
          controller.createMetricGroup(group);
        } else {
          Window.alert("You must enter a name to create a group");
        }
      }
    });

    VerticalPanel allMetricsPanel = createLabeledList("Metrics Groups", allMetricGroupsListBox);
    HorizontalPanel createPanel = new HorizontalPanel();
    createPanel.add(createGroupTextBox);
    createPanel.add(createGroupButton);
    allMetricsPanel.add(createPanel);
    this.add(allMetricsPanel);
    // this.add(createLabeledList("Metrics Groups", allMetricGroupsListBox));
    this.add(createLabeledList("Assigned Metrics", assignedMetricsListBox));
    this.add(buttonPanel);
    this.add(createLabeledList("All Metrics", allMetricsListBox));

    setCellHorizontalAlignment(buttonPanel, HasHorizontalAlignment.ALIGN_CENTER);
    setCellVerticalAlignment(buttonPanel, HasVerticalAlignment.ALIGN_MIDDLE);
  }

  protected void removeButtonClicked() {
    int index = assignedMetricsListBox.getSelectedIndex();
    allMetricsListBox.addItem(assignedMetricsListBox.getItemText(index),
        assignedMetricsListBox.getValue(index));
    assignedMetricsListBox.removeItem(assignedMetricsListBox.getSelectedIndex());
    isEdited = true;

    // assignedMetricsListBox.removeItem(assignedMetricsListBox.getSelectedIndex());
  }

  protected void addButtonClicked() {
    assignedMetricsListBox.addItem(
        allMetricsListBox.getItemText(allMetricsListBox.getSelectedIndex()),
        allMetricsListBox.getValue(allMetricsListBox.getSelectedIndex()));
    allMetricsListBox.removeItem(allMetricsListBox.getSelectedIndex());
    isEdited = true;
  }

  private VerticalPanel createLabeledList(String labelText, ListBox listBox) {
    VerticalPanel panel = new VerticalPanel();
    panel.setBorderWidth(2);
    HTML label = new HTML(labelText);

    panel.add(label);
    panel.add(listBox);
    return panel;
  }

  public void finishCreateMetricGroup() {
    // controller.
  }
}
