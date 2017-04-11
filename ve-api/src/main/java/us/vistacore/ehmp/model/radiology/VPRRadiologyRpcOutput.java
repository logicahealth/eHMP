package us.vistacore.ehmp.model.radiology;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the radiology result information that will be
 * received from the VistA RPC call
 * @author josephg
 *
 */
public class VPRRadiologyRpcOutput {
    private String apiVersion;
    private RadiologyData data;

    /**
     * Default constructor.
     */
    public VPRRadiologyRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public RadiologyData getData() {
        return data;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public void setData(RadiologyData data) {
        this.data = data;
    }

    /**
     * An inner class representing the radiology specific data.
     *
     * @author josephg
     *
     */
    public static class RadiologyData {
        private String updated;
        private int totalItems;
        private int currentItemCount;
        private List<RadiologyResult> items;

        /**
         * Default constructor
         */
        public RadiologyData() {
        }

        /**
         * Method to add an radiology result to the radiology array.
         *
         * @param a The radiology to be added.
         */
        public void addItems(RadiologyResult a) {
            if (items == null) {
                items = new ArrayList<RadiologyResult>();
            }
            items.add(a);
        }

        public List<RadiologyResult> getItems() {
            return items;
        }

        public String getUpdated() {
            return updated;
        }

        public int getTotalItems() {
            return totalItems;
        }

        public void setUpdated(String updated) {
            this.updated = updated;
        }

        public void setTotalItems(int totalItems) {
            this.totalItems = totalItems;
        }

        public int getCurrentItemCount() {
            return currentItemCount;
        }

        public void setCurrentItemCount(int currentItemCount) {
            this.currentItemCount = currentItemCount;
        }
    }
}
