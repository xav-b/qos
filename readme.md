# Network QOS Monitoring

> Test and monitor your internet connection speed and ping using [speedtest.net](http://www.speedtest.net) from the CLI


## Install

Ensure you have Node.js version 0.10 or higher installed. Then run the following:

```
$ npm install --global speed-monitor
```


## Database and Dashboard setup

```
$ docker run --rm influxdb influxd config > influxdb.conf

$ docker run \
  -p 8086:8086 -p 8083:8083 \
  -e INFLUXDB_ADMIN_ENABLED=true \
  -v $PWD/influxdb.conf:/etc/influxdb/influxdb.conf:ro \
  influxdb -config /etc/influxdb/influxdb.conf

$ curl -G -X POST \
  http://localhost:8086/query\
  --data-urlencode "q=CREATE DATABASE network"
```

Start Grafana

```
$ docker run -d --name=grafana -p 3000:3000 --link silly_lumiere -p 3000:3000 grafana/grafana
$ # admin:admin
```

Run queries

```
$ docker exec -it silly_lumiere influx -database network -precision rfc3339
```


## Usage

```
$ speed-monitor --help

  Usage
    $ speed-test

  Options
    --bytes -b    Output the result in megabytes per second (MBps)
    --verbose -v  Output more detailed information
```


## License

MIT © [Xavier Bruhiere](http://xav-b.fr)
