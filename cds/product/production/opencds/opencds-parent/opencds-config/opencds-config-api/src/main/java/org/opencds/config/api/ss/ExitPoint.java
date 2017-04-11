package org.opencds.config.api.ss;

import java.util.List;
import java.util.Map;

import org.opencds.common.interfaces.ResultSetBuilder;
import org.opencds.common.structures.EvaluationRequestKMItem;

/**
 * Provides a basic API for the exit point for vMR (or other XML strutures) at the OpenCDS Web Service layer.
 * 
 * Essentially, this provides a hook into building the output XML.
 * 
 * @author phillip
 *
 */
public interface ExitPoint {

    String buildOutput(ResultSetBuilder<?> resultSetBuilder, Map<String, List<?>> results, EvaluationRequestKMItem dssRequestKMItem);

}
