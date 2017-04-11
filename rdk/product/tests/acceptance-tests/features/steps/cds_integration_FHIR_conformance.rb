require 'json-schema'

When(/^the client requests Conformance statement for "([^"]*)"$/) do |arg1|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/metadata?resource=#{arg1}"
  @response = HTTPartyRDK.get(path)
end

Then(/^the returned json data must include resource type "(.*?)"$/) do |domain|
  json = JSON.parse(@response.body)
  type = ""  
  puts @response
  schema = 
  {
  "$schema" => "http://json-schema.org/draft-04/schema#",
  "type"=> "object",
  "properties"=> {
    "resourceType"=> {
      "type"=> "string"
    },
    "id"=> {
      "type"=> "string"
    },
    "url"=> {
      "type"=> "string"
    },
    "version"=> {
      "type"=> "string"
    },
    "name"=> {
      "type"=> "string"
    },
    "description"=> {
      "type"=> "string"
    },
    "status"=> {
      "type"=> "string"
    },
    "date"=> {
      "type"=> "string"
    },
    "fhirVersion"=> {
      "type"=> "string"
    },
    "acceptUnknown"=> {
      "type"=> "boolean"
    },
    "format"=> {
      "type"=> "array",
      "items"=> {
        "type"=> "string"
      }
    },
    "rest"=> {
      "type"=> "array",
      "items"=> {
        "type"=> "object",
        "properties"=> {
          "mode"=> {
            "type"=> "string"
          },
          "documentation"=> {
            "type"=> "string"
          },
          "resource"=> {
            "type"=> "array",
            "items"=> {
              "type"=> "object",
              "properties"=> {
                "type"=> {
                  "type"=> "string"
                },
                "profile"=> {
                  "type"=> "object",
                  "properties"=> {
                    "reference"=> {
                      "type"=> "string"
                    }
                  },
                  "required"=> [
                    "reference"
                  ]
                },
                "interaction"=> {
                  "type"=> "array",
                  "items"=> {
                    "type"=> "object",
                    "properties"=> {
                      "code"=> {
                        "type"=> "string"
                      }
                    },
                    "required"=> [
                      "code"
                    ]
                  }
                },
                "searchParam"=> {
                  "type"=> "array",
                  "items"=> {}
                }
              }
            }
          }
        }
      }
    }
  }
  }                       
  json["rest"].each do |item| 
    type = item["resource"][0]["type"]   
  end
  puts type
  expect(type.casecmp(domain)).to eq(0)
  expect(JSON::Validator.validate!(schema, json)).to eq(true)
  #expect(JSON::Validator.validate!(schema, json, :fragment => '#/rest/0/resource/0/type')).to eq(true)
end


