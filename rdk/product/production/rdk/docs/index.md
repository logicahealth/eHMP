::: page-description
RDK Introduction
================
:::

## Overview
### eHMP Overview
 * The eHMP UI is composed of applets which show pieces of information.
 * The applets are written with the client-side Application Development Kit (ADK) framework.
 * The applets retrieve information from the resource server through ADK.
 * The resource server is written with the server-side Resource Development Kit (RDK) framework.
 * ADK and RDK constitute the Software Development Kit (SDK).

### RDK Overview
The RDK is an opinionated, server-side JavaScript framework for developing a resource server.
The RDK assists common cross-cutting concerns like authentication, authorization, logging, etc.

RDK core concepts:
 * **resource**: a single web service.
 * **resource server**: a deployable set of resources with a specific configuration.
 * **subsystem**: a set of functionality used by the RDK framework itself or usable by multiple resources.
 * **interceptor**: middleware which runs before a request handler
 * **outerceptor**: middleware which runs after a request handler and before sending the response


Currently there is one main resource server, the *VistA Exchange API Resource Server*.

## Running the Resource Server
Proper deployment of RDK will generate a JSON configuration file at `config/rdk-fetch-server-config.json`.  
Once a configuration file has been generated, one of these commands may be used to start the resource server:
 * `./run.sh`  
 * `./bin/rdk-fetch-server.js`

The resource server process accepts a --config command-line argument to specify a path to a JSON configuration file.

## Development and Implementation details
 * [Contributing](contributing.md)
    * [Development Enviroment](contributing.md#Development-Environment)
    * [Code Review Checklist](contributing.md#Code-Review-Checklist)
    * [Git Basics](contributing.md#Git-Basics)
 * [Style Guide](style-guide.md)
    * [Tools](style-guide.md#Tools)
    * [RDK-Specific Guidelines](style-guide.md#RDK-Specific-Guidelines)
    * [Javascript Guidelines](style-guide.md#Javascript-Guidelines)
    * [General Programming Guidelines](style-guide.md#General-Programming-Guidelines)
    * [Good patterns and idioms to know about](style-guide.md#Good-patterns-and-idioms-to-know-about)
    * [JS pitfalls and gotchas](style-guide.md#JS-pitfalls-and-gotchas)
    * [JSDoc Guidelines](style-guide.md#JSDoc-Guidelines)
    * [Acceptable Abbreviations](style-guide.md#Acceptable-Abbreviations)
 * [Code Organization](code-organization.md)
    * [Directory overview](code-organization.md#Directory-overview)
    * [File and directory detail](code-organization.md#File-and-directory-detail)
 * [Resources](resources.md)
    * [Writeback Resources](resources.md#Writeback-Resources)
        * [Writeback Code Organization](writeback.md#Writeback-Code-Organization)
        * [Developing a Writeback Resource](writeback.md#Developing-a-Writeback-Resource)
        * [Adding Writeback Specific Dependencies](writeback.md#Adding-Writeback-Specific-Dependencies)
    * [Developing a Resource](resources.md#Developing-a-Resource)
        * [http-wrapper](http-wrapper.md)
        * [jds-filter](jds-filter.md)
    * [Adding Dependencies to the RDK](resources.md#Adding-Dependencies-to-the-RDK)
 * [Pick-Lists](pick-lists.md)
    * [Overview](pick-lists.md#Overview)
    * [Developer Notes](pick-lists.md#Developer-Notes)
    * [Endpoints](pick-lists.md#Endpoints)
    * [Code Generation Utility](pick-lists.md#Code-Generation-Utility)
    * [RPC Data Formats](pick-lists.md#RPC-Data-Formats)
    * [RPC Utilities](pick-lists.md#RPC-Utilities)
    * [Conventions](pick-lists.md#Conventions)
 * [Subsystems](subsystems.md)
    * [Developing a Subsystem](subsystems.md#Developing-a-Subsystem)
    * [Healthchecks](subsystems.md#Healthchecks)
 * [Middleware (Interceptors and Outerceptors)](middleware.md)
    * [Overview](middleware.md#Overview)
    * [Interceptors](middleware.md#Interceptors)
    * [Outerceptors](middleware.md#Outerceptors)
 * [Logging](logging.md)
    * [Contexts](logging.md#Contexts)
    * [Levels](logging.md#Levels)
    * [Writing Useful Log Messages](logging.md#Writing-Useful-Log-Messages)
    * [RDK Logging Enhancements](logging.md#RDK-Logging-Enhancements)
 * [Documenting Resources](documenting.md)
    * [API Blueprint](documenting.md#API-Blueprint)
    * [Documentation Files](documenting.md#Documentation-Files)
    * [Writing Documentation](documenting.md#Writing-Documentation)
    * [Undocumented Resources](documenting.md#Undocumented-Resources)
 * [Testing](testing.md)
    * [Unit Tests and Integration Tests](testing.md#Unit-Tests-and-Integration-Tests)
    * [Acceptance Tests](testing.md#Acceptance-Tests)
