<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <properties>
    <hudson.security.AuthorizationMatrixProperty>
      <permission>hudson.model.Item.Cancel:team-ehmp</permission>
      <permission>hudson.model.Item.Build:team-ehmp</permission>
    </hudson.security.AuthorizationMatrixProperty>
  </properties>
  <logRotator>
    <daysToKeep>-1</daysToKeep>
    <numToKeep>30</numToKeep>
    <artifactDaysToKeep>-1</artifactDaysToKeep>
    <artifactNumToKeep>-1</artifactNumToKeep>
  </logRotator>
  <keepDependencies>false</keepDependencies>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@1.5.0">
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
    <localBranch></localBranch>
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
    <excludedRegions></excludedRegions>
    <excludedUsers></excludedUsers>
    <gitConfigName></gitConfigName>
    <gitConfigEmail></gitConfigEmail>
    <skipTag>false</skipTag>
    <includedRegions></includedRegions>
    <scmName></scmName>
  </scm>
  <assignedNode>ehmpdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>true</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>true</blockBuildWhenUpstreamBuilding>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

export JOB_NAME=chef-repo-sandbox-build-$gitBranch
export ORGNAME=$gitBranch
export OPSCODE_USER=jenkins_sandbox

cd product/tests
bundle install
bundle exec rake syncCache</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

export JOB_NAME=chef-repo-sandbox-build-$gitBranch
export ORGNAME=$gitBranch
export OPSCODE_USER=jenkins_sandbox

cd product/tests/acceptance-tests
bundle install
bundle exec rake endToEndTests[aws]</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jenkins__ci.plugins.flexible__publish.FlexiblePublisher plugin="flexible-publish@0.15.2">
      <publishers>
        <org.jenkins__ci.plugins.flexible__publish.ConditionalPublisher>
          <condition class="org.jenkins_ci.plugins.run_condition.core.NeverRun" plugin="run-condition@1.0"/>
          <publisherList>
            <hudson.tasks.BuildTrigger>
              <childProjects>rdk-team-test-build-$gitBranch, ehmp-team-test-build-$gitBranch, ehmp-ui-team-test-build-$gitBranch, chef-repo-sandbox-build-$gitBranch</childProjects>
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
    <htmlpublisher.HtmlPublisher plugin="htmlpublisher@1.2">
      <reportTargets>
        <htmlpublisher.HtmlPublisherTarget>
          <reportName>Detailed Cucumber Report</reportName>
          <reportDir>product/tests/acceptance-tests/</reportDir>
          <reportFiles>cucumber.html</reportFiles>
          <keepAll>true</keepAll>
          <wrapperName>htmlpublisher-wrapper.html</wrapperName>
        </htmlpublisher.HtmlPublisherTarget>
      </reportTargets>
    </htmlpublisher.HtmlPublisher>
    <hudson.tasks.BuildTrigger>
      <childProjects>rdk-acceptance-test-build-$gitBranch</childProjects>
      <threshold>
        <name>SUCCESS</name>
      </threshold>
    </hudson.tasks.BuildTrigger>
  </publishers>
  <buildWrappers>
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
    <EnvInjectPasswordWrapper plugin="envinject@1.92.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
    <EnvInjectBuildWrapper plugin="envinject@1.92.1">
      <info>
        <propertiesContent>
          NPM_CONFIG_REGISTRY="http://nexus.osehra.org:8081/nexus/content/repositories/npm-all/"
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
