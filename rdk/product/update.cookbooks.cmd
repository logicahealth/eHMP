@echo off
call ..\infrastructure\set.env.cmd

cd ../.chef
call berks update -c berkshelf-config.json
cd ../product
IF %ERRORLEVEL% NEQ 0 exit /B %ERRORLEVEL%