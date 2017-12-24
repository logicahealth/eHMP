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
      <url>https://code.vistacore.us/projects/APP/repos/ehmp-ui/</url>
    </browser>
    <submoduleCfg class="list"/>
    <extensions>
      <hudson.plugins.git.extensions.impl.PathRestriction>
        <includedRegions></includedRegions>
        <excludedRegions>infrastructure/.*</excludedRegions>
      </hudson.plugins.git.extensions.impl.PathRestriction>
    </extensions>
  </scm>
  <assignedNode>uidocker</assignedNode>
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
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH
export PATH=/usr/local/gradle-2.4/bin:\$PATH

cd product
gradle -Ptype=dist generateVersionPropertiesFile test upload</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@2.3.1">
      <script plugin="script-security@1.24">
        <script>import hudson.model.*
import hudson.util.*

ehmpuiVersion  = &apos;unknown&apos;
provisionerVersion = &apos;unknown&apos;

matcher = manager.getMatcher(manager.build.logFile, /.*EHMPUI_VERSION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  ehmpuiVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*EHMP_UI_PROVISION=&apos;(.*)&apos;.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  provisionerVersion = matcher.group(1)
}

manager.build.setDisplayName(&quot;bk-\${ehmpuiVersion}&quot;)

def paramAction = new ParametersAction(new StringParameterValue(&apos;EHMPUI_VERSION&apos;, ehmpuiVersion), new StringParameterValue(&apos;COMMIT_HASH&apos;, commitHash), new StringParameterValue(&apos;EHMP_UI_PROVISION&apos;, provisionerVersion))
manager.build.addAction(paramAction)</script>
        <sandbox>false</sandbox>
      </script>
      <behavior>0</behavior>
      <runForMatrixParent>false</runForMatrixParent>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
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
          <projects>ehmp-ui-acceptance-test-build-$gitBranch</projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
  </publishers>
  <buildWrappers>
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
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
  </buildWrappers>
</project>
