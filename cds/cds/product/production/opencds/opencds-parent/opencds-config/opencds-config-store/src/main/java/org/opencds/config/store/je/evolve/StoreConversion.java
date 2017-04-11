package org.opencds.config.store.je.evolve;

import java.io.File;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.config.api.dao.util.FileUtil;
import org.opencds.config.api.model.KMId;
import org.opencds.config.api.model.PluginId;
import org.opencds.config.store.model.je.CDMIdJe;
import org.opencds.config.store.model.je.ConceptDeterminationMethodJe;
import org.opencds.config.store.model.je.ExecutionEngineJe;
import org.opencds.config.store.model.je.KMIdJe;
import org.opencds.config.store.model.je.KnowledgeModuleJe;
import org.opencds.config.store.model.je.PPIdJe;
import org.opencds.config.store.model.je.PluginIdJe;
import org.opencds.config.store.model.je.PluginPackageJe;
import org.opencds.config.store.model.je.SSIdJe;
import org.opencds.config.store.model.je.SemanticSignifierJe;
import org.opencds.config.store.model.je.SupportingDataJe;

import com.sleepycat.je.Environment;
import com.sleepycat.je.EnvironmentConfig;
import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.EntityStore;
import com.sleepycat.persist.PrimaryIndex;
import com.sleepycat.persist.StoreConfig;
import com.sleepycat.persist.model.EntityModel;
import com.sleepycat.persist.raw.RawObject;
import com.sleepycat.persist.raw.RawStore;

public class StoreConversion {
	private static final Log log = LogFactory.getLog(StoreConversion.class);

	public EntityStore convert(File storeLocation, String storeName, boolean readOnly) {
		FileUtil fileUtil = new FileUtil();
		// create a listing of db files
		List<String> files = fileUtil.findFiles(storeLocation, false);

		// create temporary staging dir for conversion
		File rawStoreLoc = new File(storeLocation, "OLD_STORE");
		rawStoreLoc.mkdirs();

		// move db files to temporary staging dir
		for (String fileName : files) {
			File file = Paths.get(fileName).toFile();
			file.renameTo(Paths.get(rawStoreLoc.getAbsolutePath(), file.getName()).toFile());
		}

		// load staging dir as raw store
		EnvironmentConfig rawEnvCfg = new EnvironmentConfig();
		StoreConfig rawStoreCfg = new StoreConfig();
		rawEnvCfg.setAllowCreate(false);
		rawStoreCfg.setAllowCreate(false);
		Environment rawEnv = new Environment(rawStoreLoc, rawEnvCfg);
		RawStore rawStore = new RawStore(rawEnv, storeName, rawStoreCfg);

		// reopen the existing store
		EnvironmentConfig envConfig = new EnvironmentConfig();
		StoreConfig storeConfig = new StoreConfig();
		envConfig.setAllowCreate(!readOnly);
		storeConfig.setAllowCreate(!readOnly);
		Environment env = new Environment(storeLocation, envConfig);
		EntityStore store = new EntityStore(env, storeName, storeConfig);

		// migrate the data from the old store to the new store
		convert(rawStore, "org.opencds.config.store.model.je.ConceptDeterminationMethodJe", store, CDMIdJe.class, ConceptDeterminationMethodJe.class);
		convert(rawStore, "org.opencds.config.store.model.je.ExecutionEngineJe", store, String.class, ExecutionEngineJe.class);
		convert(rawStore, "org.opencds.config.store.model.je.KnowledgeModuleJe", store, KMIdJe.class, KnowledgeModuleJe.class);
		convert(rawStore, "org.opencds.config.store.model.je.PluginPackageJe", store, PPIdJe.class, PluginPackageJe.class);
		convert(rawStore, "org.opencds.config.store.model.je.SemanticSignifierJe", store, SSIdJe.class, SemanticSignifierJe.class);
		convertSupportingData(rawStore, "org.opencds.config.store.model.je.SupportingDataJe", store, String.class, SupportingDataJe.class);

		// close the old store
		rawStore.close();
		rawEnv.close();

		// delete the old store and its files
		fileUtil.delete(rawStoreLoc);
		return store;
	}

	@SuppressWarnings("unchecked")
	private <K, E> void convert(RawStore rawStore, String rawClassName, EntityStore store, Class<K> keyClass, Class<E> entityClass) {
		EntityModel entityModel = store.getModel();
		PrimaryIndex<Object, RawObject> raws = rawStore
				.getPrimaryIndex(rawClassName);
		long rawCount = raws.count();
		PrimaryIndex<K, E> pk = store.getPrimaryIndex(keyClass, entityClass);
		EntityCursor<RawObject> cursor = raws.entities();
		for (RawObject rawObject : cursor) {
			pk.put((E) entityModel.convertRawObject(rawObject));
		}
		long count = pk.count();
		log.info("Converted " + rawCount + " instances of " + rawClassName + " to " + count + " instances of " + entityClass.getCanonicalName());
		assert count == rawCount;
		cursor.close();
	}

	@SuppressWarnings("unchecked")
	private <K, E> void convertSupportingData(RawStore rawStore, String rawClassName, EntityStore store, Class<String> keyClass, Class<SupportingDataJe> entityClass) {
		EntityModel entityModel = store.getModel();
		PrimaryIndex<Object, RawObject> raws = rawStore
				.getPrimaryIndex(rawClassName);
		long rawCount = raws.count();
		PrimaryIndex<String, SupportingDataJe> pk = store.getPrimaryIndex(keyClass, entityClass);
		EntityCursor<RawObject> cursor = raws.entities();
		for (RawObject rawObject : cursor) {
			Map<String, Object> fields = rawObject.getValues();
			RawObject pluginIdRO = (RawObject) fields.get("loadedBy");
			Map<String, Object> pluginId = pluginIdRO.getValues();
			RawObject sdIdRO = (RawObject) fields.get("sdId");
			Map<String, Object> sdId = sdIdRO.getValues();
			SupportingDataJe sd = SupportingDataJe.create(
					(String) sdId.get("identifier"), 
					(KMId) KMIdJe.create(
							(String) sdId.get("scopingEntityId"), 
							(String) sdId.get("businessId"), 
							(String) sdId.get("version")), 
					(String) fields.get("packageType"), 
					(String) fields.get("packageId"),
					(PluginId) PluginIdJe.create(
							(String) pluginId.get("scopingEntityId"), 
							(String) pluginId.get("businessId"), 
							(String) pluginId.get("version")), 
					(Date) fields.get("timestamp"), 
					(String) fields.get("userId"));
			pk.put(sd);
		}
		long count = pk.count();
		log.info("Converted " + rawCount + " instances of " + rawClassName + " to " + count + " instances of " + entityClass.getCanonicalName());
		assert count == rawCount;
		cursor.close();
	}
}
