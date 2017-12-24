<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <logRotator>
    <daysToKeep>-1</daysToKeep>
    <numToKeep>30</numToKeep>
    <artifactDaysToKeep>-1</artifactDaysToKeep>
    <artifactNumToKeep>-1</artifactNumToKeep>
  </logRotator>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.security.AuthorizationMatrixProperty>
      <permission>hudson.model.Item.Cancel:team-ehmp</permission>
      <permission>hudson.model.Item.Build:team-ehmp</permission>
    </hudson.security.AuthorizationMatrixProperty>
    <jenkins.plugins.slack.SlackNotifier_-SlackJobProperty plugin="slack@1.7">
      <teamDomain/>
      <token/>
      <room/>
      <startNotification>false</startNotification>
      <notifySuccess>false</notifySuccess>
      <notifyAborted>false</notifyAborted>
      <notifyNotBuilt>false</notifyNotBuilt>
      <notifyUnstable>false</notifyUnstable>
      <notifyFailure>true</notifyFailure>
      <notifyBackToNormal>true</notifyBackToNormal>
      <notifyRepeatedFailure>false</notifyRepeatedFailure>
      <includeTestSummary>false</includeTestSummary>
      <showCommitList>false</showCommitList>
    </jenkins.plugins.slack.SlackNotifier_-SlackJobProperty>
    <hudson.plugins.throttleconcurrents.ThrottleJobProperty plugin="throttle-concurrents@1.7.2">
      <maxConcurrentPerNode>0</maxConcurrentPerNode>
      <maxConcurrentTotal>0</maxConcurrentTotal>
      <throttleEnabled>false</throttleEnabled>
      <throttleOption>project</throttleOption>
    </hudson.plugins.throttleconcurrents.ThrottleJobProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@1.1.26">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <name></name>
        <refspec></refspec>
        <url>$gitUrl</url>
        <credentialsId>git</credentialsId>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>$gitBranch</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <disableSubmodules>false</disableSubmodules>
    <recursiveSubmodules>false</recursiveSubmodules>
    <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
    <authorOrCommitter>false</authorOrCommitter>
    <clean>false</clean>
    <wipeOutWorkspace>false</wipeOutWorkspace>
    <pruneBranches>false</pruneBranches>
    <remotePoll>false</remotePoll>
    <ignoreNotifyCommit>false</ignoreNotifyCommit>
    <useShallowClone>false</useShallowClone>
    <buildChooser class="hudson.plugins.git.util.DefaultBuildChooser"/>
    <gitTool>Default</gitTool>
    <browser class="hudson.plugins.git.browser.Stash">
      <url>https://code.vistacore.us/projects/APP/repos/rdk/</url>
    </browser>
    <submoduleCfg class="list"/>
    <relativeTargetDir></relativeTargetDir>
    <reference></reference>
    <excludedRegions>infrastructure/.*</excludedRegions>
    <excludedUsers></excludedUsers>
    <gitConfigName></gitConfigName>
    <gitConfigEmail></gitConfigEmail>
    <skipTag>false</skipTag>
    <includedRegions></includedRegions>
    <scmName></scmName>
  </scm>
  <assignedNode>ehmpdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers class="vector">
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
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

rdkVersion  = 'unknown'
JBPMFITLabProjectVersion  = 'unknown'
authVersion = 'unknown'
listenerVersion = 'unknown'
cdsinvocationserviceVersion = 'unknown'
fobtlabserviceVersion = 'unknown'
general_medicineVersion = 'unknown'
orderVersion = 'unknown'
activityVersion = 'unknown'
tasksserviceVersion = 'unknown'
provisionerVersion = 'unknown'
ehmpservicesVersion = 'unknown'
sqlConfigVersion = 'unknown'
jbpmUtilsVersion = 'unknown'

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_UTILS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jbpmUtilsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*RDK_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  rdkVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_FITLABPROJECT_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  JBPMFITLabProjectVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_AUTH_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  authVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_LISTENER_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  listenerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_CDSINVOCATIONSERVICE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  cdsinvocationserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_FOBTLABSERVICE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  fobtlabserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_GENERAL_MEDICINE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  general_medicineVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_ORDER_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  orderVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_ACTIVITY_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  activityVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_TASKSSERVICE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  tasksserviceVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JBPM_EHMPSERVICES_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  ehmpservicesVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*ORACLE_SQL_CONFIG_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  sqlConfigVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*RDK_PROVISION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

manager.build.setDisplayName("rdk-\${rdkVersion}")

def paramAction = new ParametersAction(new StringParameterValue('RDK_VERSION', rdkVersion), new StringParameterValue('JBPM_FITLABPROJECT_VERSION', JBPMFITLabProjectVersion), new StringParameterValue('JBPM_AUTH_VERSION', authVersion), new StringParameterValue('JBPM_LISTENER_VERSION', listenerVersion), new StringParameterValue('JBPM_CDSINVOCATIONSERVICE_VERSION', cdsinvocationserviceVersion), new StringParameterValue('JBPM_FOBTLABSERVICE_VERSION', fobtlabserviceVersion),  new StringParameterValue('JBPM_GENERAL_MEDICINE_VERSION', general_medicineVersion), new StringParameterValue('JBPM_ORDER_VERSION', orderVersion), new StringParameterValue('JBPM_ACTIVITY_VERSION', activityVersion), new StringParameterValue('JBPM_TASKSSERVICE_VERSION', tasksserviceVersion), new StringParameterValue('ORACLE_SQL_CONFIG_VERSION', sqlConfigVersion), new StringParameterValue('JBPM_EHMPSERVICES_VERSION', ehmpservicesVersion), new StringParameterValue('JBPM_UTILS_VERSION', jbpmUtilsVersion), new StringParameterValue('COMMIT_HASH', commitHash), new StringParameterValue('RDK_PROVISION', provisionerVersion))
manager.build.addAction(paramAction)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.plugins.cobertura.CoberturaPublisher plugin="cobertura@1.9.2">
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
    <hudson.tasks.junit.JUnitResultArchiver>
      <testResults>product/production/rdk/xunit.xml</testResults>
      <keepLongStdio>false</keepLongStdio>
      <testDataPublishers/>
    </hudson.tasks.junit.JUnitResultArchiver>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.18">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs>
            <hudson.plugins.parameterizedtrigger.FileBuildParameters>
              <propertiesFile>$rootDirectory/build/version.properties</propertiesFile>
              <failTriggerOnMissing>true</failTriggerOnMissing>
            </hudson.plugins.parameterizedtrigger.FileBuildParameters>
          </configs>
          <projects>rdk-integration-test-build-$gitBranch, rdk-acceptance-test-build-$gitBranch, rdk-acceptance-test-build-unstable-$gitBranch, rdk-acceptance-test-build-onc-$gitBranch, rdk-acceptance-test-cds-build-$gitBranch</projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
  </publishers>
  <buildWrappers>
    <EnvInjectPasswordWrapper plugin="envinject@1.92.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
    <EnvInjectBuildWrapper plugin="envinject@1.92.1">
      <info>
        <propertiesContent>
          NPM_CONFIG_REGISTRY="https://sandstore.vistacore.us/nexus/content/repositories/npm-all/"
          ARTIFACT_VERSION_PREFIX=0.$gitBranch.0.
          ORGNAME=$gitBranch
          OPSCODE_USER=jenkins_sandbox
          OVERRIDE_NEXUS_URL=https://sandstore.vistacore.us
          NEXUS_UPLOAD_REPO=releasespublish
        </propertiesContent>
        <loadFilesFromMaster>false</loadFilesFromMaster>
      </info>
    </EnvInjectBuildWrapper>
    <org.jenkinsci.plugins.preSCMbuildstep.PreSCMBuildStepsWrapper plugin="preSCMbuildstep@0.2">
      <buildSteps>
        <hudson.tasks.Shell>
          <command>git reset --hard HEAD
git clean -d -f -x</command>
        </hudson.tasks.Shell>
      </buildSteps>
    </org.jenkinsci.plugins.preSCMbuildstep.PreSCMBuildStepsWrapper>
  </buildWrappers>
</project>
