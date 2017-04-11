package us.vistacore.ehmp.model.meds;

/**
 * This class represents data for prescription fill
 * @author josephg
 *
 */
public class Fills {

    private String summary;
    private String dispenseDate;
    private String releaseDate;
    private String quantityDispensed;
    private String daysSupplyDispensed;
    private String routing;
    private String partial;
    private String dispensingPharmacy;

    public Fills(final String summary, final String dispenseDate, final String releaseDate, final String quantityDispensed,
            final String daysSupplyDispensed, final String routing, final String partial) {
        super();
        this.summary = summary;
        this.dispenseDate = dispenseDate;
        this.releaseDate = releaseDate;
        this.quantityDispensed = quantityDispensed;
        this.daysSupplyDispensed = daysSupplyDispensed;
        this.routing = routing;
        this.partial = partial;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(final String summary) {
        this.summary = summary;
    }

    public String getDispenseDate() {
        return dispenseDate;
    }

    public void setDispenseDate(final String dispenseDate) {
        this.dispenseDate = dispenseDate;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(final String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getQuantityDispensed() {
        return quantityDispensed;
    }

    public void setQuantityDispensed(final String quantityDispensed) {
        this.quantityDispensed = quantityDispensed;
    }

    public String getDaysSupplyDispensed() {
        return daysSupplyDispensed;
    }

    public void setDaysSupplyDispensed(final String daysSupplyDispensed) {
        this.daysSupplyDispensed = daysSupplyDispensed;
    }

    public String getRouting() {
        return routing;
    }

    public void setRouting(final String routing) {
        this.routing = routing;
    }

    public String getPartial() {
        return partial;
    }

    public void setPartial(final String partial) {
        this.partial = partial;
    }

    public String getDispensingPharmacy() {
        return dispensingPharmacy;
    }

    public void setDispensingPharmacy(String dispensingPharmacy) {
        this.dispensingPharmacy = dispensingPharmacy;
    }
}
