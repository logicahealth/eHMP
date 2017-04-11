package gov.va.cpe.vpr.sync.msg;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import gov.va.cpe.vpr.IBroadcastService;
import gov.va.cpe.vpr.PatientDemographics;
import gov.va.cpe.vpr.sync.MessageDestinations;
import gov.va.cpe.vpr.UidUtils;
import gov.va.cpe.vpr.dao.IVprSyncErrorDao;
import gov.va.cpe.vpr.dao.RoutingDataStore;
import gov.va.cpe.vpr.frameeng.FrameRegistry;
import gov.va.cpe.vpr.frameeng.IFrameRunner;
import gov.va.cpe.vpr.pom.*;
import gov.va.cpe.vpr.queryeng.dynamic.IViewDefDefDAO;
import gov.va.cpe.vpr.queryeng.dynamic.ViewDefDef;
import gov.va.cpe.vpr.sync.SyncError;
import gov.va.cpe.vpr.sync.SyncStatus;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.hmp.vista.rpc.RpcIoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.convert.ConversionService;
import org.springframework.jms.listener.SessionAwareMessageListener;
import org.springframework.jms.support.converter.SimpleMessageConverter;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ImportChunkMessageHandler implements SessionAwareMessageListener {
    public static final String VPR_IMPORT_TIMER = MessageDestinations.IMPORT_QUEUE;
    private static SecureRandom RANDOM = new SecureRandom();
    private static Logger log = LoggerFactory.getLogger(ImportChunkMessageHandler.class);

    private MetricRegistry metrics;
    private IFrameRunner runner;
    private ConversionService conversionService;
    private RoutingDataStore routingDao;
    private IGenericPatientObjectDAO dao;
    private IBroadcastService bcSvc;
    private ApplicationContext ctx;
    private IViewDefDefDAO vddDao; // for now; refactration imminent (famous last words!)
    private IGenericPOMObjectDAO dao2;
    private SimpleMessageConverter messageConverter;
    private IVprSyncErrorDao errorDao;

    private boolean simulateErrors = false;

    @Autowired
    public void setErrorDao(IVprSyncErrorDao errorDao) {
        this.errorDao = errorDao;
    }
    
    @Autowired
    public void setMetricRegistry(MetricRegistry metrics) {
        this.metrics = metrics;
    }

    @Autowired
    public void setFrameRunner(IFrameRunner runner) {
        this.runner = runner;
    }

    @Autowired
    public void setConversionService(ConversionService conversionService) {
        this.conversionService = conversionService;
    }
    @Autowired
    public void setRoutingDao(RoutingDataStore routingDao) {
        this.routingDao = routingDao;
    }
    @Autowired
    public void setPatientObjectDao(IGenericPatientObjectDAO dao) {
        this.dao = dao;
    }
    @Autowired
    public void setBroadcastService(IBroadcastService bcSvc) {
        this.bcSvc = bcSvc;
    }
    @Autowired
    public void setCtx(ApplicationContext ctx) {
        this.ctx = ctx;
    }
    @Autowired
    public void setVddDao(IViewDefDefDAO vddDao) {
        this.vddDao = vddDao;
    }
    @Autowired
    public void setDao2(IGenericPOMObjectDAO dao2) {
        this.dao2 = dao2;
    }

    @Autowired
    public void setMessageConverter(SimpleMessageConverter messageConverter) {
    	this.messageConverter = messageConverter;
    }

    public void setSimulateErrors(boolean simulateErrors) {
        this.simulateErrors = simulateErrors;
    }

    public void onMessage(Message message, Session session) {
    	if (log.isDebugEnabled()) log.debug("ImportChunkMessageHandler.onMessage().  Entering method...");
    	try {
            Map msg = (Map) messageConverter.fromMessage(message);
			 Timer.Context importTimerContext = metrics.timer(MetricRegistry.name(VPR_IMPORT_TIMER)).time();

            /**
             * Am I abusing VistaDataChunk to put a command in there?
             */
		        VistaDataChunk chunk = null;
		        try {
		            // turn the message into a chunk
		            chunk = conversionService.convert(msg, VistaDataChunk.class);

		            if (log.isDebugEnabled()) log.debug("importing item: {}", chunk.toString());

		            // turn the chunk into a domain object
                    if(chunk.getType().equals(VistaDataChunk.COMMAND)) {
                        Map<String, Object> commandMap = conversionService.convert(chunk, Map.class);
                        String command = commandMap.get("command").toString();
                        if(command.equalsIgnoreCase("deleteDomainForPatient")) {
                            String domain = commandMap.get("domain").toString();
                            String pid = commandMap.get("pid").toString();
                            String system = commandMap.get("system").toString();
                            dao.deleteCollectionByPIDAndSystem(domain, pid, system);
                        } else if(command.equalsIgnoreCase("deleteOperationalDomain")) {
                            String domain = commandMap.get("domain").toString();
                            String system = commandMap.get("system").toString();
                            dao2.deleteCollectionBySystem(domain, system);
                        }
                    } else if(chunk.getType().equals(VistaDataChunk.ERROR)) {
                        // Good luck!
                    } else {
                        try {
                            IPOMObject domainObject = conversionService.convert(chunk, IPOMObject.class);

                            // save the domain object
                            IPatientObject oldPtObject = null;
                            Timer domainPersistTimer = getDomainPersistTimer(chunk.getDomain());
                            Timer.Context persistTimerContext = domainPersistTimer.time();
                            if (domainObject instanceof IPatientObject) {
                                if(simulateErrors && !(domainObject instanceof PatientDemographics)) {
                                    long rnd = (long) (RANDOM.nextDouble() * 1000);
                                    if(rnd==500) {
                                        throw new RuntimeException("Simulated random error.");
                                    }
                                }
                                // get/save the old object (if any) to compute the changes later (if any)
                                oldPtObject = null;
                                try {
                                    oldPtObject = dao.findByUID(domainObject.getClass().asSubclass(IPatientObject.class), domainObject.getUid());
                                } catch(Exception e) {
                                    log.warn("Could not create class from JSON;",e);
                                }
                                routingDao.save((IPatientObject) domainObject);
                            } else {
                                dao2.save(domainObject);
                                if (domainObject instanceof ViewDefDef) {
			                    /*
			            		 * The boards have this funny ArrayList of abstract column classes.
			            		 * The special "viewdefdef" DAO has logic to re-inflate these into their actual classes.
			            		 * JSON parsing does not handle this correctly - could be I am just not using the Serializer and Deserializer stuff correctly.
			            		 */
                                    ViewDefDef vdd = vddDao.findByUid(((ViewDefDef) domainObject).getUid());
                                    FrameRegistry.ViewDefDefFrameLoader fload = (FrameRegistry.ViewDefDefFrameLoader) ctx.getBean("vddLoader");
                                    fload.update(vdd);
                                }
                            }
                            persistTimerContext.stop();

                            // trigger frameeng and ui.notify events (currently only for IPatientObjects - probably need to expand)
                            broadcastMessage(domainObject, chunk, oldPtObject);
                        } catch(Exception e) {
                            log.error("error handling msg: " + msg.toString(), e);
                            errorDao.save(new SyncError(message, msg, e));
                            session.recover();
                        }
                    }
                } catch (RpcIoException e) {
                    log.error("error handling msg: " + msg.toString(), e);
                    errorDao.save(new SyncError(message, msg, e));
                    session.recover();
		        } catch (Exception e) {
		            log.error("error handling msg: " + msg.toString(), e);
                    errorDao.save(new SyncError(message, msg, e));
                    session.recover();
		        } finally {
		            importTimerContext.stop();
		        }
		} catch (Exception e) {
            log.error("Unable to dispatch JMS message to converter", e);
            try {
//              TODO:  message.setStringProperty("rollbackMessage","Unable to dispatch JMS message to converter: "+e.getMessage());
                session.recover();
            } catch (JMSException e1) {
                e1.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            }
        }
    }

    private void broadcastMessage(IPOMObject domainObject, VistaDataChunk chunk, IPatientObject oldPtObject) {
        if (domainObject instanceof IPatientObject) {
            IPatientObject ptObject = (IPatientObject) domainObject;

            // compute the update events differently for freshness update vs inital (re)sync
            List<PatientEvent<IPatientObject>> events = null;
            String pid = "";
            if (chunk.isAutoUpdate()) {
                if (oldPtObject != null) {
                    oldPtObject.setData(ptObject.getData());
                    events = oldPtObject.getEvents();
                    pid = oldPtObject.getPid();
                }

                // send the domainChange broadcast messages
                Map<String, Object> evt = new HashMap<String, Object>();
                evt.put("eventName", "domainChange");
                evt.put("domain", UidUtils.getDomainNameByUid(domainObject.getUid()));
                evt.put("pid", pid);
                bcSvc.broadcastMessage(evt);

            } else {
                // this is a (re)sync, do not compute field changes (they should all be new)
                // also mark the event type as RELOAD (instead of CREATE)
                events = ptObject.getEvents();
                if (events == null) events = Collections.emptyList();
                for (PatientEvent<IPatientObject> evt : events) {
                    evt.setType(PatientEvent.Type.RELOAD);
                }
            }

            // if any events were generated (for freshness update or sync), push them
            if (events != null) {
                Timer.Context pushEventsContext = metrics.timer(MetricRegistry.name("vpr.pushevents", chunk.getDomain())).time();
                runner.pushEvents(events);
                pushEventsContext.stop();
            }
        } else if (domainObject instanceof SyncStatus) {
            Map<String, Object> message = new HashMap<String, Object>();
            message.put("eventName", "syncStatusChange");
            message.put("syncStatus", domainObject.getData());
            bcSvc.broadcastMessage(message);
        } else {
            if (chunk.isAutoUpdate()) {
// send the domainChange broadcast messages
                Map<String, Object> evt = new HashMap<String, Object>();
                evt.put("eventName", "operationalDataChange");
                evt.put("domain", UidUtils.getCollectionNameFromUid(domainObject.getUid()));
                evt.put("uid", domainObject.getUid());
                bcSvc.broadcastMessage(evt);
            }
        }
    }

    private Timer getDomainPersistTimer(String domain) {
        return metrics.timer(MetricRegistry.name("vpr.persist", domain));
    }
}
