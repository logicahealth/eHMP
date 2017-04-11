package us.vistacore.ehmp.model.meds;

/**
 * This class represents data for prescription administration
 * @author josephg
 */
import java.util.List;

public class Administrations {

    private List<String> value;

    public Administrations(List<String> value) {
        super();
        this.value = value;
    }

    public List<String> getValue() {
        return value;
    }

    public void setValue(List<String> value) {
        this.value = value;
    }
}
