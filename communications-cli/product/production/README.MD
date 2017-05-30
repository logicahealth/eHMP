## Communications-CLI

### Usage

**Connection Settings**

Connection parameters are not required to run commands, the application will default to using the connection object in the RDK-fetch config.

A custom config file can be used with the --config flag. When using --config, the flag --connection-object should also be used to select the correct object from the config. If --connection-object is not used, the CLI defaults to 'oracledb.communicationsDatabase'

Connection parameters can also be provided manually with the flags: --host, --port, --user, --password, --service


**Creating a new message**

When creating a new message category, content, sender, and title are required.
```
node message-utility create --cat 'Category' --title 'Title' --content 'Message Body' --sender 'Sender'
```
Create also has optional fields of content-data, ehmp-app-version, attachment, and attachment-content-type.

**Example Usage of optional fields:**

*content-data must be valid json, anything else will cause an error.*
```
node message-utility create --cat 'Category' --title 'Title' --content 'Message Body' --sender 'Sender' --content-data '{"foo":"bar"}' --ehmp-app-version '2.2'
```

**Example of using attachments**

*--attachment-content-type must be used. If it is not, the attachment will not be stored. Attachments must be less than 1 MB*
```
node message-utility create --cat 'Message Category' --title 'Title' --content 'Message Body' --sender 'Sender' --attachment '/tmp/chart.png' --attachment-content-type 'images/png'
```

**Creating new messages from a JSON file**
```
node message-utility create -f '/tmp/messages.json'
```

The json file must be flat with the required fields of category, content, sender and title.

Example:
```
[{
	"category": "announcements-promotion",
	"content": "Test content",
	"title":"Test Title",
	"sender":"Developer",
	"recipient":"2.12.12"
},{
	"category": "announcements-system",
	"content": "This is a sample body message",
	"title":"System Maintenace",
	"sender":"Devs",
	"recipient":"2.0"
}]
```

**Activating a message**
```
node message-utility activate --id 'message identifier'
```
**Deleting a message**
```
node message-utility delete --id 'message identifier'
```
**Fetch messages by category**
```
node message-utility fetch --cat 'message category'
```
**Updating user preferences**

--enabled and --cat are both required

--enabled must be set to true or false

--user-id is an optional field. Setting this updates preferences for only this user

```
node message-utility update-preferences --cat category --enabled true
```

```
node message-utility update-preferences --cat category --enabled true --user-id sampleUser1
```

### Troubleshooting
