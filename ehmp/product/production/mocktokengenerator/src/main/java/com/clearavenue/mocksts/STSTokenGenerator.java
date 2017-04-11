/*
 *
 */
package com.clearavenue.mocksts;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.UnrecoverableEntryException;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.UUID;

import javax.xml.namespace.QName;

import org.apache.xml.security.signature.XMLSignatureException;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.opensaml.Configuration;
import org.opensaml.saml2.core.Assertion;
import org.opensaml.saml2.core.Attribute;
import org.opensaml.saml2.core.AttributeStatement;
import org.opensaml.saml2.core.AttributeValue;
import org.opensaml.saml2.core.Audience;
import org.opensaml.saml2.core.AudienceRestriction;
import org.opensaml.saml2.core.AuthnContext;
import org.opensaml.saml2.core.AuthnContextClassRef;
import org.opensaml.saml2.core.AuthnStatement;
import org.opensaml.saml2.core.Conditions;
import org.opensaml.saml2.core.Issuer;
import org.opensaml.saml2.core.NameID;
import org.opensaml.saml2.core.NameIDType;
import org.opensaml.saml2.core.Subject;
import org.opensaml.saml2.core.SubjectConfirmation;
import org.opensaml.saml2.core.SubjectConfirmationData;
import org.opensaml.ws.soap.soap11.Body;
import org.opensaml.ws.soap.soap11.Envelope;
import org.opensaml.ws.soap.soap11.Header;
import org.opensaml.ws.soap.util.SOAPHelper;
import org.opensaml.ws.wsaddressing.Address;
import org.opensaml.ws.wsaddressing.EndpointReference;
import org.opensaml.ws.wspolicy.AppliesTo;
import org.opensaml.ws.wssecurity.BinarySecurityToken;
import org.opensaml.ws.wssecurity.Created;
import org.opensaml.ws.wssecurity.Expires;
import org.opensaml.ws.wssecurity.KeyIdentifier;
import org.opensaml.ws.wssecurity.Reference;
import org.opensaml.ws.wssecurity.Security;
import org.opensaml.ws.wssecurity.SecurityTokenReference;
import org.opensaml.ws.wssecurity.Timestamp;
import org.opensaml.ws.wssecurity.WSSecurityConstants;
import org.opensaml.ws.wstrust.Lifetime;
import org.opensaml.ws.wstrust.RequestSecurityTokenResponse;
import org.opensaml.ws.wstrust.RequestSecurityTokenResponseCollection;
import org.opensaml.ws.wstrust.RequestedAttachedReference;
import org.opensaml.ws.wstrust.RequestedSecurityToken;
import org.opensaml.xml.io.MarshallingException;
import org.opensaml.xml.schema.XSString;
import org.opensaml.xml.schema.impl.XSStringBuilder;
import org.opensaml.xml.security.x509.BasicX509Credential;
import org.opensaml.xml.signature.KeyInfo;
import org.opensaml.xml.signature.Signature;
import org.opensaml.xml.signature.SignatureConstants;
import org.opensaml.xml.signature.SignatureException;
import org.opensaml.xml.signature.Signer;
import org.opensaml.xml.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The Class STSTokenGenerator.
 */
public class STSTokenGenerator {

	/** The Constant COMMUNITY_ID. */
	private static final String COMMUNITY_ID = "urn:oid:2.16.840.1.113883.4.349";

	/** The Constant ASS_LEVEL. */
	private static final String ASS_LEVEL = "2";

	/** The Constant NPI. */
	private static final String NPI = "IAM AD";

	/** The Constant AUTHENTICATION_TYPE. */
	private static final String AUTHENTICATION_TYPE = "Indirect";

	/** The Constant AUTHNSYSTEM. */
	private static final String AUTHNSYSTEM = "SSOi";

	/** The Constant JKS_ALIAS. */
	private static final String JKS_ALIAS = "mocksts";

	/** The Constant JKS_PASSWORD. */
	private static final String JKS_PASSWORD       PW";

	/** The Constant SIGNING_JKS. */
	private static final String SIGNING_JKS = "mocksts.jks";

	/** The Constant ISSUER. */
	private static final String ISSUER = "int.services.eauth.DNS   ";

	/** The Constant VALID_SECONDS. */
	private static final int VALID_SECONDS = 360;

	/** The Constant SUBJECT_URL. */
	private static final String SUBJECT_URL = "http://SSOi/AppliesTo/SAML2";

	/** The Constant ID_TYPE. */
	public static final QName ID_TYPE = new QName("ID");

	/** The Constant VALUE_TYPE. */
	public static final QName VALUE_TYPE = new QName("ValueType");

	/** The Constant SAMLID. */
	public static final String SAMLID = "http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLID";

	/** The Constant TOKEN_TYPE_SAML_20. */
	public static final String TOKEN_TYPE_SAML_20 = "http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0";

	/** The Constant TOKEN_TYPE. */
	public static final QName TOKEN_TYPE = new QName(WSSecurityConstants.WSSE11_NS, "TokenType", WSSecurityConstants.WSSE11_PREFIX);

	/** The Constant logger. */
	final static Logger LOGGER = LoggerFactory.getLogger(STSTokenGenerator.class);

	/** The username. */
	private String username;

	/** The user. */
	private final MockUser user;

	/**
	 * Instantiates a new STS token generator.
	 *
	 * @param mockuser
	 *            the mockuser object with info about the user
	 */
	public STSTokenGenerator(final MockUser mockuser) {
		user = mockuser;
	}

	/**
	 * Generate SOAP envelope response containing a Header with the X509 cert used to sign the assertion found in the Body.
	 *
	 * @param bodyId
	 *            the body id to use in building the references
	 * @return the SOAP envelope
	 * @throws XMLSignatureException
	 *             the XML signature exception
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	public Envelope generateResponse(final String bodyId) throws XMLSignatureException, IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {

		final Security security = MockSTSUtils.createXMLObject(Security.class);
		SOAPHelper.addSOAP11MustUnderstandAttribute(security, true);

		final Timestamp timestamp = generateTimestamp(VALID_SECONDS);
		final BinarySecurityToken secToken = generateBinarySecurityToken();
		security.getUnknownXMLObjects().add(timestamp);
		security.getUnknownXMLObjects().add(secToken);

		final Assertion assertion = generateAssertion();
		signAssertion(assertion, secToken.getWSUId());

		final Body body = generateBody(assertion);
		body.getUnknownAttributes().put(ID_TYPE, String.format("Body-%s", bodyId));

		final Header header = MockSTSUtils.createSAMLObject(Header.class);
		header.getUnknownXMLObjects().add(security);

		final Envelope envelope = MockSTSUtils.createSAMLObject(Envelope.class);
		envelope.setHeader(header);
		envelope.setBody(body);

		return envelope;
	}

	/**
	 * Generate body.
	 *
	 * @param assertion
	 *            the assertion
	 * @return the body
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Body generateBody(final Assertion assertion) throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {

		final RequestSecurityTokenResponse rstr = MockSTSUtils.createXMLObject(RequestSecurityTokenResponse.class);

		// appliesTO
		final AppliesTo appliesTo = getAppliesTo();
		rstr.getUnknownXMLObjects().add(appliesTo);

		// lifetime
		final Lifetime lt = generateLifetime(VALID_SECONDS);
		rstr.getUnknownXMLObjects().add(lt);

		// RST
		final RequestedSecurityToken rst = generateRequestedSecurityToken(assertion);
		rstr.getUnknownXMLObjects().add(rst);

		// RAR
		final RequestedAttachedReference rar = MockSTSUtils.createXMLObject(RequestedAttachedReference.class);
		rar.setSecurityTokenReference(generateTokenReference(assertion));
		rstr.getUnknownXMLObjects().add(rar);

		final RequestSecurityTokenResponseCollection rstrc = MockSTSUtils.createXMLObject(RequestSecurityTokenResponseCollection.class);
		rstrc.getRequestSecurityTokenResponses().add(rstr);

		final Body body = MockSTSUtils.createSAMLObject(Body.class);
		body.getUnknownXMLObjects().add(rstrc);
		return body;
	}

	/**
	 * Gets the applies to.
	 *
	 * @return the applies to
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private AppliesTo getAppliesTo() throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final Address address = MockSTSUtils.createXMLObject(Address.class);
		address.setValue(SUBJECT_URL);
		final EndpointReference ep = MockSTSUtils.createXMLObject(EndpointReference.class);
		ep.setAddress(address);

		final AppliesTo at = MockSTSUtils.createXMLObject(AppliesTo.class);
		at.getUnknownXMLObjects().add(ep);
		return at;
	}

	/**
	 * Generate token reference.
	 *
	 * @param assertion
	 *            the assertion
	 * @return the security token reference
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private SecurityTokenReference generateTokenReference(final Assertion assertion)
			throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final SecurityTokenReference str = MockSTSUtils.createXMLObject(SecurityTokenReference.class);

		final KeyIdentifier keyIdentifier = MockSTSUtils.createXMLObject(KeyIdentifier.class);
		keyIdentifier.setValue(assertion.getID());
		keyIdentifier.getUnknownAttributes().put(VALUE_TYPE, SAMLID);
		keyIdentifier.setEncodingType(null);
		str.getUnknownAttributes().put(TOKEN_TYPE, TOKEN_TYPE_SAML_20);
		str.getUnknownXMLObjects().add(keyIdentifier);

		return str;
	}

	/**
	 * Generate requested security token.
	 *
	 * @param assertion
	 *            the assertion
	 * @return the requested security token
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private RequestedSecurityToken generateRequestedSecurityToken(final Assertion assertion)
			throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final RequestedSecurityToken rst = MockSTSUtils.createXMLObject(RequestedSecurityToken.class);
		rst.setUnknownXMLObject(assertion);
		return rst;
	}

	/**
	 * Generate binary security token.
	 *
	 * @return the binary security token
	 * @throws XMLSignatureException
	 *             the XML signature exception
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private BinarySecurityToken generateBinarySecurityToken()
			throws XMLSignatureException, IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final BasicX509Credential credential = getX509Credential();
		final BinarySecurityToken bst = MockSTSUtils.createXMLObject(BinarySecurityToken.class);

		bst.setEncodingType("http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary");
		bst.getUnknownAttributes().put(VALUE_TYPE, "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3");
		bst.setWSUId(String.format("BST-%s", UUID.randomUUID().toString()));

		try {
			bst.setValue(Base64.encodeBytes(credential.getEntityCertificate().getEncoded()));
		} catch (final CertificateEncodingException e) {
			throw new XMLSignatureException(e.getMessage());
		}
		return bst;
	}

	/**
	 * Generate assertion.
	 *
	 * @return the assertion
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Assertion generateAssertion() throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final Assertion assertion = MockSTSUtils.createSAMLObject(Assertion.class);
		final Subject subject = generateSubject(SUBJECT_URL, VALID_SECONDS, getUsername());
		final Issuer issuer = generateIssuer();

		// include audience as per spec
		final Audience audience = MockSTSUtils.createSAMLObject(Audience.class);
		audience.setAudienceURI(SUBJECT_URL);
		final AudienceRestriction audienceRestriction = MockSTSUtils.createSAMLObject(AudienceRestriction.class);
		audienceRestriction.getAudiences().add(audience);

		final Conditions conditions = MockSTSUtils.createSAMLObject(Conditions.class);
		conditions.getAudienceRestrictions().add(audienceRestriction);

		final AuthnStatement authnStatement = generateAuthnStatement();
		assertion.setIssuer(issuer);
		assertion.setSubject(subject);
		assertion.setConditions(conditions);
		assertion.getAuthnStatements().add(authnStatement);

		final AttributeStatement attributeStatement = generateAttributeStatement();
		attributeStatement.getAttributes().add(generateAttribute("authnsystem", AUTHNSYSTEM));
		attributeStatement.getAttributes().add(generateAttribute("authenticationtype", AUTHENTICATION_TYPE));
		attributeStatement.getAttributes().add(generateAttribute("urn:oasis:names:tc:xspa:2.0:subject:npi", NPI));
		attributeStatement.getAttributes().add(generateAttribute("assurancelevel", ASS_LEVEL));
		attributeStatement.getAttributes().add(generateAttribute("urn:nhin:names:saml:homeCommunityId", COMMUNITY_ID));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:transactionid", UUID.randomUUID().toString()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:secid", user.getSecId()));
		attributeStatement.getAttributes().add(generateAttribute("uniqueUserId", user.getUsername()));
		attributeStatement.getAttributes().add(generateAttribute("firstname", user.getFirstname()));
		attributeStatement.getAttributes().add(generateAttribute("lastname", user.getLastname()));
		attributeStatement.getAttributes().add(generateAttribute("role", user.getRole()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:mviicn", user.getIcn()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:corpid", user.getCorpId()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:dodedipnid", user.getEdipi()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:ad:samaccountname", user.getAdSamAccountName()));
		attributeStatement.getAttributes().add(generateAttribute("upn", user.getAdUpn()));
		attributeStatement.getAttributes().add(generateAttribute("email", user.getAdEmail()));
		attributeStatement.getAttributes().add(generateAttribute("urn:va:vrm:iam:vistaid", String.format("%s_%s", user.getSite(), user.getDuz())));
		attributeStatement.getAttributes()
				.add(generateAttribute("urn:oasis:names:tc:xspa:1.0:subject:subject-id", String.format("%s %s", user.getFirstname(), user.getLastname())));

		assertion.getAttributeStatements().add(attributeStatement);
		assertion.setID(String.format("Assertion-%s", UUID.randomUUID().toString()));
		assertion.setIssueInstant(new DateTime());

		return assertion;

	}

	/**
	 * Generate subject.
	 *
	 * @param recepient
	 *            the recepient
	 * @param validForInSeconds
	 *            the valid for in seconds
	 * @param name
	 *            the name
	 * @return the subject
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Subject generateSubject(final String recepient, final int validForInSeconds, final String name)
			throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final NameID nameID = MockSTSUtils.createSAMLObject(NameID.class);
		nameID.setValue(name);
		nameID.setFormat(NameIDType.PERSISTENT);

		final Subject subject = MockSTSUtils.createSAMLObject(Subject.class);
		subject.setNameID(nameID);

		final SubjectConfirmation subjectConfirmation = MockSTSUtils.createSAMLObject(SubjectConfirmation.class);
		subjectConfirmation.setMethod(SubjectConfirmation.METHOD_BEARER);

		final SubjectConfirmationData subjectConfirmationData = MockSTSUtils.createSAMLObject(SubjectConfirmationData.class);
		subjectConfirmationData.setRecipient(recepient);
		subjectConfirmationData.setNotOnOrAfter(new DateTime().plusSeconds(validForInSeconds));
		subjectConfirmation.setSubjectConfirmationData(subjectConfirmationData);
		subject.getSubjectConfirmations().add(subjectConfirmation);

		return subject;
	}

	/**
	 * Generate issuer.
	 *
	 * @return the issuer
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Issuer generateIssuer() throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final Issuer issuer = MockSTSUtils.createSAMLObject(Issuer.class);
		issuer.setValue(ISSUER);
		issuer.setFormat(NameIDType.ENTITY);
		return issuer;
	}

	/**
	 * Generate authn statement.
	 *
	 * @return the authn statement
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private AuthnStatement generateAuthnStatement() throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final AuthnContextClassRef authnContextClassRef = MockSTSUtils.createSAMLObject(AuthnContextClassRef.class);
		authnContextClassRef.setAuthnContextClassRef(AuthnContext.PASSWORD_AUTHN_CTX);

		final AuthnContext authnContext = MockSTSUtils.createSAMLObject(AuthnContext.class);
		authnContext.setAuthnContextClassRef(authnContextClassRef);

		final AuthnStatement authnStatement = MockSTSUtils.createSAMLObject(AuthnStatement.class);
		authnStatement.setAuthnContext(authnContext);
		authnStatement.setAuthnInstant(new DateTime());

		return authnStatement;
	}

	/**
	 * Generate attribute statement.
	 *
	 * @return the attribute statement
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private AttributeStatement generateAttributeStatement() throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final AttributeStatement attributeStatement = MockSTSUtils.createSAMLObject(AttributeStatement.class);
		return attributeStatement;
	}

	/**
	 * Generate attribute.
	 *
	 * @param attrName
	 *            the attr name
	 * @param attrValue
	 *            the attr value
	 * @return the attribute
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Attribute generateAttribute(final String attrName, final String attrValue)
			throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final Attribute attribute = MockSTSUtils.createSAMLObject(Attribute.class);
		attribute.setName(attrName);

		final XSStringBuilder stringBuilder = (XSStringBuilder) Configuration.getBuilderFactory().getBuilder(XSString.TYPE_NAME);
		final XSString stringValue = stringBuilder.buildObject(AttributeValue.DEFAULT_ELEMENT_NAME, XSString.TYPE_NAME);
		stringValue.setValue(attrValue);

		attribute.getAttributeValues().add(stringValue);
		return attribute;
	}

	/**
	 * Generate timestamp.
	 *
	 * @param timestampSkew
	 *            the timestamp skew
	 * @return the timestamp
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	public Timestamp generateTimestamp(final int timestampSkew) throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final DateTime now = new DateTime().toDateTime(DateTimeZone.UTC);

		final Timestamp timestamp = MockSTSUtils.createXMLObject(Timestamp.class);

		final Created created = MockSTSUtils.createXMLObject(Created.class);
		created.setDateTime(now.minusSeconds(timestampSkew));
		timestamp.setCreated(created);

		final Expires exp = MockSTSUtils.createXMLObject(Expires.class);
		exp.setDateTime(now.plusSeconds(timestampSkew));
		timestamp.setExpires(exp);

		return timestamp;
	}

	/**
	 * Generate lifetime.
	 *
	 * @param timestampSkew
	 *            the timestamp skew
	 * @return the lifetime
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	public Lifetime generateLifetime(final int timestampSkew) throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final DateTime now = new DateTime().toDateTime(DateTimeZone.UTC);

		final Lifetime lifetime = MockSTSUtils.createXMLObject(Lifetime.class);

		final Created created = MockSTSUtils.createXMLObject(Created.class);
		created.setDateTime(now.minusSeconds(timestampSkew));
		lifetime.setCreated(created);

		final Expires exp = MockSTSUtils.createXMLObject(Expires.class);
		exp.setDateTime(now.plusSeconds(timestampSkew));
		lifetime.setExpires(exp);

		return lifetime;
	}

	/**
	 * Gets the x509 credential.
	 *
	 * @return the x509 credential
	 */
	private BasicX509Credential getX509Credential() {
		final ClassLoader classloader = Thread.currentThread().getContextClassLoader();
		final BasicX509Credential credential = new BasicX509Credential();

		try {
			KeyStore keystore;
			keystore = KeyStore.getInstance(KeyStore.getDefaultType());

			final InputStream inputStream = classloader.getResourceAsStream(SIGNING_JKS);
			keystore.load(inputStream, JKS_PASSWORD.toCharArray());
			inputStream.close();

			KeyStore.PrivateKeyEntry pkEntry = null;
			pkEntry = (KeyStore.PrivateKeyEntry) keystore.getEntry(JKS_ALIAS, new KeyStore.PasswordProtection(JKS_PASSWORD.toCharArray()));
			final PrivateKey pk = pkEntry.getPrivateKey();

			final X509Certificate certificate = (X509Certificate) pkEntry.getCertificate();
			credential.setEntityCertificate(certificate);
			credential.setPrivateKey(pk);
		} catch (final KeyStoreException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - KeyStoreException : {}", e.getMessage());
			}
		} catch (final FileNotFoundException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - FileNotFoundException : {}", e.getMessage());
			}
		} catch (final NoSuchAlgorithmException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - NoSuchAlgorithmException : {}", e.getMessage());
			}
		} catch (final CertificateException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - CertificateException : {}", e.getMessage());
			}
		} catch (final IOException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - IOException : {}", e.getMessage());
			}
		} catch (final UnrecoverableEntryException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - UnrecoverableEntryException : {}", e.getMessage());
			}
		}

		return credential;

	}

	/**
	 * Sign assertion.
	 *
	 * @param assertion
	 *            the assertion
	 * @param keyId
	 *            the key id
	 * @return the signature
	 * @throws IllegalArgumentException
	 *             the illegal argument exception
	 * @throws IllegalAccessException
	 *             the illegal access exception
	 * @throws NoSuchFieldException
	 *             the no such field exception
	 * @throws SecurityException
	 *             the security exception
	 */
	private Signature signAssertion(final Assertion assertion, final String keyId)
			throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException, SecurityException {
		final Signature signature = MockSTSUtils.createSAMLObject(Signature.class);
		try {
			final BasicX509Credential credential = getX509Credential();
			signature.setSigningCredential(credential);
			signature.setSignatureAlgorithm(SignatureConstants.ALGO_ID_SIGNATURE_RSA_SHA256);
			signature.setCanonicalizationAlgorithm(SignatureConstants.ALGO_ID_C14N_EXCL_OMIT_COMMENTS);

			final Reference ref = MockSTSUtils.createXMLObject(Reference.class);
			ref.setURI(String.format("#%s", keyId));
			ref.setValueType(WSSecurityConstants.X509_V3);

			final SecurityTokenReference str = MockSTSUtils.createXMLObject(SecurityTokenReference.class);
			str.getUnknownXMLObjects().add(ref);

			final KeyInfo keyinfo = MockSTSUtils.createSAMLObject(KeyInfo.class);
			keyinfo.getXMLObjects().add(str);
			signature.setKeyInfo(keyinfo);

			assertion.setSignature(signature);

			Configuration.getMarshallerFactory().getMarshaller(assertion).marshall(assertion);
			Signer.signObject(signature);

		} catch (final MarshallingException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - MarshallingException : {}", e.getMessage());
			}
		} catch (final SignatureException e) {
			if (LOGGER.isErrorEnabled()) {
				LOGGER.error("****** - SignatureException : {}", e.getMessage());
			}
		}
		return signature;
	}

	/**
	 * Gets the username.
	 *
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * Sets the username.
	 *
	 * @param username
	 *            the new username
	 */
	public void setUsername(final String username) {
		this.username = username;
	}

}
