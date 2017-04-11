package us.vistacore.ehmp.model.transform.coding;

import javax.annotation.Nonnull;
import java.util.List;

public class TransformCodes {

    private List<VitalsTransformCodes> data;

    public List<VitalsTransformCodes> getData() {
        return data;
    }

    public static class VitalsTransformCodes {
        @Nonnull
        private String type = null;
        @Nonnull
        private List<Coding> results = null;
        @Nonnull
        private List<Coding> normalRange = null;

        @Nonnull
        public String getType() {
            return type;
        }

        @Nonnull
        public List<Coding> getResults() {
            return results;
        }

        @Nonnull
        public List<Coding> getNormalRange() {
            return normalRange;
        }
    }

    public static class Coding {
        @Nonnull
        private String system = null;
        @Nonnull
        private String code = null;
        @Nonnull
        private String display = null;

        @Nonnull
        public String getSystem() {
            return system;
        }

        @Nonnull
        public String getCode() {
            return code;
        }

        @Nonnull
        public String getDisplay() {
            return display;
        }
    }
}
