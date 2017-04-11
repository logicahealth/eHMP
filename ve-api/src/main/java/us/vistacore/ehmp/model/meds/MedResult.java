package us.vistacore.ehmp.model.meds;

import com.google.gson.annotations.SerializedName;
import us.vistacore.ehmp.model.TerminologyCode;

import java.util.ArrayList;
import java.util.List;

public class MedResult {
    private String uid;
    private String summary;
    private String pid;
    private String facilityCode;
    private String facilityName;
    private String localId;
    private String productFormCode;
    private String productFormName;
    private String sig;
    private String patientInstruction;
    private String overallStart;
    private String overallStop;
    private String stopped;
    private String medStatus;
    private String medStatusName;
    private String medType;
    private String vaType;
    private String vaStatus;
    private String supply;
    private List<Products> products;
    private List<Dosages> dosages;
    private List<Orders> orders;
    private List<Fills> fills;
    private String lastFilled;
    private String qualifiedName;
    private List<Administrations> administrations;
    private List<String> rxncodes;
    private String units;
    private String kind;

    @SerializedName("IMO")
    private String imo;

    private String name;
    private String type;
    private List<TerminologyCode> codes;


    public MedResult() {
        super();
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getPid() {
        return pid;
    }

    public void setPid(String pid) {
        this.pid = pid;
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

    public String getLocalId() {
        return localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public String getProductFormName() {
        return productFormName;
    }

    public void setProductFormName(String productFormName) {
        this.productFormName = productFormName;
    }

    public String getSig() {
        return sig;
    }

    public void setSig(String sig) {
        this.sig = sig;
    }

    public String getPatientInstruction() {
        return patientInstruction;
    }

    public void setPatientInstruction(String patientInstruction) {
        this.patientInstruction = patientInstruction;
    }

    public String getOverallStart() {
        return overallStart;
    }

    public void setOverallStart(String overallStart) {
        this.overallStart = overallStart;
    }

    public String getOverallStop() {
        return overallStop;
    }

    public void setOverallStop(String overallStop) {
        this.overallStop = overallStop;
    }

    public String getStopped() {
        return stopped;
    }

    public void setStopped(String stopped) {
        this.stopped = stopped;
    }

    public String getMedStatus() {
        return medStatus;
    }

    public void setMedStatus(String medStatus) {
        this.medStatus = medStatus;
    }

    public String getMedStatusName() {
        return medStatusName;
    }

    public void setMedStatusName(String medStatusName) {
        this.medStatusName = medStatusName;
    }

    public String getMedType() {
        return medType;
    }

    public void setMedType(String medType) {
        this.medType = medType;
    }

    public String getVaType() {
        return vaType;
    }

    public void setVaType(String vaType) {
        this.vaType = vaType;
    }

    public String getVaStatus() {
        return vaStatus;
    }

    public void setVaStatus(String vaStatus) {
        this.vaStatus = vaStatus;
    }

    public String getSupply() {
        return supply;
    }

    public void setSupply(String supply) {
        this.supply = supply;
    }

    public List<Products> getProducts() {
        return products;
    }

    public void addProducts(Products products) {
        if (this.products == null) {
            this.products = new ArrayList<Products>();
        }
        this.products.add(products);
    }

    public List<Dosages> getDosages() {
        return dosages;
    }

    public void addDosages(Dosages dosages) {
        if (this.dosages == null) {
            this.dosages = new ArrayList<Dosages>();
        }
        this.dosages.add(dosages);
    }

    public List<Orders> getOrders() {
        return orders;
    }

    public void addOrders(Orders orders) {
        if (this.orders == null) {
            this.orders = new ArrayList<Orders>();
        }
        this.orders.add(orders);
    }

    public List<Fills> getFills() {
        return fills;
    }

    public void addFills(Fills fills) {
        if (this.fills == null) {
            this.fills = new ArrayList<Fills>();
        }
        this.fills.add(fills);
    }

    public String getLastFilled() {
        return lastFilled;
    }

    public void setLastFilled(String lastFilled) {
        this.lastFilled = lastFilled;
    }

    public String getQualifiedName() {
        return qualifiedName;
    }

    public void setQualifiedName(String qualifiedName) {
        this.qualifiedName = qualifiedName;
    }

    public List<Administrations> getAdministrations() {
        return administrations;
    }

    public void addAdministrations(Administrations administrations) {
        if (this.administrations == null) {
            this.administrations =  new ArrayList<Administrations>();
        }
        this.administrations.add(administrations);
    }

    public List<String>  getRxncodes() {
        return rxncodes;
    }

    public void setRxncodes(List<String>  rxncodes) {
        this.rxncodes = rxncodes;
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getImo() {
        return imo;
    }

    public void setImo(String imo) {
        this.imo = imo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void addCodes(TerminologyCode code) {
        if (codes == null) {
            codes = new ArrayList<TerminologyCode>();
        }
        codes.add(code);
    }

    public void setCodesList(List<TerminologyCode> codesList) {
        this.codes = codesList;
    }

    public List<TerminologyCode> getCodesList() {
        return codes;
    }

    public String getProductFormCode() {
        return productFormCode;
    }

    public void setProductFormCode(String productFormCode) {
        this.productFormCode = productFormCode;
    }


}
