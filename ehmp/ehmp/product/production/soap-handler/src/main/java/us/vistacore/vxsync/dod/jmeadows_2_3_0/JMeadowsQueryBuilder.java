package us.vistacore.vxsync.dod.jmeadows_2_3_0;


import gov.va.med.jmeadows_2_3_0.webservice.JMeadowsQuery;
import gov.va.med.jmeadows_2_3_0.webservice.Patient;
import gov.va.med.jmeadows_2_3_0.webservice.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.vxsync.dod.AbstractJMeadowsQueryBuilder;

import javax.xml.datatype.XMLGregorianCalendar;

public class JMeadowsQueryBuilder extends AbstractJMeadowsQueryBuilder {

    private static final Logger LOG = LoggerFactory.getLogger(JMeadowsQueryBuilder.class);

    private User user;
    private Patient patient;

    @Override
    public AbstractJMeadowsQueryBuilder patient(Object patient) {
        this.patient = (Patient) patient;
        return this;
    }

    @Override
    public AbstractJMeadowsQueryBuilder user(Object user) {
        this.user = (User) user;
        return this;
    }

    @Override
    public Object build() {
        LOG.debug("JMeadowsQueryBuilder.build - Entering method...()");

        JMeadowsQuery queryBean = new JMeadowsQuery();
        queryBean.setActive(active);
        queryBean.setItemId(itemId);
        queryBean.setStatus(status);
        queryBean.setSortBy(sortBy);
        queryBean.setRecordSiteCode(recordSiteCode);
        queryBean.setMax(max);
        queryBean.setRequestingApp(requestingAppName);
        queryBean.setUser(user);
        queryBean.setPatient(patient);

        XMLGregorianCalendar startXmlDate = null;
        XMLGregorianCalendar endXmlDate = null;

        if (startDate != null) {
            startXmlDate = toXMLGregorianCalendar(pushCalendarToStartOfDay(startDate));
        }

        if (endDate != null) {
            endXmlDate = toXMLGregorianCalendar(pushCalendarToEndOfDay(endDate));
        }

        queryBean.setStartDate(startXmlDate);
        queryBean.setEndDate(endXmlDate);

        return queryBean;
    }
}
