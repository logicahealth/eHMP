<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.security.AuthorizationMatrixProperty>
      <permission>hudson.model.Item.Cancel:team-ehmp</permission>
      <permission>hudson.model.Item.Build:team-ehmp</permission>
      <permission>hudson.model.Item.Configure:team-ehmp</permission>
    </hudson.security.AuthorizationMatrixProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>ACTION</name>
          <description/>
          <choices class="java.util.Arrays\$ArrayList">
            <a class="string-array">
              <string>stop</string>
              <string>converge</string>
              <string>destroy</string>
              <string>ready</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_PJDS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_JDS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_KODAK</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_PANORAMA</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_SOLR</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_MOCKS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_VXSYNC</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_RDK</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_CDSDB</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_CDSINVOCATION</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_OPENCDS</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_ORACLE</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_JBPM</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_CDSDASHBOARD</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>REDEPLOY_RDK</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_UI</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>DEPLOY_BALANCER</name>
          <description/>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>EHMP_UI_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_UI_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>EHMPUI_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMPUI_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>ADK_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;adk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ADK_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>ADK_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;adk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_PROVISION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>RDK_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_PROVISION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;BACKEND_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_CORE_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VX_SYNC_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VPR_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HMP_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;NODEMOCKSERVICES_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ASU_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;SOAP_HANDLER_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_SOLR_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_PROVISION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_METRICS_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_RESULTS_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_ENGINE_AGENT_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;OPENCDS_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSDASHBOARD_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_DATA_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CACHE_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CORRELATED_IDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_FITLABPROJECT_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_FITLABPROJECT_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_AUTH_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_AUTH_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_LISTENER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_LISTENER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_GENERAL_MEDICINE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_GENERAL_MEDICINE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_ORDER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_ORDER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_ACTIVITY_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_ACTIVITY_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_CDSINVOCATIONSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_CDSINVOCATIONSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_FOBTLABSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_FOBTLABSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_TASKSSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_TASKSSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_EHMPSERVICES_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_EHMPSERVICES_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>JBPM_UTILS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_UTILS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>ORACLE_SQL_CONFIG_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ORACLE_SQL_CONFIG_VERSION&apos;) ]</script>
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
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-deploy-crs-build-r2.0&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CRS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.2.1">
          <name>CDS_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;cds-team-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
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
  <assignedNode>ehmpdocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>true</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>true</blockBuildWhenUpstreamBuilding>
  <jdk>(Default)</jdk>
  <triggers>
    <hudson.triggers.TimerTrigger>
      <spec>0 20 * * *</spec>
    </hudson.triggers.TimerTrigger>
  </triggers>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_PJDS} = true ]; then
######### deploy pjds #########
DRIVER=aws MACHINE_NAME=pjds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_JDS} = true ]; then
######### deploy jds #########
DRIVER=aws MACHINE_NAME=jds chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_KODAK} = true ]; then
######### deploy vista-kodak #########
DRIVER=aws MACHINE_NAME=vista-kodak chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_PANORAMA} = true ]; then
######### deploy vista-panorama #########
DRIVER=aws MACHINE_NAME=vista-panorama chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_SOLR} = true ]; then
######### deploy solr #########
DRIVER=aws MACHINE_NAME=solr chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_MOCKS} = true ]; then
######### deploy mocks #########
DRIVER=aws MACHINE_NAME=mocks chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_VXSYNC} = true ]; then
######### deploy vxsync #########
DRIVER=aws MACHINE_NAME=vxsync chef-client -o ehmp_provision@\$EHMP_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_RDK} = true ]; then
######### deploy rdk #########
DRIVER=aws MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_CDSDB} = true ]; then
DRIVER=aws MACHINE_NAME=cdsdb chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_CDSINVOCATION} = true ]; then
DRIVER=aws MACHINE_NAME=cdsinvocation chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_OPENCDS} = true ]; then
DRIVER=aws MACHINE_NAME=opencds chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_ORACLE} = true ]; then
DRIVER=aws MACHINE_NAME=oracle chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
######### deploy oracle, jbpm, and re-deploy rdk (re-deploy is to connect rdk to oracle, jbpm, and cdsinvocation) #########
if [ \${DEPLOY_JBPM} = true ]; then
DRIVER=aws MACHINE_NAME=jbpm chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_CDSDASHBOARD} = true ]; then
DRIVER=aws MACHINE_NAME=cdsdashboard chef-client -o cds_provision@\$CDS_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${REDEPLOY_RDK} = true ]; then
DRIVER=aws MACHINE_NAME=rdk chef-client -o rdk_provision@\$RDK_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_UI} = true ]; then
DRIVER=aws MACHINE_NAME=ehmp-ui chef-client -o ehmp-ui_provision@\$EHMP_UI_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e
if [ \${DEPLOY_BALANCER} = true ]; then
DRIVER=aws MACHINE_NAME=ehmp-balancer chef-client -o ehmp-ui_provision@\$EHMP_UI_PROVISION --environment _default --force-formatter --config /var/lib/jenkins/Projects/vistacore/.chef/knife.rb --log_level warn
fi
      </command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <org.jenkins__ci.plugins.flexible__publish.FlexiblePublisher plugin="flexible-publish@0.15.2">
      <publishers>
        <org.jenkins__ci.plugins.flexible__publish.ConditionalPublisher>
          <condition class="org.jenkins_ci.plugins.run_condition.core.NeverRun" plugin="run-condition@1.0"/>
          <publisherList>
            <hudson.tasks.BuildTrigger>
              <childProjects>rdk-team-test-build-$gitBranch, ehmp-team-test-build-$gitBranch, ehmp-ui-team-test-build-$gitBranch, cds-team-test-build-$gitBranch</childProjects>
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
  </publishers>
  <buildWrappers>
    <hudson.plugins.ansicolor.AnsiColorBuildWrapper plugin="ansicolor@0.4.2">
      <colorMapName>xterm</colorMapName>
    </hudson.plugins.ansicolor.AnsiColorBuildWrapper>
    <EnvInjectBuildWrapper plugin="envinject@1.92.1">
      <info>
        <propertiesContent>
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
