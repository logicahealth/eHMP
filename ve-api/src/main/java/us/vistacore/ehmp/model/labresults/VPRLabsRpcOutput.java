package us.vistacore.ehmp.model.labresults;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the lab result information that will be received from
 * the VistA RPC call.
 *
 * @author seth.gainey
 *
 */
public class VPRLabsRpcOutput {
    private String apiVersion;
    private LabData data;

    /**
     * Default constructor.
     */
    public VPRLabsRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public LabData getData() {
        return data;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public void setData(LabData data) {
        this.data = data;
    }

    /**
     * An inner class representing the lab specific data.
     *
     * @author seth.gainey
     *
     */
    public static class LabData {
        private String updated;
        private int totalItems;
        private List<LabResult> items;

        /**
         * Default constructor
         */
        public LabData() {
        }

        /**
         * Method to add an lab result to the labs array.
         *
         * @param a The lab to be added.
         */
        public void addItems(LabResult a) {
            if (items == null) {
                items = new ArrayList<LabResult>();
            }
            items.add(a);
        }

        public List<LabResult> getItems() {
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
    }
}
