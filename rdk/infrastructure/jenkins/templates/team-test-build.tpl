<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.security.AuthorizationMatrixProperty>
      <permission>hudson.model.Item.Cancel:team-ehmp</permission>
      <permission>hudson.model.Item.Build:team-ehmp</permission>
    </hudson.security.AuthorizationMatrixProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.BooleanParameterDefinition>
          <name>RUN_RDK_TESTS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>RUN_JBPM_TESTS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
    <jenkins.model.BuildDiscarderProperty>
      <strategy class="hudson.tasks.LogRotator">
        <daysToKeep>-1</daysToKeep>
        <numToKeep>30</numToKeep>
        <artifactDaysToKeep>-1</artifactDaysToKeep>
        <artifactNumToKeep>-1</artifactNumToKeep>
      </strategy>
    </jenkins.model.BuildDiscarderProperty>
    <hudson.plugins.throttleconcurrents.ThrottleJobProperty plugin="throttle-concurrents@1.9.0">
      <maxConcurrentPerNode>0</maxConcurrentPerNode>
      <maxConcurrentTotal>0</maxConcurrentTotal>
      <categories class="java.util.concurrent.CopyOnWriteArrayList"/>
      <throttleEnabled>false</throttleEnabled>
      <throttleOption>project</throttleOption>
      <limitOneJobWithMatchingParams>false</limitOneJobWithMatchingParams>
      <paramsToUseForLimit></paramsToUseForLimit>
    </hudson.plugins.throttleconcurrents.ThrottleJobProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@2.4.4">
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
      <hudson.plugins.git.extensions.impl.PerBuildTag/>
      <hudson.plugins.git.extensions.impl.LocalBranch/>
    </extensions>
  </scm>
  <assignedNode>ehmpdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>true</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>true</blockBuildWhenUpstreamBuilding>
  <triggers/>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

export JOB_NAME=chef-repo-sandbox-build-$gitBranch

cd product/tests
bundle install
bundle exec rake syncCache</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${RUN_RDK_TESTS} = true ]; then
export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

export JOB_NAME=chef-repo-sandbox-build-$gitBranch

cd product/tests/acceptance-tests
bundle install
bundle exec rake endToEndStableTests[aws]
fi</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${RUN_JBPM_TESTS} = true ]; then
export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

export JOB_NAME=chef-repo-sandbox-build-$gitBranch

cd product/tests/acceptance-tests
bundle install
bundle exec rake jbpmTests[aws]
fi</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jenkins__ci.plugins.flexible__publish.FlexiblePublisher plugin="flexible-publish@0.15.2">
      <publishers>
        <org.jenkins__ci.plugins.flexible__publish.ConditionalPublisher>
          <condition class="org.jenkins_ci.plugins.run_condition.core.NeverRun" plugin="run-condition@1.0"/>
          <publisherList>
            <hudson.tasks.BuildTrigger>
              <childProjects>ehmp-ui-team-test-build-$gitBranch, ehmp-team-test-build-$gitBranch, cds-team-test-build-$gitBranch, chef-repo-sandbox-build-$gitBranch</childProjects>
              <threshold>
                <name>SUCCESS</name>
                <ordinal>0</ordinal>
                <color>BLUE</color>
                <completeBuild>true</completeBuild>
              </threshold>
            </hudson.tasks.BuildTrigger>
          </publisherList>
          <executionStrategy class="org.jenkins_ci.plugins.flexible_publish.strategy.FailAtEndExecutionStrategy"/>
        </org.jenkins__ci.plugins.flexible__publish.ConditionalPublisher>
      </publishers>
    </org.jenkins__ci.plugins.flexible__publish.FlexiblePublisher>
    <net.masterthought.jenkins.CucumberReportPublisher plugin="cucumber-reports@2.5.0">
      <jsonReportDirectory>product/tests/acceptance-tests/</jsonReportDirectory>
      <jenkinsBasePath></jenkinsBasePath>
      <fileIncludePattern>cucumber.json</fileIncludePattern>
      <fileExcludePattern></fileExcludePattern>
      <skippedFails>false</skippedFails>
      <pendingFails>false</pendingFails>
      <undefinedFails>false</undefinedFails>
      <missingFails>false</missingFails>
      <ignoreFailedTests>false</ignoreFailedTests>
      <parallelTesting>false</parallelTesting>
    </net.masterthought.jenkins.CucumberReportPublisher>
    <htmlpublisher.HtmlPublisher plugin="htmlpublisher@1.11">
      <reportTargets>
        <htmlpublisher.HtmlPublisherTarget>
          <reportName>Detailed Cucumber Report</reportName>
          <reportDir>product/tests/acceptance-tests/</reportDir>
          <reportFiles>cucumber.html</reportFiles>
          <alwaysLinkToLastBuild>false</alwaysLinkToLastBuild>
          <keepAll>true</keepAll>
          <allowMissing>false</allowMissing>
        </htmlpublisher.HtmlPublisherTarget>
      </reportTargets>
    </htmlpublisher.HtmlPublisher>
  </publishers>
  <buildWrappers>
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
