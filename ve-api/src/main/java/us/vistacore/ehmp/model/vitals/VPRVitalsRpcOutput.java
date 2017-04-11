package us.vistacore.ehmp.model.vitals;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Vitals information that will be received from the VistA RPC call.  This
 * has additional information over and above the specific Vitals data.
 *
 * @author Les.Westberg
 *
 */
public class VPRVitalsRpcOutput {

    private String apiVersion;
    private VitalsData data;

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public VitalsData getData() {
        return data;
    }

    public void setData(VitalsData data) {
        this.data = data;
    }

    /**
     * An inner class representing the vitals specific data.
     *
     * @author Les.Westberg
     *
     */
    public static class VitalsData {
        private String updated;
        private int totalItems;
        private List<Vitals> items;

        /**
         * Method to add a Vitals to the Vitals Array.
         * @param vitals The vitals to be added.
         */
        public void addItems(Vitals vitals) {
            if (items == null) {
                items = new ArrayList<Vitals>();
            }
            items.add(vitals);
        }

        public List<Vitals> getItems() {
            return items;
        }

        public void setItems(List<Vitals> items) {
            this.items = items;
        }

        public String getUpdated() {
            return updated;
        }

        public void setUpdated(String updated) {
            this.updated = updated;
        }

        public int getTotalItems() {
            return totalItems;
        }

        public void setTotalItems(int totalItems) {
            this.totalItems = totalItems;
        }
    }
}
