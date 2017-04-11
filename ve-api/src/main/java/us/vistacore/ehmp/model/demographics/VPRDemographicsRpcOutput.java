package us.vistacore.ehmp.model.demographics;

import java.util.ArrayList;
import java.util.List;

public class VPRDemographicsRpcOutput {
    private String apiVersion;
    private DemographicsData data;

    public VPRDemographicsRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public DemographicsData getData() {
        return data;
    }

    public static class DemographicsData {
        private String updated;
        private int totalItems;
        private List<PatientDemographics> items;

        public void addItems(PatientDemographics a) {
            if (items == null) {
                items = new ArrayList<PatientDemographics>();
            }
            items.add(a);
        }

        public String getUpdated() {
            return updated;
        }

        public int getTotalItems() {
            return totalItems;
        }

        public List<PatientDemographics> getItems() {
            return items;
        }
    }
}
