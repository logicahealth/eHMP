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
      <url>https://code.vistacore.us/projects/APP/repos/ehmp/</url>
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

backendVersion  = 'unknown'
nodeMockServicesVersion  = 'unknown'
vxSyncVersion = 'unknown'
soapHandlerVersion = 'unknown'
healthTimeCoreJarVersion = 'unknown'
healthTimeSolrJarVersion = 'unknown'
asuVersion = 'unknown'
vprVersion = 'unknown'
jdsVersion = 'unknown'
hmpVersion = 'unknown'
jdsDataVersion = 'unknown'
provisionerVersion = 'unknown'
cacheVersion = 'unknown'
correlatedIDsVersion = 'unknown'
crsVersion = 'unknown'

matcher = manager.getMatcher(manager.build.logFile, /.*BACKEND_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  backendVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*NODEMOCKSERVICES_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  nodeMockServicesVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*VX_SYNC_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  vxSyncVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*SOAP_HANDLER_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  soapHandlerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HEALTH_TIME_CORE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  healthTimeCoreJarVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HEALTH_TIME_SOLR_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  healthTimeSolrJarVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*ASU_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  asuVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*VPR_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  vprVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JDS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jdsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HMP_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  hmpVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JDS_DATA_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jdsDataVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*EHMP_PROVISION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CACHE_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  cacheVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CORRELATED_IDS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  correlatedIDsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CRS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  crsVersion = matcher.group(1)
}

manager.build.setDisplayName("bk-\${backendVersion}")

def paramAction = new ParametersAction(new StringParameterValue('BACKEND_VERSION', backendVersion),
                  new StringParameterValue('COMMIT_HASH', commitHash),
                  new StringParameterValue('VX_SYNC_VERSION', vxSyncVersion),
                  new StringParameterValue('NODEMOCKSERVICES_VERSION', nodeMockServicesVersion),
                  new StringParameterValue('SOAP_HANDLER_VERSION', soapHandlerVersion),
                  new StringParameterValue('ASU_VERSION', asuVersion),
                  new StringParameterValue('HEALTH_TIME_CORE_VERSION', healthTimeCoreJarVersion),
                  new StringParameterValue('HEALTH_TIME_SOLR_VERSION', healthTimeSolrJarVersion),
                  new StringParameterValue('VPR_VERSION', vprVersion),
                  new StringParameterValue('JDS_VERSION', jdsVersion),
                  new StringParameterValue('HMP_VERSION', hmpVersion),
                  new StringParameterValue('JDS_DATA_VERSION', jdsDataVersion),
                  new StringParameterValue('CACHE_VERSION', cacheVersion),
                  new StringParameterValue('CORRELATED_IDS_VERSION', correlatedIDsVersion),
                  new StringParameterValue('CRS_VERSION', crsVersion),
                  new StringParameterValue('EHMP_PROVISION', provisionerVersion))
manager.build.addAction(paramAction)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.tasks.junit.JUnitResultArchiver>
      <testResults>**/build/test-results/TEST-*.xml,**/test/junit/TEST-*.xml</testResults>
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
          <projects>ehmp-acceptance-test-build-$gitBranch, ehmp-crs-test-build-$gitBranch</projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
  </publishers>
  <buildWrappers>
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
    <EnvInjectPasswordWrapper plugin="envinject@1.92.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
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
