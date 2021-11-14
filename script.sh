#!/bin/bash

cd /
echo "env ---"
env
echo "env__"

echo  "IEXEC_INPUT_FILE_NAME_1:  " $IEXEC_INPUT_FILE_NAME_1

echo "ls /iexec_in"

export PATH="$PATH:/usr/local/blender"

#cmd="blender -b $IEXEC_IN/$IEXEC_INPUT_FILE_NAME_1  -o /iexec_out/out -f 1"
cmd="blender -b /iexec_in/$IEXEC_INPUT_FILE_NAME_1  -o /iexec_out/out -s 1 -e 1"
$cmd

echo "ls /iexec_out"
