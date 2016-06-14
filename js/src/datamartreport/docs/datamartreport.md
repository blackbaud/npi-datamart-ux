<a name="npi-datamart.module_report"></a>

# DataMart Report
Module for embedding dashboards and reports on a page.


* [npi-datamart.report](#npi-datamart.module_report)
    * [bbDataMartReportConfiguration](#npi-datamart.module_report..bbDataMartReportConfiguration)
    * [bbDataMartReport](#npi-datamart.module_report..bbDataMartReport)
    * [bbDataMartDashboard](#npi-datamart.module_report..bbDataMartDashboard)
    * [bbDataMartResponsiveDashboard](#npi-datamart.module_report..bbDataMartResponsiveDashboard)


<a name="npi-datamart.module_report..bbDataMartReportConfiguration"></a>
## bbDataMartReportConfiguration
Constant used to configure application-wide behavior for the directives in the  `npi-datamart.report` module. Some options must be specified in order to use the directives, while others are optional.

* `api` - Must be set to an instance of `BBDataMartAPI` that directives should use to work with the Data Mart API in order to authenticate and display reports and dashboards. 
* `linkHandler` - *(Optional.)* A function that will handle links clicked in a report or dashboard. When a link is clicked, the function will be called and provided the link's targe URL.
* `drillHandler` - *(Optional.)* A function that will handle drill operations in a report or dashboard. When a drill event is triggered, the function will be called and provided the drill context from the event.
* `processFilters` - *(Optional.)* Hook for pre-processing filters provided to a report or dashboard directive. This can be used to have more product-friendly naming of filters within the product code that supplies filters to the directives.  This hook allows these filters to be translated into the names expected by the data mart project before being used. 


<a name="npi-datamart.module_report..bbDataMartReport"></a>
## bbDataMartReport
Directive for displaying a single data mart report on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified report as an embedded iFrame on the page.

* `bb-data-mart-report` - Displays a report as an embedded iFrame.
    * `bb-data-mart-report-id` - The report ID of the report to be displayed.
    * `bb-data-mart-report-filters` - *(Optional.)* An object describing filters to be applied to the report using the querystring URL filters feature of reports. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used. 
    * `bb-data-mart-report-drill-handler` - *(Optional.)* Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.  
    * `height` - *(Optional.)* Sets the height attribute of the iFrame.
    * `width` - *(Optional.)* Sets the width attribute of the iFrame. 

  
<a name="npi-datamart.module_report..bbDataMartDashboard"></a>
## bbDataMartDashboard
Directive for displaying a report dashboard on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified dashboard as an embedded iFrame on the page. The height of the iFrame will be set automatically based on the height of the dashboard.

The embedded dashboard will have Sky NPI CSS styles injected to use a Sky look and feel.

The directive also supports embedding help links directly in the dashboards. Clicking these links will cause the Help flyout to open to a specified topic. To embed a help link, use the "Add Web Content" feature in the dashboard designer.  For the url, use `https://www.blackbaud.com/files/support/helpfiles/npi/npi_help.html?helpkey=<<INSERT HELP KEY>>.html`.  

* `bb-data-mart-dashboard` - Displays a dashboard as an embedded iFrame.
    * `bb-data-mart-dashboard-id` - The report ID of the dashboard to be displayed.
    * `bb-data-mart-dashboard-filters` - *(Optional.)* An object describing filters to be applied to the dashboard using the querystring URL filters feature of dahboards. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used. 
    * `bb-data-mart-dashboard-drill-handler` - *(Optional.)* Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
    * `bb-data-mart-dashboard-no-chrome` - *(Optional.)* If true, does not include the dashboard chrome for saving filters and exporting as PDF.
    * `width` - *(Optional.)* Sets the width attribute of the iFrame. 

<a name="npi-datamart.module_report..bbDataMartResponsiveDashboard"></a>
## bbDataMartResponsiveDashboard
Directive for creating the effect of reponsive design for dashboards. Data Mart dashboards currently have a fixed width design. This directive provides responsive design by allowing different dashboards to be used at different breakpoints.  A collection of dashboards can be designed to show the same or similar reports in different layouts for the different breakpoints, and this directive will display the correct dashboard based on the size of the device.  If the device width changes (for example, due to changing orientation) the dashboard can change as well.

Note that when using a responsive dashboard, the `bb-data-mart-dashboard-no-chrome` option is used to hide the chrome when not viewing on a large (desktop) device.

* `bb-data-mart-responsive-dashboard` - Displays a dashboard as an embedded iFrame, choosing the correct dashboard based on the width of the device.
    * `bb-data-mart-responsive-dashboard-xs` - The dashboard id of the dashboard to display on extra small devices (phone).
    * `bb-data-mart-responsive-dashboard-sm` - The dashboard id of the dashboard to display on small devices (portait tablets).
    * `bb-data-mart-responsive-dashboard-lg` - The dashboard id of the dashboard to display on medium (landscape tablets) and large devices (desktop).  There is no distinction between medium and large devices because the maximum size of a dashboard already fits on the medium device width.
    * `bb-data-mart-responsive-dashboard-drill-handler` - *(Optional.)* Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
