package us.vistacore.ehmp.model.vitals.transform.coding;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * This class is used to deserialize FMQL formatted data for file 120.52
 */
public class QualifierCodes {
    private List<Result> results;

    public List<Result> getResults() {
        return results;
    }

    public static class Result {
        private Qualifier qualifier;
        private FmqlUri uri;
        @SerializedName("vital_type") private VitalType vitalType;
        private FmqlVuid vuid;

        public Qualifier getQualifier() {
            return qualifier;
        }

        public FmqlUri getUri() {
            return uri;
        }

        public VitalType getVitalType() {
            return vitalType;
        }

        public FmqlVuid getVuid() {
            return vuid;
        }
    }

    public static class Qualifier {
        private String fmId;
        private String fmType;
        private String value;
        private String type;

        public String getFmId() {
            return fmId;
        }

        public String getFmType() {
            return fmType;
        }

        public String getValue() {
            return value;
        }

        public String getType() {
            return type;
        }
    }

    public static class FmqlUri {
        private String fmId;
        private String fmType;
        private String value;
        private String type;
        private String label;
        private String sameAs;
        private String sameAsLabel;

        public String getFmId() {
            return fmId;
        }

        public String getFmType() {
            return fmType;
        }

        public String getValue() {
            return value;
        }

        public String getType() {
            return type;
        }

        public String getLabel() {
            return label;
        }

        public String getSameAs() {
            return sameAs;
        }

        public String getSameAsLabel() {
            return sameAsLabel;
        }
    }

    public static class FmqlVuid {
        private String fmId;
        private String fmType;
        private String value;
        private String type;

        public String getFmId() {
            return fmId;
        }

        public String getFmType() {
            return fmType;
        }

        public String getValue() {
            return value;
        }

        public String getType() {
            return type;
        }
    }


    public static class VitalType {
        private String fmId;
        private String type;
        private String file;
        private List<VitalTypeValue> value;

        public String getFmId() {
            return fmId;
        }

        public String getType() {
            return type;
        }

        public String getFile() {
            return file;
        }

        public List<VitalTypeValue> getValue() {
            return value;
        }
    }

    public static class VitalTypeValue {
        @SerializedName("vital_type") private FmqlUri vitalType;
        private FmqlUri category;

        public FmqlUri getVitalType() {
            return vitalType;
        }

        public FmqlUri getCategory() {
            return category;
        }
    }
}
