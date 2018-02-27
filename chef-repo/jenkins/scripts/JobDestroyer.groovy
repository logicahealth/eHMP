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
    
        jenkinsMain.job.grep{ job -> job.name.text().startsWith('chef-server') && job.name.text() != 'chef-server-creator' && job.name.text() != 'chef-server-destroyer'}.each{ job ->
            println "checking if we should destroy job ${job.name.text()}"
            if (!jobNameContainsExistingBranch(job.name.text(), remoteBranches)) {
                 println "preparing to delete ${job.name.text()}"
                deleteJob(job.name.text())
            }
        }
    }

    def jobNameContainsExistingBranch(job, remoteBranches) {
        return remoteBranches.find{ branchName ->
            if (job.contains(branchName)) {
                println "looks like ${job} services branch ${branchName}"
                true
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
        cli.execute(args, input, output, err)
        cli.close()
    }

    def deleteJob(String jobName){
        println "deleting job $jobName"
        runCliCommand(['delete-job', jobName])
    }

    def String getJob(String jobName){
        //println "geting job $jobName"
        ByteArrayOutputStream output = new ByteArrayOutputStream()
        runCliCommand(['get-job', jobName], System.in, output, System.err)
        return output.toString()
    }
}
