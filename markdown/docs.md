# authentication
DataMart AuthenticationAuthentication module for NPI DataMart UX

* authentication
	* `BBDataMartAuthentication`
	* `getDomain`
	* `ensureAuthenticated`
	* `maintainAuthentication`
	
## `BBDataMartAuthentication`
An class to handle authentication with the DataMart APIs

**Kind**: inner property of `authentication`

**Returns**:
		BBDataMartAuthentication - The class containing methods to handle authentication on the DataMart API

**Params**:
* options - Object containing the information for domain and single sign on
	* domain - The domain
	* getDomain - A promise returning the domain
	* ssoProvider - the SSO provider
	* getSSOProvider - A promise returning the SSO provider
	* getSSOToken - A promise returning the SSO token
	
	
## `getDomain`
Gets the domain of the environment

**Kind**: inner property of `authentication`

**Returns**:
		CallExpression - A promise to get the domain of the environment


## `ensureAuthenticated`
Ensures that the client maintains an authenticated token

**Kind**: inner property of `authentication`

**Returns**:
		ensureAuthenticatedPromise - A promise to ensure authentication


## `maintainAuthentication`
Ensures that the API is currently authenticated and will ensure the API maintains authentication tokens until the specified scope is destroyed

**Kind**: inner property of `authentication`

**Returns**:
		CallExpression - A promise to maintain authentication

**Params**:
* $scope
	
	