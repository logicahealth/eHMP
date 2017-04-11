package us.vistacore.ehmp.model.demographics;

import java.util.ArrayList;
import java.util.List;

public class VPRPatientSelectRpcOutput {
    private String apiVersion;
    private PatientSelectData data;

    public VPRPatientSelectRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public PatientSelectData getData() {
        return data;
    }

    public static class PatientSelectData {
        private String updated;
        private int totalItems;
        private List<PatientSelect> items;

        public void addItems(PatientSelect a) {
            if (items == null) {
                items = new ArrayList<PatientSelect>();
            }
            items.add(a);
        }

        public String getUpdated() {
            return updated;
        }

        public int getTotalItems() {
            return totalItems;
        }

        public List<PatientSelect> getItems() {
            return items;
        }
    }
}
