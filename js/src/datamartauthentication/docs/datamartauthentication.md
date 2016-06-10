<a name="npi-datamart.module_authentication"></a>

# DataMart AuthenticationAuthentication module for NPI DataMart UX


* [authentication](#npi-datamart.module_authentication)
    * [~BBDataMartAuthentication(options)](#npi-datamart.module_authentication..BBDataMartAuthentication) ⇒ <code>BBDataMartAuthentication</code>
    * [~getDomain()](#npi-datamart.module_authentication..getDomain) ⇒ <code>CallExpression</code>
    * [~ensureAuthenticated()](#npi-datamart.module_authentication..ensureAuthenticated) ⇒ <code>ensureAuthenticatedPromise</code>
    * [~maintainAuthentication($scope)](#npi-datamart.module_authentication..maintainAuthentication) ⇒ <code>CallExpression</code>

<a name="npi-datamart.module_authentication..BBDataMartAuthentication"></a>

## authentication~BBDataMartAuthentication(options) ⇒ <code>BBDataMartAuthentication</code>
An class to handle authentication with the DataMart APIs

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>BBDataMartAuthentication</code> - The class containing methods to handle authentication on the DataMart API  
**Params**

- options <code>Object</code> - Object containing the information for domain and single sign on
    - .domain <code>string</code> - The domain
    - .getDomain <code>function</code> - A promise returning the domain
    - .ssoProvider <code>string</code> - the SSO provider
    - .getSSOProvider <code>function</code> - A promise returning the SSO provider
    - .getSSOToken <code>function</code> - A promise returning the SSO token

<a name="npi-datamart.module_authentication..getDomain"></a>

## authentication~getDomain() ⇒ <code>CallExpression</code>
Gets the domain of the environment

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>CallExpression</code> - A promise to get the domain of the environment  
<a name="npi-datamart.module_authentication..ensureAuthenticated"></a>

## authentication~ensureAuthenticated() ⇒ <code>ensureAuthenticatedPromise</code>
Ensures that the client maintains an authenticated token

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>ensureAuthenticatedPromise</code> - A promise to ensure authentication  
<a name="npi-datamart.module_authentication..maintainAuthentication"></a>

## authentication~maintainAuthentication($scope) ⇒ <code>CallExpression</code>
Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>CallExpression</code> - A promise to maintain authentication  
**Params**

- $scope <code>Object</code>

