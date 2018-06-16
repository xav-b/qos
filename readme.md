# Network QOS Monitoring

> Test and monitor your internet connection speed and ping using [speedtest.net](http://www.speedtest.net) from the CLI

![Dashboard](_medias/dashboard.png "Speed dashboard")


## Install

Ensure you have Node.js version 0.10 or higher installed, as well as
docker. Then run the following:

```
$ npm install

$ # start and configure database and dashboard
$ ./_bootstrap/run.sh
```

Then import `./_bootstrap.sh/qos-dashboard.json` in [the import panel](http://localhost:3000/dashboard/import).

Finally start monitoring `./monitor.sh`.


## Usage

```
$ ./cli --help

  Test your internet connection speed and ping using speedtest.net from the CLI

  Usage
    $ speed-test

  Options
    --bytes -b    Output the result in megabytes per second (MBps)
    --verbose -v  Output more detailed information
    --db-host -h  Database host

```


## License

MIT © [Xavier Bruhiere](http://xav-b.fr)
