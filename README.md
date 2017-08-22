# Blackbaud NPI Data Mart UX

[![view on npm](http://img.shields.io/npm/v/blackbaud-npi-datamart-ux.svg)](https://www.npmjs.org/package/blackbaud-npi-datamart-ux)
[![Coverage Status](https://coveralls.io/repos/github/blackbaud/npi-datamart-ux/badge.svg?branch=master)](https://coveralls.io/github/blackbaud/npi-datamart-ux?branch=master)
[![Build Status](https://travis-ci.org/blackbaud/npi-datamart-ux.svg?branch=master)](https://travis-ci.org/blackbaud/npi-datamart-ux)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg "MIT License")](https://github.com/blackbaud/npi-datamart-ux/blob/master/LICENSE)

NPI Data Mart UX is a Javascript library that provides integration between SKY UX applications and the GoodData ecosystem to deliver Nonprofit Intelligence


## Capabilities
* Authenticate via Single Sign On
* Embed dashboards and reports
* Provide mobile responsiveness by showing alternate reports or dashboards based on device resolution
* Embed help content directly into a dashboard
* Use One Blackbaud styling for all dashboards by default or customize using Dashboard Stylist
* Expose drill events for drilling into a list of records from a report
* Execute reports using the GoodData API through the browser to render headline metrics using Blackbaud SKY styling



## Install the library

NPI Data Mart UX can be installed via [NPM](https://www.npmjs.com/package/blackbaud-npi-datamart-ux): 

    npm install blackbaud-npi-datamart-ux

## Contributing

We welcome contributions to this library. Please be sure to follow the coding conventions already established in the esixting code, and write appropriate documentation and unit tests to go along with new features.

### Getting the code

1. Fork the master branch into your own repo
2. Create a branch named after the feature you will be contributing (.e.g. my-new-feature)
3. Clone your repo locally, then run `npm install` from your local repo's directory to install all required dependencies
4. Run `grunt build` to do your initial build. As you write your code, the individual pieces will be built (see step 1 below)

### Writing the code

1. Launch a command prompt, `cd` to the folder where you cloned your branch, then run `grunt watch`.  
2. Write your code, documentation, and unit tests.  All new code must have 100% unit test coverage and include documentation for how to use the feature or the pull request will not be accepted.  

  - Your unit tests should be located in a folder called `test` under your feature's folder in `js/src` and should consist of one or more JavaScript files named `<featurename>.spec.js`.  As you write unit tests or change code, the `grunt watch` task will run your unit tests and generate code coverage.  Code coverage reports can be located under `coverage/<browser version>/index.html` and can be launched straight from disk.
  - You should include documentation for each module you create within your source code. These files should reside in a folder called `docs` under your feature's folder. When your feature is built, we use JSDoc-style comments in our JavaScript files to generate Markdown documentation.


### Submitting the code

1. Commit and push your changes to your repo
2. Submit a pull request

## Filing Issues

To file a bug, just go to the [issues](https://github.com/blackbaud/npi-datamart-ux/issues) page and create a new issue. We are operating under the expectation that we will close bugs within two weeks of filing. On the newly created issue, there will be an option for you to subscribe to notifications which will send you emails about commits, comments, and releases related to the bug so you can know exactly where the bug is within its lifecycle.