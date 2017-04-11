@echo off
call ..\infrastructure\set.env.cmd

cd ..
echo Starting Chef to update your workspace...
call chef-solo -c %CD%\.chef\solo.rb
cd product
IF %ERRORLEVEL% NEQ 0 exit /B %ERRORLEVEL%