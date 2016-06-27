<a id="npi-datamart.module:authentication"></a>

# Data Mart Authentication
Module for handling Single Sign-On

* [npi-datamart.module:authentication](#npi-datamart.module:authentication)
    * [BBDataMartAuthentication](#npi-datamart.module:authentication~BBDataMartAuthentication)
    * [getDomain](#npi-datamart.module:authentication~getDomain)
    * [ensureAuthenticated](#npi-datamart.module:authentication~ensureAuthenticated)
    * [maintainAuthentication](#npi-datamart.module:authentication~maintainAuthentication)
    

---
<a id="npi-datamart.module:authentication~BBDataMartAuthentication"></a>
## BBDataMartAuthentication
An Angular Factory to create BBDataMartAuthentication objects

**Params**:
- `options` - Object containing the information for domain and single sign on
    - `domain` - ( _Optional_ ) The domain.
    - `getDomain` - ( _Optional_ ) A promise returning the domain. Required if options.domain is not specified.
    - `ssoProvider` - ( _Optional_ ) the SSO provider.
    - `getSSOProvider` - ( _Optional_ ) A promise returning the SSO provider. Required if options.ssoProvider is not specified.
    - `getSSOToken` - A promise returning the SSO token.

**Returns**:
    `BBDataMartAuthentication` - The class containing methods to handle authentication on the Data Mart API

---
<a id="npi-datamart.module:authentication~getDomain"></a>
## getDomain
Gets the domain of the environment

**Returns**:
    `CallExpression` - A promise to get the domain of the environment

---
<a id="npi-datamart.module:authentication~ensureAuthenticated"></a>
## ensureAuthenticated
Ensures that the client maintains an authenticated token

**Returns**:
    `ensureAuthenticatedPromise` - A promise to ensure authentication

---
<a id="npi-datamart.module:authentication~maintainAuthentication"></a>
## maintainAuthentication
Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed

**Params**:
- `$scope`

**Returns**:
    `CallExpression` - A promise to maintain authentication