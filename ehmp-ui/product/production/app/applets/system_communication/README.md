::: page-description
# System Communication Applet #
This applet's main purpose is to present the user with announcements.
:::

## Applet Id ##
```JavaScript
{ id: 'system_communication' }
```

## View Types ##
### Announcements ###
```JavaScript
{
    type: 'announcements',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Displays a grouped list of announcement models. It utilizes the shared [Announcements Collection][AnnouncementsCollection].
##### Options #####
###### categories {.method} ######
Array of Objects used to configure what announcements are displayed based on the announcement model's [`category`](#Announcements-Collection-Model-Parse) attribute. Below is a list of properties available on each "categories Object".

| Required                           | Attribute | Type     | Description |
|:----------------------------------:|-----------|----------|-------------|
| <i class="fa fa-check-circle"></i> | **id**    | string   | announcement sub category <br/> **Example:**<br/> `{id: 'terms'}` filters on models with `{category: 'announcements-terms'}`  |
|                                    | **label** | string   | HTML header for the category |

The default value for this option is represented below:
```JavaScript
categories: [
    { id: 'terms', label: 'Terms of Use' },
    { id: 'system', label: 'Announcements' }
]
```

## Announcements Collection ##
This collection utilizes the RDK `ehmp-announcements` fetch resource.

> A new instance of the collection is created on require of the applet module (a.k.a. application start) for the purpose of sharing across multiple views.

The collection's `fetch` method is called on trigger of the `app:logged-in` event (which is thrown on the `ADK.Messaging` bus). Before called, the collection also checks to see if the user model retrieved from `ADK.UserService.getUserSession()` has a `uid` value.

### Collection Parse ###
Returns the response Object's `communication` array.
<table>
<thead>
    <th>Before Collection Parse</th>
    <th>After Collection Parse</th>
</thead>
<tr>
<td><pre lang="JavaScript">
{
    "communication": [{
        "identifier": [{
            "system": "",
            "value": ""
        }],
        "category": [{
            "system": "",
            "code": ""
        }],
        "sender": {
            "name": ""
        },
        "recipient": [{
            "all": true
        }],
        "payload": [{
            "content": [{
                "title": "",
                "contentString": ""
            }]
        }],
        "medium": [{
            "system": "",
            "code": ""
        }],
        "status": {
            "system": "",
            "code": ""
        },
        "sent": ""
    }]
}
</pre></td>
<td><pre lang="JavaScript">
[{
    "identifier": [{
        "system": "",
        "value": ""
    }],
    "category": [{
        "system": "",
        "code": ""
    }],
    "sender": {
        "name": ""
    },
    "recipient": [{
        "all": true
    }],
    "payload": [{
        "content": [{
            "title": "",
            "contentString": ""
        }]
    }],
    "medium": [{
        "system": "",
        "code": ""
    }],
    "status": {
        "system": "",
        "code": ""
    },
    "sent": ""
}]
</pre></td>
</tr>
</table>

### Model Parse ###
Creates a new Object with the following attributes:
| Attribute | Derived From                          |
|-----------|---------------------------------------|
| title     | `payload[0].content[0].title`         |
| content   | `payload[0].content[0].contentString` |
| category  | `category[0].code`                    |
| sender    | `sender.name`                         |
| sent      | `sent`                                |

<table>
<thead>
    <th>Before Model Parse</th>
    <th>After Model Parse</th>
</thead>
<tr>
<td><pre lang="JavaScript">
{
    "identifier": [{
        "system": "",
        "value": ""
    }],
    "category": [{
        "system": "",
        "code": ""
    }],
    "sender": {
        "name": ""
    },
    "recipient": [{
        "all": true
    }],
    "payload": [{
        "content": [{
            "title": "",
            "contentString": ""
        }]
    }],
    "medium": [{
        "system": "",
        "code": ""
    }],
    "status": {
        "system": "",
        "code": ""
    },
    "sent": ""
}
</pre></td>
<td><pre lang="JavaScript">
{
    "title": "",
    "content": "",
    "category": "",
    "sender": "",
    "sent": ""
}
</pre>
</td>
</tr>
</table>

## Announcement Check Model ##
Extended from `ADK.Checks.CheckModel`, this check is registered to the **screen-display** group and is therefore triggered by a screen change. The check's validation references the ["system_communication"][SessionStorageUsage] sessionStorage key to determine if the logged-in user has _"acknowledged"_ the terms/system announcements. Upon failure, the check displays an modal with all the terms/system announcements via the [Announcements View Type][AnnouncementsViewType].  Upon canceling/closing the modal without _"acknowledgment"_, an `app:logout` event will be fired on the `ADK.Messaging` bus, which will end the user session and log the user out of the application.

## Session Storage Usage ##
The applet has references to the `system_communication` sessionStorage key to keep track of the logged-in user's decision to _"acknowledge"_ the terms/system announcements.

The value for this sessionStorage key is an Object with the property of `acknowledgedAnnouncements`. Below is a list of acceptable `acknowledgedAnnouncements` values and their meaning.
- **true**: The user has acknowledged the terms/system announcements.
- **null**: There are no terms/system announcements for the user to acknowledge.

## Messaging Events ##
### Listens ###
#### On Applet Channel ####
`ADK.Messaging.getChannel('system_communication')`
##### register:check {.method} #####
On trigger of this event, the applet register's a new instance of it's [Announcement Check][AnnouncementCheck] definition to the global ADK collection of checks.
```JavaScript
ADK.Messaging.getChannel('system_communication').on('register:check', function() {
    ADK.Checks.register(new Check({
        id: 'system-communication-announcements'
    }));
});
```
##### unregister:check {.method}  #####
On trigger of this event, the applet un-register's it's [Announcement Check][AnnouncementCheck] Instance from the global ADK collection of checks.
```JavaScript
ADK.Messaging.getChannel('system_communication').on('unregister:check', function() {
    ADK.Checks.unregister('system-communication-announcements');
});
```
### Triggers ###
#### On Applet Channel ####
`ADK.Messaging.getChannel('system_communication')`
##### register:check {.method}  #####
This event is triggered on trigger of the `app:logged-in` event on the `ADK.Messaging` bus if the user model retrieved from `ADK.UserService.getUserSession()` has a `uid` value.
##### unregister:check {.method}  #####
This event is triggered on trigger of the `app:logged-in` event on the `ADK.Messaging` bus if the user model retrieved from `ADK.UserService.getUserSession()` does NOT have a `uid` value.

## Viewed All Behavior ##

The custom "Viewed All" behavior class allows for a developer to know when the user has viewed all the content for a scrollable region.

Behavior class located under: `system_communication/viewedAllBehavior.js`
```JavaScript
behaviors: {
  ViewedAllBehavior: {
    /*
    Behavior class definition
    (Accessed via require dependency)
    --REQUIRED--
     */
    behaviorClass: ViewedAllBehavior,

    /*
    jQuery selector for scrollable container
    --REQUIRED--
     */
    container: '.modal-body',

    /*
    View event to signal when the scroll listener should be set-up.
    If not provided, scroll event will be set-up on "attach" of the view.
    --OPTIONAL--
     */
    event: 'modal-shown'
  }
}
```

[AnnouncementsCollection]: #Announcements-Collection
[AnnouncementCheck]: #Announcement-Check-Model
[AnnouncementsViewType]: #View-Types-Announcements
[SessionStorageUsage]: #Session-Storage-Usage