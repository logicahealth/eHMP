package org.opencds.config.mapper;

import org.opencds.config.api.model.Concept;
import org.opencds.config.api.model.impl.ConceptImpl;
import org.opencds.config.schema.NamespacedConcept;

public abstract class ConceptMapper {

	public static Concept internal(NamespacedConcept external) {
		if (external == null) {
			return null;
		}
		return ConceptImpl.create(external.getCode(), external.getCodeSystem(), external.getCodeSystemName(),
				external.getDisplayName(), external.getComment(), ValueSetMapper.internal(external.getValueSet()));
	}

	public static org.opencds.config.schema.Concept external(Concept internal) {
		if (internal == null) {
			return null;
		}
		org.opencds.config.schema.Concept external = new org.opencds.config.schema.Concept();// =
																								// new
																								// NamespacedConcept();

		external.setCode(internal.getCode());
		// external.setCodeSystem(internal.getCodeSystem());
		// external.setCodeSystemName(internal.getCodeSystemName());
		external.setDisplayName(internal.getDisplayName());
		external.setComment(internal.getComment());

		return external;
	}
}
