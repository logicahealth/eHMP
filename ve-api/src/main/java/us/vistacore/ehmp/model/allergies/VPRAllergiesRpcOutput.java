package us.vistacore.ehmp.model.allergies;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Allergies information that will be received from
 * the VistA RPC call. This has additional information over and above the
 * specific allergies data.
 *
 * @author Les.Westberg
 *
 */
public class VPRAllergiesRpcOutput {
    private String apiVersion;
    private AllergiesData data;

    /**
     * Default constructor.
     */
    public VPRAllergiesRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public AllergiesData getData() {
        return data;
    }

    public void setData(AllergiesData data) {
        this.data = data;
    }

    /**
     * An inner class representing the allergy specific data.
     *
     * @author Les.Westberg
     *
     */
    public static class AllergiesData {
        private String updated;
        private int totalItems;
        private List<AllergiesResult> items;

        /**
         * Default constructor
         */
        public AllergiesData() {
        }

        /**
         * Method to add an allergy result to the allergies array.
         *
         * @param a The vitals to be added.
         */
        public void addItems(AllergiesResult a) {
            if (items == null) {
                items = new ArrayList<AllergiesResult>();
            }
            items.add(a);
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

        public List<AllergiesResult> getItems() {
            return items;
        }

        public void setItems(List<AllergiesResult> items) {
            this.items = items;
        }
    }
}
