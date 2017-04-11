#
# Cookbook: rc
# License: Apache 2.0
#
# Copyright 2015-2016, Bloomberg Finance L.P.
#
require 'poise'

module RcCookbook
  module Resource
    # A resource which manages runtime configuration files.
    # @since 1.0.0
    # @example
    # rc_file '/etc/skel/bashrc' do
    #   options('http_proxy' => 'http://proxy.corporate.com:80')
    # end
    #
    # rc_file File.join(Dir.home, 'curlrc.bat') do
    #   type 'bat'
    #   options('http_proxy' => 'http://proxy.corporate.com:80')
    # end
    class RcFile < Chef::Resource
      include Poise(fused: true)
      provides(:rc_file)

      attribute(:path, kind_of: String, name_attribute: true)
      attribute(:owner, kind_of: String)
      attribute(:group, kind_of: String)
      attribute(:mode, kind_of: String, default: '0640')
      attribute(:type, equal_to: %w{bash bat edn yaml json toml java ini}, default: 'bash')
      attribute('',
        template: true,
        default_options: {},
        default_cookbook: 'rc',
        default_source: lazy { "#{type}.erb" })

      def to_content
        case type.to_sym
        when :edn
          require 'edn'
          options.to_edn
        when :yaml
          options.to_yaml
        when :java, :properties, :java_properties
          require 'java-properties'
          JavaProperties.generate(options)
        when :toml
          require 'toml'
          TOML::Generator.new(options).body
        when :json
          JSON.pretty_generate(options)
        when :ini
          require 'iniparse'
          IniParse.gen do |doc|
            options.each_pair do |key, value|
              if value.kind_of?(Hash) # rubocop:disable Style/ClassCheck
                doc.section(key) do |s|
                  value.each { |k, v| s.option(k, v) }
                end
              else
                doc.option(key, value)
              end
            end
          end.to_ini
        else
          content
        end
      end

      action(:create) do
        notifying_block do
          file new_resource.path do
            owner new_resource.owner
            group new_resource.group
            mode new_resource.mode
            content new_resource.to_content
          end
        end
      end

      action(:append_if_missing) do
        fail 'You cannot use append_if_missing on non-bash file types!' unless new_resource.type == 'bash'
        notifying_block do
          new_resource.options.each_pair do |k, v|
            append_if_no_line 'append if missing' do
              path new_resource.path
              line %{export #{k}="#{v}"}
            end
          end
        end
      end

      action(:delete) do
        notifying_block do
          file new_resource.path do
            action :delete
          end
        end
      end
    end
  end
end
