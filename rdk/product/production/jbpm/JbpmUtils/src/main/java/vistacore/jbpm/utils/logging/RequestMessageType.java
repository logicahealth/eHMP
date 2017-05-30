package vistacore.jbpm.utils.logging;

	public enum RequestMessageType {
		INCOMING_RESPONSE("Incoming Response"),
		OUTGOING_RESPONSE("Outgoing Response"),
		INCOMING_REQUEST("Incoming Request"),
		OUTGOING_REQUEST("Outgoing Request");
		
		private String type;
		public String getType(){
			return type;	
		}
		RequestMessageType(String type){
			this.type = type;
		}
}
