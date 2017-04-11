package org.opencds.config.cli

import groovy.util.logging.Log4j

import java.nio.file.Paths

import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder

import org.opencds.config.cli.commands.CDMCommands
import org.opencds.config.cli.commands.CDMTransformCommand
import org.opencds.config.cli.commands.Commands
import org.opencds.config.cli.commands.EECommands
import org.opencds.config.cli.commands.KMCommands
import org.opencds.config.cli.commands.PPCommands
import org.opencds.config.cli.commands.SDCommands
import org.opencds.config.cli.commands.SSCommands
import org.opencds.config.cli.commands.TransferCommand
import org.opencds.config.cli.util.ResourceUtil
import org.opencds.config.client.rest.RestClient

@Log4j
class CdmCli {

	Closure command
	
	public CdmCli(Closure command) {
		this.command = command;
	}
	
    public void run() {
		command()
    }

    public static void main(String[] args) {
        def cli = buildCli(args)
        try {
            OptionAccessor options = cli.options()
			
			String user
			if (options.user) {
				user = options.user
			} else {
				throw new RuntimeException('user option is required')
			}
			
			def inFile
			if (options.file) {
				File iFile = new File(options.file)
				inFile = new FileInputStream(iFile)
			} else {
				throw new RuntimeException('file option is required')
			}
			
            def outFile
            if (options.outfile) {
                File oFile = new File(options.outfile)
                oFile.delete()
                outFile = new FileOutputStream(oFile)
            } else {
                throw new RuntimeException("outfile option is required")
            }
			CDMTransformCommand command = new CDMTransformCommand(inFile, outFile, user)
			Closure cmd
			if (options.'psv-to-xml') {
				cmd = command.psvToCdm
			} else if (options.'xml-to-psv') {
				cmd = command.cdmToPsv
			} else {
				throw new RuntimeException('psv-to-xml or xml-to-psv option is required')
			}

            CdmCli client = new CdmCli(cmd)

            client.run()
        } catch (Exception e) {
            e.printStackTrace()
            log.error(e.message, e)
            cli.usage()
        }
    }

    static Map buildCli(String[] args) {
        def cli = new CliBuilder()
		cli._(longOpt: 'user', args: 1, "User ID")
        cli._(longOpt: 'file', args: 1, "File to upload.")
        cli._(longOpt: 'outfile', args: 1, 'File to which the output is written')
		cli._(longOpt: 'psv-to-xml', args: 0, 'xml input to pipe delimited output')
		cli._(longOpt: 'xml-to-psv', args: 0, 'pipe delimited input to xml output')
        def options = cli.parse(args)
        [usage: { cli.usage() }, options: { options }]
    }

}
