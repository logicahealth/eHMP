package us.vistacore.vxsync.mvi;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;

import javax.xml.XMLConstants;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.SOAPConnection;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPMessage;
import javax.xml.transform.OutputKeys;
import javax.xml.XMLConstants;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.hl7.v3.PRPAIN201309UV02;
import org.hl7.v3.PRPAIN201310UV02;
import org.hl7.v3.PRPAIN201305UV02;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import us.vistacore.vxsync.config.MviConfiguration;

public class MviSoapConnection {
	
	private static MviConfiguration config;
	private static final Logger LOG = LoggerFactory.getLogger(MviSoapConnection.class);
	private static SOAPConnectionFactory factory;
	private static String url;
	
	static {
		try {
			factory = SOAPConnectionFactory.newInstance();
		} catch (UnsupportedOperationException | SOAPException e) {
			LOG.error("Unable to create MVI Connection Factory", e);
		}
	}

	public static void setConfiguration(MviConfiguration config) {
		LOG.debug("MVI configuration set");
		MviSoapConnection.config = config;
	}
	public String send1305Message(PRPAIN201305UV02 message, boolean debug) {
		LOG.debug("Starting send1305Message");
		return sendHl7Message(message, "PRPA_IN201306UV02", debug);
	}
	public String send1309Message(PRPAIN201309UV02 message, boolean debug) {
		LOG.debug("Starting send1309Message");
		return sendHl7Message(message, "PRPA_IN201310UV02", debug);
	}
	private String sendHl7Message(Object message, String resultPattern, boolean debug) {

		SOAPMessage request = makeSOAPMessage(message);
		LOG.debug("SOAP body built");
		if (debug) {
			String outSoapMsg = prettyPrintSOAPMessage(request);
			if (outSoapMsg != null) {
				LOG.info(outSoapMsg);
			}
		}
		try {
			LOG.debug("Making connection to MVI");
			SOAPConnection connection = factory.createConnection();

            LOG.debug("Invoking MVI call to " + getMviUri());
			SOAPMessage response = connection.call(request, getMviUri());
			if (debug) {
				try {
					ByteArrayOutputStream resStream = new ByteArrayOutputStream();
					response.writeTo(resStream);
					LOG.warn(new String(resStream.toByteArray(), "UTF-8"));
				} catch (Exception e) {
					LOG.error("Unable to parse SOAP response", e);
				}
			}
			NodeList children = response.getSOAPBody().getChildNodes();
			Node responseBody = null;
			for(int i = 0; i < children.getLength(); i++) {
				Node currentNode = children.item(i);
				if(resultPattern.equals(currentNode.getLocalName())) {
					responseBody = currentNode;
					LOG.debug("Find the result pattern");
					break;
				}
			}

			return nodeToString(responseBody);
		} catch (UnsupportedOperationException | SOAPException e) {
			LOG.error("Unable to successfully communicate with MVI",e);
		}

		return null;
	}

	private String getMviUri() {
		if(url == null) {
            url = String.format("%s://%s:%s%s", config.getProtocol(), config.getHost(), config.getPort(), config.getPath());
		}
		return url;
	}
	
	private <E> E makePOJOFromBody(Node body, Class<E> clazz) {
		try {
			JAXBContext context = JAXBContext.newInstance(clazz);
			Unmarshaller unmarshaller = context.createUnmarshaller();
			return (E) unmarshaller.unmarshal(body);
		} catch (JAXBException e) {
			LOG.error("Unable to unmarshal SOAP body to POJO",e);
		}
		return null;
	}

	SOAPMessage makeSOAPMessage(Object message) {
		LOG.debug("Converting POJO into SOAP message");
		try{
			Document document = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
			Marshaller marshaller = JAXBContext.newInstance(message.getClass()).createMarshaller();
			marshaller.marshal(message, document);
			
			SOAPMessage soap = MessageFactory.newInstance().createMessage();
			soap.getSOAPBody().addDocument(document);
			soap.getSOAPPart().getEnvelope().setPrefix("soapenv");
			soap.getSOAPPart().getEnvelope().removeNamespaceDeclaration("SOAP-ENV");
			soap.getSOAPBody().setPrefix("soapenv");
			soap.getSOAPHeader().setPrefix("soapenv");
			soap.getSOAPBody().getFirstChild().setPrefix("vaww");
			
			return soap;
		} catch (Exception e){
			LOG.error("Unable to create SOAP message",e);
		}
		return null;
	}

	String prettyPrintSOAPMessage(SOAPMessage soapMessage) {
		try {
			TransformerFactory tf = TransformerFactory.newInstance();
			tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
			tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
			Transformer t = tf.newTransformer();
			t.setOutputProperty(OutputKeys.INDENT, "yes");
 			t.setOutputProperty("{http://xml.apache.org/xslt}indent-amount","2");
			ByteArrayOutputStream reqStream = new ByteArrayOutputStream();
 			t.transform(soapMessage.getSOAPPart().getContent(), new StreamResult(reqStream));
 			return reqStream.toString();
		} catch (Exception e) {
			LOG.error("Unable to parse SOAP request", e);
			return null;
		}
	}

	private String nodeToString(Node node) {
		  StringWriter sw = new StringWriter();
		  try {
			TransformerFactory tf = TransformerFactory.newInstance();
			tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
			tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
			
		    Transformer t = tf.newTransformer();
		    t.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
		    t.transform(new DOMSource(node), new StreamResult(sw));
		  } catch (TransformerException te) {
		    LOG.error("nodeToString Transformer Exception");
		  }
		  return sw.toString();
		}

}
