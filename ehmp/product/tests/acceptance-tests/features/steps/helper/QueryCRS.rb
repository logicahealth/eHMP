path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'DefaultHmpLogin.rb'
require 'BuildQuery.rb'

#access CRS Server
class AccessCRS < BuildQuery
  def initialize
    super()  
    @path = String.new(DefaultLogin.crs_endpoint)
    @path.concat("")
  end
end
