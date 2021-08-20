# SuperRender
Dapp to render Blender files using IExec.

Steps to execute it locally:
1. Place a test blender file named blendfile.blend in /tmp/iexec_in in local VM
2. docker build . --tag blender-test-app
3. docker run --rm     -v /tmp/iexec_in:/iexec_in     -v /tmp/iexec_out:/iexec_out     -e IEXEC_IN=/iexec_in     -e IEXEC_OUT=/iexec_out  -e IEXEC_INPUT_FILE_NAME_1=blendfile.blend -e IEXEC_INPUT_FILES_NUMBER=1   blender-test-app args1 arg2 arg3
4. Check output in /tmp/iexec_out folder
