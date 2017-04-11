@echo off

call "C:\Program Files\Microsoft SDKs\Windows\v7.1\Bin\setenv.cmd"

TITLE ADK
COLOR 0A

set PROJECT_NAME=adk

set vagrant_version="1.8.1"
set VAGRANT_BIN=%VAGRANT_PATH%\bin

rem set GRADLE_OPTS="-Xmx1G -Xms256m  -Dorg.gradle.daemon=true -Dorg.gradle.parallel=true -Dorg.gradle.workers.max=1"
REM SET GRADLE_HOME=%GRADLE_HOME%
REM export GROOVY_HOME=%GROOVY_HOME%


set PATH=%GROOVY_HOME%\bin;%GRADLE_HOME%\bin;%PATH%


set LIBPATH=C:\Windows\Microsoft.NET\Framework64\v4.0.30319;C:\Windows\Microsoft.NET\Framework64\v3.5;C:\Program Files (x86)\Microsoft Visual Studio 10.0\VC\LIB;

set LIB=C:\Program Files (x86)\Microsoft Visual Studio 10.0\VC\LIB;C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\lib;

set JDK_VERSION="jdk1.8.0_77"

set destroyAll="destroyAll"
set startAll="startJDS startMocks startKodak startPanorama startVxSync"
set stopAll="stopJDS stopMocks stopKodak stopPanorama stopVxSync"
set deployAllDev="deployAllDev"
set deployAll="deployAll"
set MOCKS=true

set CONFIGURE_ARGS="--with-ldflags='-Wno-error=unused-command-line-argument-hard-error-in-future'"

set deployVE2All="deployVE2JDS deployMssql deployJmeadows deployKodak deployPanorama deployVE2Solr deployVE2Ehmp deployVE2VeApi"
set deployVE2AllDev="deployVE2JDS deployMssql deployJmeadows deployKodak deployPanorama deployVE2SolrDev deployVE2EhmpDev deployVE2VeApiDev"
set destroyVE2All="destroyVE2JDS destroyJmeadows destroyKodak destroyMssql destroyPanorama destroyVE2Solr destroyVE2Ehmp destroyVE2VeApi destroyOpeninfobutton"






if defined VISTACORE_PROJECT (
  echo ########################################    FAILURE    ##############################################
  echo.
  echo.
  echo                        You have already sourced this terminal to a project.
  echo                        You cannot source multiple times or from one project to another.
  echo                        The project %VISTACORE_PROJECT% has already been sourced.
  echo.
  echo #####################################################################################################
  echo.
  exit /B 1
)

echo vistacore-%PROJECT_NAME%
set USER=%USERNAME%
set HOME=%HOMEDRIVE%%HOMEPATH%
if not defined JENKINS_HOME (
  set INSTALL_FOR_USER=%USERNAME%
  set INSTALL_IN_HOME=%HOMEPATH%

  if not defined INSTALL_IN_HOME (
    "failure: unable to find home directory for user %INSTALL_FOR_USER%"
    exit /B 1
  )

  rem set WORKSPACE=%INSTALL_IN_HOME%\Projects\vistacore
  set WORKSPACE=%SYSTEMDRIVE%%HOMEPATH:\=/%/Projects/vistacore
  set PROJECT_HOME=%WORKSPACE%/%PROJECT_NAME%
) else (
  set PROJECT_HOME=%WORKSPACE%
  set WORKSPACE=%JENKINS_HOME%/Projects/vistacore
)

set CHEFDK_PATH=C:\opscode\chefdk

set PATH=%JAVA_HOME%\bin;%CHEFDK_PATH%\bin;%CHEFDK_PATH%\embedded\bin;%PATH%

set GEM_PATH=%CHEFDK_PATH%\embedded\lib\ruby\gems\2.0.0

set GEM_HOME=%WORKSPACE%\.aidk_gems
set GEM_PATH=%GEM_PATH%;%GEM_HOME%
set PATH=%GEM_HOME%\bin;%PATH%
set BERKSHELF_PATH=%WORKSPACE%\.berkshelf
set VAGRANT_HOME=%WORKSPACE%\.vagrant.d
set SLACK_GEM_HOME=%PROJECT_HOME%\infrastructure\ruby
set RAKE_SYSTEM=%PROJECT_HOME%/.rake
set BUNDLE_PATH=%GEM_HOME%



set VISTACORE_PROJECT=%project_name%

exit /b

:colorEcho
echo off
<nul set /p ".=%DEL%" > "%~2"
%SYSTEMROOT%\system32\findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1i