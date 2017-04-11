package us.vistacore.ehmp;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;
import com.google.common.collect.Iterables;
import io.dropwizard.Configuration;
import us.vistacore.aps.ApsConfiguration;
import us.vistacore.aps.VistaConfiguration;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class VeApiConfiguration extends Configuration {

    @JsonProperty("jds")
    private JdsConfiguration jdsConfiguration;

    @JsonProperty("aps")
    private ApsConfiguration apsConfiguration;

    @JsonProperty("hmp")
    private HmpConfiguration hmpConfiguration;

    @JsonProperty("vistas")
    private Map<String, VistaConfiguration> vistaMapping;

    public VeApiConfiguration() {
        super();
    }

    public JdsConfiguration getJdsConfiguration() {
         return jdsConfiguration;
    }

    public HmpConfiguration getHmpConfiguration() { return hmpConfiguration; }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("jds", jdsConfiguration == null ? "null" : jdsConfiguration.toString())
                .add("aps", apsConfiguration == null ? "null" : apsConfiguration.toString())
                .add("hmp", hmpConfiguration == null ? "null" : hmpConfiguration.toString())
                .add("vistas", vistaMapping == null ? "null" : Iterables.toString(this.vistaMapping.entrySet()))
                .toString();
    }

    public ApsConfiguration getApsConfiguration() {
        return apsConfiguration;
    }

    public List<VistaConfiguration> getVistaConfigList() {
        return new ArrayList<>(vistaMapping.values());
    }
}
