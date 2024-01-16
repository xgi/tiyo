#!/bin/bash

if [[ -z "$1" ]]; then
  echo "cannot install: path not provided"
  exit 1
fi
echo "Installing extensions in $1"

cd "$(dirname "$0")"

if [ ! -d "$1/plugins" ]; then
  mkdir "$1/plugins"
fi
if [ ! -d "$1/plugins/@tiyo" ]; then
  mkdir "$1/plugins/@tiyo"
fi

cp -r ../../dist/libs/core $1/plugins/@tiyo
rsync -r ../../node_modules $1/plugins/@tiyo/core --exclude 'typescript' --exclude 'electron' --exclude '.bin'