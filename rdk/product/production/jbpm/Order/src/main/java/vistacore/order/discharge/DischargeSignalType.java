package vistacore.order.discharge;

public enum DischargeSignalType {
    COMPLETE("COMPLETE","Completed","Completed by CPRS/VistA", "Completed: Successful"),
    END("END","Follow-up Ended","", "Discontinued"),
    TIMEOUT("TIME-OUT","Follow-Up Ended","Timed Out", "Discontinued: Timed Out");

    private String action;

    public String getAction() {
        return action;
    }

    private String name;

    public String getName() {
        return name;
    }

    private String history;

    public String getHistory() {
        return history;
    }

    private String state;
    public String getState() {
        return state;
    }

    private DischargeSignalType(String name, String action, String history, String state) {
        this.name = name;
        this.action = action;
        this.history = history;
        this.state = state;
    }
}