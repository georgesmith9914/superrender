#!/bin/bash

cd /
echo "env ---"
env
echo "env__"

echo  "IEXEC_INPUT_FILE_NAME_1:  " $IEXEC_INPUT_FILE_NAME_1

echo "ls /iexec_in"

export PATH="$PATH:/usr/local/blender"

#cmd="blender -b $IEXEC_IN/$IEXEC_INPUT_FILE_NAME_1  -o /iexec_out/out -f 1"
cmd="blender -b /iexec_in/$IEXEC_INPUT_FILE_NAME_1  -o /iexec_out/animation_#_test.png -f 4"
$cmd
echo /iexec_in/$IEXEC_INPUT_FILE_NAME_1
echo '{ "deterministic-output-path" : "/iexec_out/animation_4_test.png" }' > /iexec_out/computed.json
# echo "not applicable" > /iexec_out/determinism.iexec

echo "ls /iexec_out"
