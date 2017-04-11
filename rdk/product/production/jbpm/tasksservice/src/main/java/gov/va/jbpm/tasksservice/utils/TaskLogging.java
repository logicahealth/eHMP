package gov.va.jbpm.tasksservice.utils;

public class TaskLogging {

	/**
	 * This is a poor mans logger since we don't have log4j or sl4j in this project.
	 * It makes it so you have one centralized place where you can turn on System.out.println statements
	 * for debugging in development.
	 */
	public TaskLogging() {
		
	}
	public static void debug(String myMessage) {
		System.out.println("DEBUG: TaskLogging: " + myMessage);
	}
	public static void error(String myMessage) {
		System.out.println("ERROR: TaskLogging: " + myMessage);
	}
	public static void warn(String myMessage) {
		System.out.println("WARN: TaskLogging: " + myMessage);
	}
	public static void info(String myMessage) {
		System.out.println("INFO: TaskLogging: " + myMessage);
	}
}
