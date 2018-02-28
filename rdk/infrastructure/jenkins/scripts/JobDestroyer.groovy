@GrabResolver(
     name='jgit-repository', 
     root='http://download.eclipse.org/jgit/maven'
)
@Grab(
     group='org.eclipse.jgit',
     module='org.eclipse.jgit',
     version='1.1.0.201109151100-r'
)

import org.eclipse.jgit.*
import org.eclipse.jgit.lib.*
import org.eclipse.jgit.util.*

class JobDestroyer {

    def jenkinsBaseUrl = 'http://localhost:8080'
  def remoteBranches = []

    def username = null
    def password = null

    public JobDestroyer( String username, String password){
        this.username = username
        this.password = password
    }
    
    public static void main(args){
        def self = new JobDestroyer(System.getProperty('username', null), System.getProperty('password', null));
        self.run();
    }

    def run(){
    Repository repository = RepositoryCache.open(RepositoryCache.FileKey.lenient(new File('.'),FS.DETECTED), true)
    
    Map<String, Ref> remotesRefList = repository.getRefDatabase().getRefs(Constants.R_REMOTES)
    for (String remoteKey : remotesRefList.keySet()) {
      def branchName = remoteKey.replace('origin/', '')
      println "found remote branch $branchName"
      remoteBranches.push(branchName)
    }

        def jenkinsMain = new XmlSlurper().parse("$jenkinsBaseUrl/api/xml")
    
    jenkinsMain.job.grep{ job -> job.name.text().contains('rdk') && job.name.text() != 'creator' && job.name.text() != 'destroyer' && !job.name.text().contains('template') && !job.name.text().contains('infrastructure')}.each{ job ->
      println "checking if we should destroy job ${job.name.text()}"
      def jobConfig = new XmlSlurper().parseText(getJob(job.name.text()))
      def gitBranch = jobConfig.'*'.find{ it.name() == 'scm' }.branches.'hudson.plugins.git.BranchSpec'.name.text()
      println "checking if remote branch $gitBranch exists"
      if (gitBranch != '**' && !(gitBranch in remoteBranches)) {
        deleteJob(job.name.text())
      }
    }
    }

    @GrabResolver(name = "nexus", root = "https://nexus.osehra.org:8444/nexus/content/groups/public")
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
        cli.execute(args, input, output, err)
        cli.close()
    }

    def deleteJob(String jobName){
    println "deleting job $jobName in jenkins $jenkinsBaseUrl"
        runCliCommand(['delete-job', jobName])
    }

    def String getJob(String jobName){
    println "geting job $jobName in jenkins $jenkinsBaseUrl"
    ByteArrayOutputStream output = new ByteArrayOutputStream()
        runCliCommand(['get-job', jobName], System.in, output, System.err)
    return output.toString()
    }


}
