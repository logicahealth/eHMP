package gov.va.cpe.vpr.ws.link;

public enum LinkRelation {
    SELF("self"),
    NEXT("next"),
    PREVIOUS("previous"),
    PATIENT("http://vaww.cpe.domain.ext/rels/patient"),
    TREND("http://vaww.cpe.domain.ext/rels/trend"),
    OPEN_INFO_BUTTON("http://vaww.cpe.domain.ext/rels/openinfobutton");

    private LinkRelation(String rel) {
        this.rel = rel;
    }

    @Override
    public String toString() {
        return rel;
    }

    private String rel;
}
