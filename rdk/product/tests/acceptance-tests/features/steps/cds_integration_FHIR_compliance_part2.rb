require 'json-schema'

@resource = ""
Then(/^the returned json data meet the requirement of FHIR050_Condition$/) do
  puts @response
  json = JSON.parse(@response.body)
  schema_fhir050_condition = {
  "description" => "This schema is also applying for resource condition",
  "$schema"=> "http://json-schema.org/draft-04/schema#",
  "type"=> "object",
  "properties"=> {
    "resourceType"=> {
      "type"=> "string"
    },
    "type"=> {
      "type"=> "string"
    },
    "id"=> {
      "type"=> "string"
    },
    "link"=> {
      "type"=> "array",
      "items"=> {
        "type"=> "object",
        "properties"=> {
          "relation"=> {
            "type"=> "string"
          },
          "url"=> {
            "type"=> "string"
          }
        }
      }
    },
    "total"=> {
      "type"=> "integer"
    },
    "entry"=> {
      "type"=> "array",
      "items"=> {
        "type"=> "object",
        "properties"=> {
          "resource"=> {
            "type"=> "object",
            "properties"=> {
              "resourceType"=> {
                "type"=> "string"
              },
              "category"=> {
                "type"=> "object",
                "properties"=> {
                  "coding"=> {
                    "type"=> "array",
                    "items"=> {
                      "type"=> "object",
                      "properties"=> {
                        "code"=> {
                          "type"=> "string"
                        },
                        "system"=> {
                          "type"=> "string"
                        }
                      }
                    }
                  }
                }
              },
              "stage"=> {
                "type"=> "object",
                "properties"=> {
                  "summary"=> {
                    "type"=> "string"
                  }
                }
              },
              "patient"=> {
                "type"=> "object",
                "properties"=> {
                  "reference"=> {
                    "type"=> "string"
                  }
                }
              },
              "code"=> {
                "type"=> "object",
                "properties"=> {
                  "coding"=> {
                    "type"=> "array",
                    "items"=> {
                      "type"=> "object",
                      "properties"=> {
                        "display"=> {
                          "type"=> "string"
                        },
                        "system"=> {
                          "type"=> "string"
                        }
                      }
                    }
                  }
                }
              },
              "asserter"=> {
                "type"=> "object",
                "properties"=> {
                  "reference"=> {
                    "type"=> "string"
                  },
                  "display"=> {
                    "type"=> "string"
                  }
                }
              },
              "dateAsserted"=> {
                "type"=> "string"
              },
              "onsetDateTime"=> {
                "type"=> "string"
              },
              "contained"=> {
                "type"=> "array",
                "items"=> {
                  "type"=> "object",
                  "properties"=> {
                    "resourceType"=> {
                      "type"=> "string"
                    }
                  }
                }
              },
              "clinicalStatus"=> {
                "type"=> "string"
              },
              "extension"=> {
                "type"=> "array",
                "items"=> {
                  "type"=> "object",
                  "properties"=> {
                    "url"=> {
                      "type"=> "string"
                    }
                  }
                }
              }
            },
            "required" => %w(
              resourceType
             )
          }
        },
        "required" => %w(
          resource
        )
      }
    }
  }
}
       
  json["entry"].each do |item| 
    @resource  = item["resource"]["resourceType"] 
  end
  puts @resource
  expect(JSON::Validator.validate!(schema_fhir050_condition, json)).to eq(true) 
end

Then(/^required element "([^"]*)" is "([^"]*)" returned$/) do |arg1, arg2|
  puts @resource
  expect(@resource.casecmp(arg2)).to eq(0)
end

When(/^the client use GET requests with compartment\-style for patient "([^"]*)" of "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg1}/#{arg2}?_count=3"
  @response = HTTPartyRDK.get(path)
end

When(/^the client use POST requests with compartment\-style for patient "([^"]*)" of "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{arg1}/#{arg2}/_search?_count=3"
  @response = HTTPartyRDK.post(path)
end

When(/^the client use GET requests with direct\-resource\-access\-style for patient "([^"]*)" of "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/#{arg2}?subject.identifier=#{arg1}\&_count=3"
  @response = HTTPartyRDK.get(path)
end

When(/^the client use POST requests with direct\-resource\-access\-style for patient "([^"]*)" of "([^"]*)"$/) do |arg1, arg2|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/#{arg2}/_search?subject.identifier=#{arg1}\&_count=1"
  @response = HTTPartyRDK.post(path)
end
