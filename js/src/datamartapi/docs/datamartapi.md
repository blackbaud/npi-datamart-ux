<a name="npi-datamart.module_api"></a>

# DataMart APIAPI module for NPI DataMart UX


* [api](#npi-datamart.module_api)
    * [~BBDataMartAPI(options)](#npi-datamart.module_api..BBDataMartAPI) ⇒ <code>BBDataMartAPI</code>
    * [~getDataMartId()](#npi-datamart.module_api..getDataMartId) ⇒ <code>CallExpression</code>
    * [~getApiRoot()](#npi-datamart.module_api..getApiRoot) ⇒ <code>CallExpression</code>
    * [~platformIsAvailable()](#npi-datamart.module_api..platformIsAvailable) ⇒ <code>CallExpression</code>
    * [~getObjectUriFromIdentifier(identifier)](#npi-datamart.module_api..getObjectUriFromIdentifier) ⇒ <code>CallExpression</code>
    * [~executeReport(reportIdentifier, filters)](#npi-datamart.module_api..executeReport) ⇒ <code>CallExpression</code>
    * [~getHeadlineReportData(reportIdentifier, filters)](#npi-datamart.module_api..getHeadlineReportData) ⇒ <code>CallExpression</code>
    * [~getHeadlineReportDrillContext(reportIdentifier, filters)](#npi-datamart.module_api..getHeadlineReportDrillContext) ⇒ <code>CallExpression</code>
    * [~loadDrillInRecordIds(drillContext)](#npi-datamart.module_api..loadDrillInRecordIds) ⇒ <code>CallExpression</code>
    * [~getLatestReportDefinition(reportIdentifier)](#npi-datamart.module_api..getLatestReportDefinition) ⇒ <code>CallExpression</code>
    * [~getObjectDefinitionByUri(objectUri)](#npi-datamart.module_api..getObjectDefinitionByUri) ⇒ <code>CallExpression</code>
    * [~maintainAuthentication(scope)](#npi-datamart.module_api..maintainAuthentication) ⇒ <code>CallExpression</code>

<a name="npi-datamart.module_api..BBDataMartAPI"></a>

## api~BBDataMartAPI(options) ⇒ <code>BBDataMartAPI</code>
An object for interacting with the DataMart APIs

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>BBDataMartAPI</code> - A class containing methods to handle interactions with the DataMart APIs  
**Params**

- options <code>Object</code> - Object containing the information for the authentication and datamart
    - .authentication <code>BBDataMartAuthentication</code> - A BBDataMartAuthentication object
    - [.dataMartId] <code>string</code> - ID of the datamart
    - [.getDataMartId] <code>function</code> - A promise to return the DataMart ID as a string. Required if dataMartId not provided.
    - [.translateObjectIdentifier] <code>function</code> - A funtion returning a promise that returns a data mart identifier based on a provided identifier.  This is a hook to allow custom identifier translation.
    - [.translateFilters] <code>function</code> - A funtion returning a promise that returns a filters object based on a provided filters object.  This is a hook to allow custom filters translation.
    - [.translateAttributeName] <code>function</code> - A function that returns a translated attribute name based on a provided attribute name.

<a name="npi-datamart.module_api..getDataMartId"></a>

## api~getDataMartId() ⇒ <code>CallExpression</code>
Gets the datamart ID

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the datamart ID as a string  
<a name="npi-datamart.module_api..getApiRoot"></a>

## api~getApiRoot() ⇒ <code>CallExpression</code>
Get the root of the API

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the root URL of the API as a string  
<a name="npi-datamart.module_api..platformIsAvailable"></a>

## api~platformIsAvailable() ⇒ <code>CallExpression</code>
Check if the platform is available.

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise for if the platform is available as a boolean  
<a name="npi-datamart.module_api..getObjectUriFromIdentifier"></a>

## api~getObjectUriFromIdentifier(identifier) ⇒ <code>CallExpression</code>
Gets the object URI from an identifier

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the relative URI for the datamart report or dashboard  
**Params**

- identifier <code>string</code> - Identifier for a datamart report or dashboard

<a name="npi-datamart.module_api..executeReport"></a>

## api~executeReport(reportIdentifier, filters) ⇒ <code>CallExpression</code>
Execites a report based on an identifier and filters

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the result of the report as an Object  
**Params**

- reportIdentifier <code>string</code> - Identifier for the report
- filters <code>Array.&lt;Object&gt;</code> - Filters for the report
    - [.attribute] <code>string</code> - The name of the attribute to be filtered
    - [.attributeDisplayForm] <code>string</code> - The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - .value <code>string</code> - The filter value

<a name="npi-datamart.module_api..getHeadlineReportData"></a>

## api~getHeadlineReportData(reportIdentifier, filters) ⇒ <code>CallExpression</code>
Executes a report that returns a single data value

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the result of the report as a single string  
**Params**

- reportIdentifier <code>string</code> - Identifier for the report
- filters <code>Array.&lt;Object&gt;</code> - Filters for the report
    - [.attribute] <code>string</code> - The name of the attribute to be filtered
    - [.attributeDisplayForm] <code>string</code> - The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - .value <code>string</code> - The filter value

<a name="npi-datamart.module_api..getHeadlineReportDrillContext"></a>

## api~getHeadlineReportDrillContext(reportIdentifier, filters) ⇒ <code>CallExpression</code>
Gets an object that can be used to drill into the context of a headline report

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise that will return an object to be used to drill into the context of a headline report  
**Params**

- reportIdentifier <code>string</code> - Identifier for the report
- filters <code>Array.&lt;Object&gt;</code> - Filters for the report
    - [.attribute] <code>string</code> - The name of the attribute to be filtered
    - [.attributeDisplayForm] <code>string</code> - The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - .value <code>string</code> - The filter value

<a name="npi-datamart.module_api..loadDrillInRecordIds"></a>

## api~loadDrillInRecordIds(drillContext) ⇒ <code>CallExpression</code>
Load the drilled in records from a context

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the drilled in records object  
**Params**

- drillContext <code>Object</code> - Context from the getHeadlineReportDrillContext or from a datamart directive

<a name="npi-datamart.module_api..getLatestReportDefinition"></a>

## api~getLatestReportDefinition(reportIdentifier) ⇒ <code>CallExpression</code>
Gets the latest report definition

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the most recent definition of the report as an object  
**Params**

- reportIdentifier <code>string</code> - Identifier for the report

<a name="npi-datamart.module_api..getObjectDefinitionByUri"></a>

## api~getObjectDefinitionByUri(objectUri) ⇒ <code>CallExpression</code>
Get an object definition by a URI

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to return the object based on a URI  
**Params**

- objectUri <code>string</code> - URI of the object

<a name="npi-datamart.module_api..maintainAuthentication"></a>

## api~maintainAuthentication(scope) ⇒ <code>CallExpression</code>
Maintains the authentication

**Kind**: inner method of <code>[api](#npi-datamart.module_api)</code>  
**Returns**: <code>CallExpression</code> - A promise to let you know when the authentication is maintained  
**Params**

- scope <code>Object</code>

