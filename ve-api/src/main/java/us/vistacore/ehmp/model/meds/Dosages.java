package us.vistacore.ehmp.model.meds;

/**
 * This class represents data for the dosage of a medication
 * @author josephg
 */
public class Dosages {

    private String summary;
    private String dose;
    private String units;
    private String routeName;
    private String scheduleName;
    private String scheduleType;
    private String start;
    private String stop;
    private String relativeStart;
    private String relativeStop;
    private String scheduleFreq;
    private String startDateString;
    private String stopDateString;
    private String complexDuration;
    private String ivRate;
    private String adminTimes;
    private String duration;
    private String amount;
    private String noun;
    private String instructions;

    public Dosages(String summary, String dose, String units, String routeName,
           String scheduleName, String scheduleType, String start,
           String stop, String relativeStart, String relativeStop,
           String scheduleFreq, String startDateString, String stopDateString,
           String complexDuration, String doseVal, String ivRate, String adminTimes,
           String duration, String relatedOrder, String complexConjunction) {
        super();
        this.summary = summary;
        this.dose = dose;
        this.units = units;
        this.routeName = routeName;
        this.scheduleName = scheduleName;
        this.scheduleType = scheduleType;
        this.start = start;
        this.stop = stop;
        this.relativeStart = relativeStart;
        this.relativeStop = relativeStop;
        this.scheduleFreq = scheduleFreq;
        this.startDateString = startDateString;
        this.stopDateString = stopDateString;
        this.complexDuration = complexDuration;
        this.ivRate = ivRate;
        this.adminTimes = adminTimes;
        this.duration = duration;
    }

    public Dosages() {
        // TODO Auto-generated constructor stub
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getScheduleName() {
        return scheduleName;
    }

    public void setScheduleName(String scheduleName) {
        this.scheduleName = scheduleName;
    }

    public String getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(String scheduleType) {
        this.scheduleType = scheduleType;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getStop() {
        return stop;
    }

    public void setStop(String stop) {
        this.stop = stop;
    }

    public String getRelativeStart() {
        return relativeStart;
    }

    public void setRelativeStart(String relativeStart) {
        this.relativeStart = relativeStart;
    }

    public String getRelativeStop() {
        return relativeStop;
    }

    public void setRelativeStop(String relativeStop) {
        this.relativeStop = relativeStop;
    }

    public String getScheduleFreq() {
        return scheduleFreq;
    }

    public void setScheduleFreq(String scheduleFreq) {
        this.scheduleFreq = scheduleFreq;
    }

    public String getStartDateString() {
        return startDateString;
    }

    public void setStartDateString(String startDateString) {
        this.startDateString = startDateString;
    }

    public String getStopDateString() {
        return stopDateString;
    }

    public void setStopDateString(String stopDateString) {
        this.stopDateString = stopDateString;
    }

    public String getComplexDuration() {
        return complexDuration;
    }

    public void setComplexDuration(String complexDuration) {
        this.complexDuration = complexDuration;
    }

    public String getIvRate() {
        return ivRate;
    }

    public void setIvRate(String ivRate) {
        this.ivRate = ivRate;
    }

    public String getAdminTimes() {
        return adminTimes;
    }

    public void setAdminTimes(String adminTimes) {
        this.adminTimes = adminTimes;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getNoun() {
        return noun;
    }

    public void setNoun(String noun) {
        this.noun = noun;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
