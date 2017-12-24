<project>
<actions/>
<description>
$description
</description>
<keepDependencies>false</keepDependencies>
<properties>
<hudson.model.ParametersDefinitionProperty>
  <parameterDefinitions>
          <hudson.model.ChoiceParameterDefinition>
            <name>ACTION</name>
            <description/>
            <choices class="java.util.Arrays\$ArrayList">
              <a class="string-array">
                <string>stop</string>
                <string>converge</string>
                <string>ready</string>
              </a>
            </choices>
          </hudson.model.ChoiceParameterDefinition>
          <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
            <name>APP_VERSION</name>
            <description>
            This is the version of the app to deploy. It corresponds to a version file (archived by the demo build) at /repositories/releases/us/vistacore/chef-server-package It also corresponds to a demo build of the same name (which uploaded the file to nexus) ex. version 1.2.1 would correspond to us/vistacore/chef-server-package/1.2.1/chef-server-package-1.2.1.sh , which was uploaded by the FIT demo build # v-1.2.1
            </description>
            <editable>true</editable>
            <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
              <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-deploy-demo-external-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;APP_VERSION&apos;) ]</script>
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
      <url>https://code.vistacore.us/projects/APP/repos/ehmp-ui/</url>
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
  <jdk>(Default)</jdk>
  <triggers class="vector">
  </triggers>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>
#!/usr/bin/env bash
set -e

echo "APP_VERSION=\${APP_VERSION}"
curl https://store.vistacore.us/nexus/content/repositories/releases/us/vistacore/artifact-versions-shell/\$APP_VERSION/artifact-versions-shell-\$APP_VERSION.sh -o artifact_versions.sh
source artifact_versions.sh
export DRIVER=aws
export PANORAMA_HMP_VERSION=2.2.T13-static
export KODAK_HMP_VERSION=2.0.rc221.4056
######### deploy pjds #########
MACHINE_NAME=pjds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy zookeeper #########
MACHINE_NAME=zookeeper chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy backend stack #########
chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy rdk... jbpm deploy comes after CDS deploys #########
MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy cdsinvocation stack #########
MACHINE_NAME=cdsdb chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
MACHINE_NAME=cdsinvocation chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
MACHINE_NAME=opencds chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy jbpm, and re-deploy rdk (re-deploy is to connect rdk to jbpm and cdsinvocation) #########
MACHINE_NAME=jbpm chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
######### deploy cdsdashboard #########
MACHINE_NAME=cdsdashboard chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
MACHINE_NAME=ehmp-ui chef-client -o ehmp-ui_provision@\$EHMP_UI_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
ELASTIC_IP=184.73.191.235
MACHINE_NAME=ehmp-balancer chef-client -o ehmp-ui_provision@\$EHMP_UI_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
</command>
</hudson.tasks.Shell>
</builders>
<publishers>
  <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
    <groovyScript>import hudson.model.*
  import hudson.util.*
  def appVersion = 'unknown'

  def matcher = manager.getMatcher(manager.build.logFile, /.*APP_VERSION='(.*)'.*/)
  if(matcher[0] != null &amp;&amp; matcher[0][1] != null) {
  appVersion = matcher.group(1)
  }

  manager.build.setDisplayName("v-\${appVersion}")

  def paramAction = new ParametersAction(new StringParameterValue('APP_VERSION', appVersion))
  manager.build.addAction(paramAction)</groovyScript>
    <behavior>0</behavior>
  </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
<hudson.tasks.Mailer plugin="mailer@1.17">
<recipients>ehmp-ui-build-monitoring@vistacore.us</recipients>
<dontNotifyEveryUnstableBuild>false</dontNotifyEveryUnstableBuild>
<sendToIndividuals>false</sendToIndividuals>
</hudson.tasks.Mailer>
</publishers>
<buildWrappers>
<hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.3">
<colorMapName>xterm</colorMapName>
</hudson.plugins.ansicolor.AnsiColorBuildWrapper>
<org.jenkinsci.plugins.preSCMbuildstep.PreSCMBuildStepsWrapper plugin="preSCMbuildstep@0.3">
<failOnError>false</failOnError>
</org.jenkinsci.plugins.preSCMbuildstep.PreSCMBuildStepsWrapper>
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
