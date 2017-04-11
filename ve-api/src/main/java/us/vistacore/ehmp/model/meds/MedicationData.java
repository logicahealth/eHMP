package us.vistacore.ehmp.model.meds;

import java.util.ArrayList;
import java.util.List;

/**
 * this class represents the specifics for med data
 * @author josephg
 *
 */
public class MedicationData {
    private String updated;
    private int totalItems;
    private int currentItemCount;
    private List<MedResult> items;

    public String getUpdated() {
        return updated;
    }

    public void setUpdated(String updated) {
        this.updated = updated;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public int getCurrentItemCount() {
        return currentItemCount;
    }

    public void setCurrentItemCount(Integer currentItemCount) {
        this.currentItemCount = currentItemCount;
    }

    public List<MedResult> getItems() {
        return items;
    }

    /**
     * Method to add a medication to the array of medications
     * @param items is the medication to be added
     */
    public void addItems(MedResult items) {
        if (this.items == null) {
            this.items = new ArrayList<MedResult>();
        }
        this.items.add(items);
    }
}
