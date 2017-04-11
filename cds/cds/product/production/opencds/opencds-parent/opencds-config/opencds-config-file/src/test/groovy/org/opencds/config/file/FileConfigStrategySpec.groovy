package org.opencds.config.file;

import java.nio.file.Path
import java.nio.file.Paths

import org.opencds.config.api.ConfigData
import org.opencds.config.service.CacheServiceImpl;

import spock.lang.Specification

class FileConfigStrategySpec extends Specification {

    def "test getKnowledgeRepository"() {
//        given:
        def fileConfig = new FileConfigStrategy()
        Path path = Paths.get("src/test/resources/resources_v1.3")
        ConfigData configData = new ConfigData(configType: 'SIMPLE_FILE', configPath: path.toString())
        
//        when:
        def kr = fileConfig.getKnowledgeRepository(configData, new CacheServiceImpl())
        
//        then:
        kr != null
        kr.conceptDeterminationMethodService != null
        kr.conceptDeterminationMethodService.getAll().size() == 3
        kr.conceptService != null
        kr.executionEngineService != null
        kr.executionEngineService.getAll().size() == 3
        kr.knowledgeModuleService != null
        kr.knowledgeModuleService.getAll().size() == 24
        kr.knowledgePackageService != null
        kr.semanticSignifierService != null
        kr.semanticSignifierService.getAll().size() == 1
        kr.supportingDataPackageService != null
        kr.supportingDataService != null
        kr.supportingDataService.getAll().size() == 1
    }

}
