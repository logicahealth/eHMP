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
package com.cognitivemedicine.metricsdashboard.client.widgets;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.logical.shared.CloseEvent;
import com.google.gwt.event.logical.shared.CloseHandler;
import com.google.gwt.user.client.Timer;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HTML;
import com.google.gwt.user.client.ui.Panel;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A class for generating static popup messages
 * 
 * @author sschechter
 * 
 */
public class Alerts {

  public static void notify(Panel parent, String title, String message) {
    final DialogBox d = new DialogBox();
    d.setText(title);
    d.setModal(false);
    // d.center();
    Button closeButton = new Button("Close", new ClickHandler() {
      public void onClick(ClickEvent event) {
        d.hide();
      }
    });
    // d.add(closeButton);
    d.addCloseHandler(new CloseHandler<PopupPanel>() {
      @Override
      public void onClose(CloseEvent<PopupPanel> event) {
        d.hide();
      }
    });

    VerticalPanel v = new VerticalPanel();
    // v.add(new Label(message));

    HTML html = new HTML();
    html.setHTML(message);
    html.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(ClickEvent event) {
        d.hide();
      }
    });

    v.add(html);
    v.add(closeButton);
    d.setWidget(v);
    // d.setPopupPosition(Window.getClientWidth()-d.getOffsetWidth(),
    // Window.getClientHeight()-d.getOffsetWidth());

    Timer t = new Timer() {
      @Override
      public void run() {
        d.hide();
      }
    };
    t.schedule(3000);

    d.setWidth("300px");
    d.setHeight("200px");
    d.center();
    // d.setPopupPosition(Window.getClientWidth()-d.getOffsetWidth(),
    // Window.getClientHeight()-d.getOffsetWidth());
    // d.show();
  }

  // public static void notifyPrompt(String title, String message) {
  // final DialogBox d = new DialogBox();
  // d.setText(title);
  // d.setModal(false);
  // d.center();
  // Button closeButton = new Button("Close", new ClickHandler() {
  // public void onClick(ClickEvent event) {
  // d.hide();
  // }
  // });
  // d.add(closeButton);
  // d.addCloseHandler(new CloseHandler<PopupPanel>() {
  // @Override
  // public void onClose(CloseEvent<PopupPanel> event) {
  // d.hide();
  // }
  // });
  //
  // VerticalPanel v = new VerticalPanel();
  // v.add(new Label(message));
  // v.add(closeButton);
  // d.setWidget(v);
  // }
}
