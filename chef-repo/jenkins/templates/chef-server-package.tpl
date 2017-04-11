<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.buildblocker.BuildBlockerProperty plugin="build-blocker-plugin@1.7.1">
      <useBuildBlocker>false</useBuildBlocker>
      <blockLevel>GLOBAL</blockLevel>
      <scanQueueFor>DISABLED</scanQueueFor>
      <blockingJobs></blockingJobs>
    </hudson.plugins.buildblocker.BuildBlockerProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>APP_VERSION</name>
          <description>This is the app version you want to deploy.  Gotten from releases/us/vistacore/artifact-versions-shell</description>
          <defaultValue/>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>NEXUS_URL</name>
          <description></description>
          <defaultValue>https://store.vistacore.us</defaultValue>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
    <jenkins.plugins.slack.SlackNotifier_-SlackJobProperty plugin="slack@1.8">
      <teamDomain></teamDomain>
      <token></token>
      <room></room>
      <startNotification>false</startNotification>
      <notifySuccess>false</notifySuccess>
      <notifyAborted>false</notifyAborted>
      <notifyNotBuilt>false</notifyNotBuilt>
      <notifyUnstable>false</notifyUnstable>
      <notifyFailure>false</notifyFailure>
      <notifyBackToNormal>false</notifyBackToNormal>
      <notifyRepeatedFailure>false</notifyRepeatedFailure>
      <includeTestSummary>false</includeTestSummary>
      <showCommitList>false</showCommitList>
      <includeCustomMessage>false</includeCustomMessage>
      <customMessage></customMessage>
    </jenkins.plugins.slack.SlackNotifier_-SlackJobProperty>
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
  <assignedNode>vpc_slave_chef_repo</assignedNode>
  <canRoam>false</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <jdk>(Default)</jdk>
  <triggers class="vector"/>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>curl \$NEXUS_URL/nexus/service/local/repositories/releases/content/us/vistacore/artifact-versions-shell/\$APP_VERSION/artifact-versions-shell-\$APP_VERSION.sh -o artifact_versions.sh
</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>source artifact_versions.sh
if [ -z \$APP_VERSION ]; then
  echo &quot;You must set the APP_VERSION variable to run this job.&quot;
  exit 1
fi

# this needs to run with sudo as it configures the berks-api service on the slave
sudo chef-client -o berks-api
sleep 30</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>source artifact_versions.sh
# https://github.com/berkshelf/berkshelf-api/issues/112
export LANG=en_US.UTF-8

rm -rf ~/.berkshelf/cookbooks
cd provisioner_berksfile
berks install
berks install
rm Berksfile.lock</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>source artifact_versions.sh
sh generate-package.sh</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

def actionList = manager.build.getActions(hudson.model.ParametersAction)

resolver = actionList.get(0).createVariableResolver(manager.build)

version = resolver.resolve(&quot;APP_VERSION&quot;)

manager.build.setDisplayName(&quot;\${version}&quot;)</groovyScript>
      <behavior>0</behavior>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
    <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.22">
      <configs>
        <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
          <configs class="java.util.Collections\$EmptyList"/>
          <projects></projects>
          <condition>SUCCESS</condition>
          <triggerWithNoParameters>false</triggerWithNoParameters>
        </hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
      </configs>
    </hudson.plugins.parameterizedtrigger.BuildTrigger>
  </publishers>
  <buildWrappers/>
</project>
