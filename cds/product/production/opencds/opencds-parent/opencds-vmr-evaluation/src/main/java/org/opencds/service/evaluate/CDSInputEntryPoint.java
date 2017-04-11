/**
 * Copyright 2011, 2012 OpenCDS.org
 *	Licensed under the Apache License, Version 2.0 (the "License");
 *	you may not use this file except in compliance with the License.
 *	You may obtain a copy of the License at
 *
 *		http://www.apache.org/licenses/LICENSE-2.0
 *
 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 *	
 */

package org.opencds.service.evaluate;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.exceptions.InvalidDriDataFormatException;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.common.utilities.StreamUtility;
import org.opencds.config.api.pool.UnmarshallerFactory;
import org.opencds.config.api.pool.UnmarshallerPool;
import org.opencds.config.api.ss.EntryPoint;
import org.opencds.vmr.v1_0.schema.CDSInput;

/**
 * @author David Shields
 * @author Phillip Warner
 *
 */
public class CDSInputEntryPoint implements EntryPoint<CDSInput>, Cloneable {

	private static Log log = LogFactory
			.getLog(CDSInputEntryPoint.class);
	
    private final StreamUtility streamUtility = new StreamUtility();

	private final UnmarshallerPool unmarshallerPool;

    public CDSInputEntryPoint() {
    	unmarshallerPool = new UnmarshallerPool(new UnmarshallerFactory());
    }
    
	@Override
	public CDSInput buildInput(String inputPayloadString) {

		// this begins the guts for building fact lists for input data based on one particular fact model (opencds-vmr-1_0)			
		log.debug("starting CDSInputEntryPoint");
        CDSInput cdsInput = null;

		try {
            StreamSource payloadStream = new StreamSource(streamUtility.getInputStreamFromString(inputPayloadString));
            Unmarshaller unmarshaller = unmarshallerPool.borrowObject(CDSInput.class);
			JAXBElement<CDSInput> jaxbElement = unmarshaller.unmarshal( payloadStream, CDSInput.class);
			unmarshallerPool.returnObject(CDSInput.class, unmarshaller);
			cdsInput = jaxbElement.getValue();
		} catch (JAXBException e) {
			e.printStackTrace();
			throw new InvalidDriDataFormatException(e.getMessage() + ", therefore unable to unmarshal input Semantic Payload xml string: " + inputPayloadString.hashCode(), e);
		} catch (Exception e) {
			e.printStackTrace();
			throw new OpenCDSRuntimeException(e.getMessage(), e);	
		}
		
		log.debug("finished CDSInputEntryPoint");
		
		return cdsInput;
	}

}
