@ECHO OFF
:Loop
IF "%1"=="" GOTO Continue
ECHO Ok, let's build and sign "%1" to android...
CD ../apps/"%1"
CALL cordova build --release android
CD platforms\android\app\build\outputs\bundle\release
IF not exist eco"%1".aab (
CALL keytool -genkey -v -keystore eco"%1".keystore -alias eco"%1" -keyalg RSA -keysize 2048 -validity 10000
) else (
   CALL DEL eco"%1".aab
)
CALL jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore eco"%1".keystore app-release.aab eco"%1"
CALL zipalign -v 4 app-release.aab eco"%1".aab
GOTO Finish
:Continue
ECHO U must pass app name as parameter...
GOTO Finish
:Finish
PAUSE
