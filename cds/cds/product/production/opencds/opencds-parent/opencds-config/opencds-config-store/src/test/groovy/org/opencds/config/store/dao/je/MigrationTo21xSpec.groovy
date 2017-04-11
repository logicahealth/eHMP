package org.opencds.config.store.dao.je

import java.nio.file.Path
import java.nio.file.Paths

import org.opencds.common.exceptions.OpenCDSRuntimeException
import org.opencds.config.store.je.OpenCDSConfigStore

import spock.lang.Specification

class MigrationTo21xSpec extends Specification {
	static final File path20x = new File('src/test/resources/resources_v2.0.6-store')
	static final String STORE = 'STORE'

	static File tmpPath
	static File path
	static OpenCDSConfigStore configStore

	def setupSpec() {
		tmpPath = File.createTempDir()
		println tmpPath.getAbsolutePath()
		path = new File(tmpPath, STORE)
		path.mkdirs()
		path20x.listFiles().each {File file ->
			println "file.name is ${file.name}"
			File target = Paths.get(path.getAbsolutePath(), file.name).toFile()
			println "Copying file : ${file.absolutePath} to ${target.absolutePath}"
			println path.exists()
			println target.getAbsolutePath()
			target.createNewFile()
			target << file.bytes
		}
	}

	def cleanupSpec() {
		configStore?.close();
		tmpPath.listFiles().each {file ->
			println "deleting ${file.getAbsolutePath()} ${file.length()}"
			if (file.isDirectory()) {
				file.listFiles().each {subfile ->
					println "deleting ${subfile.getAbsolutePath()} ${subfile.length()}"
					subfile.delete()
				}
			}
			assert file.delete() == true
		}
		println "deleting ${path.getAbsolutePath()} ${path.length()}"
		assert tmpPath.delete() == true
	}

	def "setup for migration"() {
		when:
		try {
			configStore = new OpenCDSConfigStore(path)
			configStore.close()
			configStore = new OpenCDSConfigStore(path)
		} catch (Exception e) {
			e.printStackTrace()
			throw e
		}

		then:
		notThrown(OpenCDSRuntimeException)
	}
}
