::: page-description
Querying
========
:::

## Authentication

### Specification

Authentication request:
```
POST /resource/authentication
Content-Type: application/json

{
  "site":"<siteHash>",
  "division":"<division>",
  "accessCode":"<accessCode>",
  "verifyCode":"<verifyCode>"
}

```

Authentication response:
```
200 OK
set-cookie: <cookie>; Path=/; Expires=<date>; HttpOnly; Secure
X-Set-JWT: <jwt>

{"data":{"uid":"uid","expires":"2016-09-21T17:20:24.507Z","site":"AB34",[...]},"status":200}
```

Authenticate future requests by supplying both the cookie and JWT request headers:

```
Cookie: <cookie>
Authorization: Bearer <jwt>
```

RDK can set new cookie and JWT values during a session by sending a set-cookie or X-Set-JWT response header in any response.

### Examples

Example cookie and JWT response headers:
```
set-cookie: ehmp.vistacore.rdk.sid=s%3AOcP62fxt-xzlujxplqd2mAlFp4Y9DeUT.auOdOatTmpdS%2Fov2edK%2BiPBMLnT5a6ZCNSEOzBFj%2FcA; Path=/; Expires=Wed, 21 Sep 2016 17:20:27 GMT; HttpOnly; Secure
X-Set-JWT: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjc3JmIjoiYkZWQjNDS3EtN3RzRUtnRUhHWlRCcVFTN28tTjNCb2ZLcFJRIiwiaWF0IjoxNDc0NDc3NTI3fQ.HDTglJhMMIpGXy4p4ELCW1Tz57LuLmOaWchZty5NTPY
```

Example authenticated request headers:
```
Cookie: ehmp.vistacore.rdk.sid=s%3AOcP62fxt-xzlujxplqd2mAlFp4Y9DeUT.auOdOatTmpdS%2Fov2edK%2BiPBMLnT5a6ZCNSEOzBFj%2FcA
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjc3JmIjoiYkZWQjNDS3EtN3RzRUtnRUhHWlRCcVFTN28tTjNCb2ZLcFJRIiwiaWF0IjoxNDc0NDc3NTI3fQ.HDTglJhMMIpGXy4p4ELCW1Tz57LuLmOaWchZty5NTPY
```

### Tips

Developers with the RDK repository cloned can use this bash script to handle automatically authenticating requests:
```
alias curl-rdk="bash <(cd ~/Projects/vistacore/rdk; git show origin/curl-rdk:./curl-rdk)"
curl-rdk --help
```

## HTTP method override

RDK supports querying GET resources through a POST request. There are two intended use cases for this:

 1. To overcome query string limitations. Some software can't handle long query strings, but most software handles large POST bodies.
 2. To keep PHI and PII out of logs. Query strings are commonly logged by default; supplying sensitive resource parameters in a POST body adds a level of safety.

To perform a request for a non-POST resource using POST, add the `X-HTTP-Method-Override` header to the request. For example:  
```
POST /resource/patient/record/domain/document
X-HTTP-Method-Override: GET

{ "pid": "1234" }
```

Other HTTP verbs are also valid override values: PUT, PATCH, DELETE.

When overriding the HTTP method, query parameters must not conflict with body parameters, and all query parameters must be present as body parameters.

When using method overriding, it is best not to use query parameters at all, in order to improve performance, to avoid confusion, and to avoid logging sensitive information.

<br />
---
Next: [Resources](resources.md)
