#
# Class for clearing the Solr cache
#
class SolrCache
  # Clear Cache
  def self.clear(base_uri)
    # Require specific gem version at convergence-time
    gem 'httparty', '=0.11.0'
    require 'httparty'

    # get count of total documents
    before_count = get_count(get_documents(base_uri))

    # delete all documents
    `curl -s -H "Content-Type: application/json" -X POST -d '{"delete":{"query":"*:*"},"commit":{}}"' "#{base_uri}/solr/vpr/update?wt=json"`

    # get count of total documents (should be 0)
    after_count = get_count(get_documents(base_uri))
    Chef::Log.info "Cleared Solr (#{before_count} -> #{after_count} documents)"
  end

  def self.get_documents(base_uri)
    `curl -s -X GET "#{base_uri}/solr/vpr/select?q=*:*&wt=json"`
  end

  def self.get_count(json)
    JSON.parse(json)['response']['numFound']
  end
end
