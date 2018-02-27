

import groovy.text.SimpleTemplateEngine

class JobManager {

    def jenkinsBaseUrl = 'http://localhost:8080'

    def workspaceDir = System.getProperty('workspaceDir')
    def gitBranch = System.getProperty('gitBranch').replace('origin/', '')

    def username = null
    def password = null

    public JobManager( String username, String password){
        this.username = username
        this.password = password
    }

    public static void main(args){
        def self = new JobManager(System.getProperty('username', null), System.getProperty('password', null));
        self.run();
    }

    def run(){

        if (gitBranch == 'HEAD')
        {
            gitBranch = 'git symbolic-ref refs/remotes/origin/HEAD'.execute().text.trim().replace('refs/remotes/origin/', '')
            println "resetting current branch name to $gitBranch, was pointed to HEAD"
        }

        def dir = new File('./infrastructure/jenkins')
        dir.traverse(
            type:groovy.io.FileType.FILES,
            nameFilter:~/.*\.kin/,
            maxDepth:0
        ) { kinBuildFilePath ->
            println "should we process this kin file: ${kinBuildFilePath}"
            if (gitBranch != 'next' && kinBuildFilePath.name.contains('infrastructure')) {
                println "skipping this kin file as we are not on the next branch"
            } else {
                println "processing this kin file"
                buildAndPublishJobs(kinBuildFilePath.absolutePath)
            }
        }
    }

    def buildAndPublishJobs(String kinBuildFilePath) {
        buildJobConfig(kinBuildFilePath).each { Job job ->
            if (!doesJobExist(job.name)) {
                createJob(job)
            } else {
                updateJob(job)
            }
        }
    }

    @GrabResolver(name = "nexus", root = "http://nexus.osehra.org:8081/nexus/content/groups/public")
    @Grab('jenkins:jenkins-cli:1.642.1')
    def runCliCommand(List<String> args, InputStream input = System.in,
        OutputStream output = System.out, OutputStream err = System.err)
    {

        def hudson.cli.CLI cli = new hudson.cli.CLI(jenkinsBaseUrl.toURI().toURL())
        if ( username != null && password != null){
            args.add('--username')
            args.add(username)
            args.add('--password')
            args.add(password)
        }
        println "Executing with arguments: ${args}"
        cli.execute(args, input, output, err)
        cli.close()
    }

    def createJob(Job job){
        println "creating job ${job.name} in jenkins ${jenkinsBaseUrl}"
        FileInputStream configFileInputStream = new FileInputStream(job.configFile)
        runCliCommand(['create-job', job.name], configFileInputStream)
    }

    def updateJob(Job job){
        def reenableJob = isJobEnabled(job.name)
        println "updating job ${job.name} in jenkins ${jenkinsBaseUrl}"
        FileInputStream configFileInputStream = new FileInputStream(job.configFile)
        runCliCommand(['update-job', job.name], configFileInputStream)
        if (reenableJob) {
            println "re-enabling job ${job.name} in jenkins ${jenkinsBaseUrl}"
            runCliCommand(['enable-job', job.name])
        }
    }

    def boolean doesJobExist(String jobName)  {
        def slurper = new XmlSlurper()
        def addr       = "$jenkinsBaseUrl/api/xml"
        def authString = "${username}:${password}".getBytes().encodeBase64().toString()
        def conn = addr.toURL().openConnection()
        conn.setRequestProperty( "Authorization", "Basic ${authString}" )

        //def jenkinsMain = slurper.parse("$jenkinsBaseUrl/api/xml")
        def jenkinsMain = slurper.parseText( conn.content.text )

        boolean found = false
        jenkinsMain.job.each{
            if (it.name.text() == jobName) {
                found = true
            }
        }

        return found
    }

    def boolean isJobEnabled(String jobName)  {
        def slurper = new XmlSlurper()
        def addr       = "$jenkinsBaseUrl/job/$jobName/config.xml"
        def authString = "${username}:${password}".getBytes().encodeBase64().toString()
        def conn = addr.toURL().openConnection()
        conn.setRequestProperty( "Authorization", "Basic ${authString}" )

        //def jobConfig = slurper.parse("$jenkinsBaseUrl/job/$jobName/config.xml")
        def jobConfig = slurper.parseText( conn.content.text )

        boolean enabled = false
        if (jobConfig.disabled == 'false') {
          enabled = true
        }
        return enabled
    }

    @GrabResolver(name = "nexus", root = "http://nexus.osehra.org:8081/nexus/content/groups/public")
    @Grab('hr.helix:kin:1.0')
    def List<Job> buildJobConfig(String kinBuildFilePath) {
        println "processing $kinBuildFilePath"
        hr.helix.kin.IO io = new hr.helix.kin.IO()
        hr.helix.kin.script.Runner runner = new hr.helix.kin.script.Runner()
        SimpleTemplateEngine engine = new groovy.text.SimpleTemplateEngine()
        String dsl = new File(kinBuildFilePath).getText().replace('%branch%', gitBranch)

        def build = runner.run(dsl)
        def jobs = new ArrayList<Job>()
        build.producers().each { job ->
            def name = job.name
            def templates = build.templates(name)
            def template = findValidTemplate(kinBuildFilePath, templates)
            if (!template) {
                System.err.println "No template $templates for job '$name'!"
                System.exit 4
            }

            def traits = build.traits(name)
            def config = engine.createTemplate(template).make(traits)

            def configFile = new File("$workspaceDir/build/$name/config.xml")
            io.writeConfig config, configFile
            println "creating ${configFile.absolutePath}"
            jobs.add(new Job(name: name, configFile: configFile))
        }

        return jobs
    }

    File findValidTemplate(String kinBuildFilePath, List<String> templateNames) {

        templateNames.findResult { name ->
            def templatePath = new File(kinBuildFilePath).parent + '/' + name
            println "looking for template here: $templatePath"
            def template = new File(templatePath)
            template.isFile() ? template : null
        }
    }

}
