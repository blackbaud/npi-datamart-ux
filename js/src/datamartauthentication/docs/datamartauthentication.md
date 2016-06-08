<a name="npi-datamart.module_authentication"></a>

# authentication
Authentication module for NPI Datamart


* [authentication](#npi-datamart.module_authentication)
    * [~getDomain()](#npi-datamart.module_authentication..getDomain) ⇒ <code>string</code>
    * [~getSSOProvider()](#npi-datamart.module_authentication..getSSOProvider) ⇒ <code>string</code>
    * [~getSSOUrl(targetUrl)](#npi-datamart.module_authentication..getSSOUrl) ⇒ <code>string</code>
    * [~isUnauthorizedFailure(reason)](#npi-datamart.module_authentication..isUnauthorizedFailure) ⇒ <code>boolean</code>
    * [~getTemporaryToken()](#npi-datamart.module_authentication..getTemporaryToken) ⇒ <code>string</code>
    * [~authenticate()](#npi-datamart.module_authentication..authenticate) ⇒ <code>Array.&lt;string&gt;</code>
    * [~ensureTemporaryToken()](#npi-datamart.module_authentication..ensureTemporaryToken) ⇒ <code>string</code>
    * [~ensureAuthenticated()](#npi-datamart.module_authentication..ensureAuthenticated) ⇒ <code>Promise</code>
    * [~maintainAuthentication(scope)](#npi-datamart.module_authentication..maintainAuthentication) ⇒ <code>Promise</code>

<a name="npi-datamart.module_authentication..getDomain"></a>

## authentication~getDomain() ⇒ <code>string</code>
Gets the domain of the environment

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>string</code> - Domain  
<a name="npi-datamart.module_authentication..getSSOProvider"></a>

## authentication~getSSOProvider() ⇒ <code>string</code>
Gets the SSO Provider

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>string</code> - SSO Provider  
<a name="npi-datamart.module_authentication..getSSOUrl"></a>

## authentication~getSSOUrl(targetUrl) ⇒ <code>string</code>
Gets the SSO URL based on the Provider and the Domain

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>string</code> - SSO URL  
**Params**

- targetUrl <code>string</code> - Url of the target for SSO

<a name="npi-datamart.module_authentication..isUnauthorizedFailure"></a>

## authentication~isUnauthorizedFailure(reason) ⇒ <code>boolean</code>
Checks if a failure reason corresponds to a 401 unauthorized response

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>boolean</code> - Unauthorized Failure  
**Params**

- reason - Reason for failure

<a name="npi-datamart.module_authentication..getTemporaryToken"></a>

## authentication~getTemporaryToken() ⇒ <code>string</code>
Requests a temporary token for use with the API

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>string</code> - token  
<a name="npi-datamart.module_authentication..authenticate"></a>

## authentication~authenticate() ⇒ <code>Array.&lt;string&gt;</code>
Performs an SSO with the API, retreiving both a long lived authentication token and a temporary token

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>Array.&lt;string&gt;</code> - [Authentication Token, Temporary Token]  
<a name="npi-datamart.module_authentication..ensureTemporaryToken"></a>

## authentication~ensureTemporaryToken() ⇒ <code>string</code>
Ensures that the browser has a temporary token by requesting one, and then authenticating if the request fails with a 401

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Returns**: <code>string</code> - Temporary token  
<a name="npi-datamart.module_authentication..ensureAuthenticated"></a>

## authentication~ensureAuthenticated() ⇒ <code>Promise</code>
Ensures that the client maintains an authenticated token

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
<a name="npi-datamart.module_authentication..maintainAuthentication"></a>

## authentication~maintainAuthentication(scope) ⇒ <code>Promise</code>
Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed

**Kind**: inner method of <code>[authentication](#npi-datamart.module_authentication)</code>  
**Params**

- scope - Scope of the authentication

