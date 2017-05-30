package org.opencds.plugin;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.plugin.PluginContext.PostProcessPluginContext;
import org.opencds.plugin.util.VmrUtil;
import org.opencds.vmr.v1_0.internal.EvalTime;
import org.opencds.vmr.v1_0.internal.EvaluatedPerson;
import org.opencds.vmr.v1_0.internal.FocalPersonId;
import org.opencds.vmr.v1_0.internal.ObservationResult;
import org.opencds.vmr.v1_0.internal.datatypes.IVLDate;

public class AssertionsPlugin implements PostProcessPlugin {
    private static final Log log = LogFactory.getLog(AssertionsPlugin.class);

    private static final String SD_CONCEPTS = "concepts";

    private static final String CONCEPT_REGEX = "^C[0-9]*";

    private static final String EQUALS = "=";
    private static final String PIPE = "|";

    private static final String ASSERT_ROOT = "ASSERTROOT";
    private static final String ASSERTIONS_CD = "assertions";
    private static final String ASSERTIONS_DN = "Assertions found in working memory";

    @Override
    public void execute(PostProcessPluginContext context) {
        Set<String> assertions = context.getAssertions();
        Map<String, SupportingData> supportingData = context.getSupportingData();
        PluginDataCache cache = context.getCache();

        SupportingData sd = supportingData.get(SD_CONCEPTS);
        log.debug("SD: " + sd);
        Properties concepts = new Properties();
        if (sd != null) {
            concepts = cache.get(sd);
            if (concepts == null) {
                Map<String, SupportingData> sdMap = context.getSupportingData();
                sd = sdMap.get(SD_CONCEPTS);
                byte[] data = sd.getData();
                try {
                    concepts = new Properties();
                    concepts.load(new ByteArrayInputStream(data));
                    cache.put(sd, concepts);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                // how do we know which supporting data is the one?
            }
        }

        StringBuilder obsValue = new StringBuilder();
        int noAssertions = assertions.size();
        int counter = 0;
        for (String assertion : new TreeSet<String>(assertions)) {
            counter++;
            if (assertion.matches(CONCEPT_REGEX)) {
                obsValue.append(assertion);
                obsValue.append(EQUALS);
                obsValue.append(getConceptDisplayName(concepts, assertion));
            } else {
                obsValue.append(assertion);
            }
            if (counter < noAssertions) {
                obsValue.append(PIPE);
            }
        }

        // add as ObservationResult
        IVLDate obsTime = VmrUtil.createObsTime((EvalTime) context.getAllFactLists().get(EvalTime.class).get(0));

        ObservationResult obsResult = VmrUtil.createObservationResult(
                ((EvaluatedPerson) context.getAllFactLists().get(EvaluatedPerson.class).get(0)).getId(), obsTime,
                ((FocalPersonId) context.getAllFactLists().get(FocalPersonId.class).get(0)).getId(), ASSERT_ROOT,
                ASSERTIONS_CD, ASSERTIONS_DN, obsValue.toString());

        Map<String, List<?>> resultFactLists = context.getResultFactLists();
        List<ObservationResult> obsResults = (List<ObservationResult>) resultFactLists.get(ObservationResult.class
                .getSimpleName());
        if (obsResults == null) {
            obsResults = new ArrayList<>();
            resultFactLists.put(ObservationResult.class.getSimpleName(), obsResults);
        }
        obsResults.add(obsResult);
    }

    private String getConceptDisplayName(Properties concepts, String assertion) {
        String displayName = (String) concepts.get(assertion);
        if (displayName == null) {
            displayName = "";
        }
        return displayName;
    }

}
