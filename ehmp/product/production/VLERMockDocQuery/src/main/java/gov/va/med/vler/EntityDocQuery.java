package gov.va.med.vler;

import gov.hhs.fha.nhinc.common.nhinccommonentity.RespondingGatewayCrossGatewayQueryRequestType;
import gov.hhs.fha.nhinc.entitydocquery.EntityDocQueryPortType;
import oasis.names.tc.ebxml_regrep.xsd.query._3.AdhocQueryRequest;
import oasis.names.tc.ebxml_regrep.xsd.query._3.AdhocQueryResponse;
import oasis.names.tc.ebxml_regrep.xsd.rim._3.AdhocQueryType;
import oasis.names.tc.ebxml_regrep.xsd.rim._3.SlotType1;
import org.apache.commons.lang.StringUtils;

import javax.jws.WebService;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;

@WebService(endpointInterface="gov.hhs.fha.nhinc.entitydocquery.EntityDocQueryPortType")
public class EntityDocQuery implements EntityDocQueryPortType {

    @Override
    public AdhocQueryResponse respondingGatewayCrossGatewayQuery(RespondingGatewayCrossGatewayQueryRequestType respondingGatewayCrossGatewayQueryRequestType) {
        AdhocQueryResponse adhocQueryResponse = null;

        try {

            AdhocQueryRequest adhocQueryRequest = respondingGatewayCrossGatewayQueryRequestType.getAdhocQueryRequest();

            AdhocQueryType adhocQuery = adhocQueryRequest.getAdhocQuery();

            String patientIdStr = null;

            if (adhocQuery.getSlot() != null && adhocQuery.getSlot().size() > 0) {
                SlotType1 patientIdSlot = adhocQuery.getSlot().get(1);
                patientIdStr = patientIdSlot.getValueList().getValue().get(0);
            }

            ClassLoader classLoader = getClass().getClassLoader();
            File file = null;

            //FIVEHUNDREDTWENTYSIX,PATIENT to return empty document list
            if (StringUtils.contains(patientIdStr, "5000000089V224123")) {
                file = new File(classLoader.getResource("mock-no-docs-response.xml").getFile());
            }//NINE,PATIENT to return empty response
            else if (StringUtils.contains(patientIdStr, "10109V652700")) {
                file = new File(classLoader.getResource("mock-empty-response.xml").getFile());
            }
            else {
                file = new File(classLoader.getResource("mock-response.xml").getFile());
            }

            JAXBContext jaxbContext = JAXBContext.newInstance(AdhocQueryResponse.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            adhocQueryResponse = (AdhocQueryResponse) jaxbUnmarshaller.unmarshal(file);


        } catch (JAXBException e) {
            e.printStackTrace();
        }

        return adhocQueryResponse;
    }
}