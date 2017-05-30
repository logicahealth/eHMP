package org.opencds.dss.evaluate;

import java.util.Date;
import java.util.List;

import org.omg.dss.DSSRuntimeExceptionFault;
import org.omg.dss.EvaluationExceptionFault;
import org.omg.dss.InvalidDriDataFormatExceptionFault;
import org.omg.dss.InvalidTimeZoneOffsetExceptionFault;
import org.omg.dss.RequiredDataNotProvidedExceptionFault;
import org.omg.dss.UnrecognizedLanguageExceptionFault;
import org.omg.dss.UnrecognizedScopedEntityExceptionFault;
import org.omg.dss.UnsupportedLanguageExceptionFault;
import org.omg.dss.evaluation.requestresponse.DataRequirementItemData;
import org.omg.dss.evaluation.requestresponse.EvaluationRequest;
import org.opencds.common.structures.EvaluationRequestDataItem;
import org.opencds.common.structures.EvaluationRequestKMItem;
import org.opencds.config.api.KnowledgeRepository;

public interface RequestProcessor {

    List<EvaluationRequestKMItem> decodeInput(KnowledgeRepository knowledgeRepository, EvaluationRequest request,
            EvaluationRequestDataItem evaluationRequestDataItem, List<DataRequirementItemData> listDRIData,
            Date evalTime)
            throws InvalidDriDataFormatExceptionFault,
            RequiredDataNotProvidedExceptionFault,
            EvaluationExceptionFault,
            InvalidTimeZoneOffsetExceptionFault,
            UnrecognizedScopedEntityExceptionFault,
            UnrecognizedLanguageExceptionFault,
            UnsupportedLanguageExceptionFault,
            DSSRuntimeExceptionFault;

}
