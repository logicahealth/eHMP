<div class="jumbotron">
    <div class="container">
        <p>The eHMP Clinical Practice Environment is a web application that will ultimately perform many of the functions of the VA's Computerized Patient Record System (CPRS). The CPE utilizes VistA Exchange as its source of patient data via the VistA Exchange API (VX-API). The web application is developed as a Single Page Application using a custom web SDK. The SDK provides the following:
        </p>
        <ul>
            <li>Application Development Kit (ADK) for UI development with Marionette/Backbone</li>
            <li>Resource Development Kit (RDK) for developing REST services using Node/Express</li>
            <li>VistA Exchange API (VX-API) for interfacing with the VistA Exchange patient record cache and VistA</li>
        </ul>
        <p>
        The SDK provides common cross cutting concerns including accessing the patient record, the ability to add incremental functionality to the web application through the development of applets, and the ability to develop new REST services against VistA Exchange.
        </p>
    </div>
</div>
<div class="container">
    <div class="tree">
        <ul>
            <li>
                <div class="component ehmp-ui">
                    <h2>eHMP UI</h2>
                    <div class="component adk">
                        <a href="adk/index.md"><h2>ADK</h2></a>
                        <p>Application Development Kit</p>
                        <p class="hidden-xs"><a href="adk/index.md" class="btn btn-default" id="adk_link" role="button">Developer Guide <i class="fa fa-chevron-right fa-sm"></i></a></p>
                    </div>
                </div>
                <ul>
                    <li>
                        <div class="component ehmp">
                            <h2>Vista Exchange</h2>
                            <div class="component rdk">
                                <a href="rdk/index.md"><h2>RDK</h2></a>
                                <p>Resource Development Kit</p>
                                <p class="hidden-xs"><a href="rdk/index.md" class="btn btn-default" id="rdk_link" role="button">Developer Guide <i class="fa fa-chevron-right"></i></a></p>
                                <div class="component wrap vxapi">
                                    <a href="./#/vx-api/fetch"><h3>Fetch</h3></a>
                                    <p class="hidden-xs"><a href="./#/vx-api/fetch" class="btn btn-default" id="vxApi_link" role="button">API Documentation <i class="fa fa-chevron-right"></i></a></p>
                                </div>
                                <div class="component wrap vxapi">
                                    <a href="./#/vx-api/write-health-data"><h3>Write Back</h3></a>
                                    <p class="hidden-xs"><a href="./#/vx-api/write-health-data" class="btn btn-default" id="vxApi_link" role="button">API Documentation <i class="fa fa-chevron-right"></i></a></p>
                                </div>
                                <div class="component wrap vxapi">
                                    <a href="./#/vx-api/write-pick-list"><h3>Pick List</h3></a>
                                    <p class="hidden-xs"><a href="./#/vx-api/write-pick-list" class="btn btn-default" id="vxApi_link" role="button">API Documentation <i class="fa fa-chevron-right"></i></a></p>
                                </div>
                            </div>
                            <ul>
                                <li>
                                    <div class="component">
                                        <a href="./#/vx-api/jds"><h2>JDS</h2></a>
                                        <p class="hidden-xs"><a href="./#/vx-api/jds" class="btn btn-default" id="vxApi_link" role="button">API Documentation <i class="fa fa-chevron-right"></i></a></p>
                                    </div>
                                </li>
                                <li>
                                    <div class="component">
                                        <h2>SOLR</h2>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</div>
