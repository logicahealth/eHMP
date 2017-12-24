<?xml version="1.0" encoding="UTF-8"?>
<project>
   <actions />
   <description>$description</description>
   <keepDependencies>false</keepDependencies>
   <properties>
     <hudson.security.AuthorizationMatrixProperty>
       <permission>hudson.model.Item.Cancel:team-ehmp</permission>
       <permission>hudson.model.Item.Build:team-ehmp</permission>
     </hudson.security.AuthorizationMatrixProperty>
      <jenkins.model.BuildDiscarderProperty>
         <strategy class="hudson.tasks.LogRotator">
            <daysToKeep>-1</daysToKeep>
            <numToKeep>10</numToKeep>
            <artifactDaysToKeep>-1</artifactDaysToKeep>
            <artifactNumToKeep>-1</artifactNumToKeep>
         </strategy>
      </jenkins.model.BuildDiscarderProperty>
      <hudson.plugins.throttleconcurrents.ThrottleJobProperty plugin="throttle-concurrents@1.9.0">
         <maxConcurrentPerNode>0</maxConcurrentPerNode>
         <maxConcurrentTotal>0</maxConcurrentTotal>
         <categories class="java.util.concurrent.CopyOnWriteArrayList" />
         <throttleEnabled>false</throttleEnabled>
         <throttleOption>project</throttleOption>
         <limitOneJobWithMatchingParams>false</limitOneJobWithMatchingParams>
         <paramsToUseForLimit />
      </hudson.plugins.throttleconcurrents.ThrottleJobProperty>
   </properties>
   <scm class="hudson.plugins.git.GitSCM" plugin="git@2.4.4">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
         <hudson.plugins.git.UserRemoteConfig>
            <url>https://code.vistacore.us/scm/pi/chef-repo.git</url>
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
         <url>$gitUrl</url>
      </browser>
      <submoduleCfg class="list" />
      <extensions>
         <hudson.plugins.git.extensions.impl.PerBuildTag />
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
      <hudson.tasks.Shell>
         <command>
            export ORGNAME=$gitBranch
            export OPSCODE_USER=jenkins_sandbox
            knife upload / --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb</command>
      </hudson.tasks.Shell>
   </builders>
   <publishers>
      <hudson.tasks.Mailer plugin="mailer@1.17">
         <recipients>team-milkyway@vistacore.us</recipients>
         <dontNotifyEveryUnstableBuild>true</dontNotifyEveryUnstableBuild>
         <sendToIndividuals>true</sendToIndividuals>
      </hudson.tasks.Mailer>
      <hudson.plugins.parameterizedtrigger.BuildTrigger plugin="parameterized-trigger@2.30">
         <configs>
            <hudson.plugins.parameterizedtrigger.BuildTriggerConfig>
               <configs class="empty-list" />
               <projects />
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
