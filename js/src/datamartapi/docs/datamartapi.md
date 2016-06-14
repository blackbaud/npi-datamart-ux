<a name="npi-datamart.module_api"></a>

# DataMart API
API module for NPI DataMart UX


* [api](#npi-datamart.module_api)
    * [BBDataMartAPI(options)](#npi-datamart.module_api..BBDataMartAPI) ⇒ `BBDataMartAPI`
    * [getDataMartId()](#npi-datamart.module_api..getDataMartId) ⇒ `CallExpression`
    * [getApiRoot()](#npi-datamart.module_api..getApiRoot) ⇒ `CallExpression`
    * [platformIsAvailable()](#npi-datamart.module_api..platformIsAvailable) ⇒ `CallExpression`
    * [getObjectUriFromIdentifier(identifier)](#npi-datamart.module_api..getObjectUriFromIdentifier) ⇒ `CallExpression`
    * [executeReport(reportIdentifier, filters)](#npi-datamart.module_api..executeReport) ⇒ `CallExpression`
    * [getHeadlineReportData(reportIdentifier, filters)](#npi-datamart.module_api..getHeadlineReportData) ⇒ `CallExpression`
    * [getHeadlineReportDrillContext(reportIdentifier, filters)](#npi-datamart.module_api..getHeadlineReportDrillContext) ⇒ `CallExpression`
    * [loadDrillInRecordIds(drillContext)](#npi-datamart.module_api..loadDrillInRecordIds) ⇒ `CallExpression`
    * [getLatestReportDefinition(reportIdentifier)](#npi-datamart.module_api..getLatestReportDefinition) ⇒ `CallExpression`
    * [getObjectDefinitionByUri(objectUri)](#npi-datamart.module_api..getObjectDefinitionByUri) ⇒ `CallExpression`
    * [maintainAuthentication(scope)](#npi-datamart.module_api..maintainAuthentication) ⇒ `CallExpression`

<a name="npi-datamart.module_api..BBDataMartAPI"></a>

## BBDataMartAPI(options) ⇒ `BBDataMartAPI`
An object for interacting with the DataMart APIs

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `BBDataMartAPI` - A class containing methods to handle interactions with the DataMart APIs  
**Params**

- `options` - Object containing the information for the authentication and datamart
    - `authentication` - A BBDataMartAuthentication object
    - `dataMartId` - _(Optional.)_ String containing the ID of the datamart
    - `getDataMartId` - _(Optional.)_ A promissory function to return the DataMart ID as a string. Required if dataMartId not provided.
    - `translateObjectIdentifier` - _(Optional.)_ A funtion returning a promise that returns a data mart identifier based on a provided identifier.  This is a hook to allow custom identifier translation.
    - `translateFilters` - _(Optional.)_ A funtion returning a promise that returns a filters object based on a provided filters object.  This is a hook to allow custom filters translation.
    - `translateAttributeName` - _(Optional.)_ A function that returns a translated attribute name based on a provided attribute name.

<a name="npi-datamart.module_api..getDataMartId"></a>

## getDataMartId() ⇒ `CallExpression`
Gets the datamart ID

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the datamart ID as a string  
<a name="npi-datamart.module_api..getApiRoot"></a>

## getApiRoot() ⇒ `CallExpression`
Get the root of the API

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the root URL of the API as a string  
<a name="npi-datamart.module_api..platformIsAvailable"></a>

## platformIsAvailable() ⇒ `CallExpression`
Check if the platform is available.

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise for if the platform is available as a boolean  
<a name="npi-datamart.module_api..getObjectUriFromIdentifier"></a>

## getObjectUriFromIdentifier(identifier) ⇒ `CallExpression`
Gets the object URI from an identifier

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the relative URI for the datamart report or dashboard  
**Params**

- `identifier` - String for a datamart report or dashboard

<a name="npi-datamart.module_api..executeReport"></a>

## executeReport(reportIdentifier, filters) ⇒ `CallExpression`
Execites a report based on an identifier and filters

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the result of the report as an Object  
**Params**

- `reportIdentifier `string` - Identifier for the report
- `filters `Array.&lt;Object&gt;` - Filters for the report
    - `attribute` - _(Optional.)_ String containing the name of the attribute to be filtered
    - `attributeDisplayForm` - _(Optional.)_ The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - String containing the filter value

<a name="npi-datamart.module_api..getHeadlineReportData"></a>

## getHeadlineReportData(reportIdentifier, filters) ⇒ `CallExpression`
Executes a report that returns a single data value

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the result of the report as a single string  
**Params**

- `reportIdentifier `string` - Identifier for the report
- `filters[]` - Array of filters for the report
    - `attribute` - _(Optional.)_ The name of the attribute to be filtered
    - `attributeDisplayForm` - _(Optional.)_ The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - String containing the filter value

<a name="npi-datamart.module_api..getHeadlineReportDrillContext"></a>

## getHeadlineReportDrillContext(reportIdentifier, filters) ⇒ `CallExpression`
Gets an object that can be used to drill into the context of a headline report

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise that will return an object to be used to drill into the context of a headline report  
**Params**

- `reportIdentifier` - Identifier for the report
- `filters[]` - Array of filters for the report
    - `attribute`- _(Optional.)_ The name of the attribute to be filtered
    - `attributeDisplayForm` - _(Optional.)_ The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - String containing the filter value

<a name="npi-datamart.module_api..loadDrillInRecordIds"></a>

## loadDrillInRecordIds(drillContext) ⇒ `CallExpression`
Load the drilled in records from a context

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the drilled in records object  
**Params**

- `drillContext` - Context object from the getHeadlineReportDrillContext or from a datamart directive

<a name="npi-datamart.module_api..getLatestReportDefinition"></a>

## getLatestReportDefinition(reportIdentifier) ⇒ `CallExpression`
Gets the latest report definition

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the most recent definition of the report as an object  
**Params**

- `reportIdentifier` - String for the report

<a name="npi-datamart.module_api..getObjectDefinitionByUri"></a>

## getObjectDefinitionByUri(objectUri) ⇒ `CallExpression`
Get an object definition by a URI

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to return the object based on a URI  
**Params**

- `objectUri` - String of the URI of the object

<a name="npi-datamart.module_api..maintainAuthentication"></a>

## maintainAuthentication(scope) ⇒ `CallExpression`
Maintains the authentication

**Kind**: inner method of `[api](#npi-datamart.module_api)`  
**Returns**: `CallExpression` - A promise to let you know when the authentication is maintained  
**Params**

- `scope` - Angular object

