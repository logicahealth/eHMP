package org.opencds.config.api.xml;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class JAXBContextService {
    private static final Log log = LogFactory.getLog(JAXBContextService.class);

    public JAXBContext getJAXBContext(Class<?> clazz) {
        JAXBContext jaxbContext = null;
        try {
            jaxbContext = JAXBContext.newInstance(clazz);
            log.debug("JAXBContext created: " + jaxbContext);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return jaxbContext;
    }

    public JAXBContext getJAXBContext(String schemaUrl) {
        JAXBContext jaxbContext = null;
        try {
            jaxbContext = JAXBContext.newInstance(schemaUrl);
            log.debug("JAXBContext created: " + jaxbContext);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return jaxbContext;
    }

}
