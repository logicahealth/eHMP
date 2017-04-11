package us.vistacore.ehmp.model.meds;

/**
 * This class represents data for a medication prescription order
 * @author josephg
 *
 */
public class Orders {

    private String summary;
    private String orderUid;
    private String prescriptionId;
    private String ordered;
    private String providerUid;
    private String providerName;
    private String pharmacistUid;
    private String pharmacistName;
    private String fillCost;
    private String locationName;
    private String locationUid;
    private String quantityOrdered;
    private String daysSupply;
    private String fillsAllowed;
    private String fillsRemaining;
    private String vaRouting;
    private String successor;
    private String predecessor;

    public Orders(String summary, String orderUid, String prescriptionId,
            String ordered, String providerUid, String providerName,
            String pharmacistUid, String pharmacistName, String fillCost,
            String locationName, String locationUid, String quantityOrdered,
            String daysSupply, String fillsAllowed, String fillsRemaining,
            String vaRouting, String successor, String predecessor) {
        super();
        this.summary = summary;
        this.orderUid = orderUid;
        this.prescriptionId = prescriptionId;
        this.ordered = ordered;
        this.providerUid = providerUid;
        this.providerName = providerName;
        this.pharmacistUid = pharmacistUid;
        this.pharmacistName = pharmacistName;
        this.fillCost = fillCost;
        this.locationName = locationName;
        this.locationUid = locationUid;
        this.quantityOrdered = quantityOrdered;
        this.daysSupply = daysSupply;
        this.fillsAllowed = fillsAllowed;
        this.fillsRemaining = fillsRemaining;
        this.vaRouting = vaRouting;
        this.successor = successor;
        this.predecessor = predecessor;
    }

    public Orders() {
        // TODO Auto-generated constructor stub
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getOrderUid() {
        return orderUid;
    }

    public void setOrderUid(String orderUid) {
        this.orderUid = orderUid;
    }

    public String getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(String prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public String getOrdered() {
        return ordered;
    }

    public void setOrdered(String ordered) {
        this.ordered = ordered;
    }

    public String getProviderUid() {
        return providerUid;
    }

    public void setProviderUid(String providerUid) {
        this.providerUid = providerUid;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getPharmacistUid() {
        return pharmacistUid;
    }

    public void setPharmacistUid(String pharmacistUid) {
        this.pharmacistUid = pharmacistUid;
    }

    public String getPharmacistName() {
        return pharmacistName;
    }

    public void setPharmacistName(String pharmacistName) {
        this.pharmacistName = pharmacistName;
    }

    public String getFillCost() {
        return fillCost;
    }

    public void setFillCost(String fillCost) {
        this.fillCost = fillCost;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getLocationUid() {
        return locationUid;
    }

    public void setLocationUid(String locationUid) {
        this.locationUid = locationUid;
    }

    public String getQuantityOrdered() {
        return quantityOrdered;
    }

    public void setQuantityOrdered(String quantityOrdered) {
        this.quantityOrdered = quantityOrdered;
    }

    public String getDaysSupply() {
        return daysSupply;
    }

    public void setDaysSupply(String daysSupply) {
        this.daysSupply = daysSupply;
    }

    public String getFillsAllowed() {
        return fillsAllowed;
    }

    public void setFillsAllowed(String fillsAllowed) {
        this.fillsAllowed = fillsAllowed;
    }

    public String getFillsRemaining() {
        return fillsRemaining;
    }

    public void setFillsRemaining(String fillsRemaining) {
        this.fillsRemaining = fillsRemaining;
    }

    public String getVaRouting() {
        return vaRouting;
    }

    public void setVaRouting(String vaRouting) {
        this.vaRouting = vaRouting;
    }

    public String getSuccessor() {
        return successor;
    }

    public void setSuccessor(String successor) {
        this.successor = successor;
    }

    public String getPredecessor() {
        return predecessor;
    }

    public void setPredecessor(String predecessor) {
        this.predecessor = predecessor;
    }
}
