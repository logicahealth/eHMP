package us.vistacore.asu.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import us.vistacore.asu.dao.JdsDao;
import us.vistacore.asu.rules.ASURules;

@Component
public class ScheduledRuleRefreshJob {

    private static final Logger log = LoggerFactory.getLogger(ScheduledRuleRefreshJob.class);

    private final JdsDao dao;

    @Autowired
    public ScheduledRuleRefreshJob(JdsDao dao) {
        this.dao = dao;
    }

    @Scheduled(fixedDelayString = "${rule.refresh.interval.ms}", initialDelayString = "${rule.refresh.initial.delay.ms}")
    public void refreshAsuRules() {
        log.debug("ASU rules internally refreshing");
        ASURules.refreshRules(dao);
        log.debug("ASU rules internally refreshed");
     }
}
