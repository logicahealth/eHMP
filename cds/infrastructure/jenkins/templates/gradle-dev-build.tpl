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
      <url>https://code.vistacore.us/projects/APP/repos/cds/</url>
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
    <hudson.plugins.gradle.Gradle plugin="gradle@1.25">
      <description></description>
      <switches></switches>
      <tasks>generateVersionPropertiesFile build uploadArchives</tasks>
      <rootBuildScriptDir></rootBuildScriptDir>
      <buildFile>product/build.gradle</buildFile>
      <gradleName>gradle-2.4</gradleName>
      <useWrapper>false</useWrapper>
      <makeExecutable>false</makeExecutable>
      <fromRootBuildScriptDir>true</fromRootBuildScriptDir>
      <useWorkspaceAsHome>false</useWorkspaceAsHome>
      <passAsProperties>false</passAsProperties>
    </hudson.plugins.gradle.Gradle>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@2.3.1">
      <script plugin="script-security@1.24">
        <script>import hudson.model.*
import hudson.util.*

CDSIMetricsVersion = &apos;unknown&apos;
CDSIResultsVersion = &apos;unknown&apos;
opencdsVersion = &apos;unknown&apos;
opencdsKnowRepoVersion = &apos;unknown&apos;
CDSDashboardVersion = &apos;unknown&apos;
provisionerVersion = &apos;unknown&apos;

matcher = manager.getMatcher(manager.build.logFile, /.*CDSI_METRICS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSIMetricsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDSI_RESULTS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSIResultsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDS_ENGINE_AGENT_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSEngineAgentVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*OPENCDS_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  opencdsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*OPENCDS_KNOWLEDGE_REPOSITORY_DATA_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  opencdsKnowRepoVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDSDASHBOARD_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSDashboardVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDS_PROVISION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

manager.build.setDisplayName(&quot;OCDS:\${opencdsVersion}-CDSI:\${CDSIResultsVersion}-CDSD:\${CDSDashboardVersion}&quot;)

def paramAction = new ParametersAction(new StringParameterValue(&apos;CDSDASHBOARD_VERSION&apos;, CDSDashboardVersion), new StringParameterValue(&apos;OPENCDS_KNOWLEDGE_REPOSITORY_DATA_VERSION&apos;, opencdsKnowRepoVersion), new StringParameterValue(&apos;OPENCDS_VERSION&apos;, opencdsVersion), new StringParameterValue(&apos;CDSI_METRICS_VERSION&apos;, CDSIMetricsVersion), new StringParameterValue(&apos;CDSI_RESULTS_VERSION&apos;, CDSIResultsVersion), new StringParameterValue(&apos;CDS_ENGINE_AGENT_VERSION&apos;, CDSEngineAgentVersion), new StringParameterValue(&apos;COMMIT_HASH&apos;, commitHash), new StringParameterValue(&apos;CDS_PROVISION&apos;, provisionerVersion))
manager.build.addAction(paramAction)</script>
        <sandbox>false</sandbox>
      </script>
      <behavior>0</behavior>
      <runForMatrixParent>false</runForMatrixParent>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.32">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs>
            <hudson.plugins.parameterizedtrigger.FileBuildParameters>
              <propertiesFile>product/build/version.properties</propertiesFile>
              <failTriggerOnMissing>true</failTriggerOnMissing>
              <useMatrixChild>false</useMatrixChild>
              <onlyExactRuns>false</onlyExactRuns>
            </hudson.plugins.parameterizedtrigger.FileBuildParameters>
          </configs>
          <projects>cds-acceptance-test-build-$gitBranch</projects>
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
    <EnvInjectPasswordWrapper plugin="envinject@1.93.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
  </buildWrappers>
</project>
