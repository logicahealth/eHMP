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
      <url>https://code.vistacore.us/projects/APP/repos/cds/</url>
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
  <jdk>(Default)</jdk>
  <triggers class="vector">
    <hudson.triggers.SCMTrigger>
      <spec></spec>
      <ignorePostCommitHooks>false</ignorePostCommitHooks>
    </hudson.triggers.SCMTrigger>
  </triggers>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.plugins.gradle.Gradle plugin="gradle@1.24">
      <description/>
      <switches/>
      <tasks>generateVersionPropertiesFile build uploadArchives</tasks>
      <rootBuildScriptDir/>
      <buildFile>product/build.gradle</buildFile>
      <gradleName>gradle-2.4</gradleName>
      <useWrapper>false</useWrapper>
      <makeExecutable>false</makeExecutable>
      <fromRootBuildScriptDir>true</fromRootBuildScriptDir>
      <useWorkspaceAsHome>false</useWorkspaceAsHome>
    </hudson.plugins.gradle.Gradle>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

CDSIMetricsVersion = 'unknown'
CDSIResultsVersion = 'unknown'
opencdsVersion = 'unknown'
opencdsKnowRepoVersion = 'unknown'
CDSDashboardVersion = 'unknown'
provisionerVersion = 'unknown'

matcher = manager.getMatcher(manager.build.logFile, /.*CDSI_METRICS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSIMetricsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDSI_RESULTS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSIResultsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDS_ENGINE_AGENT_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSEngineAgentVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*OPENCDS_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  opencdsVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*OPENCDS_KNOWLEDGE_REPOSITORY_DATA_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  opencdsKnowRepoVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDSDASHBOARD_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  CDSDashboardVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*CDS_PROVISION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

manager.build.setDisplayName("OCDS:\${opencdsVersion}-CDSI:\${CDSIResultsVersion}-CDSD:\${CDSDashboardVersion}")

def paramAction = new ParametersAction(new StringParameterValue('CDSDASHBOARD_VERSION', CDSDashboardVersion), new StringParameterValue('OPENCDS_KNOWLEDGE_REPOSITORY_DATA_VERSION', opencdsKnowRepoVersion), new StringParameterValue('OPENCDS_VERSION', opencdsVersion), new StringParameterValue('CDSI_METRICS_VERSION', CDSIMetricsVersion), new StringParameterValue('CDSI_RESULTS_VERSION', CDSIResultsVersion), new StringParameterValue('CDS_ENGINE_AGENT_VERSION', CDSEngineAgentVersion), new StringParameterValue('COMMIT_HASH', commitHash), new StringParameterValue('CDS_PROVISION', provisionerVersion))
manager.build.addAction(paramAction)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.18">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs>
            <hudson.plugins.parameterizedtrigger.FileBuildParameters>
              <propertiesFile>product/build/version.properties</propertiesFile>
              <failTriggerOnMissing>true</failTriggerOnMissing>
            </hudson.plugins.parameterizedtrigger.FileBuildParameters>
          </configs>
          <projects>cds-integration-test-build-$gitBranch, cds-acceptance-test-build-$gitBranch</projects>
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
    <EnvInjectBuildWrapper plugin="envinject@1.92.1">
      <info>
        <propertiesContent>
          NPM_CONFIG_REGISTRY="https://nexus.osehra.org:8444/nexus/content/repositories/npm-all/"
          ARTIFACT_VERSION_PREFIX=0.$gitBranch.0.
          ORGNAME=$gitBranch
          OPSCODE_USER=jenkins_sandbox
          OVERRIDE_NEXUS_URL=https://sandstore.vistacore.us
          NEXUS_UPLOAD_REPO=releasespublish
        </propertiesContent>
        <loadFilesFromMaster>false</loadFilesFromMaster>
      </info>
    </EnvInjectBuildWrapper>
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
    <EnvInjectPasswordWrapper plugin="envinject@1.93.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
    <org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper plugin="credentials-binding@1.10">
      <bindings>
        <org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
          <credentialsId>jenkins_sandbox</credentialsId>
          <variable>HOST_KEY_PATH</variable>
        </org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
      </bindings>
    </org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper>
  </buildWrappers>
</project>
