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

##Contributing

We welcome contributions to this library. Please be sure to follow the coding conventions already established in the esixting code, and write appropriate documentation and unit tests to go along with new features.

### Getting the code

1. Fork the master branch into your own repo
2. Create a branch named after the feature you will be contributing (.e.g. my-new-feature)
3. Clone your repo locally, then run `npm install` from your local repo's directory to install all required dependencies
4. Run `grunt build` to do your initial build. As you write your code, the individual pieces will be built