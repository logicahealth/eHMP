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
    before_count = get_count(get_documents(base_uri).body)

    # delete all documents
    HTTParty.post(
      "#{base_uri}/solr/vpr/update?wt=json",
      body: {
        delete: {
          query: '*:*'
        },
        commit: {}
      }.to_json,
      headers: {
        'Content-Type' => 'application/json'
      }
    )

    # get count of total documents (should be 0)
    after_count = get_count(get_documents(base_uri).body)
    Chef::Log.info "Cleared Solr (#{before_count} -> #{after_count} documents)"
  end

  def self.get_documents(base_uri)
    HTTParty.get(
      "#{base_uri}/solr/vpr/select",
      query: {
        q: '*:*',
        wt: 'json'
      },
      headers: {
        'Accept' => 'application/json'
      }
    )
  end

  def self.get_count(json)
    JSON.parse(json)['response']['numFound']
  end
end
