package com.cognitivemedicine.metricsdashboard.client.widgets;

import java.util.ArrayList;

import com.google.gwt.user.client.ui.ListBox;

/**
 * A widget for a multi select ListBox
 * 
 * @author sschechter
 * 
 */
public class MultiSelectListBox extends ListBox {

  public MultiSelectListBox() {
    super(true);
  }

  public ArrayList<String> getSelectedItems() {
    ArrayList<String> selectedItems = new ArrayList<String>();
    for (int i = 0; i < getItemCount(); i++) {
      if (isItemSelected(i)) {
        selectedItems.add(getValue(i));
      }
    }
    return selectedItems;
  }
}
