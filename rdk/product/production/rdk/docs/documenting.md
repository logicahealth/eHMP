::: page-description
Documenting a Resource
=======
:::

## API Blueprint

The RDK uses [API Blueprint](https://apiblueprint.org) to document its resources. API Blueprint is an extension of [Markdown](https://daringfireball.net/projects/markdown/). The documentation you write will be [available for browsing](#/vx-api) and will also used to validate and parse request parameters.

## Documentation Files

Your documentation file must have the same name and location as your resource file, but with a `.md` extension instead of a `.js` extension. See `example-basic-resource.md` for an example of documenting `example-basic-resource.js`; both files are found under `rdk/src/resources/_example/`.

If you need to give your documentation file a different name or location, you can add an `apiBlueprintFile` property to the configuration you return from `getResourceConfig` with the full path to your documentation file.

## Writing Documentation

[API Blueprint's documentation](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md) is a good resource for learning the API Blueprint format. There are a few standards and customizations that the RDK uses:

### Groups

The RDK uses API Blueprint's [Resource Group feature](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-resourcegroup-section) to group resources on the documentation page. Your documentation should start with a `# Group My Group` header.

### Path Replacement

API Blueprint defines a resource [with a Markdown header followed by a path in brackets](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-resource-section), like this:

    ## My Resource [/its/path]

RDK resources should instead use `{{{path}}}`. This will be replaced with the path that the resource is deployed to. For example:

    ## My Resource [{{{path}}}]

API Blueprint's [Action sections](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-action-section) can also have paths; you should use `{{{path}}}` for them too. You can also add a subpath, like `[{{{path}}}/subpath]`.

### Linking to Common Parameters

Many RDK resources share common parameters, like `pid`. Rather than copying the same parameter to every API Bluprint file, you should instead link to common parameters using the `:[]()` syntax, which is like a regular Markdown link but with an initial colon:

    + Parameters

        :[pid]({{{common}}}/parameters/pid.md)

        :[uid]({{{common}}}/parameters/uid.md name:"Consult")

        + otherParam: `example` (string, optional) - My custom parameter

Parameters linked to with this syntax will be inlined directly into the generated documentation. A couple of notes:

1. The `{{{common}}}` variable will be replaced with the actual path to common items.
2. The `uid` parameter in the example above has a `name:"Consult"` added to it. Some linked files can accept arguments like this to customize them. Open the `uid.md` file (found at `rdk/src/core/api-blueprint/parameters`) to see how it's used. 

### Parameter Patterns

API Blueprint currently doesn't support advanced validation for parameters, although [support is coming](https://github.com/apiaryio/api-blueprint/issues/211). So in addition to API Blueprint's built-in validation, the RDK's parameter validator also supports validation via a regular expression pattern. To add a regular expression pattern to a parameter, place it in the parameter's description with a prefix of `Pattern:`, like this:

    + phone: `(123) 456-7890` (string, required) - A US phone number

        Pattern: `^\(\d{3}\) \d{3}-\d{4}$`

### Requests and Responses

You should include a [Request section](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-request-section) for actions that have a request body, like POST or PUT. You should include a [Response section](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-response-section) for all possible responses.

Documentation for most resources will include a 200 response for success, a 400 response for invalid parameters, a 404 response for a not-found error, and a 500 response for unexpected errors like an unavailable subsystem. See the *Linking to Common Responses* section below for a shortcut to writing these.

#### Example Bodies

Request and Response sections [allow `+ Body` sections](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-body-section). You should create an example body for a POST or a PUT request, and an example body for each response. Per the spec, example bodies need to be indented by 12 spaces or three tabs.

#### Linking to Schemas

Request and Response sections [allow `+ Schema` sections](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#def-schema-section). Schemas can be used to validate request and response bodies. Schemas can be placed inline into the document, but it's a good idea to link to them the same way you link to common parameters:

    + Request My Request (application/json)

        + Schema

                :[Schema]({{{common}}}/schemas/my_schema.jsonschema)

As with example bodies (and as shown in the example above), schemas need to be indented by 12 spaces or three tabs.

You should always create a schema for requests that have a body, such as POST and PUT requests. It's also a good idea to make schemas for your responses.

If you have your resource running in a development environment you can generate a schema from your response by calling it with a `spy-for-versioning=true` query parameter. Or you can use a tool like [jsonschema.net](http://jsonschema.net) to generate a schema from a JSON object. If you use that tool you should probably choose the "Single schema (list validation)" option under Arrays.

You can put your schemas in `rdk/src/core/api-blueprint/schemas`.

#### Linking to Common Responses

Most resources return a 200 response, which you'll need to document by hand. Most resources also return a 400, 404 and 500 response. Since these responses are usually the same between resources, there are some common responses that you can link to, for example:

    + Response 200 (application/json)

        // Document your 200 response here

    :[Response 400]({{{common}}}/responses/400.md name:"site")
    :[Response 404]({{{common}}}/responses/404.md)
    :[Response 500]({{{common}}}/responses/500.md)

## Undocumented Resources

If a resource should not have documentation you can exclude it from the generated documentation by adding an `undocumented: true` property to the resource's config. **Note**: this also disables automated request parameter validation for your resource, so think twice before you set it.

<br />
---
Next: [Testing](testing.md)
