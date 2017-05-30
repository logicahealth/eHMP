#
# Cookbook Name:: ehmp_oracle
# Attributes: communication
#

default['ehmp_oracle']['communication']['tablespaces'] = {
  'COMM_DATA' => {
    'file' => 'comm01.dbf' ,
    'size' => '256M',
    'extent' => '265M'
  },
  'COMM_X' => {
    'file' => 'commx01.dbf' ,
    'size' => '256M',
    'extent' => '265M'
  }
}
default['ehmp_oracle']['communication']['sql_dir'] = "/tmp/oracledb"
default['ehmp_oracle']['communication']['user_communication_item'] = "oracle_user_communication"
default['ehmp_oracle']['communication']['user_communicationuser_item'] = "oracle_user_communicationuser"
