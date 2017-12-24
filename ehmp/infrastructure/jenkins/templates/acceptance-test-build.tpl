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
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>BACKEND_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;BACKEND_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>EHMP_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>NODEMOCKSERVICES_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;NODEMOCKSERVICES_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>VX_SYNC_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VX_SYNC_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>VPR_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VPR_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>SOAP_HANDLER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;SOAP_HANDLER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>HEALTH_TIME_CORE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_CORE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>HEALTH_TIME_SOLR_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_SOLR_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>ASU_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ASU_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>COMMIT_HASH</name>
          <description>Git Revision hash to checkout. This should be the same revision hash the dev build was at when it produced the version being tested here.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JDS_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>HMP_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HMP_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JDS_DATA_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_DATA_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CACHE_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CACHE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CORRELATED_IDS_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CORRELATED_IDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
    <hudson.plugins.throttleconcurrents.ThrottleJobProperty plugin="throttle-concurrents@1.8">
      <maxConcurrentPerNode>0</maxConcurrentPerNode>
      <maxConcurrentTotal>0</maxConcurrentTotal>
      <throttleEnabled>false</throttleEnabled>
      <throttleOption>project</throttleOption>
    </hudson.plugins.throttleconcurrents.ThrottleJobProperty>
  </properties>
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
        <name>\${COMMIT_HASH}</name>
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
      <url>https://code.vistacore.us/projects/APP/repos/ehmp/</url>
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
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e

######### deploy pJDS #########
ACTION=converge DRIVER=aws MACHINE_NAME=pjds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy zookeeper #########
ACTION=converge DRIVER=aws MACHINE_NAME=zookeeper chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy backend stack #########
ACTION=converge DRIVER=aws chef-client -o ehmp_provision@\$EHMP_PROVISION --environment noPublishTubes --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

cd product/production/vx-sync
bundle install
rake operational_data[aws]
rake patient_sync[aws]
rake inttest[aws]</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

cd product/tests/acceptance-tests
export PARALLEL_TEST_PROCESSORS=1
bundle install
bundle exec rake endToEndTests[aws]</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

def actionList = manager.build.getActions(hudson.model.ParametersAction)

resolver = actionList.get(0).createVariableResolver(manager.build)

backendVersion = resolver.resolve(&quot;BACKEND_VERSION&quot;)
hmpVersion = resolver.resolve(&quot;HMP_MAIN_WAR_VERSION&quot;)

manager.build.setDisplayName(&quot;ve-\${backendVersion} hmp-\${hmpVersion}&quot;)

import hudson.FilePath

channel = manager.build.workspace.channel;
manager.listener.logger.println(&quot;Workspace Channel&quot; + channel )

FilePath workspacePath = manager.build.getWorkspace()
manager.listener.logger.println(&quot;Workspace Path logged here&quot; + workspacePath )
if(manager.build.workspace.isRemote())
{
    channel = manager.build.workspace.channel;
}
FilePath generatedFile = new hudson.FilePath(channel, manager.build.workspace.toString() + &quot;//consoleLog.txt&quot;)
generatedFile.write(manager.build.getLog(),&quot;UTF-8&quot;)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <net.masterthought.jenkins.CucumberReportPublisher plugin="cucumber-reports@1.4.0">
      <jsonReportDirectory>product/tests/acceptance-tests/</jsonReportDirectory>
      <fileIncludePattern>cucumber.json</fileIncludePattern>
    </net.masterthought.jenkins.CucumberReportPublisher>
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
    <hudson.plugins.git.GitPublisher plugin="git@1.5.0">
      <configVersion>2</configVersion>
      <pushMerge>false</pushMerge>
      <pushOnlyIfSuccess>true</pushOnlyIfSuccess>
      <forcePush>true</forcePush>
      <tagsToPush>
        <hudson.plugins.git.GitPublisher_-TagToPush>
          <targetRepoName>origin</targetRepoName>
          <tagName>healthy-$gitBranch</tagName>
          <tagMessage></tagMessage>
          <createTag>false</createTag>
          <updateTag>true</updateTag>
        </hudson.plugins.git.GitPublisher_-TagToPush>
      </tagsToPush>
    </hudson.plugins.git.GitPublisher>
    <hudson.tasks.Mailer plugin="mailer@1.5">
      <recipients></recipients>
      <dontNotifyEveryUnstableBuild>true</dontNotifyEveryUnstableBuild>
      <sendToIndividuals>true</sendToIndividuals>
    </hudson.tasks.Mailer>
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
    <EnvInjectPasswordWrapper plugin="envinject@1.93.1">
      <injectGlobalPasswords>true</injectGlobalPasswords>
      <maskPasswordParameters>true</maskPasswordParameters>
      <passwordEntries/>
    </EnvInjectPasswordWrapper>
    <org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper plugin="credentials-binding@1.10">
      <bindings>
        <org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
          <credentialsId>jenkins</credentialsId>
          <variable>HOST_KEY_PATH</variable>
        </org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
      </bindings>
    </org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper>
  </buildWrappers>
</project>
