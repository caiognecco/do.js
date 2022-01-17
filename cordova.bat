@ECHO OFF
:Loop
IF "%1"=="" IF "%2"=="" GOTO Continue
ECHO Ok, let's "%1" "%2" to android...
cd ../apps/"%2"
CALL cordova "%1" android
GOTO Finish
:Continue
ECHO U must pass action (build/emulate) and app name as parameters...
GOTO Finish
:Finish
EXIT
