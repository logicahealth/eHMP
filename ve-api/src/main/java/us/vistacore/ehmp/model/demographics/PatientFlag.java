package us.vistacore.ehmp.model.demographics;

public class PatientFlag {

    private Long id;
    private String name;
    private String text;

    public String toString() {
        return name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getText() {
        return text;
    }
}
