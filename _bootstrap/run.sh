#! /usr/bin/env bash

# unofficial strict mode
set -eo pipefail
IFS=$'\n\t'

readonly BASE_URL="http://admin:admin@localhost:3000"

echo "starting database and dashboard containers"
docker-compose up -d

echo "waiting for services to come online (15s)..."
sleep 15
docker-compose ps

echo "creating 'network' database"
curl -G -X POST \
  http://localhost:8086/query \
  --data-urlencode "q=CREATE DATABASE network"

# NOTE create `internal` as well?
echo "creating 'Network' data source"
curl \
  -iX POST \
  --header "Content-type: application/json" \
  -d @_bootstrap/create-ds.json \
  "${BASE_URL}/api/datasources"

# FIXME use the json template
#echo "creating 'QOS' dashboard"
#curl \
  #-iX POST \
  #--header "Content-type: application/json" \
  #-d @_bootstrap/create-dashboard.json \
  #"${BASE_URL}/api/dashboards/db"
