package org.opencds.evaluation.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.opencds.config.api.KnowledgeRepository;
import org.opencds.config.api.model.KMId;
import org.opencds.config.api.model.KnowledgeModule;
import org.opencds.config.api.model.SupportingData;
import org.opencds.config.util.EntityIdentifierUtil;

public class SupportingDataUtil {

    /**
     * Retrieves all relevant SupportingData, i.e., SDs that are associated with
     * the KnowledgeModule or SDs that have no associated KM.
     * 
     * See documentation referenced by OP-41.
     * 
     * @param knowledgeRepository
     * @param knowledgeModule
     * @return
     */
    public static Map<String, org.opencds.plugin.SupportingData> getSupportingData(
            KnowledgeRepository knowledgeRepository, KnowledgeModule knowledgeModule) {
        List<SupportingData> supportingDataList = filterByKM(knowledgeModule.getKMId(), knowledgeRepository
                .getSupportingDataService().getAll());

        Map<String, org.opencds.plugin.SupportingData> supportingData = new LinkedHashMap<>();
        for (SupportingData sd : supportingDataList) {
            byte[] data = knowledgeRepository.getSupportingDataPackageService().getPackageBytes(sd);
            supportingData.put(sd.getIdentifier(), org.opencds.plugin.SupportingData.create(sd.getIdentifier(),
                    EntityIdentifierUtil.makeEIString(sd.getKMId()),
                    EntityIdentifierUtil.makeEIString(sd.getLoadedBy()), sd.getPackageId(), sd.getPackageType(), data));
        }
        return supportingData;
    }

    /**
     * Inclusion filter by SupportingData by KMId, or SDs that have no
     * associated KMId.
     * 
     * @param kmId
     * @param sds
     * @return
     */
    private static List<SupportingData> filterByKM(KMId kmId, List<SupportingData> sds) {
        List<SupportingData> sdList = new ArrayList<>();
        for (SupportingData sd : sds) {
            if (sd.getKMId() == null || sd.getKMId().equals(kmId)) {
                sdList.add(sd);
            }
        }
        return sdList;
    }

}
