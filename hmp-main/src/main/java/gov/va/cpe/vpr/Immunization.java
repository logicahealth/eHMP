package gov.va.cpe.vpr;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonView;
import gov.va.cpe.vpr.pom.AbstractPatientObject;
import gov.va.cpe.vpr.pom.IPatientObject;
import gov.va.cpe.vpr.pom.JSONViews;
import gov.va.hmp.healthtime.PointInTime;

import java.util.List;
import java.util.Map;

public class Immunization extends AbstractPatientObject implements IPatientObject {
    private String summary;
    private String localId;
    /**
     * The facility where the encounter occurred
     *
     * @see "HITSP/C154 16.17 Facility ID"
     */
    private String facilityCode;
    /**
     * The facility where the encounter occurred
     *
     * @see "HITSP/C154 16.18 Facility Name"
     */
    private String facilityName;
    private String name;
    private PointInTime administeredDateTime;
    private Boolean contraindicated;
    private String location;
    private String seriesName;
    private String seriesUid;
    private String reactionName;
    private String reactionUid;
    private String comments;
    private String cptCode;
    private String cptName;
    private Clinician performer;
    private String performerUid;
    private String encounterUid;

    public String getPerformerUid() {
        return performerUid;
    }

    public String getEncounterUid() {
        return encounterUid;
    }

    @JsonCreator
    public Immunization(Map<String, Object> data) {
        super(data);
    }

    public Immunization() {
        super(null);
    }

    public String getSummary() {
        return getName();
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getLocalId() {
        return localId;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getName() {
        return name;
    }

    /**
     * Solr alias for 'name'.
     *
     * @see #getName()
     */
    @JsonView(JSONViews.SolrView.class)
    public String getImmunizationName() {
        return getName();
    }

    public PointInTime getAdministeredDateTime() {
        return administeredDateTime;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public Boolean getContraindicated() {
        return contraindicated;
    }

    public String getLocation() {
        return location;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getSeriesUid() {
        return seriesUid;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getReactionUid() {
        return reactionUid;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getSeriesName() {
        return seriesName;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getReactionName() {
        return reactionName;
    }

    @JsonView({JSONViews.JDBView.class, JSONViews.WSView.class, JSONViews.EventView.class})
    public String getComments() {
        return comments;
    }

    /**
     * Solr alias for 'comments'.
     *
     * @see #getComments()
     */
    @JsonView(JSONViews.SolrView.class)
    public String getComment() {
        return getComments();
    }

    public String getCptCode() {
        return cptCode;
    }

    public String getCptName() {
        return cptName;
    }

    public Clinician getPerformer() {
        return performer;
    }

    public String getKind() {
        return "Immunization";
    }

    public List getTaggers() {
//        if (uid)
//            return manualFlush { Tagger.findAllByUrl(uid) }
//        else
//            return []
        //TODO - fix this
        return null;
    }

    public String getFacilityCode() {
        return facilityCode;
    }

    public String getFacilityName() {
        return facilityName;
    }
}
