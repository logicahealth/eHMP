/*
 *
 */
package com.clearavenue.mocksts;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import javax.xml.namespace.QName;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.opensaml.xml.Configuration;
import org.opensaml.xml.ElementExtensibleXMLObject;
import org.opensaml.xml.XMLObject;
import org.opensaml.xml.XMLObjectBuilderFactory;
import org.opensaml.xml.io.Unmarshaller;
import org.opensaml.xml.io.UnmarshallingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * The Class MockSTSUtils.
 */
public class MockSTSUtils {

	/** The Constant logger. */
	final static Logger logger = LoggerFactory.getLogger(MockSTSUtils.class);

	/** The Constant builderFactory. */
	private static final XMLObjectBuilderFactory builderFactory = Configuration.getBuilderFactory();

	/**
	 * Creates the saml object of supplied Class using the OpenSAML builderFactory
	 *
	 * @param <T>
	 *            the generic type
	 * @param clazz
	 *            the clazz of the SAML object to create
	 * @return the OpenSAML object of type T
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	@SuppressWarnings("unchecked")
	public static <T> T createXMLObject(final Class<T> clazz) throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final QName defaultElementName = (QName) clazz.getDeclaredField("ELEMENT_NAME").get(null);
		final T object = (T) builderFactory.getBuilder(defaultElementName).buildObject(defaultElementName);
		return object;
	}

	@SuppressWarnings("unchecked")
	public static <T> T createSAMLObject(final Class<T> clazz) throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final QName defaultElementName = (QName) clazz.getDeclaredField("DEFAULT_ELEMENT_NAME").get(null);
		final T object = (T) builderFactory.getBuilder(defaultElementName).buildObject(defaultElementName);
		return object;
	}

	/**
	 * Gets the first element in the XMLObject of the supplied Class.
	 *
	 * @param <T>
	 *            the generic class of XMLObject to find
	 * @param obj
	 *            the parent object to find search in
	 * @param type
	 *            the type of the element to find
	 * @return the first element of the supplied class
	 */
	@SuppressWarnings("unchecked")
	public static <T extends XMLObject> T getFirstElement(final ElementExtensibleXMLObject obj, final Class<T> type) {
		if (obj == null) {
			return null;
		}

		for (final XMLObject o : obj.getUnknownXMLObjects()) {
			if (type.isInstance(o)) {
				return (T) o;
			}
		}
		return null;
	}

	/**
	 * Unmarshall element from string.
	 *
	 * @param elementString
	 *            the element string
	 * @return the XML object
	 * @throws UnmarshallingException
	 *             the unmarshalling exception
	 * @throws ParserConfigurationException
	 *             the parser configuration exception
	 * @throws SAXException
	 *             the SAX exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	public static XMLObject unmarshallElementFromString(final String elementString) throws UnmarshallingException, ParserConfigurationException, SAXException, IOException {
		try {
			final Element samlElement = loadElementFromString(elementString);

			final Unmarshaller unmarshaller = Configuration.getUnmarshallerFactory().getUnmarshaller(samlElement);
			if (unmarshaller == null) {
				logger.error("****** - Unable to retrieve unmarshaller by DOM Element");
				throw new IllegalArgumentException("No unmarshaller for " + elementString);
			}

			return unmarshaller.unmarshall(samlElement);
		} catch (final UnmarshallingException e) {
			if (logger.isErrorEnabled()) {
				logger.error("****** - Unmarshalling failed when parsing element string " + elementString, e);
			}
			throw e;
		}
	}

	/**
	 * Load element from string.
	 *
	 * @param elementString
	 *            the element string
	 * @return the element
	 * @throws ParserConfigurationException
	 *             the parser configuration exception
	 * @throws SAXException
	 *             the SAX exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	private static Element loadElementFromString(final String elementString) throws ParserConfigurationException, SAXException, IOException {
		try {
			final DocumentBuilderFactory newFactory = getDocumentBuilderFactory();
			newFactory.setNamespaceAware(true);

			final DocumentBuilder builder = newFactory.newDocumentBuilder();

			final Document doc = builder.parse(new ByteArrayInputStream(elementString.getBytes("UTF-8")));
			final Element samlElement = doc.getDocumentElement();

			return samlElement;
		} catch (final ParserConfigurationException e) {
			if (logger.isErrorEnabled()) {
				logger.error("****** - ParserConfigurationException {} : {}", elementString, e.getMessage());
			}
			throw e;
		} catch (final SAXException e) {
			if (logger.isErrorEnabled()) {
				logger.error("****** - SAXException {} : {}", elementString, e.getMessage());
			}
			throw e;
		} catch (final IOException e) {
			if (logger.isErrorEnabled()) {
				logger.error("****** - IOException {} : {} ", elementString, e.getMessage());
			}
			throw e;
		}
	}

	/**
	 * Gets the document builder factory.
	 *
	 * @return the document builder factory
	 * @throws ParserConfigurationException
	 *             the parser configuration exception
	 */
	private static DocumentBuilderFactory getDocumentBuilderFactory() throws ParserConfigurationException {
		final DocumentBuilderFactory newFactory = DocumentBuilderFactory.newInstance();
		newFactory.setNamespaceAware(true);
		final String FEATURE = "http://xml.org/sax/features/external-general-entities";
		newFactory.setFeature(FEATURE, false);
		return newFactory;
	}

}
