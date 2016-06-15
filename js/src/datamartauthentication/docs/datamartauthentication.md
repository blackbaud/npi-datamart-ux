<a name="npi-datamart.module_authentication"></a>

# Data Mart Authentication
Module for handling Single Sign-On 


* [authentication](#npi-datamart.module_authentication)
    * [BBDataMartAuthentication(options)](#npi-datamart.module_authentication..BBDataMartAuthentication) ⇒ `BBDataMartAuthentication`
    * [getDomain()](#npi-datamart.module_authentication..getDomain) ⇒ `CallExpression`
    * [ensureAuthenticated()](#npi-datamart.module_authentication..ensureAuthenticated) ⇒ `ensureAuthenticatedPromise`
    * [maintainAuthentication($scope)](#npi-datamart.module_authentication..maintainAuthentication) ⇒ `CallExpression`

<a name="npi-datamart.module_authentication..BBDataMartAuthentication"></a>

## BBDataMartAuthentication(options) ⇒ `BBDataMartAuthentication`
An Angular Factory to create BBDataMartAuthentication objects

**Kind**: inner method of `[authentication](#npi-datamart.module_authentication)`  
**Returns**: `BBDataMartAuthentication` - The class containing methods to handle authentication on the Data Mart API  
**Params**

- `options` - Object containing the information for domain and single sign on
    - `domain` - String containing the domain name
    - `getDomain` - Promise function returning the domain
    - `ssoProvider` - String containing the SSO provider
    - `getSSOProvider` - Promise function returning the SSO provider
    - `getSSOToken` - Promise function returning the SSO token

<a name="npi-datamart.module_authentication..getDomain"></a>

## getDomain() ⇒ `CallExpression`
Gets the domain of the environment

**Kind**: inner method of `[authentication](#npi-datamart.module_authentication)`  
**Returns**: `CallExpression` - A promise to get the domain of the environment  
<a name="npi-datamart.module_authentication..ensureAuthenticated"></a>

## ensureAuthenticated() ⇒ `ensureAuthenticatedPromise`
Ensures that the client maintains an authenticated token

**Kind**: inner method of `[authentication](#npi-datamart.module_authentication)`  
**Returns**: `ensureAuthenticatedPromise` - A promise to ensure authentication  
<a name="npi-datamart.module_authentication..maintainAuthentication"></a>

## maintainAuthentication($scope) ⇒ `CallExpression`
Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed

**Kind**: inner method of `[authentication](#npi-datamart.module_authentication)`  
**Returns**: `CallExpression` - A promise to maintain authentication  
**Params**

- `$scope` - Angular scope object

