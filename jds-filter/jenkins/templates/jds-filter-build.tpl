<project>
  <description>$description</description>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@1.2.0">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <url>$gitUrl</url>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>$gitBranch</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <clean>true</clean>
    <wipeOutWorkspace>false</wipeOutWorkspace>
    <skipTag>false</skipTag>
  </scm>
  <assignedNode>slave_yum_mirror</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <builders>
    <hudson.tasks.Shell>
      <command>npm install &amp;&amp; gulp test</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>npm publish --registry https://dl.vistacore.us/nexus/content/repositories/npm-internal/</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <hudson.tasks.Mailer plugin="mailer@1.5">
      <recipients>rong.chen@asmr.com udit.jhalani@accenturefederal.com mark.goldman@accenturefederal.com</recipients>
      <dontNotifyEveryUnstableBuild>false</dontNotifyEveryUnstableBuild>
      <sendToIndividuals>true</sendToIndividuals>
    </hudson.tasks.Mailer>
  </publishers>
</project>
