# api
Data Mart APIAPI module for NPI Data Mart UX

* api
    * `BBDataMartAPI`
    * `getDataMartId`
    * `getApiRoot`
    * `platformIsAvailable`
    * `getObjectUriFromIdentifier`
    * `executeReport`
    * `getHeadlineReportData`
    * `getHeadlineReportDrillContext`
    * `loadDrillInRecordIds`
    * `getLatestReportDefinition`
    * `getObjectDefinitionByUri`
    * `maintainAuthentication`
    
---
## `BBDataMartAPI`
An Angular Factory for generating BBDataMartAPI objects

**Kind**: inner property of `api`**Returns**:
    
        BBDataMartAPI - A class containing methods to handle interactions with the Data Mart APIs


**Params**:

* options - Object containing the information for the authentication and datamart
    * authentication - A BBDataMartAuthentication object
    * dataMartId - (_Optional_) ID of the datamart
    * getDataMartId - (_Optional_) A promise to return the Data Mart ID as a string. Required if dataMartId not provided.
    * translateObjectIdentifier - (_Optional_) A funtion returning a promise that returns a data mart identifier based on a provided identifier.  This is a hook to allow custom identifier translation.
    * translateFilters - (_Optional_) A funtion returning a promise that returns a filters object based on a provided filters object.  This is a hook to allow custom filters translation.
    * translateAttributeName - (_Optional_) A function that returns a translated attribute name based on a provided attribute name.
    
    


---
## `getDataMartId`
Gets the Data Mart ID

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the Data Mart ID as a string


---
## `getApiRoot`
Get the root of the API

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the root URL of the API as a string


---
## `platformIsAvailable`
Check if the platform is available.

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise for if the platform is available as a boolean


---
## `getObjectUriFromIdentifier`
Gets the object URI from an identifier

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the relative URI for the Data Mart report or dashboard


**Params**:

* identifier - Identifier for a Data Mart report or dashboard
    
    


---
## `executeReport`
Execites a report based on an identifier and filters

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the result of the report as an Object


**Params**:

* reportIdentifier - Identifier for the report
    
    

* filters - Filters for the report
    * attribute - (_Optional_) The name of the attribute to be filtered
    * attributeDisplayForm - (_Optional_) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    * value - The filter value
    
    


---
## `getHeadlineReportData`
Executes a report that returns a single data value

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the result of the report as a single string


**Params**:

* reportIdentifier - Identifier for the report
    
    

* filters - Filters for the report
    * attribute - (_Optional_) The name of the attribute to be filtered
    * attributeDisplayForm - (_Optional_) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    * value - The filter value
    
    


---
## `getHeadlineReportDrillContext`
Gets an object that can be used to drill into the context of a headline report

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise that will return an object to be used to drill into the context of a headline report


**Params**:

* reportIdentifier - Identifier for the report
    
    

* filters - Filters for the report
    * attribute - (_Optional_) The name of the attribute to be filtered
    * attributeDisplayForm - (_Optional_) The display form of the attribute that will be filtered. This is required if you do not provide attribute
    * value - The filter value
    
    


---
## `loadDrillInRecordIds`
Load the drilled in records from a context

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the drilled in records object


**Params**:

* drillContext - Context from the getHeadlineReportDrillContext or from a Data Mart directive
    
    


---
## `getLatestReportDefinition`
Gets the latest report definition

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the most recent definition of the report as an object


**Params**:

* reportIdentifier - Identifier for the report
    
    


---
## `getObjectDefinitionByUri`
Get an object definition by a URI

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to return the object based on a URI


**Params**:

* objectUri - URI of the object
    
    


---
## `maintainAuthentication`
Maintains the authentication

**Kind**: inner property of `api`**Returns**:
    
        CallExpression - A promise to let you know when the authentication is maintained


**Params**:

* scope
    
    


