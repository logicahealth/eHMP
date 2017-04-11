package us.vistacore.ehmp.model.labresults;

import us.vistacore.ehmp.model.TerminologyCode;

import java.util.ArrayList;
import java.util.List;
/**
 * This class represents the data for a single lab resultsList retrieved from Vista.
 */
public class LabResult {
    private String sourceVistaSite;

    // VPR data attributes
    private String bactRemarks;
    private String categoryCode;
    private String categoryName;
    private String comment;
    private String displayName;
    private String displayOrder;
    private String facilityCode;
    private String facilityName;
    private List<GramStain> gramStain;
    private String groupName;
    private String groupUid;
    private String high;
    private String interpretationCode;
    private String interpretationName;
    private String labOrderId;
    private String localId;
    private String low;
    private String observed;
    private String orderUid;
    private List<Organism> organisms;
    private String organismQty;
    private String organizerType;
    private String result;
    private String resulted;
    private List<Results> results;
    private String resultNumber;
    private String sample;
    private String specimen;
    private String statusCode;
    private String statusName;
    private String summary;
    private String typeCode;
    private String typeId;
    private String typeName;
    private String uid;
    private String units;
    private String urineScreen;
    private String vuid;
    private List<TerminologyCode> codes;

    public String getOrderUid() {
        return orderUid;
    }

    public void setOrderUid(String orderUid) {
        this.orderUid = orderUid;
    }

    public String getOrganismQty() {
        return organismQty;
    }

    public void setOrganismQty(String organismQty) {
        this.organismQty = organismQty;
    }

    public String getOrganizerType() {
        return organizerType;
    }

    public void setOrganizerType(String organizerType) {
        this.organizerType = organizerType;
    }

    public List<Results> getResults() {
        return results;
    }

    public void addResults(Results r) {
        if (this.results == null) {
            this.results = new ArrayList<Results>();
        }
        this.results.add(r);
    }

    public static class GramStain {
        private String result;

        public GramStain(String result) {
            this.result = result;
        }

        public String getResult() {
            return result;
        }

        public void setResult(String result) {
            this.result = result;
        }
    }

    public static class Organism {
        private String name;
        private String qty;
        private List<Drugs> drugs;

        public Organism(String name, String qty, List<Drugs> drugs) {
            this.name = name;
            this.qty = qty;
            this.drugs = drugs;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getQty() {
            return qty;
        }

        public void setQty(String qty) {
            this.qty = qty;
        }

        public List<Drugs> getDrugs() {
            return drugs;
        }

        public void addDrugs(Drugs drugs) {
            if (this.drugs == null) {
                this.drugs = new ArrayList<Drugs>();
            }
            this.drugs.add(drugs);
        }

        public static class Drugs {
            private String interp;
            private String name;
            private String result;
            private String restrict;

            public Drugs(String interp, String name, String result, String restrict) {
                this.interp = interp;
                this.name = name;
                this.result = result;
                this.restrict = restrict;
            }

            public Drugs(String interp, String name, String result) {
                this.interp = interp;
                this.name = name;
                this.result = result;
            }

            public String getInterp() {
                return interp;
            }
            public void setInterp(String interp) {
                this.interp = interp;
            }
            public String getName() {
                return name;
            }
            public void setName(String name) {
                this.name = name;
            }
            public String getResult() {
                return result;
            }
            public void setResult(String result) {
                this.result = result;
            }
            public String getRestrict() {
                return restrict;
            }
            public void setRestrict(String restrict) {
                this.restrict = restrict;
            }
        }
    }

    public static class Results {
        private String localTitle;
        private String nationalTitle;
        private String resultUid;
        private String uid;

        public Results(String localTitle, String nationalTitle, String resultUid, String uid) {
            this.localTitle = localTitle;
            this.nationalTitle = nationalTitle;
            this.resultUid = resultUid;
            this.uid = uid;
        }

        public String getLocalTitle() {
            return localTitle;
        }

        public void setLocalTitle(String localTitle) {
            this.localTitle = localTitle;
        }

        public String getResultUid() {
            return resultUid;
        }

        public void setResultUid(String resultUid) {
            this.resultUid = resultUid;
        }

        public String getUid() {
            return uid;
        }

        public void setUid(String uid) {
            this.uid = uid;
        }

        public String getNationalTitle() {
            return nationalTitle;
        }

        public void setNationalTitle(String nationalTitle) {
            this.nationalTitle = nationalTitle;
        }
    }

    public LabResult() {
        super();
    }

    public String getBactRemarks() {
        return bactRemarks;
    }

    public void setBactRemarks(String bactRemarks) {
        this.bactRemarks = bactRemarks;
    }

    /**
     * Return the source vista site.
     *
     * @return The source vista site.
     */
    public String getSourceVistaSite() {
        return sourceVistaSite;
    }

    /**
     * Set the source vista site.
     *
     * @param sourceVistaSite
     *            The source vista site.
     */
    public void setSourceVistaSite(String sourceVistaSite) {
        this.sourceVistaSite = sourceVistaSite;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getFacilityCode() {
        return facilityCode;
    }

    public void setFacilityCode(String facilityCode) {
        this.facilityCode = facilityCode;
    }

    public String getFacilityName() {
        return facilityName;
    }

    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getGroupUid() {
        return groupUid;
    }

    public void setGroupUid(String groupUid) {
        this.groupUid = groupUid;
    }

    public String getHigh() {
        return high;
    }

    public void setHigh(String high) {
        this.high = high;
    }

    public String getInterpretationCode() {
        return interpretationCode;
    }

    public void setInterpretationCode(String interpretationCode) {
        this.interpretationCode = interpretationCode;
    }

    public String getInterpretationName() {
        return interpretationName;
    }

    public void setInterpretationName(String interpretationName) {
        this.interpretationName = interpretationName;
    }

    public String getLabOrderId() {
        return labOrderId;
    }

    public void setLabOrderId(String labOrderId) {
        this.labOrderId = labOrderId;
    }

    public String getLocalId() {
        return localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public String getLow() {
        return low;
    }

    public void setLow(String low) {
        this.low = low;
    }

    public String getObserved() {
        return observed;
    }

    public void setObserved(String observed) {
        this.observed = observed;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getResulted() {
        return resulted;
    }

    public void setResulted(String resulted) {
        this.resulted = resulted;
    }

    public String getSample() {
        return sample;
    }

    public void setSample(String sample) {
        this.sample = sample;
    }

    public String getSpecimen() {
        return specimen;
    }

    public void setSpecimen(String specimen) {
        this.specimen = specimen;
    }

    public String getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(String statusCode) {
        this.statusCode = statusCode;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }

    public String getTypeId() {
        return typeId;
    }

    public void setTypeId(String typeId) {
        this.typeId = typeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public String getVuid() {
        return vuid;
    }

    public void setVuid(String vuid) {
        this.vuid = vuid;
    }

    public List<GramStain> getGramStain() {
        return gramStain;
    }

    public void addGramStain(GramStain gramStain) {
        if (this.gramStain == null) {
            this.gramStain = new ArrayList<GramStain>();
        }
        this.gramStain.add(gramStain);
    }

    public List<Organism> getOrganisms() {
        return organisms;
    }

    public void addOrganism(Organism organism) {
        if (this.organisms == null) {
            this.organisms = new ArrayList<Organism>();
        }
        this.organisms.add(organism);
    }

    public String getResultNumber() {
        return resultNumber;
    }

    public void setResultNumber(String resultNumber) {
        this.resultNumber = resultNumber;
    }

    public String getUrineScreen() {
        return urineScreen;
    }

    public void setUrineScreen(String urineScreen) {
        this.urineScreen = urineScreen;
    }

    public String getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(String displayOrder) {
        this.displayOrder = displayOrder;
    }

    /**
     * Add code to the list of codes.
     * @param code The code to be added to the list.
     */
    public void addCodes(TerminologyCode code) {
        if (codes == null) {
            codes = new ArrayList<TerminologyCode>();
        }
        codes.add(code);
    }

    /**
     * Set the codes list to be the given code list.
     * @param codesList The code list to be set.
     */
    public void setCodesList(List<TerminologyCode> codesList) {
        this.codes = codesList;
    }

    /**
     * Retrieve the list of codes.
     * @return The list of codes
     */
    public List<TerminologyCode> getCodesList() {
        return codes;
    }


}
