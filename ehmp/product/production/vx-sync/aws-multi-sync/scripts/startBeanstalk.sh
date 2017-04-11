pushd /opt/vxsync
beanstalkd -p 5000 -b data/beanstalk -f0 -V -z 2000000 > ./logs/beanstalkd.log &
#beanstalkd -p 5001 -b data/beanstalk-1 -f0 -V -z 2000000 > ./logs/beanstalkd-1.log &
#beanstalkd -p 5002 -b data/beanstalk-2 -f0 -V -z 2000000 > ./logs/beanstalkd-2.log &
popd
