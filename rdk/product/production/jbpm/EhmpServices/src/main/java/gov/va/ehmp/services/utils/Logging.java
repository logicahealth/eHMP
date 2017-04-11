package gov.va.ehmp.services.utils;

public class Logging {

	/**
	 * This is a poor mans logger since we don't have log4j or sl4j in this project.
	 * It makes it so you have one centralized place where you can turn on System.out.println statements
	 * for debugging in development.
	 */
	public Logging() {
		
	}
	public static void debug(String myMessage) {
		System.out.println("DEBUG: EhmpServices: " + myMessage);
	}
	public static void error(String myMessage) {
		System.out.println("ERROR: EhmpServices: " + myMessage);
	}
	public static void warn(String myMessage) {
		System.out.println("WARN: EhmpServices: " + myMessage);
	}
	public static void info(String myMessage) {
		System.out.println("INFO: EhmpServices: " + myMessage);
	}
}
