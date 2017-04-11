#!/bin/bash
#
#---------------------------------------------------------------------------------------------------------
# This will export all the jobs in beanstalk to the given directory.  It will place them in subdirectories
# of the given directory where each subdirectory will be named the same as the tube that the jobs came
# from.  The jobs will be named <job-type>_<jobId>[_<iterator>].json.   Where <job-type> is one of "READY",
# "DELAYED", or "BURIED".   Which describes the type of status it was in the tube.   The jobId is the
# value of the jobId attribute in the job.  The iterator exists if for some reason there was a collision
# and the file already existed, it will add a numeric iterator to make it unique.
#
# These can be re-imported using the tools/maintenance/importBeanstalkJobs.js utility.
#---------------------------------------------------------------------------------------------------------
usage()
{
	cat << EOF
	usage: $0 options

	This script will export beanstalk jobs to a given directory
	specified by the options below

	NOTE: node must be part of your path

	OPTIONS:
	-h   Show this message
	-d   Output directory for beanstalk jobs
	-v   vxsync base directory
EOF
}

while getopts ":hd:v:" option
do
    case $option in
        h)
            usage
            exit 1
            ;;
        d)
            outdir=$OPTARG
            ;;
        v)
            vxsyncDir=$OPTARG
            ;;
    esac
done

if [[ -z $outdir ]]; then
	echo "output directory is required"
	exit 1
fi

if [[ -z $vxsyncDir ]]; then
	echo "vxsync base directory is required"
	exit 1
fi

pushd $vxsyncDir
echo shutdownBeanstalk.sh: Exporting beanstalk jobs
node tools/maintenance/exportBeanstalkJobs.js --basedir $outdir > $outdir/exportBeanstalkJobs.output.log
echo shutdownBeanstalk.sh: Beanstalk jobs have been drained to: $outdir
popd
