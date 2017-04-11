package org.opencds.config.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.common.cache.OpencdsCache.CacheRegion;
import org.opencds.common.exceptions.RequiredDataNotProvidedException;
import org.opencds.config.api.ExecutionEngineAdapter;
import org.opencds.config.api.ExecutionEngineContext;
import org.opencds.config.api.KnowledgeLoader;
import org.opencds.config.api.cache.CacheService;
import org.opencds.config.api.dao.ExecutionEngineDao;
import org.opencds.config.api.model.ExecutionEngine;
import org.opencds.config.api.service.ExecutionEngineService;

import com.google.common.collect.ImmutableList;

public class ExecutionEngineServiceImpl implements ExecutionEngineService {
    private static final Log log = LogFactory.getLog(ExecutionEngineServiceImpl.class);

    private final ExecutionEngineDao dao;
    private CacheService cacheService;

    public ExecutionEngineServiceImpl(ExecutionEngineDao dao, CacheService cacheService) {
        this.dao = dao;
        this.cacheService = cacheService;
        this.cacheService.putAll(EECacheRegion.EXECUTION_ENGINE, buildPairs(this.dao.getAll()));
    }

    @Override
    public ExecutionEngine find(String identifier) {
        return cacheService.get(EECacheRegion.EXECUTION_ENGINE, identifier);
    }

    @Override
    public List<ExecutionEngine> getAll() {
        Set<ExecutionEngine> ees = cacheService.getAll(EECacheRegion.EXECUTION_ENGINE);
        return ImmutableList.<ExecutionEngine> builder().addAll(ees).build();
    }

    @Override
    public void persist(ExecutionEngine ee) {
        dao.persist(ee);
        cacheService.put(EECacheRegion.EXECUTION_ENGINE, ee.getIdentifier(), ee);
    }

    @Override
    public void persist(List<ExecutionEngine> ees) {
        dao.persist(ees);
        cacheService.putAll(EECacheRegion.EXECUTION_ENGINE, buildPairs(ees));
    }

    @Override
    public void delete(String identifier) {
        ExecutionEngine ee = find(identifier);
        if (ee != null) {
            dao.delete(ee);
            cacheService.evict(EECacheRegion.EXECUTION_ENGINE, ee.getIdentifier());
        }
    }

    private Map<String, ExecutionEngine> buildPairs(List<ExecutionEngine> all) {
        Map<String, ExecutionEngine> cachables = new HashMap<>();
        for (ExecutionEngine ee : all) {
            cachables.put(ee.getIdentifier(), ee);
        }
        return cachables;
    }

    @Override
    @Deprecated
    public <T> T getExecutionEngineInstance(ExecutionEngine engine) {
        T instance = cacheService.get(EECacheRegion.EXECUTION_ENGINE_INSTANCE, engine);
        if (instance == null) {
            try {
                Class<T> c = (Class<T>) Class.forName(engine.getIdentifier());
                instance = c.newInstance();
                cacheService.put(EECacheRegion.EXECUTION_ENGINE_INSTANCE, engine, instance);
            } catch (IllegalAccessException | InstantiationException e) {
                e.printStackTrace();
                throw new RequiredDataNotProvidedException(e.getClass().getSimpleName() + ": " + engine.getIdentifier()
                        + " " + e.getMessage());
            } catch (ClassNotFoundException e) {
                log.warn("EE Identifier is not a class (might reference an Adapter): " + e.getMessage());
            } catch (ClassCastException e) {
                log.warn("Class is not an instance of Evaluater; will return null. " + e.getMessage());
            }
        }

        return instance;
    }

    @Override
    public <I, O, P, E extends ExecutionEngineAdapter<I, O, P>> E getExecutionEngineAdapter(ExecutionEngine engine) {
        E instance = cacheService.get(EECacheRegion.EXECUTION_ENGINE_ADAPTER, engine);
        if (instance == null) {
            try {
                if (engine.getAdapter() == null) {
                    return null;
                }
                Class<E> c = (Class<E>) Class.forName(engine.getAdapter());
                instance = c.newInstance();
                cacheService.put(EECacheRegion.EXECUTION_ENGINE_ADAPTER, engine, instance);
            } catch (IllegalAccessException | InstantiationException e) {
                e.printStackTrace();
                throw new RequiredDataNotProvidedException(e.getClass().getSimpleName() + ": " + engine.getIdentifier()
                        + " " + e.getMessage());
            } catch (ClassNotFoundException e) {
                log.warn("EE Adapter is not a class (might reference an old-style Evaluater): " + e.getMessage());
            } catch (ClassCastException e) {
                log.warn("Class is not an instance of ExecutionEngineAdapter; will return null");
            }
        }

        return instance;
    }

    @Override
    public <C extends ExecutionEngineContext<?, ?>> C createContext(ExecutionEngine engine) {
        C instance = null;
        try {
            Class<C> c = (Class<C>) Class.forName(engine.getContext());
            instance = c.newInstance();
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            e.printStackTrace();
            throw new RequiredDataNotProvidedException(e.getClass().getSimpleName() + ": " + engine.getIdentifier()
                    + " " + e.getMessage());
        } catch (ClassCastException e) {
            log.warn("Class is not an instance of ExecutionEngineContext; will return null");
        }

        return instance;
    }

    @Override
    public <KL extends KnowledgeLoader<?>> KL getKnowledgeLoader(ExecutionEngine engine) {
        KL instance = cacheService.get(EECacheRegion.KNOWLEDGE_LOADER, engine);
        try {
            if (instance == null) {
                String kLoader = engine.getKnowledgeLoader();
                if (kLoader == null) {
                    kLoader = engine.getIdentifier();
                }
                Class<KL> klc = (Class<KL>) Class.forName(kLoader);
                instance = klc.newInstance();
                cacheService.put(EECacheRegion.KNOWLEDGE_LOADER, engine, instance);
            }
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            e.printStackTrace();
            throw new RequiredDataNotProvidedException(e.getClass().getSimpleName() + ": " + engine.getIdentifier()
                    + " " + e.getMessage());
        } catch (ClassCastException e) {
            log.warn("Class is not an instance of KnowledgeLoader; will return null");
        }
        return instance;
    }

    private enum EECacheRegion implements CacheRegion {
        EXECUTION_ENGINE(ExecutionEngine.class),
        EXECUTION_ENGINE_ADAPTER(ExecutionEngineAdapter.class),
        EXECUTION_ENGINE_INSTANCE(Object.class),
        KNOWLEDGE_LOADER(KnowledgeLoader.class);

        private Class<?> type;

        EECacheRegion(Class<?> type) {
            this.type = type;
        }

        @Override
        public boolean supports(Class<?> type) {
            return this.type.isAssignableFrom(type);
        }
    }

}
