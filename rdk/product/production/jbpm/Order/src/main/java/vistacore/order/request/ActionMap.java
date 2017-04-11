package vistacore.order.request;



public enum ActionMap {

	 COMPLETE("Complete")
	,CLARIFICATION("Return for Clarification")
	,DECLINE("Decline")
	,REASSIGN("Reassign")
	;

	private String label;
	public String getLabel() {
		return label;
	}

	private ActionMap(String label) {
		this.label = label;
	}

}