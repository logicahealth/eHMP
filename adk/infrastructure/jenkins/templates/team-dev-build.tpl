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
      <url>https://code.vistacore.us/projects/APP/repos/adk/</url>
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
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH
export PATH=/usr/local/gradle-2.4/bin:\$PATH

cd product
gradle generateVersionPropertiesFile upload</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

adkVersion  = 'unknown'

matcher = manager.getMatcher(manager.build.logFile, /.*ADK_VERSION='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  adkVersion = matcher.group(1)
}

matcher = manager.getMatcher(manager.build.logFile, /.*COMMIT_HASH='(.*)'.*/)
if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  commitHash = matcher.group(1)
}

manager.build.setDisplayName("adk-\${adkVersion}")

def paramAction = new ParametersAction(new StringParameterValue('ADK_VERSION', adkVersion), new StringParameterValue('COMMIT_HASH', commitHash) )
manager.build.addAction(paramAction)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.tasks.junit.JUnitResultArchiver>
      <testResults>**/test/build/junit-reports/TEST-*.xml</testResults>
      <keepLongStdio>false</keepLongStdio>
      <testDataPublishers/>
    </hudson.tasks.junit.JUnitResultArchiver>
    <hudson.tasks.Mailer plugin="mailer@1.4">
      <recipients>ehmp-ui-build-monitoring@vistacore.us</recipients>
      <dontNotifyEveryUnstableBuild>false</dontNotifyEveryUnstableBuild>
      <sendToIndividuals>true</sendToIndividuals>
    </hudson.tasks.Mailer>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.18">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs>
            <hudson.plugins.parameterizedtrigger.FileBuildParameters>
              <propertiesFile>$rootDirectory/build/version.properties</propertiesFile>
              <failTriggerOnMissing>true</failTriggerOnMissing>
            </hudson.plugins.parameterizedtrigger.FileBuildParameters>
          </configs>
          <projects>adk-integration-test-build-$gitBranch, adk-acceptance-test-build-$gitBranch</projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
    <hudson.tasks.BuildTrigger>
      <childProjects>ehmp-ui-acceptance-test-build-$gitBranch</childProjects>
      <threshold>
        <name>SUCCESS</name>
      </threshold>
    </hudson.tasks.BuildTrigger>
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
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.3.1">
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
