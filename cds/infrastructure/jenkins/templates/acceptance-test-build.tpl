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
          <name>EHMP_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
            <script>
            [ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_PROVISION&apos;) ]
            </script>
            <sandbox>false</sandbox>
            <classpath class="empty-list"/>
            </groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>BACKEND_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
            <script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;BACKEND_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VX_SYNC_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VPR_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;SOAP_HANDLER_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_CORE_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_SOLR_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;NODEMOCKSERVICES_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ASU_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JDS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>HMP_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HMP_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_DATA_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CACHE_VERSION&apos;) ]
            </script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CORRELATED_IDS_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>EHMP_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>PREVIOUS_EHMP_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_COMMIT_HASH&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>OPENCDS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;OPENCDS_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDSDASHBOARD_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSDASHBOARD_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>RDK_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_PROVISION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>RDK_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDS_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_PROVISION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>

        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDSI_METRICS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_METRICS_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>

        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDSI_RESULTS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_RESULTS_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>

        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDS_ENGINE_AGENT_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_ENGINE_AGENT_VERSION&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>

        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]
            </script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
<usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CRS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-deploy-crs-build-r2.0&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CRS_VERSION&apos;) ]
            </script>
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
  <assignedNode>rdkdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e

######### deploy backend stack #########
ACTION=converge DRIVER=aws chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
ACTION=converge DRIVER=aws MACHINE_NAME=pjds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn

######### deploy rdk stack #########
ACTION=converge DRIVER=aws MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn

ACTION=converge DRIVER=aws MACHINE_NAME=cdsdb chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
ACTION=converge DRIVER=aws MACHINE_NAME=cdsinvocation chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
ACTION=converge DRIVER=aws MACHINE_NAME=opencds chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn

######### re-deploy rdk due to cds circular dependency #########
ACTION=converge DRIVER=aws MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn

######### deploy cdsdashboard #########
ACTION=converge DRIVER=aws MACHINE_NAME=cdsdashboard chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
</command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

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

cd product/tests/acceptance-tests
bundle install
bundle exec rake endToEndTests[aws]</command>
    </hudson.tasks.Shell>

  </builders>
  <publishers>
  <hudson.plugins.postbuildtask.PostbuildTask plugin="postbuild-task@1.8">
      <tasks>
        <hudson.plugins.postbuildtask.TaskProperties>
          <logTexts>
            <hudson.plugins.postbuildtask.LogProperties>
              <logText>.*</logText>
              <operator>AND</operator>
            </hudson.plugins.postbuildtask.LogProperties>
          </logTexts>
          <EscalateStatus>false</EscalateStatus>
          <RunIfJobSuccessful>false</RunIfJobSuccessful>
          <script>#!/usr/bin/env bash

export PATH=/usr/local/bin:\$PATH
export WORKSPACE=/var/lib/jenkins/Projects/vistacore
export BERKSHELF_PATH=\$WORKSPACE/.berkshelf
export VAGRANT_HOME=\$WORKSPACE/.vagrant.d
export GEM_HOME=\$WORKSPACE/.gems
export GEM_PATH=\$GEM_HOME:\$GEM_PATH
export PATH=\$GEM_HOME/bin:\$PATH

cd product/tests
rake scpCDSILogs[aws]</script>
        </hudson.plugins.postbuildtask.TaskProperties>
        <hudson.plugins.postbuildtask.TaskProperties>
          <logTexts>
            <hudson.plugins.postbuildtask.LogProperties>
              <logText>.*</logText>
              <operator>AND</operator>
            </hudson.plugins.postbuildtask.LogProperties>
          </logTexts>
          <EscalateStatus>false</EscalateStatus>
          <RunIfJobSuccessful>true</RunIfJobSuccessful>
<script>#!/usr/bin/env bash&#xd;
set -e&#xd;
######### stop cdsdashboard #########&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=cdsdashboard chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
######### stop deploy cds stack #########&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=cdsdb chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=cdsinvocation chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=opencds chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
######### stop rdk #########&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
######### stop pJDS #########&#xd;
ACTION=stop DRIVER=aws MACHINE_NAME=pjds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
######### stop backend stack #########&#xd;
ACTION=stop DRIVER=aws chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn&#xd;
</script>
      </hudson.plugins.postbuildtask.TaskProperties>
      </tasks>
    </hudson.plugins.postbuildtask.PostbuildTask>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@1.8">
      <groovyScript>import hudson.model.*
import hudson.util.*

def actionList = manager.build.getActions(hudson.model.ParametersAction)

resolver = actionList.get(0).createVariableResolver(manager.build)

CDSIResultsVersion = resolver.resolve(&quot;CDSI_RESULTS_VERSION&quot;)
CDSDashboardVersion = resolver.resolve(&quot;CDSDASHBOARD_VERSION&quot;)
OpenCDSVersion = resolver.resolve(&quot;OPENCDS_VERSION&quot;)

manager.build.setDisplayName("OCDS:\${OpenCDSVersion}-CDSI:\${CDSIResultsVersion}-CDSD:\${CDSDashboardVersion}")


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
    </htmlpublisher.HtmlPublisher>]
    <hudson.tasks.BuildTrigger>
      <childProjects>rdk-acceptance-test-build-$gitBranch</childProjects>
      <threshold>
        <name>SUCCESS</name>
      </threshold>
    </hudson.tasks.BuildTrigger>
  </publishers>
  <buildWrappers>
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
          <credentialsId>jenkins</credentialsId>
          <variable>HOST_KEY_PATH</variable>
        </org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
      </bindings>
    </org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper>
  </buildWrappers>
</project>
