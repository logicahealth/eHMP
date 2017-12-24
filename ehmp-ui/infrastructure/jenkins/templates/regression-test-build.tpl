<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>$description</description>
  <logRotator>
    <daysToKeep>-1</daysToKeep>
    <numToKeep>30</numToKeep>
    <artifactDaysToKeep>-1</artifactDaysToKeep>
    <artifactNumToKeep>10</artifactNumToKeep>
  </logRotator>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>ACTION</name>
          <description/>
          <choices class="java.util.Arrays\$ArrayList">
            <a class="string-array">
              <string>converge</string>
              <string>start</string>
              <string>stop</string>
              <string>destroy</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>EHMP_UI_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_UI_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>EHMPUI_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMPUI_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>ADK_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;adk-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ADK_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>ADK_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;adk-dev-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>RDK_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>RDK_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;RDK_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>RDK_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>PREVIOUS_RDK_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;ehmp-ui-acceptance-test-build-$gitBranch&apos;)?.lastBuild?.buildVariableResolver.resolve(&apos;RDK_COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>EHMP_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>BACKEND_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;BACKEND_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>HEALTH_TIME_CORE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_CORE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>VX_SYNC_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VX_SYNC_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>VPR_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;VPR_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JDS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>HMP_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HMP_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>NODEMOCKSERVICES_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;NODEMOCKSERVICES_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>ASU_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ASU_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>SOAP_HANDLER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;SOAP_HANDLER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>HEALTH_TIME_SOLR_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;HEALTH_TIME_SOLR_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>EHMP_COMMIT_HASH</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;EHMP_COMMIT_HASH&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CDS_PROVISION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_PROVISION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CDSI_METRICS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_METRICS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CDSI_RESULTS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSI_RESULTS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CDS_ENGINE_AGENT_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDS_ENGINE_AGENT_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>OPENCDS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;OPENCDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CDSDASHBOARD_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CDSDASHBOARD_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JDS_DATA_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JDS_DATA_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CACHE_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CACHE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>CORRELATED_IDS_VERSION</name>
          <description>The ehmp infrastructure version number that corresponds with this jobs commit hash.</description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;CORRELATED_IDS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_FITLABPROJECT_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_FITLABPROJECT_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_AUTH_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_AUTH_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_LISTENER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_LISTENER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_GENERAL_MEDICINE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_GENERAL_MEDICINE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_ORDER_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_ORDER_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_ACTIVITY_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_ACTIVITY_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_CDSINVOCATIONSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_CDSINVOCATIONSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_FOBTLABSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_FOBTLABSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_TASKSSERVICE_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_TASKSSERVICE_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_EHMPSERVICES_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_EHMPSERVICES_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>JBPM_UTILS_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;JBPM_UTILS_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
          <name>ORACLE_SQL_CONFIG_VERSION</name>
          <description></description>
          <editable>false</editable>
          <choiceListProvider class="jp.ikedam.jenkins.plugins.extensible_choice_parameter.SystemGroovyChoiceListProvider">
            <groovyScript plugin="script-security@1.27">
<script>[ jenkins.model.Jenkins.instance.getItem(&apos;rdk-acceptance-test-build-$gitBranch&apos;)?.lastStableBuild?.buildVariableResolver.resolve(&apos;ORACLE_SQL_CONFIG_VERSION&apos;) ]</script>
<sandbox>false</sandbox>
<classpath class="empty-list"/>
</groovyScript>
            <usePredefinedVariables>true</usePredefinedVariables>
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
        <jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition plugin="extensible-choice-parameter@1.3.3">
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
            <project class="project" reference="../../../../../.."/>
          </choiceListProvider>
        </jp.ikedam.jenkins.plugins.extensible__choice__parameter.ExtensibleChoiceParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@3.0.0">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <url>$gitUrl</url>
        <credentialsId>git</credentialsId>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>\${COMMIT_HASH}</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
    <browser class="hudson.plugins.git.browser.Stash">
      <url>https://code.vistacore.us/projects/APP/repos/ehmp-ui/</url>
    </browser>
    <submoduleCfg class="list"/>
    <extensions/>
  </scm>
  <assignedNode>uidocker</assignedNode>
  <canRoam>false</canRoam>
  <disabled>true</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/usr/bin/env bash
set -e

export DRIVER=aws

$deployBlock
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

cd product/tests
bundle install
bundle exec rake syncCache
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

cd product/tests/acceptance-tests
bundle install
$prepopBlock
bundle exec rake $regressionTestTask[aws]
      </command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <hudson.tasks.ArtifactArchiver>
      <artifacts>product/tests/acceptance-tests/screenshots/*</artifacts>
      <allowEmptyArchive>false</allowEmptyArchive>
      <onlyIfSuccessful>false</onlyIfSuccessful>
      <fingerprint>false</fingerprint>
      <defaultExcludes>true</defaultExcludes>
      <caseSensitive>true</caseSensitive>
    </hudson.tasks.ArtifactArchiver>
    <org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder plugin="groovy-postbuild@2.3.1">
      <script plugin="script-security@1.24">
        <script>manager.build.setDisplayName("\${manager.envVars['EHMPUI_VERSION']}")</script>
        <sandbox>false</sandbox>
      </script>
      <behavior>0</behavior>
      <runForMatrixParent>false</runForMatrixParent>
    </org.jvnet.hudson.plugins.groovypostbuild.GroovyPostbuildRecorder>
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
    <EnvInjectBuildWrapper plugin="envinject@1.93.1">
      <info>
        <groovyScriptContent>def value = currentJob.lastCompletedBuild?.buildVariableResolver?.resolve('EHMP_COMMIT_HASH')
        return [PREVIOUS_EHMP_COMMIT_HASH: value]
        </groovyScriptContent>
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
          <credentialsId>jenkins</credentialsId>
          <variable>HOST_KEY_PATH</variable>
        </org.jenkinsci.plugins.credentialsbinding.impl.FileBinding>
      </bindings>
    </org.jenkinsci.plugins.credentialsbinding.impl.SecretBuildWrapper>
  </buildWrappers>
</project>
