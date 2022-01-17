@ECHO OFF
:Loop
IF "%1"=="" GOTO Continue
ECHO Ok, let's serve "%1" as http...
CALL npx http-server dist/apps/"%1"/pt
GOTO Finish
:Continue
ECHO U must pass app name as parameter...
GOTO Finish
:Finish
EXIT
