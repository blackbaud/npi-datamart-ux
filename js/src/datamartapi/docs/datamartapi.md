<a id="npi-datamart.module:api"></a>

# Data Mart API
API module for NPI Data Mart UX

Test

* [npi-datamart.module:api](#npi-datamart.module:api)
    * [BBDataMartAPI](#npi-datamart.module:api~BBDataMartAPI)
    * [getDataMartId](#npi-datamart.module:api~getDataMartId)
    * [getApiRoot](#npi-datamart.module:api~getApiRoot)
    * [platformIsAvailable](#npi-datamart.module:api~platformIsAvailable)
    * [getObjectUriFromIdentifier](#npi-datamart.module:api~getObjectUriFromIdentifier)
    * [executeReport](#npi-datamart.module:api~executeReport)
    * [getHeadlineReportData](#npi-datamart.module:api~getHeadlineReportData)
    * [getHeadlineReportDrillContext](#npi-datamart.module:api~getHeadlineReportDrillContext)
    * [loadDrillInRecordIds](#npi-datamart.module:api~loadDrillInRecordIds)
    * [getLatestReportDefinition](#npi-datamart.module:api~getLatestReportDefinition)
    * [getObjectDefinitionByUri](#npi-datamart.module:api~getObjectDefinitionByUri)
    * [maintainAuthentication](#npi-datamart.module:api~maintainAuthentication)
    

---
<a id="npi-datamart.module:api~BBDataMartAPI"></a>
## BBDataMartAPI
An Angular Factory for generating BBDataMartAPI objects

**Params**:
- `options` - Object containing the information for the authentication and datamart
    - `authentication` - A BBDataMartAuthentication object
    - `dataMartId` - ( _Optional_ ) ID of the datamart
    - `getDataMartId` - ( _Optional_ ) A promise to return the Data Mart ID as a string. Required if dataMartId not provided.
    - `translateObjectIdentifier` - ( _Optional_ ) A funtion returning a promise that returns a data mart identifier based on a provided identifier.  This is a hook to allow custom identifier translation.
    - `translateFilters` - ( _Optional_ ) A funtion returning a promise that returns a filters object based on a provided filters object.  This is a hook to allow custom filters translation.
    - `translateAttributeName` - ( _Optional_ ) A function that returns a translated attribute name based on a provided attribute name.

**Returns**:
    `BBDataMartAPI` - A class containing methods to handle interactions with the Data Mart APIs

---
<a id="npi-datamart.module:api~getDataMartId"></a>
## getDataMartId
Gets the Data Mart ID

**Returns**:
    `CallExpression` - A promise to return the Data Mart ID as a string

---
<a id="npi-datamart.module:api~getApiRoot"></a>
## getApiRoot
Get the root of the API

**Returns**:
    `CallExpression` - A promise to return the root URL of the API as a string

---
<a id="npi-datamart.module:api~platformIsAvailable"></a>
## platformIsAvailable
Check if the platform is available.

**Returns**:
    `CallExpression` - A promise for if the platform is available as a boolean

---
<a id="npi-datamart.module:api~getObjectUriFromIdentifier"></a>
## getObjectUriFromIdentifier
Gets the object URI from an identifier

**Params**:
- `identifier` - Identifier for a Data Mart report or dashboard

**Returns**:
    `CallExpression` - A promise to return the relative URI for the Data Mart report or dashboard

---
<a id="npi-datamart.module:api~executeReport"></a>
## executeReport
Execites a report based on an identifier and filters

**Params**:
- `reportIdentifier` - Identifier for the report
- `filters` - Filters for the report
    - `attribute` - ( _Optional_ ) The name of the attribute to be filtered
    - `attributeDisplayForm` - ( _Optional_ ) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - The filter value

**Returns**:
    `CallExpression` - A promise to return the result of the report as an Object

---
<a id="npi-datamart.module:api~getHeadlineReportData"></a>
## getHeadlineReportData
Executes a report that returns a single data value

**Params**:
- `reportIdentifier` - Identifier for the report
- `filters` - Filters for the report
    - `attribute` - ( _Optional_ ) The name of the attribute to be filtered
    - `attributeDisplayForm` - ( _Optional_ ) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - The filter value

**Returns**:
    `CallExpression` - A promise to return the result of the report as a single string

---
<a id="npi-datamart.module:api~getHeadlineReportDrillContext"></a>
## getHeadlineReportDrillContext
Gets an object that can be used to drill into the context of a headline report

**Params**:
- `reportIdentifier` - Identifier for the report
- `filters` - Filters for the report
    - `attribute` - ( _Optional_ ) The name of the attribute to be filtered
    - `attributeDisplayForm` - ( _Optional_ ) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    - `value` - The filter value

**Returns**:
    `CallExpression` - A promise that will return an object to be used to drill into the context of a headline report

---
<a id="npi-datamart.module:api~loadDrillInRecordIds"></a>
## loadDrillInRecordIds
Load the drilled in records from a context

**Params**:
- `drillContext` - Context from the getHeadlineReportDrillContext or from a Data Mart directive

**Returns**:
    `CallExpression` - A promise to return the drilled in records object

---
<a id="npi-datamart.module:api~getLatestReportDefinition"></a>
## getLatestReportDefinition
Gets the latest report definition

**Params**:
- `reportIdentifier` - Identifier for the report

**Returns**:
    `CallExpression` - A promise to return the most recent definition of the report as an object

---
<a id="npi-datamart.module:api~getObjectDefinitionByUri"></a>
## getObjectDefinitionByUri
Get an object definition by a URI

**Params**:
- `objectUri` - URI of the object

**Returns**:
    `CallExpression` - A promise to return the object based on a URI

---
<a id="npi-datamart.module:api~maintainAuthentication"></a>
## maintainAuthentication
Maintains the authentication

**Params**:
- `scope`

**Returns**:
    `CallExpression` - A promise to let you know when the authentication is maintained