/*
 *
 */

package com.clearavenue.mocksts;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Predicate;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.xml.security.signature.XMLSignatureException;
import org.opensaml.DefaultBootstrap;
import org.opensaml.common.xml.SAMLConstants;
import org.opensaml.saml2.core.Assertion;
import org.opensaml.saml2.core.Attribute;
import org.opensaml.saml2.core.AttributeValue;
import org.opensaml.ws.soap.soap11.Body;
import org.opensaml.ws.soap.soap11.Envelope;
import org.opensaml.ws.soap.soap11.Fault;
import org.opensaml.ws.soap.soap11.FaultCode;
import org.opensaml.ws.soap.soap11.FaultString;
import org.opensaml.ws.soap.soap11.impl.EnvelopeMarshaller;
import org.opensaml.ws.wstrust.OnBehalfOf;
import org.opensaml.ws.wstrust.RequestSecurityToken;
import org.opensaml.xml.Configuration;
import org.opensaml.xml.ConfigurationException;
import org.opensaml.xml.XMLObject;
import org.opensaml.xml.encryption.EncryptionConstants;
import org.opensaml.xml.io.Marshaller;
import org.opensaml.xml.io.MarshallingException;
import org.opensaml.xml.io.UnmarshallingException;
import org.opensaml.xml.schema.XSAny;
import org.opensaml.xml.schema.XSString;
import org.opensaml.xml.security.BasicSecurityConfiguration;
import org.opensaml.xml.util.XMLHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/**
 * The Class MockSTSController.
 */
@Controller
public class MockSTSController {

	/** The Constant logger. */
	static final Logger LOGGER = LoggerFactory.getLogger(MockSTSController.class);

	/** The json users url. */
	@Value("${mockssoi.usersUrl}")
	private String usersUrl;

	/** The err msg. */
	public String errMsg = "";

	/**
	 * Gets the STS token.
	 *
	 * @param req
	 *            the req
	 * @param resp
	 *            the resp
	 * @param map
	 *            the map
	 */
	@RequestMapping(value = "/generateToken", method = RequestMethod.POST)
	public void getToken(final HttpServletRequest req, final HttpServletResponse resp, final ModelMap map) {

		LOGGER.info("****** - MockSTS POST received");

		try {
			// bootstrap openSAML
			DefaultBootstrap.bootstrap();
			final BasicSecurityConfiguration config = (BasicSecurityConfiguration) Configuration.getGlobalSecurityConfiguration();
			config.setSignatureReferenceDigestMethod(EncryptionConstants.ALGO_ID_DIGEST_SHA256);

			// get request and unmarshall envelope
			final String xml = IOUtils.toString(req.getInputStream());
			final Envelope requestEnvelope = (Envelope) MockSTSUtils.unmarshallElementFromString(xml);
			final Body requestBody = requestEnvelope.getBody();
			final RequestSecurityToken rst = MockSTSUtils.getFirstElement(requestBody, RequestSecurityToken.class);
			final OnBehalfOf behalfOf = MockSTSUtils.getFirstElement(rst, OnBehalfOf.class);
			final Assertion inAssertion = MockSTSUtils.getFirstElement(behalfOf, Assertion.class);

			// get attribute from assertion
			final List<Attribute> attributes = inAssertion.getAttributeStatements().get(0).getAttributes();
			final String username = findAttributeValue(attributes, "username");

			// find mockuser in .json file and return soap fault if not found
			final MockUser mockuser = getUser(username);
			if (mockuser == null) {
				returnSoapFault(String.format("%s not found in mock users list", username), resp);
				return;
			}

			// generate signed saml token and wrap it in an envelope
			final String bodyId = UUID.randomUUID().toString();
			final STSTokenGenerator generator = new STSTokenGenerator(mockuser);
			final Envelope responseEnvelope = generator.generateResponse(bodyId);

			// marshall the envelope
			final EnvelopeMarshaller marshaller = new EnvelopeMarshaller();
			final Element res = marshaller.marshall(responseEnvelope);

			// convert it to string and write to response
			final StringWriter rspWrt = new StringWriter();
			XMLHelper.writeNode(res, rspWrt);
			resp.setContentType("text/xml");
			final PrintWriter writer = resp.getWriter();
			writer.write(rspWrt.toString());
			writer.flush();
			writer.close();

		} catch (final ParserConfigurationException e) {
			returnSoapFault(String.format("ParserConfigurationException : %s", e.getMessage()), resp);
		} catch (final SAXException e) {
			returnSoapFault(String.format("SAXException : %s", e.getMessage()), resp);
		} catch (final MarshallingException e) {
			returnSoapFault(String.format("MarshallingException : %s", e.getMessage()), resp);
		} catch (final UnmarshallingException e) {
			returnSoapFault(String.format("UnmarshallingException : %s", e.getMessage()), resp);
		} catch (final ConfigurationException e) {
			returnSoapFault(String.format("ConfigurationException : %s", e.getMessage()), resp);
		} catch (final XMLSignatureException e) {
			returnSoapFault(String.format("XMLSignatureException : %s", e.getMessage()), resp);
		} catch (final IOException e) {
			returnSoapFault(String.format("IOException : %s", e.getMessage()), resp);
		} catch (final IllegalArgumentException e) {
			returnSoapFault(String.format("IllegalArgumentException : %s", e.getMessage()), resp);
		} catch (final IllegalAccessException e) {
			returnSoapFault(String.format("IllegalAccessException : %s", e.getMessage()), resp);
		} catch (final NoSuchFieldException e) {
			returnSoapFault(String.format("NoSuchFieldException : %s", e.getMessage()), resp);
		} catch (final SecurityException e) {
			returnSoapFault(String.format("SecurityException : %s", e.getMessage()), resp);
		}
	}

	/**
	 * Returns a soap fault containing supplied message to the HttpServletResponse.
	 *
	 * @param message
	 *            the message to return in the soap fault
	 * @param resp
	 *            the response
	 */
	private void returnSoapFault(final String message, final HttpServletResponse resp) {

		try {
			final Envelope envelope = MockSTSUtils.createSAMLObject(Envelope.class);
			final Body body = MockSTSUtils.createSAMLObject(Body.class);
			final FaultCode fc = MockSTSUtils.createSAMLObject(FaultCode.class);
			final FaultString fs = MockSTSUtils.createSAMLObject(FaultString.class);
			final Fault fault = MockSTSUtils.createSAMLObject(Fault.class);
			fc.setValue(FaultCode.SERVER);
			fs.setValue(message);
			fault.setCode(fc);
			fault.setMessage(fs);

			body.getUnknownXMLObjects().add(fault);
			envelope.setBody(body);
			final EnvelopeMarshaller marshaller = new EnvelopeMarshaller();
			final Element res = marshaller.marshall(envelope);

			final StringWriter rspWrt = new StringWriter();
			XMLHelper.writeNode(res, rspWrt);
			resp.setContentType("text/xml");
			final PrintWriter writer = resp.getWriter();
			writer.write(rspWrt.toString());
			writer.flush();
			writer.close();
		} catch (final IOException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - IOException : {}", e.getMessage());
			}
		} catch (final MarshallingException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - MarshallingException : {}", e.getMessage());
			}
		} catch (final IllegalArgumentException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - IllegalArgumentException : {}", e.getMessage());
			}
		} catch (final IllegalAccessException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - IllegalAccessException : {}", e.getMessage());
			}
		} catch (final NoSuchFieldException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - NoSuchFieldException : {}", e.getMessage());
			}
		} catch (final SecurityException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - SecurityException : {}", e.getMessage());
			}
		}
	}

	/**
	 * Find attribute value for the supplied attribute name in the list of supplied attributes.
	 *
	 * @param attributes
	 *            the attributes list
	 * @param name
	 *            the name of the attribute to find
	 * @return the string value of the attribute
	 * @throws MarshallingException
	 *             the marshalling exception
	 */
	private String findAttributeValue(final List<Attribute> attributes, final String name) throws MarshallingException {
		final Attribute attr = CollectionUtils.find(attributes, new Predicate<Attribute>() {
			@Override
			public boolean evaluate(final Attribute object) {
				return object.getName().equals(name);
			}
		});

		return getAttributeValue(attr);
	}

	/**
	 * Gets the attribute value.
	 *
	 * @param attribute
	 *            the attribute
	 * @return the attribute value
	 * @throws MarshallingException
	 *             the marshalling exception
	 */
	private String getAttributeValue(final Attribute attribute) throws MarshallingException {
		for (int i = 0; i < attribute.getAttributeValues().size(); i++) {
			if (attribute.getAttributeValues().get(i) instanceof XSString) {
				final XSString str = (XSString) attribute.getAttributeValues().get(i);
				if (AttributeValue.DEFAULT_ELEMENT_LOCAL_NAME.equals(str.getElementQName().getLocalPart())
						&& SAMLConstants.SAML20_NS.equals(str.getElementQName().getNamespaceURI())) {
					return str.getValue();
				}
			} else {
				final XSAny ep = (XSAny) attribute.getAttributeValues().get(i);
				if (AttributeValue.DEFAULT_ELEMENT_LOCAL_NAME.equals(ep.getElementQName().getLocalPart())
						&& SAMLConstants.SAML20_NS.equals(ep.getElementQName().getNamespaceURI())) {
					if (ep.getUnknownXMLObjects().size() > 0) {
						final StringBuilder res = new StringBuilder();
						for (final XMLObject obj : ep.getUnknownXMLObjects()) {
							final Marshaller m = Configuration.getMarshallerFactory().getMarshaller(obj);
							res.append(XMLHelper.nodeToString(m.marshall(obj)));
						}
						return res.toString();
					}
					return ep.getTextContent();
				}
			}
		}
		return null;
	}

	/**
	 * Load users json file.
	 *
	 * @return the list of MockUsers from the json file
	 */
	private List<MockUser> loadUsers() {
		List<MockUser> users = new ArrayList<MockUser>();

		if (StringUtils.isBlank(usersUrl)) {
			LOGGER.error("Error loading mockssoi-users.json : usersUrl blank, check mockssoi.properties file.");
		} else {
			final String url = usersUrl;

			try {
				final String json = IOUtils.toString(new URL(url));
				if (StringUtils.isNotBlank(json)) {
					final Gson gson = new Gson();
					users = gson.fromJson(json, new TypeToken<List<MockUser>>() {
					}.getType());
				}
			} catch (final IOException e) {
				if (LOGGER.isErrorEnabled()) {
					LOGGER.error("Error loading mockssoi-users.json : {}", e.getMessage());
				}
			}
		}

		return users;
	}

	/**
	 * Gets the user object for the provided username.
	 *
	 * @param username
	 *            - the username to find
	 * @return the user object
	 */
	private MockUser getUser(final String username) {
		final List<MockUser> users = loadUsers();
		for (final MockUser user : users) {
			if (user.getUsername().equals(username)) {
				return user;
			}
		}
		return null;
	}
}

// @SuppressWarnings("unused")
// private void validate(final Envelope envelope) {
// try {
// final Body body = envelope.getBody();
// final RequestSecurityTokenResponseCollection rstrc = getFirstElement(body, RequestSecurityTokenResponseCollection.class);
// final RequestSecurityTokenResponse rstr = rstrc.getRequestSecurityTokenResponses().get(0);
// final RequestedSecurityToken rst = getFirstElement(rstr, RequestedSecurityToken.class);
// final Assertion assertion = (Assertion) rst.getUnknownXMLObject();
// if (assertion != null) {
// final Signature signature = assertion.getSignature();
// final SAMLSignatureProfileValidator profileValidator = new SAMLSignatureProfileValidator();
// try {
// profileValidator.validate(signature);
// final Header header = envelope.getHeader();
// final Security security = getFirstElement(header, Security.class);
// final BinarySecurityToken bst = getFirstElement(security, BinarySecurityToken.class);
// final byte[] decoded = Base64.decode(bst.getValue());
// final X509Certificate cert = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new ByteArrayInputStream(decoded));
// final BasicX509Credential credential = new BasicX509Credential();
// credential.setEntityCertificate(cert);
// final SignatureValidator signatureValidator = new SignatureValidator(credential);
// signatureValidator.validate(signature);
// logger.info("****** - validation PASSED");
//
// } catch (final ValidationException e) {
// if (logger.isInfoEnabled()) {
// logger.info("****** - validation FAILED : " + e.getMessage());
// }
// }
// }
// } catch (final Exception e) {
// if (logger.isInfoEnabled()) {
// logger.info("validation FAILED : " + e.getMessage());
// }
// }
// }