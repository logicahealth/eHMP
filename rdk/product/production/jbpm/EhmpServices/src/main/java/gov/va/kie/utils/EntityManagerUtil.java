package gov.va.kie.utils;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.kie.api.runtime.Environment;
import org.kie.api.runtime.EnvironmentName;
import org.kie.api.runtime.KieSession;

public class EntityManagerUtil {
	public static EntityManager getEntityManager(KieSession ksession) {		
		Environment env = ksession.getEnvironment();
		EntityManagerFactory entityManagerFactory = (EntityManagerFactory)env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
		
		return entityManagerFactory.createEntityManager();
	}
}
