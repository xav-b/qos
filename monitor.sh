#! /usr/bin/env bash

# unofficial strict mode
set -eo pipefail
IFS=$'\n\t'

while true
  do
    echo "[ commander ] benchmarking network..."
    DEBUG='*' ./cli.js --verbose
    echo "[ commander ] going back to sleep 5mn..."
    sleep 300
  done
