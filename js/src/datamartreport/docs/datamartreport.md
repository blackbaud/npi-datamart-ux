<a id="npi-datamart.module:report"></a>

# Data Mart Report
Module for embedding dashboards and reports on a page

* [npi-datamart.module:report](#npi-datamart.module:report)
    * [bbDataMartReportConfiguration](#npi-datamart.module:report~bbDataMartReportConfiguration)
    * [bbDataMartReport](#npi-datamart.module:report~bbDataMartReport)
    * [bbDataMartDashboard](#npi-datamart.module:report~bbDataMartDashboard)
    * [bbDataMartResponsiveDashboard](#npi-datamart.module:report~bbDataMartResponsiveDashboard)
    * [bbDataMartDesigner](#npi-datamart.module:report~bbDataMartDesigner)
    * [bbDataMartDesigner](#npi-datamart.module:report~bbDataMartDesigner)
    

---
<a id="npi-datamart.module:report~bbDataMartReportConfiguration"></a>
## bbDataMartReportConfiguration
Constant used to configure application-wide behavior for the directives in the  `npi-datamart.report` module. Some options must be specified in order to use the directives, while others are optional.

- `api` - Must be set to an instance of `BBDataMartAPI` that directives should use to work with the Data Mart API in order to authenticate and display reports and dashboards.
- `linkHandler` - ( _Optional_ ) A function that will handle links clicked in a report or dashboard. When a link is clicked, the function will be called and provided the link&#39;s targe URL.
- `drillHandler` - ( _Optional_ ) A function that will handle drill operations in a report or dashboard. When a drill event is triggered, the function will be called and provided the drill context from the event.
- `processFilters` - ( _Optional_ ) Hook for pre-processing filters provided to a report or dashboard directive. This can be used to have more product-friendly naming of filters within the product code that supplies filters to the directives.  This hook allows these filters to be translated into the names expected by the data mart project before being used.


---
<a id="npi-datamart.module:report~bbDataMartReport"></a>
## bbDataMartReport
Directive for displaying a single data mart report on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified report as an embedded iFrame on the page.

- `bb-data-mart-report` - Displays a report as an embedded iFrame.
    - `bb-data-mart-report-id` - The report ID of the report to be displayed.
    - `bb-data-mart-report-filters` - ( _Optional_ ) An object describing filters to be applied to the report using the querystring URL filters feature of reports. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used.
    - `bb-data-mart-report-drill-header` - ( _Optional_ ) Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
    - `height` - ( _Optional_ ) Sets the height attribute of the iFrame.
    - `width` - ( _Optional_ ) Sets the width attribute of the iFrame.


---
<a id="npi-datamart.module:report~bbDataMartDashboard"></a>
## bbDataMartDashboard
Directive for displaying a report dashboard on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the specified dashboard as an embedded iFrame on the page. The height of the iFrame will be set automatically based on the height of the dashboard.The embedded dashboard will have Sky NPI CSS styles injected to use a Sky look and feel.The directive also supports embedding help links directly in the dashboards. Clicking these links will cause the Help flyout to open to a specified topic. To embed a help link, use the &quot;Add Web Content&quot; feature in the dashboard designer.  For the url, use `https://www.blackbaud.com/files/support/helpfiles/npi/npi_help.html?helpkey=&lt;&lt;INSERT HELP KEY&gt;&gt;.html`.

- `bb-data-mart-dashboard`
    - `bb-data-mart-dashboard-id` - The report ID of the dashboard to be displayed.
    - `bb-data-mart-dashboard-filters` - ( _Optional_ ) An object describing filters to be applied to the dashboard using the querystring URL filters feature of dahboards. The keys and values of this object will be applied as filters.  The `bbDataMartReportConfiguration.processFilters` function, if defined, will be executed on the filters object before it is used.
    - `bb-data-mart-dashboard-drill-handler` - ( _Optional_ ) Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.
    - `bb-data-mart-dashboard-no-chrome` - ( _Optional_ ) If true, does not include the dashboard chrome for saving filters and exporting as PDF.
    - `width` - ( _Optional_ ) Sets the width attribute of the iFrame.


---
<a id="npi-datamart.module:report~bbDataMartResponsiveDashboard"></a>
## bbDataMartResponsiveDashboard
Directive for creating the effect of reponsive design for dashboards. Data Mart dashboards currently have a fixed width design. This directive provides responsive design by allowing different dashboards to be used at different breakpoints.  A collection of dashboards can be designed to show the same or similar reports in different layouts for the different breakpoints, and this directive will display the correct dashboard based on the size of the device.  If the device width changes (for example, due to changing orientation) the dashboard can change as well.Note that when using a responsive dashboard, the `bb-data-mart-dashboard-no-chrome` option is used to hide the chrome when not viewing on a large (desktop) device.

- `bb-data-mart-responsive-dashboard`
    - `bb-data-mart-responsive-dashboard-xs` - The dashboard id of the dashboard to display on extra small devices (phone).
    - `bb-data-mart-responsive-dashboard-sm` - The dashboard id of the dashboard to display on small devices (portait tablets).
    - `bb-data-mart-responsive-dashboard-lg` - The dashboard id of the dashboard to display on medium (landscape tablets) and large devices (desktop).  There is no distinction between medium and large devices because the maximum size of a dashboard already fits on the medium device width.
    - `bb-data-mart-responsive-dashboard-drill-handler` - ( _Optional_ ) Overrides the `bbDataMartReportConfiguration.processFilters` function for a specific directive.


---
<a id="npi-datamart.module:report~bbDataMartDesigner"></a>
## bbDataMartDesigner
The DataMart Designer directive


---
<a id="npi-datamart.module:report~bbDataMartDesigner"></a>
## bbDataMartDesigner
Directive for displaying the analytical designer on a page. When loaded, the directive will authenticate with the Data Mart API (if not already authenticated) and ensure authentication is maintained until the directive is destroyed. It will show the analytical designer
        as an embedded iFrame on the page.

- `bb-data-mart-designer`
    - `height` - ( _Optional_ ) Sets the height attribute of the iFrame.
    - `width` - ( _Optional_ ) Sets the width attribute of the iFrame.
