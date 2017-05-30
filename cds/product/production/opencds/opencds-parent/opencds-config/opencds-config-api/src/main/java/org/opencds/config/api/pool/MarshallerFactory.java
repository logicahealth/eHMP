package org.opencds.config.api.pool;

import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.pool2.BaseKeyedPooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.config.api.xml.JAXBContextService;

public class MarshallerFactory extends BaseKeyedPooledObjectFactory<Class<?>, Marshaller> {
	private static final Log log = LogFactory.getLog(MarshallerFactory.class);
	private final JAXBContextService jaxbContextService = new JAXBContextService();

	@Override
	public Marshaller create(Class<?> clazz) throws Exception {
		Marshaller marshaller = null;
		log.debug("Creating pooled instance of marshaller: " + clazz.getCanonicalName());
		try {
			marshaller = jaxbContextService.getJAXBContext(clazz).createMarshaller();
		} catch (JAXBException e) {
			throw new OpenCDSRuntimeException("Request for Marshaller for class: " + clazz.getCanonicalName()
					+ " created JAXBException: " + e.getMessage());
		}
		if (marshaller == null) {
			throw new OpenCDSRuntimeException("Could not resolve Marshaller for class: " + clazz.getCanonicalName());
		}
		return marshaller;
	}

	@Override
	public PooledObject<Marshaller> wrap(Marshaller value) {
		return new DefaultPooledObject<>(value);
	}

}
