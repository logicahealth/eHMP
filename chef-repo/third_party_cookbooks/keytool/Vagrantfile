Vagrant.configure("2") do |config|
  config.vm.box = "opscode-centos-6.5"
  config.vm.box_url = "http://opscode-vm-bento.s3.amazonaws.com/vagrant/virtualbox/opscode_centos-6.5_chef-provisionerless.box"
  config.berkshelf.enabled = true
  config.omnibus.chef_version = :latest

  config.vm.define "java6" do |java6|
    java6.vm.hostname = "java6"
    java6.vm.provision :chef_solo do |chef|
      chef.json = {
        "java" => {
          "jdk_version" => 6
        }
      }

      chef.run_list = [
        "recipe[java]",
        "recipe[keytool::default]",
        "recipe[keytool::test]"
      ]
    end
  end

  config.vm.define "java7" do |java7|
   java7.vm.hostname = "java7"
    java7.vm.provision :chef_solo do |chef|
      chef.json = {
        "java" => {
          "jdk_version" => 7
        }
      }

      chef.run_list = [
        "recipe[java]",
        "recipe[keytool::default]",
        "recipe[keytool::test]"
      ]
    end
  end
end
