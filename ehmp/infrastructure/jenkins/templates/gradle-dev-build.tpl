<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <jenkins.model.BuildDiscarderProperty>
      <strategy class="hudson.tasks.LogRotator">
        <daysToKeep>-1</daysToKeep>
        <numToKeep>30</numToKeep>
        <artifactDaysToKeep>-1</artifactDaysToKeep>
        <artifactNumToKeep>-1</artifactNumToKeep>
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
      <url>https://code.vistacore.us/projects/APP/repos/ehmp/</url>
    </browser>
    <submoduleCfg class="list"/>
    <extensions>
      <hudson.plugins.git.extensions.impl.PathRestriction>
        <includedRegions></includedRegions>
        <excludedRegions>infrastructure/.*</excludedRegions>
      </hudson.plugins.git.extensions.impl.PathRestriction>
      <hudson.plugins.git.extensions.impl.PerBuildTag/>
    </extensions>
  </scm>
  <assignedNode>ehmpdocker</assignedNode>
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
    <hudson.plugins.gradle.Gradle plugin="gradle@1.25">
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
      <passAsProperties>false</passAsProperties>
    </hudson.plugins.gradle.Gradle>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@2.3.1">
      <script plugin="script-security@1.24">
        <script>import hudson.model.*
import hudson.util.*

backendVersion  = &apos;unknown&apos;
nodeMockServicesVersion  = &apos;unknown&apos;
vxSyncVersion = &apos;unknown&apos;
soapHandlerVersion = &apos;unknown&apos;
healthTimeCoreJarVersion = &apos;unknown&apos;
healthTimeSolrJarVersion = &apos;unknown&apos;
asuVersion = &apos;unknown&apos;
vprVersion = &apos;unknown&apos;
jdsVersion = &apos;unknown&apos;
hmpVersion = &apos;unknown&apos;
jdsDataVersion = &apos;unknown&apos;
provisionerVersion = &apos;unknown&apos;
cacheVersion = &apos;unknown&apos;
correlatedIDsVersion = &apos;unknown&apos;
crsVersion = &apos;unknown&apos;

matcher = manager.getMatcher(manager.build.logFile, /.*BACKEND_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  backendVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*NODEMOCKSERVICES_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  nodeMockServicesVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*VX_SYNC_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  vxSyncVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*SOAP_HANDLER_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  soapHandlerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HEALTH_TIME_CORE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  healthTimeCoreJarVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HEALTH_TIME_SOLR_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  healthTimeSolrJarVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*ASU_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  asuVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*VPR_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  vprVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JDS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jdsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*HMP_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  hmpVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*JDS_DATA_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  jdsDataVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*EHMP_PROVISION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CACHE_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  cacheVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CORRELATED_IDS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  correlatedIDsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CRS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  crsVersion = matcher.group(1)
}

manager.build.setDisplayName(&quot;bk-\${backendVersion}&quot;)

def paramAction = new ParametersAction(new StringParameterValue(&apos;BACKEND_VERSION&apos;, backendVersion),
                  new StringParameterValue(&apos;COMMIT_HASH&apos;, commitHash),
                  new StringParameterValue(&apos;VX_SYNC_VERSION&apos;, vxSyncVersion),
                  new StringParameterValue(&apos;NODEMOCKSERVICES_VERSION&apos;, nodeMockServicesVersion),
                  new StringParameterValue(&apos;SOAP_HANDLER_VERSION&apos;, soapHandlerVersion),
                  new StringParameterValue(&apos;ASU_VERSION&apos;, asuVersion),
                  new StringParameterValue(&apos;HEALTH_TIME_CORE_VERSION&apos;, healthTimeCoreJarVersion),
                  new StringParameterValue(&apos;HEALTH_TIME_SOLR_VERSION&apos;, healthTimeSolrJarVersion),
                  new StringParameterValue(&apos;VPR_VERSION&apos;, vprVersion),
                  new StringParameterValue(&apos;JDS_VERSION&apos;, jdsVersion),
                  new StringParameterValue(&apos;HMP_VERSION&apos;, hmpVersion),
                  new StringParameterValue(&apos;JDS_DATA_VERSION&apos;, jdsDataVersion),
                  new StringParameterValue(&apos;CACHE_VERSION&apos;, cacheVersion),
                  new StringParameterValue(&apos;CORRELATED_IDS_VERSION&apos;, correlatedIDsVersion),
                  new StringParameterValue(&apos;CRS_VERSION&apos;, crsVersion),
                  new StringParameterValue(&apos;EHMP_PROVISION&apos;, provisionerVersion))
manager.build.addAction(paramAction)</script>
        <sandbox>false</sandbox>
      </script>
      <behavior>0</behavior>
      <runForMatrixParent>false</runForMatrixParent>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.tasks.junit.JUnitResultArchiver plugin="junit@1.19">
      <testResults>**/build/test-results/TEST-*.xml,**/test/junit/TEST-*.xml</testResults>
      <keepLongStdio>false</keepLongStdio>
      <healthScaleFactor>1.0</healthScaleFactor>
      <allowEmptyResults>false</allowEmptyResults>
    </hudson.tasks.junit.JUnitResultArchiver>
    <hudson.tasks.Mailer plugin="mailer@1.17">
      <recipients>ehmp-build-monitoring@vistacore.us</recipients>
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
          <projects>ehmp-acceptance-test-build-$gitBranch, ehmp-crs-test-build-$gitBranch</projects>
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
        <propertiesContent>NPM_CONFIG_REGISTRY=&quot;http://nexus.osehra.org:8081/nexus/content/repositories/npm-all/&quot;</propertiesContent>
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
