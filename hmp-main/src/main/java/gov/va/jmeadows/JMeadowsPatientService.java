package gov.va.jmeadows;

import gov.va.cpe.idn.PatientIds;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.hmp.HmpProperties;
import gov.va.med.jmeadows.webservice.JMeadowsException_Exception;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinTask;
import java.util.concurrent.TimeUnit;

import static gov.va.jmeadows.JMeadowsClientUtils.createDodJMeadowsQueryBuilder;
import static gov.va.jmeadows.JMeadowsClientUtils.validatePatientIds;
import static gov.va.jmeadows.JMeadowsNoteService.NoteType.INPATIENT;
import static gov.va.jmeadows.JMeadowsNoteService.NoteType.OUTPATIENT;

/**
 * Class retrieves clinical data from the jMeadows webservice.
 */
@Service
public class JMeadowsPatientService implements IJMeadowsPatientService, EnvironmentAware {

    private static final Logger LOG = LoggerFactory.getLogger(JMeadowsPatientService.class);

    private JMeadowsConfiguration jMeadowsConfiguration;

    private IJMeadowsAllergyService jMeadowsAllergyService;
    private IJMeadowsVitalService jMeadowsVitalService;
    private IJMeadowsLabService jMeadowsLabService;
    private IJMeadowsDemographicsService jMeadowsDemographicsService;
    private IJMeadowsProblemService jMeadowsProblemService;
    private IJMeadowsMedicationService jMeadowsMedicationService;
    private IJMeadowsNoteService jMeadowsNoteService;
    private IJMeadowsConsultNoteService jMeadowsConsultNoteService;
    private IJMeadowsRadiologyService jMeadowsRadiologyService;
    private IJMeadowsImmunizationService jMeadowsImmunizationService;
    private IJMeadowsOrderService jMeadowsOrderService;

    private int parallelismMin = 1;

    @Autowired
    public void setJMeadowsConfiguration(JMeadowsConfiguration jMeadowsConfiguration) {
        this.jMeadowsConfiguration = jMeadowsConfiguration;
    }

    @Autowired
    public void setJMeadowsAllergyService(IJMeadowsAllergyService IJMeadowsAllergyService) {
        this.jMeadowsAllergyService = IJMeadowsAllergyService;

    }

    @Autowired
    public void setJMeadowsLabService(IJMeadowsLabService IJMeadowsLabService) {
        this.jMeadowsLabService = IJMeadowsLabService;

    }

    @Autowired
    public void setJMeadowsMedicationService(IJMeadowsMedicationService IJMeadowsMedicationService) {
        this.jMeadowsMedicationService = IJMeadowsMedicationService;

    }

    @Autowired
    public void setJMeadowsRadiologyService(IJMeadowsRadiologyService IJMeadowsRadiologyService)
    {
        this.jMeadowsRadiologyService = IJMeadowsRadiologyService;

    }

    @Autowired
    public void setJMeadowsDemographicsService(IJMeadowsDemographicsService IJMeadowsDemographicsService)
    {
        this.jMeadowsDemographicsService = IJMeadowsDemographicsService;

    }

    @Autowired
    public void setJMeadowsVitalService(IJMeadowsVitalService IJMeadowsVitalService) {
        this.jMeadowsVitalService = IJMeadowsVitalService;
    }

    @Autowired
    public void setJMeadowsProblemService(IJMeadowsProblemService IJMeadowsProblemService) {
        this.jMeadowsProblemService = IJMeadowsProblemService;
    }

    @Autowired
    public void setJMeadowsNoteService(IJMeadowsNoteService IJMeadowsProgressNoteService) {
        this.jMeadowsNoteService = IJMeadowsProgressNoteService;
    }

    @Autowired
    public void setJMeadowsConsultNoteService(IJMeadowsConsultNoteService IJMeadowsConsultNoteService) {
        this.jMeadowsConsultNoteService = IJMeadowsConsultNoteService;
    }


    @Autowired
    public void setJMeadowsImmunizationService(IJMeadowsImmunizationService IJMeadowsImmunizationService) {
        this.jMeadowsImmunizationService = IJMeadowsImmunizationService;
    }

    @Autowired
    public void setjMeadowsOrderService(IJMeadowsOrderService ijMeadowsOrderService) {
        this.jMeadowsOrderService = ijMeadowsOrderService;
    }

    /**
     * Retrieves DoD clinical data from jMeadows.
     *
     * @param patientIds Patient identifiers container.
     * @return List of patient DoD clinical data.
     * @throws IllegalArgumentException if required parameters are missing or invalid.
     */
    @Override
    public List<VistaDataChunk> fetchDodPatientData(PatientIds patientIds) {
        LOG.debug("JMeadowsPatientService.fetchDodPatientData - Entering method...");

        validatePatientIds(patientIds);

        List<VistaDataChunk> oaVistaDataChunk = new ArrayList<VistaDataChunk>();

        JMeadowsQueryBuilder queryBuilder = createDodJMeadowsQueryBuilder(patientIds, jMeadowsConfiguration);

        long startTime = System.currentTimeMillis();

        int availableProcessors = Runtime.getRuntime().availableProcessors();
        int parallelism = (availableProcessors > parallelismMin) ? availableProcessors : parallelismMin;
        ForkJoinPool pool = new ForkJoinPool(parallelism);

        //allergy
        ForkJoinTask<List<VistaDataChunk>> oaAllergyChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsAllergyService, "fetchDodPatientAllergies", new Object[]{queryBuilder.build(), patientIds}));
        //vitals
        ForkJoinTask<List<VistaDataChunk>> oaVitalsChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsVitalService, "fetchDodPatientVitals", new Object[]{queryBuilder.build(), patientIds}));
        //chem labs
       ForkJoinTask<List<VistaDataChunk>> oaChemLabChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsLabService, "fetchDodPatientChemistryLabs", new Object[]{queryBuilder.build(), patientIds}));

        //pathology labs
        ForkJoinTask<List<VistaDataChunk>> oaPathologyLabChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsLabService, "fetchDodPatientAnatomicPathologyLabs", new Object[]{queryBuilder.build(), patientIds}));

        //outpatient meds
        ForkJoinTask<List<VistaDataChunk>> oaOutMedChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsMedicationService, "fetchDodPatientOutpatientMedications",
                new Object[]{queryBuilder.build(), patientIds}));
        //inpatient meds
        ForkJoinTask<List<VistaDataChunk>> oaInMedChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsMedicationService, "fetchDodPatientInpatientMedications",
                new Object[]{queryBuilder.build(), patientIds}));
        //radiology reports
        ForkJoinTask<List<VistaDataChunk>> oaRadiologyChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsRadiologyService, "fetchDodPatientRadiologyReports",
                new Object[]{queryBuilder.build(), patientIds}));
        //problems
        ForkJoinTask<List<VistaDataChunk>> oaProblemChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsProblemService, "fetchDodPatientProblems", new Object[]{queryBuilder.build(), patientIds}));
        //outpatient notes
        ForkJoinTask<List<VistaDataChunk>> oaOutpatientNoteChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsNoteService, "fetchDodNotes", new Object[]{OUTPATIENT, queryBuilder.build(), patientIds}));
        //inpatient notes
        ForkJoinTask<List<VistaDataChunk>> oaInpatientNoteChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsNoteService, "fetchDodNotes", new Object[]{INPATIENT, queryBuilder.build(), patientIds}));
        //consult notes
        ForkJoinTask<List<VistaDataChunk>> oaConsultNoteChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsConsultNoteService, "fetchDodConsults", new Object[]{queryBuilder.build(), patientIds}));
        //demographics
        ForkJoinTask<List<VistaDataChunk>> oaDemographicsChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsDemographicsService, "fetchDodPatientDemographics",
                new Object[]{queryBuilder.build(), patientIds}));

        //immunizations
        ForkJoinTask<List<VistaDataChunk>> oaImmunizationsChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsImmunizationService, "fetchDodPatientImmunizations",
                new Object[]{queryBuilder.build(), patientIds}));

        //orders
        ForkJoinTask<List<VistaDataChunk>> oaOrdersChunk = pool.submit(new FetchDoDPatientDataTask(
                jMeadowsOrderService, "fetchDodPatientOrders", new Object[]{queryBuilder.build(), patientIds}));

        try {
            oaVistaDataChunk.addAll(oaAllergyChunk.join());
            oaVistaDataChunk.addAll(oaVitalsChunk.join());
            oaVistaDataChunk.addAll(oaChemLabChunk.join());
            oaVistaDataChunk.addAll(oaPathologyLabChunk.join());
            oaVistaDataChunk.addAll(oaOutMedChunk.join());
            oaVistaDataChunk.addAll(oaInMedChunk.join());
            oaVistaDataChunk.addAll(oaRadiologyChunk.join());
            oaVistaDataChunk.addAll(oaProblemChunk.join());
            oaVistaDataChunk.addAll(oaOutpatientNoteChunk.join());
            oaVistaDataChunk.addAll(oaInpatientNoteChunk.join());
            oaVistaDataChunk.addAll(oaConsultNoteChunk.join());
            oaVistaDataChunk.addAll(oaDemographicsChunk.join());
            oaVistaDataChunk.addAll(oaImmunizationsChunk.join());
            oaVistaDataChunk.addAll(oaOrdersChunk.join());
        }finally {
            LOG.debug("total time to fetch DoD patient data: " + (System.currentTimeMillis() - startTime) +
                    "ms, PID: " + patientIds.getPid() + ", using # of CPU: " + parallelism);
            pool.shutdown();
            try {
                if (!pool.awaitTermination(3, TimeUnit.SECONDS)) {
                    pool.shutdownNow();
                    if (!pool.awaitTermination(3, TimeUnit.SECONDS)) {
                        LOG.error("Error terminating pool");
                    }
                }
            }catch (InterruptedException ie) {
                pool.shutdownNow();
            }
        }

        LOG.debug("JMeadowsPatientService.fetchDodPatientData - Leaving method with " + oaVistaDataChunk.size() + " VistaDataChunk objects.");
        return oaVistaDataChunk;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.parallelismMin = Integer.parseInt(environment.getProperty(HmpProperties.JMEADOWS_PARALLELISM_MIN));
    }

}
