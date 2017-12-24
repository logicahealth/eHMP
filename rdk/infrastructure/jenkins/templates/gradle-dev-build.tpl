<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.security.AuthorizationMatrixProperty>
      <permission>hudson.model.Item.Build:authenticated</permission>
    </hudson.security.AuthorizationMatrixProperty>
    <jenkins.model.BuildDiscarderProperty>
      <strategy class="hudson.tasks.LogRotator">
        <daysToKeep>-1</daysToKeep>
        <numToKeep>30</numToKeep>
        <artifactDaysToKeep>-1</artifactDaysToKeep>
        <artifactNumToKeep>5</artifactNumToKeep>
      </strategy>
    </jenkins.model.BuildDiscarderProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@3.0.0">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <url>$gitUrl</url>
        <credentialsId>git</credentialsId>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>$gitBranch</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
    <browser class="hudson.plugins.git.browser.Stash">
      <url>https://code.vistacore.us/projects/APP/repos/rdk/</url>
    </browser>
    <submoduleCfg class="list"/>
    <extensions>
      <hudson.plugins.git.extensions.impl.PathRestriction>
        <includedRegions></includedRegions>
        <excludedRegions>infrastructure/.*</excludedRegions>
      </hudson.plugins.git.extensions.impl.PathRestriction>
    </extensions>
  </scm>
  <assignedNode>rdkdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers>
    <hudson.triggers.SCMTrigger>
      <spec></spec>
      <ignorePostCommitHooks>false</ignorePostCommitHooks>
    </hudson.triggers.SCMTrigger>
  </triggers>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.plugins.gradle.Gradle plugin="gradle@1.23">
      <description></description>
      <switches></switches>
      <tasks>$gradleTasks</tasks>
      <rootBuildScriptDir></rootBuildScriptDir>
      <buildFile>$rootDirectory/build.gradle</buildFile>
      <gradleName>gradle-2.4</gradleName>
      <useWrapper>false</useWrapper>
      <makeExecutable>false</makeExecutable>
      <fromRootBuildScriptDir>false</fromRootBuildScriptDir>
      <useWorkspaceAsHome>false</useWorkspaceAsHome>
    </hudson.plugins.gradle.Gradle>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@2.3.1">
      <script plugin="script-security@1.24">
        <script>import hudson.model.*
import hudson.util.*

rdkVersion  = &apos;unknown&apos;
JBPMFITLabProjectVersion  = &apos;unknown&apos;
authVersion = &apos;unknown&apos;
listenerVersion = &apos;unknown&apos;
cdsinvocationserviceVersion = &apos;unknown&apos;
fobtlabserviceVersion = &apos;unknown&apos;
general_medicineVersion = &apos;unknown&apos;
orderVersion = &apos;unknown&apos;
activityVersion = &apos;unknown&apos;
tasksserviceVersion = &apos;unknown&apos;
provisionerVersion = &apos;unknown&apos;
ehmpservicesVersion = &apos;unknown&apos;
sqlConfigVersion = &apos;unknown&apos;
jbpmUtilsVersion = &apos;unknown&apos;

matcher = manager.getMatcher(manager.build.logFile, /.*RDK_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  rdkVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_FITLABPROJECT_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  JBPMFITLabProjectVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_AUTH_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  authVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_LISTENER_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  listenerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_CDSINVOCATIONSERVICE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  cdsinvocationserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_FOBTLABSERVICE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  fobtlabserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_GENERAL_MEDICINE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  general_medicineVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_ORDER_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  orderVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_ACTIVITY_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  activityVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_TASKSSERVICE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  tasksserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_EHMPSERVICES_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  ehmpservicesVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*ORACLE_SQL_CONFIG_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  sqlConfigVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_UTILS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jbpmUtilsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*RDK_PROVISION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

manager.build.setDisplayName(&quot;rdk-\${rdkVersion}&quot;)

def paramAction = new ParametersAction(new StringParameterValue(&apos;RDK_VERSION&apos;, rdkVersion), new StringParameterValue(&apos;JBPM_FITLABPROJECT_VERSION&apos;, JBPMFITLabProjectVersion), new StringParameterValue(&apos;JBPM_AUTH_VERSION&apos;, authVersion), new StringParameterValue(&apos;JBPM_LISTENER_VERSION&apos;, listenerVersion), new StringParameterValue(&apos;JBPM_CDSINVOCATIONSERVICE_VERSION&apos;, cdsinvocationserviceVersion), new StringParameterValue(&apos;JBPM_FOBTLABSERVICE_VERSION&apos;, fobtlabserviceVersion),  new StringParameterValue(&apos;JBPM_GENERAL_MEDICINE_VERSION&apos;, general_medicineVersion), new StringParameterValue(&apos;JBPM_ORDER_VERSION&apos;, orderVersion), new StringParameterValue(&apos;JBPM_ACTIVITY_VERSION&apos;, activityVersion), new StringParameterValue(&apos;JBPM_TASKSSERVICE_VERSION&apos;, tasksserviceVersion), new StringParameterValue(&apos;ORACLE_SQL_CONFIG_VERSION&apos;, sqlConfigVersion), new StringParameterValue(&apos;JBPM_UTILS_VERSION&apos;, jbpmUtilsVersion), new StringParameterValue(&apos;JBPM_EHMPSERVICES_VERSION&apos;, ehmpservicesVersion), new StringParameterValue(&apos;COMMIT_HASH&apos;, commitHash), new StringParameterValue(&apos;RDK_PROVISION&apos;, provisionerVersion) )
manager.build.addAction(paramAction)</script>
        <sandbox>false</sandbox>
        <classpath/>
      </script>
      <behavior>0</behavior>
      <runForMatrixParent>false</runForMatrixParent>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.plugins.cobertura.CoberturaPublisher plugin="cobertura@1.9.8">
      <coberturaReportFile>product/production/rdk/coverage/cobertura-coverage.xml</coberturaReportFile>
      <onlyStable>false</onlyStable>
      <failUnhealthy>false</failUnhealthy>
      <failUnstable>false</failUnstable>
      <autoUpdateHealth>false</autoUpdateHealth>
      <autoUpdateStability>false</autoUpdateStability>
      <zoomCoverageChart>false</zoomCoverageChart>
      <maxNumberOfBuilds>0</maxNumberOfBuilds>
      <failNoReports>true</failNoReports>
      <healthyTarget>
        <targets class="enum-map" enum-type="hudson.plugins.cobertura.targets.CoverageMetric">
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>METHOD</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>8000000</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>LINE</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>8000000</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>CONDITIONAL</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>7000000</int>
          </entry>
        </targets>
      </healthyTarget>
      <unhealthyTarget>
        <targets class="enum-map" enum-type="hudson.plugins.cobertura.targets.CoverageMetric">
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>METHOD</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>LINE</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>CONDITIONAL</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
        </targets>
      </unhealthyTarget>
      <failingTarget>
        <targets class="enum-map" enum-type="hudson.plugins.cobertura.targets.CoverageMetric">
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>METHOD</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>LINE</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
          <entry>
            <hudson.plugins.cobertura.targets.CoverageMetric>CONDITIONAL</hudson.plugins.cobertura.targets.CoverageMetric>
            <int>0</int>
          </entry>
        </targets>
      </failingTarget>
      <sourceEncoding>UTF_8</sourceEncoding>
    </hudson.plugins.cobertura.CoberturaPublisher>
    <hudson.tasks.junit.JUnitResultArchiver plugin="junit@1.19">
      <testResults>product/production/rdk/xunit.xml</testResults>
      <keepLongStdio>false</keepLongStdio>
      <healthScaleFactor>1.0</healthScaleFactor>
      <allowEmptyResults>false</allowEmptyResults>
    </hudson.tasks.junit.JUnitResultArchiver>
    <hudson.tasks.Mailer plugin="mailer@1.17">
      <recipients>ehmp-ui-build-monitoring@vistacore.us</recipients>
      <dontNotifyEveryUnstableBuild>false</dontNotifyEveryUnstableBuild>
      <sendToIndividuals>true</sendToIndividuals>
    </hudson.tasks.Mailer>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.32">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs>
            <hudson.plugins.parameterizedtrigger.FileBuildParameters>
              <propertiesFile>$rootDirectory/build/version.properties</propertiesFile>
              <failTriggerOnMissing>true</failTriggerOnMissing>
              <useMatrixChild>false</useMatrixChild>
              <onlyExactRuns>false</onlyExactRuns>
            </hudson.plugins.parameterizedtrigger.FileBuildParameters>
          </configs>
          <projects>rdk-acceptance-test-build-$gitBranch</projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
  </publishers>
  <buildWrappers>
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
    <EnvInjectBuildWrapper plugin="envinject@1.93.1">
      <info>
        <propertiesContent>NPM_CONFIG_REGISTRY=&quot;https://store.vistacore.us/nexus/content/repositories/npm-all/&quot;</propertiesContent>
        <loadFilesFromMaster>false</loadFilesFromMaster>
      </info>
    </EnvInjectBuildWrapper>
    <EnvInjectPasswordWrapper plugin="envinject@1.93.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
  </buildWrappers>
</project>
