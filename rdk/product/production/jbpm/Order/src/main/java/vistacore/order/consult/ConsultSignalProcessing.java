package vistacore.order.consult;

import org.jboss.logging.Logger;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;

import vistacore.order.Facility;
import vistacore.order.Provider;
import vistacore.order.Visit;
import vistacore.order.exception.OrderException;
import vistacore.order.kie.utils.WorkflowProcessInstanceUtil;

import org.kie.api.runtime.process.ProcessInstance; 
import org.kie.api.runtime.process.WorkflowProcessInstance;

/**
 * Provides script contents for consult activity signals
 * @author sam.amer
 *
 */
public class ConsultSignalProcessing implements java.io.Serializable {
	private static final long serialVersionUID = -5667906299526274579L;
	
	public ConsultSignalProcessing() {
	}
	private static final String noHistoryText = " "; //for signals without a history text, use a space instead of null
	private static final Logger LOGGER = Logger.getLogger(ConsultSignalProcessing.class);
	

	/**
	 * Processes RELEASE.EWL signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processReleaseEWLSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processReleaseEWLSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			Signal signal = new Signal();
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");

			String state = StatesMap.getActivitystate().get("Scheduling");
			String signalName = "RELEASE.EWL";
			String signalOwner = "Process: " + Long.toString(processInstance.getId());
			String signalAction = "Release from Electronic Waiting List (EWL)";
			String signalHistory = "";

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					signal.setActionText(signalAction);
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}

				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? noHistoryText : s_signalBody.getComment());
			}

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state", state);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			
			List<Signal> newSignals;
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			else {
				newSignals = new ArrayList<Signal>();
			}
			
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseEWLSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseEWLSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}

	}

	/**
	 * Processes APPT.CANCELED signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processApptCanceledSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processApptCanceledSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();

			workflowProcessInstance.setVariable("formAction","canceled");
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			String signalName = "APPT.CANCELED";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Cancel Appointment";
			String signalHistory = "";

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getReason()) ? "" : s_signalBody.getReason());
				if (s_signalBody.getReason() != null) {
					String reason = s_signalBody.getReason();
					signalHistory = reason + " : ";
					if (reason.indexOf("canceled previous") >= 0) {
						state = StatesMap.getActivitystate().get("PatientCanceled");
					}
					if (reason.indexOf("no-showed previous") >= 0) {
						state = StatesMap.getActivitystate().get("NoShow");
					}
					if (reason.indexOf("left without being seen") >= 0) {
						state = StatesMap.getActivitystate().get("NotSeen");
					}
					if (reason.indexOf("Clinic canceled") >= 0) {
						state = StatesMap.getActivitystate().get("ClinicCanceled");
					}
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
				if (signalHistory.length() == 0) {
					signalHistory = noHistoryText;
				}
			}
			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setExecutionDateTime(currentDateString);

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);

			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					vistacore.order.Appointment t_appointment = newAppointments.get(lastAppointmentIndex);
					appointment.setType(t_appointment.getType());
					appointment.setEwl(t_appointment.getEwl());
					apptStatus.setId("4");
					apptStatus.setName("No-show");
					appointment.setStatus(apptStatus);
					newAppointments.add(appointment);
				}
				ccData.setAppointments(newAppointments);
			}
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
			workflowProcessInstance.signalEvent("toTriage", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptCanceledSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptCanceledSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Sets state:substate when appointment is one day after scheduled date 
	 * Called from: Process Appt In Past (script)
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processApptInPastTimer(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processApptInPastTimer");
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");

			String state = StatesMap.getActivitystate().get("ApptInPast");
			workflowProcessInstance.setVariable("state",state);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptInPastTimer: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptInPastTimer: An unexpected condition has happened: %s", e.getMessage()) ,e);
		}
	}

	/**
	 * Processes APPT.KEPT signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processApptKeptSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processApptKeptSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();

			String signalName = "APPT.KEPT";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Appointment Checked Out";
			String signalHistory = "";
			String state = StatesMap.getActivitystate().get("CheckedOut");

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					signal.setActionText(signalAction);
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory = (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? noHistoryText : s_signalBody.getComment());
			}

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state", state);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					vistacore.order.Appointment t_appointment = newAppointments.get(lastAppointmentIndex);
					appointment.setType(t_appointment.getType());
					appointment.setEwl(t_appointment.getEwl());
					appointment.setDate(t_appointment.getDate());
					appointment.setClinic(t_appointment.getClinic());
					appointment.setProvider(t_appointment.getProvider());
					apptStatus.setId("3");
					apptStatus.setName("Checked-out");
					appointment.setStatus(apptStatus);
					newAppointments.add(appointment);
				}
				ccData.setAppointments(newAppointments);
			}
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptKeptSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processApptKeptSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes RESCHEDULE signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processRescheduleSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processRescheduleSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<Schedule> newSchedules = new java.util.ArrayList<Schedule>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			Schedule schedule = new Schedule();
			vistacore.order.AppointmentType apptType = new vistacore.order.AppointmentType();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();
			vistacore.order.Facility clinic = new vistacore.order.Facility();

			String signalName = "RESCHEDULE";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Reschedule";
			StringBuilder signalHistory = new StringBuilder();

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null)
					signalOwner = s_signalBody.getExecutionUserId();

				signal.setExecutionUserId(signalOwner);
				
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					signal.setActionText(signalAction);
				}
				
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				
				//signal.history: <Reschedule: Scheduled Date>, <Reschedule: Clinic> (<Reschedule: Provider> ) : <Reschedule: Comment>
				if (!ConsultHelperUtil.isEmptyString(s_signalBody.getScheduledDate())) {
					signalHistory.append(s_signalBody.getScheduledDate());
				}
				
				Facility facility = s_signalBody.getClinic();
				if (facility != null && !ConsultHelperUtil.isEmptyString(facility.getName())) {
					if (signalHistory.length() > 0) {
						signalHistory.append(", ");
					}
					signalHistory.append(facility.getName());
				}
	
				Provider provider = s_signalBody.getProvider();
				if (provider != null && !ConsultHelperUtil.isEmptyString(provider.getDisplayName())) {
					signalHistory.append(String.format(" (%s)", provider.getDisplayName()));
				}
				
				if (!ConsultHelperUtil.isEmptyString(s_signalBody.getComment())) {
					if (signalHistory.length() > 0) {
						signalHistory.append(" : ");
					}
					signalHistory.append(s_signalBody.getComment());
				}
			}
			if (signalHistory.toString().trim().length() == 0) {
				signalHistory = new StringBuilder(noHistoryText);
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);

			workflowProcessInstance.setVariable("signalHistory", signalHistory.toString().trim());

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			if (ccData.getSchedules() != null) {
				newSchedules = ccData.getSchedules();
			}

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
			}

			appointment.setEwl(false);

			String schAction = "Scheduled";
			apptType.setId("1");
			apptType.setName("VA");
			apptStatus.setId("2");
			apptStatus.setName("Scheduled");
			appointment.setDate(s_signalBody.getScheduledDate());
			Facility signalBodyClinic = s_signalBody.getClinic();
			if (signalBodyClinic == null)
				throw new OrderException("signalBodyClinic was null");
			clinic.setName(signalBodyClinic.getName());
			appointment.setClinic(clinic);
			Provider signalBodyProvider = s_signalBody.getProvider();
			if (signalBodyProvider == null)
				throw new OrderException("signalBodyProvider was null");
			appointment.setProvider(signalBodyProvider.getDisplayName());
			DateTime compareDate = new DateTime().withTime(0, 0, 0, 0);
			DateTimeFormatter formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
			String apptDateStr = s_signalBody.getScheduledDate();
			if (ConsultHelperUtil.isEmptyString(apptDateStr))
				throw new OrderException("apptDateStr was null");
			DateTime apptDate;
			try {
				apptDate = formatter.parseDateTime(apptDateStr);
			} catch (Exception e) {
				throw new OrderException("apptDateStr was unable to be parsed: " + e.getMessage());
			}
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			if (apptDate.isBefore(compareDate)) {
				state = StatesMap.getActivitystate().get("ApptInPast");
			} else {
				state = StatesMap.getActivitystate().get("ApptBooked");
			}
			workflowProcessInstance.setVariable("state",state);

			appointment.setType(apptType);
			appointment.setStatus(apptStatus);

			schedule.setActionText(schAction);
			schedule.setComment(s_signalBody.getComment());
			schedule.setExecutionUserId(s_signalBody.getExecutionUserId());
			schedule.setExecutionUserName(s_signalBody.getExecutionUserName());
			schedule.setExecutionDateTime(currentDateString);
			if (apptType.getId() != null) {
				schedule.setAppointment(appointment);
				newAppointments.add(appointment);
				ccData.setAppointments(newAppointments);
			}

			newSchedules.add(schedule);
			ccData.setSchedules(newSchedules);
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processRescheduleSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processRescheduleSignal: An unexpected condition has happened: %s", e.getMessage()) , e);
		}
	}

	/**
	 * Processes CLAIM signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processClaimSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processClaimSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			vistacore.order.Visit visit = new vistacore.order.Visit();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = null;
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			vistacore.order.Completion completion = new vistacore.order.Completion();

			String noteUid = s_signalBody.getNoteClinicalObjectUid();
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getCompletion() != null) {
					completion = ccData.getCompletion();
			}
			if (noteUid != null && !noteUid.isEmpty()) {
				String signalName = "CLAIM";
				String signalOwner = "Process: " + processInstance.getId();
				String signalAction = "Associate Note";
				String signalHistory = noHistoryText;

				if (s_signalBody != null) {
					if (s_signalBody.getExecutionUserId() != null) {
						signalOwner = s_signalBody.getExecutionUserId();
						completion.setExecutionUserId(s_signalBody.getExecutionUserId());
						signal.setExecutionUserId(s_signalBody.getExecutionUserId());
					}
					if (s_signalBody.getExecutionUserName() != null) {
						signal.setExecutionUserName(s_signalBody.getExecutionUserName());
						completion.setExecutionUserName(s_signalBody.getExecutionUserName());
					}
					if (s_signalBody.getActionText() != null) {
						signalAction = s_signalBody.getActionText();
						completion.setActionText(signalAction);
						signal.setActionText(signalAction);
					}
					if (s_signalBody.getActionId() != null) {
						completion.setActionId(s_signalBody.getActionId());
						signal.setActionId(s_signalBody.getActionId());
					}
					if (s_signalBody.getNoteTitle() != null) {
						completion.setNoteTitle(s_signalBody.getNoteTitle());
					}
					completion.setComment(ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
					if (s_signalBody.getVisit() != null) {
						visit.setLocation(s_signalBody.getVisit().getLocation());
						visit.setLocationDesc(s_signalBody.getVisit().getLocationDesc());
						visit.setServiceCategory(s_signalBody.getVisit().getServiceCategory());
						visit.setDateTime(s_signalBody.getVisit().getDateTime());
						completion.setVisit(visit);
					}
				}
				
				workflowProcessInstance.setVariable("signalName", signalName);
				workflowProcessInstance.setVariable("signalOwner", signalOwner);
				workflowProcessInstance.setVariable("signalAction", signalAction);
				workflowProcessInstance.setVariable("signalHistory", signalHistory);
				String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
				workflowProcessInstance.setVariable("prevOrderState", state);
				
				if (ccData.getAppointments() != null) {
					newAppointments = ccData.getAppointments();
					int lastAppointmentIndex = newAppointments.size() -1;
					if (lastAppointmentIndex >= 0) {
						appointment = newAppointments.get(lastAppointmentIndex);
					}
				}
				
				if (appointment != null && appointment.getType().getName().equalsIgnoreCase("eConsult")) {
					state = StatesMap.getActivitystate().get("eConsultComplete");
				} else if (state.startsWith("Scheduling")){
					state = StatesMap.getActivitystate().get("CompleteScheduling");
					workflowProcessInstance.signalEvent("terminateScheduling", null);
					workflowProcessInstance.signalEvent("toComplete", null);
				} else {
					state = StatesMap.getActivitystate().get("CompleteScheduled");				
				}
				
				workflowProcessInstance.setVariable("state",state);
				workflowProcessInstance.setVariable("formAction","claimed");

				completion.setNoteClinicalObjectUid(noteUid);
				completion.setExecutionDateTime(currentDateString);
				ccData.setCompletion(completion);

				signal.setName("CLAIM");
				signal.setExecutionDateTime(currentDateString);
				Gson gson = new Gson();
				String signalData = gson.toJson(s_signalBody);
				signal.setData(signalData);

				if (ccData.getSignals() != null) {
					newSignals = ccData.getSignals();
				}
				newSignals.add(signal);
				ccData.setSignals(newSignals);

				vistacore.order.Order order;
				if (ccData.getOrder() != null) {
					order = ccData.getOrder();
				} else {
					order = new vistacore.order.Order();
				}
				
				vistacore.order.Activity activity;
				if (ccData.getActivity() != null) {
					activity = ccData.getActivity();
				} else {
					activity = new vistacore.order.Activity();
				}
				order.setStatus(ConsultHelperUtil.getStatusFromState(state));
				activity.setState(state);
				ccData.setOrder(order);
				ccData.setActivity(activity);
				consultClinicalObject.setData(ccData);
				ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

				workflowProcessInstance.signalEvent("saveSignalClinObj", null);

			} else {
				workflowProcessInstance.setVariable("formAction","ignored");
				LOGGER.debug("ConsultSignalProcessing.processClaimSignal: CLAIM Signal Ignored...");
			}
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processClaimSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processClaimSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes RELEASE.CONSULT signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processReleaseConsultSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processReleaseConsultSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = null;
			vistacore.order.Completion completion = new vistacore.order.Completion();

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");

			if (ccData.getCompletion() != null) {
				completion = ccData.getCompletion();
			}

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					appointment = newAppointments.get(lastAppointmentIndex);
				}
			}

			String signalName = "RELEASE.CONSULT";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Disassociate note";
			String signalHistory = "";

			workflowProcessInstance.setVariable("formAction","released");
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			if (state.equals(StatesMap.getActivitystate().get("CompleteScheduling"))){
				state = (String) workflowProcessInstance.getVariable("prevOrderState");
				workflowProcessInstance.signalEvent("toScheduling", null);
				workflowProcessInstance.signalEvent("terminateCompletion", null);
			} else if (appointment != null) {
				if (appointment.getType().getName().equalsIgnoreCase("eConsult")) {
					state = StatesMap.getActivitystate().get("eConsult");
				} else {
					state = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "prevOrderState");
					if (appointment.getStatus().getId().equals("4")) {
						state = StatesMap.getActivitystate().get("CheckedOut");
					} else if (appointment.getStatus().getId().equals("2")) { //Scheduled
						DateTime compareDate = new DateTime().withTime(0, 0, 0, 0);
						DateTimeFormatter formatter = DateTimeFormat.forPattern("MM/dd/yyyy");
						String apptDateStr = appointment.getDate();
						if (ConsultHelperUtil.isEmptyString(apptDateStr))
							throw new OrderException("apptDateStr was null");
						DateTime apptDate;
						try {
							apptDate = formatter.parseDateTime(apptDateStr);
						} catch (Exception e) {
							throw new OrderException("apptDateStr was unable to be parsed: " + e.getMessage());
						}
						DateTime apptDatePlusSeven = apptDate.plusDays(7);
						if (apptDatePlusSeven.isBefore(compareDate)) {
							state = StatesMap.getActivitystate().get("ActionRequired");
						} else if (apptDate.isBefore(compareDate)) {
							state = StatesMap.getActivitystate().get("ApptInPast");
						} else {
							state = StatesMap.getActivitystate().get("ApptBooked");
						}
					}
				}
			}

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					completion.setExecutionUserId(signalOwner);
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					completion.setExecutionUserName(s_signalBody.getExecutionUserName());
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					completion.setActionText(signalAction);
					signal.setActionText(signalAction);
				}
				if (s_signalBody.getActionId() != null) {
					completion.setActionId(s_signalBody.getActionId());
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? " " : s_signalBody.getComment());
				completion.setComment(s_signalBody.getComment() == null ? "" : " " + s_signalBody.getComment());
			}

			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);

			workflowProcessInstance.setVariable("state",state);

			completion.setNoteClinicalObjectUid("");
			completion.setNoteTitle("");
			completion.setExecutionDateTime(currentDateString);
			ccData.setCompletion(completion);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseConsultSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseConsultSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes COMPLETE signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processCompleteSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processCompleteSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getRequiredSignalBody(workflowProcessInstance, "s_signalBody");
			vistacore.order.Visit visit = new vistacore.order.Visit();
			vistacore.order.Completion completion = new vistacore.order.Completion();
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getCompletion() != null) {
				completion = ccData.getCompletion();
			}

			String state = WorkflowProcessInstanceUtil.getOptionalString(workflowProcessInstance, "state");
			String noteUid = completion.getNoteClinicalObjectUid();
			if ((!ConsultHelperUtil.isEmptyString(noteUid) && noteUid.equals(s_signalBody.getNoteClinicalObjectUid())) || (ConsultHelperUtil.isEmptyString(noteUid) && s_signalBody.getActionText() != null && s_signalBody.getActionId() != null)) {
				if (ccData.getSignals() != null) {
					newSignals = ccData.getSignals();
				}
				workflowProcessInstance.setVariable("formAction","completed");
				workflowProcessInstance.setVariable("activityHealthy", true);
				workflowProcessInstance.setVariable("activityHealthDescription","");
				String action = s_signalBody.getActionText();
				if (action.equalsIgnoreCase("Completed, Admin")) {
					state = StatesMap.getActivitystate().get("CompleteAdmin");
				} else if (action.equalsIgnoreCase("Completed, by Note")) {
					state = StatesMap.getActivitystate().get("CompleteNote");
				} else if (action.equalsIgnoreCase("Completed, Community Care")) {
					state = StatesMap.getActivitystate().get("CompleteCommCare");
				} else if (action.equalsIgnoreCase("Completed, eConsult")) {
					state = StatesMap.getActivitystate().get("CompleteEConsult");
				}
				workflowProcessInstance.setVariable("state",state);

				if (s_signalBody.getVisit() != null) {
					Visit signalBodyVisit = s_signalBody.getVisit();
					visit.setLocation(signalBodyVisit.getLocation());
					visit.setLocationDesc(signalBodyVisit.getLocationDesc());
					visit.setServiceCategory(signalBodyVisit.getServiceCategory());
					visit.setDateTime(signalBodyVisit.getDateTime());
					completion.setVisit(visit);
				}

				String signalName = "COMPLETE";
				String signalOwner = "Process: " + processInstance.getId();
				String signalAction = "";
				String signalHistory = "";

				if (s_signalBody != null) {
					if (s_signalBody.getExecutionUserId() != null) {
						String[] uidParts = s_signalBody.getExecutionUserId().split(":");
						if (uidParts.length > 2) {
							signalOwner = uidParts[3] + ";" + uidParts[4];
						} else {
							signalOwner = s_signalBody.getExecutionUserId();
						}
						completion.setExecutionUserId(s_signalBody.getExecutionUserId());
						signal.setExecutionUserId(s_signalBody.getExecutionUserId());
					}
					if (s_signalBody.getExecutionUserName() != null) {
						completion.setExecutionUserName(s_signalBody.getExecutionUserName());
						signal.setExecutionUserName(s_signalBody.getExecutionUserName());
					}
					if (s_signalBody.getActionText() != null) {
						signalAction += s_signalBody.getActionText();
						completion.setActionText(s_signalBody.getActionText());
					}
					if (s_signalBody.getActionId() != null) {
						completion.setActionId(s_signalBody.getActionId());
						signal.setActionId(s_signalBody.getActionId());
					}
					if (completion.getNoteTitle() != null) {
						signalHistory = completion.getNoteTitle() + " : ";
					}
					signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
					completion.setComment(ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
				}
				
				if (signalHistory.length() == 0) {
					signalHistory = noHistoryText;
				}
				completion.setExecutionDateTime(currentDateString);
				workflowProcessInstance.setVariable("signalName", signalName);
				workflowProcessInstance.setVariable("signalOwner", signalOwner);
				workflowProcessInstance.setVariable("signalAction", signalAction);
				workflowProcessInstance.setVariable("signalHistory", signalHistory);

				ccData.setCompletion(completion);

				signal.setName(signalName);
				signal.setActionText(signalAction);
				signal.setHistory(signalHistory);
				signal.setExecutionDateTime(currentDateString);
				Gson gson = new Gson();
				String signalData = gson.toJson(s_signalBody);
				signal.setData(signalData);

				newSignals.add(signal);
				ccData.setSignals(newSignals);

				vistacore.order.Order order;
				if (ccData.getOrder() != null) {
					order = ccData.getOrder();
				} else {
					order = new vistacore.order.Order();
				}
				
				vistacore.order.Activity activity;
				if (ccData.getActivity() != null) {
					activity = ccData.getActivity();
				} else {
					activity = new vistacore.order.Activity();
				}
				order.setStatus(ConsultHelperUtil.getStatusFromState(state));
				activity.setState(state);
				ccData.setOrder(order);
				ccData.setActivity(activity);
				consultClinicalObject.setData(ccData);
				ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

				String author = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator");
				String instanceName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "instanceName");
				String patientUid = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "patientUid");
				if (patientUid.length() < 5)
					throw new OrderException("patientUid was not in the correct format: length is less than 5: " + patientUid);
				String patientId = patientUid.split(":")[3] + ";" + patientUid.split(":")[4];
				String notificationTaskId = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "notificationTaskId");
				
				String dateString = ConsultHelperUtil.getCurrentDateStringNotificationExpiration();

				String subject = "Consult " + instanceName + " Completed";
				String message = "Consult " + instanceName	+ " has been completed on {dateString}";

				String jsonString = ConsultHelperUtil.buildNotificationJson(author, subject, message, patientId, notificationTaskId, dateString);
				
				workflowProcessInstance.setVariable("tmp_notificationJSON",jsonString);

				workflowProcessInstance.signalEvent("saveSignalClinObj", null);
				workflowProcessInstance.signalEvent("completionStarted", null);

			} else {
				workflowProcessInstance.setVariable("formAction","ignored");
			}
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCompleteSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCompleteSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes RELEASE.ECONSULT signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processReleaseEConsultSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processReleaseEConsultSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.Completion completion = new vistacore.order.Completion();

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");

			if (ccData.getCompletion() != null) {
				completion = ccData.getCompletion();
			}

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					appointment = newAppointments.get(lastAppointmentIndex);
				}
			}

			if (appointment.getType().getName().equalsIgnoreCase("eConsult")) {
				String signalName = "RELEASE.ECONSULT";
				String signalOwner = "Process: " + processInstance.getId();
				String signalAction = "Cancel eConsult";
				String signalHistory = "";
				String state = StatesMap.getActivitystate().get("UnderReview");
				vistacore.order.Appointment t_appointment = new vistacore.order.Appointment();
				vistacore.order.AppointmentType apptType = new vistacore.order.AppointmentType();
				apptType.setId("0");
				apptType.setName("Not Assigned");
				t_appointment.setType(apptType);
				newAppointments.add(t_appointment);
				ccData.setAppointments(newAppointments);
				workflowProcessInstance.setVariable("formAction","toTriage");
				workflowProcessInstance.signalEvent("toTriage", null);

				if (s_signalBody != null) {
					if (s_signalBody.getExecutionUserId() != null) {
						signalOwner = s_signalBody.getExecutionUserId();
						completion.setExecutionUserId(signalOwner);
						signal.setExecutionUserId(signalOwner);
					}
					if (s_signalBody.getExecutionUserName() != null) {
						completion.setExecutionUserName(s_signalBody.getExecutionUserName());
						signal.setExecutionUserName(s_signalBody.getExecutionUserName());
					}
					if (s_signalBody.getActionText() != null) {
						signalAction = s_signalBody.getActionText();
						completion.setActionText(signalAction);
						signal.setActionText(signalAction);
					}
					if (s_signalBody.getActionId() != null) {
						completion.setActionId(s_signalBody.getActionId());
						signal.setActionId(s_signalBody.getActionId());
					}
					signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
					completion.setComment(ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
				}

				if (signalHistory.length() == 0) {
					signalHistory = noHistoryText;
				}
				
				workflowProcessInstance.setVariable("signalName", signalName);
				workflowProcessInstance.setVariable("signalOwner", signalOwner);
				workflowProcessInstance.setVariable("signalAction", signalAction);
				workflowProcessInstance.setVariable("signalHistory", signalHistory);
				workflowProcessInstance.setVariable("state",state);
				completion.setNoteClinicalObjectUid("");
				completion.setNoteTitle("");
				completion.setExecutionDateTime(currentDateString);
				ccData.setCompletion(completion);
				signal.setName(signalName);
				signal.setExecutionDateTime(currentDateString);
				Gson gson = new Gson();
				String signalData = gson.toJson(s_signalBody);
				signal.setData(signalData);
				if (ccData.getSignals() != null) {
					newSignals = ccData.getSignals();
				}
				newSignals.add(signal);
				ccData.setSignals(newSignals);

				vistacore.order.Order order;
				if (ccData.getOrder() != null) {
					order = ccData.getOrder();
				} else {
					order = new vistacore.order.Order();
				}
				
				vistacore.order.Activity activity;
				if (ccData.getActivity() != null) {
					activity = ccData.getActivity();
				} else {
					activity = new vistacore.order.Activity();
				}
				order.setStatus(ConsultHelperUtil.getStatusFromState(state));
				activity.setState(state);
				ccData.setOrder(order);
				ccData.setActivity(activity);
				consultClinicalObject.setData(ccData);
				ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

				workflowProcessInstance.signalEvent("saveSignalClinObj", null);
				workflowProcessInstance.signalEvent("terminateCompletion", null);
			} else {
				workflowProcessInstance.setVariable("formAction","");
			}
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseEConsultSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseEConsultSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes REVIEW signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processReviewSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processReviewSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			vistacore.order.Visit visit = new vistacore.order.Visit();
			Review review = new Review();

			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			
			int indexOfColon = state.indexOf(":");
			if (indexOfColon == -1)
				throw new OrderException("state did not contain a colon");
			state = state.substring(0, indexOfColon) + " Reviewed" + state.substring(indexOfColon);

			String signalName = "REVIEW";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Order Reviewed";
			String signalHistory = "Review:";

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					review.setExecutionUserId(signalOwner);
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					review.setExecutionUserName(s_signalBody.getExecutionUserName());
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					signal.setActionText(signalAction);
					String formAction = s_signalBody.getActionText();
					workflowProcessInstance.setVariable("formAction", formAction);

				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : "" + s_signalBody.getComment());
				if (s_signalBody.getVisit() != null) {
					Visit signalBodyVisit = s_signalBody.getVisit();
					visit.setLocation(signalBodyVisit.getLocation());
					visit.setLocationDesc(signalBodyVisit.getLocationDesc());
					visit.setServiceCategory(signalBodyVisit.getServiceCategory());
					visit.setDateTime(signalBodyVisit.getDateTime());
				}
			}
			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");

			review.setExecutionDateTime(currentDateString);
			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			ccData.setReview(review);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
			
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReviewSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReviewSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes COMMUNITY.UPDATE.PENDING signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processCommunityPendingSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processCommunityPendingSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();

			String signalName = "COMMUNITY.UPDATE.PENDING";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Update Community Care Scheduling : Pending";
			String signalHistory = "";
			String state = "Community Care:Pending";

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
			}
			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setExecutionDateTime(currentDateString);
			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);

			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					vistacore.order.Appointment t_appointment = newAppointments.get(lastAppointmentIndex);
					appointment.setType(t_appointment.getType());
					appointment.setEwl(t_appointment.getEwl());
					
					int apptTypeId;
					try {
						apptTypeId = Integer.parseInt(t_appointment.getType().getId());
					} catch (Exception e) {
						throw new OrderException("Appointments Type ID was not an Integer: " + e.getMessage());
					}
					
					if (apptTypeId > 1 && apptTypeId <= 6) {
						apptStatus.setId("1");
						apptStatus.setName("Pending");
						appointment.setStatus(apptStatus);
						newAppointments.add(appointment);
						ccData.setAppointments(newAppointments);
					}
				}
			}
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityPendingSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityPendingSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes COMMUNITY.UPDATE.SCHEDULED signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processCommunityScheduledSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processCommunityScheduledSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.AppointmentStatus apptStatus = new vistacore.order.AppointmentStatus();

			String signalName = "COMMUNITY.UPDATE.SCHEDULED";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Update Community Care Scheduling : Scheduled";
			String signalHistory = "";
			String state = StatesMap.getActivitystate().get("CommCareScheduled");

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
			}
			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setExecutionDateTime(currentDateString);
			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);

			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			//Update last appointment
			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				int lastAppointmentIndex = newAppointments.size() -1;
				if (lastAppointmentIndex >= 0) {
					vistacore.order.Appointment t_appointment = newAppointments.get(lastAppointmentIndex);
					appointment.setType(t_appointment.getType());
					appointment.setEwl(t_appointment.getEwl());
					
					int apptTypeId;
					try {
						apptTypeId = Integer.parseInt(t_appointment.getType().getId());
					} catch (Exception e) {
						throw new OrderException("Appointments Type ID was not an Integer: " + e.getMessage());
					}
					
					if (apptTypeId > 1 && apptTypeId <= 6) {
						apptStatus.setId("2");
						apptStatus.setName("Scheduled");
						appointment.setStatus(apptStatus);
						newAppointments.add(appointment);
						ccData.setAppointments(newAppointments);
					}
				}
			}
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);

			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityScheduledSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityScheduledSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes RELEASE.COMMUNITY script
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processReleaseCommunitySignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processReleaseCommunitySignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			java.util.List<vistacore.order.Appointment> newAppointments = new java.util.ArrayList<vistacore.order.Appointment>();
			vistacore.order.Appointment appointment = new vistacore.order.Appointment();
			vistacore.order.AppointmentType apptType = new vistacore.order.AppointmentType();

			String signalName = "RELEASE.COMMUNITY";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Remove from Community Care";
			String signalHistory = "";
			String state = StatesMap.getActivitystate().get("UnderReview");

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : s_signalBody.getComment());
			}
			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setExecutionDateTime(currentDateString);

			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);
			workflowProcessInstance.setVariable("formAction","triage");

			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);

			if (ccData.getAppointments() != null) {
				newAppointments = ccData.getAppointments();
				apptType.setId("0");
				apptType.setName("Not Assigned");
				appointment.setType(apptType);
				appointment.setEwl(false);
				newAppointments.add(appointment);
				ccData.setAppointments(newAppointments);
			}
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
			workflowProcessInstance.signalEvent("toTriage", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseCommunitySignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processReleaseCommunitySignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes COMPLETE signal in Community Care subprocess
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processCommunityCompleteSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processCommunityCompleteSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			vistacore.order.Visit visit = new vistacore.order.Visit();
			vistacore.order.Completion completion = new vistacore.order.Completion();
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getCompletion() != null) {
				completion = ccData.getCompletion();
			}
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}

			workflowProcessInstance.setVariable("formAction","completed");
			workflowProcessInstance.setVariable("activityHealthy", true);
			workflowProcessInstance.setVariable("activityHealthDescription","");
			String state = StatesMap.getActivitystate().get("CompleteCommCare");
			workflowProcessInstance.setVariable("state",state);
			String signalName = "COMPLETE";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Complete.Consult Form:";
			String signalHistory = "Complete.Consult:";
			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					completion.setExecutionUserId(signalOwner);
					signal.setExecutionUserId(signalOwner);
				}
				if (s_signalBody.getExecutionUserName() != null) {
					completion.setExecutionUserName(s_signalBody.getExecutionUserName());
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction += s_signalBody.getActionText();
					completion.setActionText(s_signalBody.getActionText());
				}
				if (s_signalBody.getActionId() != null) {
					completion.setActionId(s_signalBody.getActionId());
					signal.setActionId(s_signalBody.getActionId());
				}
				if (s_signalBody.getNoteClinicalObjectUid() != null) {
					completion.setNoteClinicalObjectUid(s_signalBody.getNoteClinicalObjectUid());
				}
				if (s_signalBody.getNoteTitle() != null) {
					completion.setNoteTitle(s_signalBody.getNoteTitle());
					signalHistory = "Note Title: " + s_signalBody.getNoteTitle() + " Complete.Consult:";
				}
				String comment = ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : " " + s_signalBody.getComment();
				signalHistory += comment;
				completion.setComment(comment);

				//set the visit object
				if (s_signalBody.getVisit() != null) {
					Visit signalBodyVisit = s_signalBody.getVisit();
					visit.setLocation(signalBodyVisit.getLocation());
					visit.setLocationDesc(signalBodyVisit.getLocationDesc());
					visit.setServiceCategory(signalBodyVisit.getServiceCategory());
					visit.setDateTime(signalBodyVisit.getDateTime());
					completion.setVisit(visit);
				}
			}

			completion.setExecutionDateTime(currentDateString);
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);

			ccData.setCompletion(completion);

			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setHistory(signalHistory);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			//Update clinical object
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			//Notification
			String author = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator"); //Ordering provider
			String patientId = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "icn"); //"urn:va:patient:" + site + ":" + dfn;
			String instanceName = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "instanceName");
			String notificationTaskId = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "notificationTaskId");
			
			String dateString = ConsultHelperUtil.getCurrentDateStringNotificationExpiration();

			String subject = "Consult " + instanceName + " Completed";
			String message = "Consult " + instanceName + " has been completed on {dateString}";
			
			String jsonString = ConsultHelperUtil.buildNotificationJson(author, subject, message, patientId, notificationTaskId, dateString);
			workflowProcessInstance.setVariable("notificationJSON",jsonString);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
			workflowProcessInstance.signalEvent("completionStarted", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityCompleteSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processCommunityCompleteSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes END signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processENDSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processENDSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();

			String signalName = "END";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Discontinue";
			String signalHistory = "";
			String state = "Discontinued:"+(ConsultHelperUtil.isEmptyString(s_signalBody.getReason()) ? "" : " " + s_signalBody.getReason());
			
			if (ConsultHelperUtil.isEmptyString(consultClinicalObject.getEhmpState()))
				throw new OrderException("ConsultClinicalObject's EhmpState was null");
			
			if (consultClinicalObject.getEhmpState().equalsIgnoreCase("draft")) {
				consultClinicalObject.setEhmpState("deleted");
				signalAction = "Delete";
				state = StatesMap.getActivitystate().get("Draft");
			}
			Boolean discontinuedByInitiator = true;
			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(signalOwner);
					if (!signalOwner.equals(WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "initiator"))) {
						discontinuedByInitiator = false;
					}
				}
				if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
					workflowProcessInstance.setVariable("discontinuedBy", s_signalBody.getExecutionUserName());
				}
				if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
					signal.setActionText(s_signalBody.getActionText());
				}
				if (s_signalBody.getActionId() != null) {
					signal.setActionId(s_signalBody.getActionId());
				}
				if (s_signalBody.getReason() != null) {
					signalHistory += s_signalBody.getReason();
					if (s_signalBody.getComment() != null) {
						signalHistory += ":Discontinue:";
					}
				}
				signalHistory += (ConsultHelperUtil.isEmptyString(s_signalBody.getComment()) ? "" : " " + s_signalBody.getComment());
			}

			if (signalHistory.length() == 0) {
				signalHistory = noHistoryText;
			}
			workflowProcessInstance.setVariable("discontinuedByInitiator",discontinuedByInitiator);
			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			workflowProcessInstance.setVariable("state",state);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processENDSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processENDSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes EDIT signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processEditSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processEditSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");

			DateTimeFormat.forPattern("YYYYMMddHHmmss");
			String userId="";
			String userName="";
			String signalName = "EDIT";
			String signalOwner = "Process: " + processInstance.getId();
			String signalAction = "Accept";
			String signalHistory = noHistoryText;
			String cdsIntentResult = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "cdsIntentResult");
			String orderable = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "orderable");

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					userId = s_signalBody.getExecutionUserId();
				}
				if (s_signalBody.getExecutionUserName() != null) {
					userName = s_signalBody.getExecutionUserName();
				}
				if (s_signalBody.getOrderable() != null) {
					orderable = s_signalBody.getOrderable();
				}
				if (s_signalBody.getCdsIntentResult() != null) {
					cdsIntentResult = s_signalBody.getCdsIntentResult();
				}
				if (s_signalBody.getUrgency() != null) {
					consultOrder.setUrgency(s_signalBody.getUrgency());
				}
				if (s_signalBody.getAcceptingProvider() != null) {
					consultOrder.setAcceptingProvider(s_signalBody.getAcceptingProvider());
				}
				if (s_signalBody.getEarliestDate() != null) {
					consultOrder.setEarliestDate(s_signalBody.getEarliestDate());
				}
				if ( s_signalBody.getLatestDate() != null) {
					consultOrder.setLatestDate(s_signalBody.getLatestDate());
				}
				if ( s_signalBody.getFacility() != null) {
					consultOrder.setDestinationFacility(s_signalBody.getFacility());
				}
				if (s_signalBody.getConditions() != null) {
					consultOrder.setConditions(s_signalBody.getConditions());
				}
				if (s_signalBody.getRequest() != null) {
					consultOrder.setRequestReason(s_signalBody.getRequest());
				}
				if (s_signalBody.getComment() != null) {
					consultOrder.setRequestComment(s_signalBody.getComment());
				}
				if (s_signalBody.getOverrideReason() != null) {
					consultOrder.setOverrideReason(s_signalBody.getOverrideReason());
				}
				if (s_signalBody.getQuestions() != null) {
					consultOrder.setPreReqQuestions(s_signalBody.getQuestions());
				}
				if (s_signalBody.getOrdersResults() != null) {
					consultOrder.setPreReqOrders(s_signalBody.getOrdersResults());
				} 
				if (s_signalBody.getVisit() != null) {
					consultOrder.setVisit(s_signalBody.getVisit());
				}
				if (s_signalBody.getOrderResultComment() != null) {
					consultOrder.setOrderResultComment(s_signalBody.getOrderResultComment());
				}
				consultOrder.setFormAction("accepted");
			}

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);

			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			vistacore.order.Order order = ccData.getOrder();
			if (order == null)
				throw new OrderException("order was null");
			vistacore.order.Activity activity = ccData.getActivity();
			if (activity == null)
				throw new OrderException("activity was null");
			List<ConsultOrderData> consultOrders = ccData.getConsultOrders();
			if (consultOrders == null)
				throw new OrderException("consultOrders was null");

			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			
			//Check Prerequisites
			List<ConsultPreReqOrder> preReqOrders = consultOrder.getPreReqOrders();
			boolean completed = true;
			if (preReqOrders !=null && preReqOrders.size() > 0) {
				for (ConsultPreReqOrder t_order : preReqOrders) {
					if (OrderStatus.ORDER_STATUS_ORDER.equalsIgnoreCase(t_order.getStatus())) {
						completed = false;
					}
				}
			} else {
				completed = false;
			}
			workflowProcessInstance.setVariable("workupComplete", completed);
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			boolean bIsEmergent = ConsultHelperUtil.setUpdateAndChangedToEmergentWaitOnLabs(workflowProcessInstance, consultOrder, activity, completed);			
			if (completed && state.equals(StatesMap.getActivitystate().get("Workup"))) {
				state = StatesMap.getActivitystate().get("WorkupComplete");
				workflowProcessInstance.signalEvent("endWorkupSubprocess", null);
			}
			if (bIsEmergent)
				state = StatesMap.getActivitystate().get("Unreleased");
			
			workflowProcessInstance.setVariable("workupComplete", completed);
			workflowProcessInstance.setVariable("state",state);
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));

			Facility orderingFacility = consultOrder.getOrderingFacility();
			if (orderingFacility == null)
				throw new OrderException("orderingFacility was null");
			activity.setSourceFacilityId(orderingFacility.getCode());
			activity.setState(state);
			activity.setActivityHealthy(true);
			activity.setActivityHealthDescription("");
			ccData.setActivity(activity);
			ccData.setOrder(order);
			consultClinicalObject.setData(ccData);
			ConsultOrderData consultOrderData = ConsultHelperUtil.buildConsultOrder(consultClinicalObject, consultOrder, orderable, cdsIntentResult, userId, userName);
			consultOrders.add(consultOrderData);
			ccData.setConsultOrders(consultOrders);
			
			signal.setName(signalName);
			signal.setActionText(signalAction);
			signal.setHistory(signalHistory);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			//Update clinical object
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
			
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processENDSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processENDSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes ORDER.ACTIVATE signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processOrderActivateSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processOrderActivateSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();
			SignalBody s_signalBody = WorkflowProcessInstanceUtil.getOptionalSignalBody(workflowProcessInstance, "s_signalBody");

			String signalName = "ORDER.ACTIVATE";
			String signalOwner = "Process: " + Long.toString(processInstance.getId());
			String signalAction = "Activate Order";
			String signalHistory = noHistoryText;

			if (s_signalBody != null) {
				if (s_signalBody.getExecutionUserId() != null) {
					signalOwner = s_signalBody.getExecutionUserId();
					signal.setExecutionUserId(s_signalBody.getExecutionUserId());
					String completingProviderUid = s_signalBody.getExecutionUserId();
					String completeAssignment ="";
					if (completingProviderUid.indexOf("urn:va") != -1) {
						int idx = completingProviderUid.indexOf("user:");
						if (idx == -1)
							throw new OrderException("No \"user:\" was in completingProviderUid: " + completingProviderUid);
						
						completeAssignment = completingProviderUid.substring(idx + 5).replace(":", ";");
					} else {
						completeAssignment = completingProviderUid;
					}
					workflowProcessInstance.setVariable("completeAssignment", completeAssignment);
				 }
				 if (s_signalBody.getExecutionUserName() != null) {
					signal.setExecutionUserName(s_signalBody.getExecutionUserName());
				 }
				 if (s_signalBody.getActionText() != null) {
					signalAction = s_signalBody.getActionText();
				 }
			}

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);
			String state = StatesMap.getActivitystate().get("UnderReview");
			workflowProcessInstance.setVariable("state",state);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_signalBody);
			signal.setData(signalData);

			ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);

			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processOrderActivateSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processOrderActivateSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}

	/**
	 * Processes PREREQ.ORDER.UPDATE signal
	 * @param processInstance	a reference to the running process instance
	 */
	public static void processPrereqOrderUpdateSignal(ProcessInstance processInstance) {
		try {
			LOGGER.debug("Entering ConsultSignalProcessing.processPrereqOrderUpdateSignal");
			String currentDateString = ConsultHelperUtil.getCurrentDateString();
			WorkflowProcessInstance workflowProcessInstance = (WorkflowProcessInstance)processInstance;
			ConsultOrder consultOrder = WorkflowProcessInstanceUtil.getRequiredConsultOrder(workflowProcessInstance, "consultOrder");
			ConsultClinicalObject consultClinicalObject = WorkflowProcessInstanceUtil.getRequiredConsultClinicalObject(workflowProcessInstance, "consultClinicalObject");
			ConsultClinicalObjectData ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			Signal signal = new Signal();
			java.util.List<Signal> newSignals = new java.util.ArrayList<Signal>();

			List<ConsultPreReqOrder> preReqOrders = consultOrder.getPreReqOrders();
			ConsultPreReqOrder s_preReqOrder = WorkflowProcessInstanceUtil.getRequiredConsultPreReqOrder(workflowProcessInstance, "s_preReqOrder");
			boolean completed = true;
			String labStatus = "";
			if (preReqOrders !=null && preReqOrders.size() > 0) {
				for (ConsultPreReqOrder t_order : preReqOrders) {
					String uid = t_order.getUid();					
					if (!ConsultHelperUtil.isEmptyString(uid) && uid.equalsIgnoreCase(s_preReqOrder.getUid())) {
						labStatus = s_preReqOrder.getStatus();
						LOGGER.debug(String.format("ConsultSignalProcessing.processPrereqOrderUpdateSignal: Lab results received for: %s", t_order.getOrderName() + " status:" + labStatus));
						if (labStatus.equals(OrderStatus.ORDER_STATUS_COMPLETE)) {
							t_order.setStatus(OrderStatus.ORDER_STATUS_COMPLETE);
						} else {
							t_order.setStatus(labStatus);
							completed = false;
						}
						t_order.setStatusDate(currentDateString);
						//the following check for !isEmptyString() is required because if it is empty or null we don't want to wait for a result 
					} else if (!ConsultHelperUtil.isEmptyString(t_order.getStatus()) && !OrderStatus.ORDER_STATUS_COMPLETE.equalsIgnoreCase(t_order.getStatus()) && !OrderStatus.ORDER_STATUS_OVERRIDE.equalsIgnoreCase(t_order.getStatus()) && !OrderStatus.ORDER_STATUS_SATISFIED.equalsIgnoreCase(t_order.getStatus())) {
						LOGGER.debug(String.format("ConsultSignalProcessing.processPrereqOrderUpdateSignal: Still waiting for Lab results for: %s", t_order.getOrderName()));
						completed = false;
					}
				}
			}
			workflowProcessInstance.setVariable("preRequisitesComplete", completed);
			String state = WorkflowProcessInstanceUtil.getRequiredString(workflowProcessInstance, "state");
			if (completed) {
				state = StatesMap.getActivitystate().get("WorkupComplete");
				workflowProcessInstance.setVariable("state",state);
			}

			String signalName = "PREREQ.ORDER.UPDATE";
			String signalOwner = "Process: " + Long.toString(processInstance.getId());
			String signalAction = "Prerequisite Update";
			String signalHistory = noHistoryText;

			workflowProcessInstance.setVariable("signalName", signalName);
			workflowProcessInstance.setVariable("signalOwner", signalOwner);
			workflowProcessInstance.setVariable("signalAction", signalAction);
			workflowProcessInstance.setVariable("signalHistory", signalHistory);

			signal.setName(signalName);
			signal.setExecutionDateTime(currentDateString);
			Gson gson = new Gson();
			String signalData = gson.toJson(s_preReqOrder);
			signal.setData(signalData);

			ccData = consultClinicalObject.getData();
			if (ccData == null)
				throw new OrderException("ccData was null");
			if (ccData.getSignals() != null) {
				newSignals = ccData.getSignals();
			}
			newSignals.add(signal);
			ccData.setSignals(newSignals);
			
			vistacore.order.Order order;
			if (ccData.getOrder() != null) {
				order = ccData.getOrder();
			} else {
				order = new vistacore.order.Order();
			}
			
			vistacore.order.Activity activity;
			if (ccData.getActivity() != null) {
				activity = ccData.getActivity();
			} else {
				activity = new vistacore.order.Activity();
			}
			order.setStatus(ConsultHelperUtil.getStatusFromState(state));
			activity.setState(state);
			ccData.setOrder(order);
			ccData.setActivity(activity);
			consultClinicalObject.setData(ccData);
			ConsultHelperUtil.saveClinicalObject(workflowProcessInstance, consultClinicalObject);
			workflowProcessInstance.signalEvent("saveSignalClinObj", null);
		} catch (OrderException e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processPrereqOrderUpdateSignal: %s", e.getMessage()), e);
		} catch (Exception e) {
			LOGGER.error(String.format("ConsultSignalProcessing.processPrereqOrderUpdateSignal: An unexpected condition has happened: %s", e.getMessage()), e);
		}
	}
}
