#!/usr/bin/env node

const debug = require('debug')('qos')
const url = require('url')
const meow = require('meow')
const speedtest = require('speedtest-net')
const updateNotifier = require('update-notifier')
const roundTo = require('round-to')
const Influx = require('influx')

// TODO choose output (stdout, influxdb)
const cli = meow(
  `
	Usage
	  $ speed-test

	Options
	  --bytes -b    Output the result in megabytes per second (MBps)
	  --verbose -v  Output more detailed information
	  --db-host -h  Database host
`,
  {
    flags: {
      bytes: {
        type: 'boolean',
        alias: 'b',
      },
      verbose: {
        type: 'boolean',
        alias: 'v',
      },
    },
  }
)

updateNotifier({ pkg: cli.pkg }).notify()

const stats = {
  ping: '',
  download: '',
  upload: '',
}

const unit = cli.flags.bytes ? 'MBps' : 'Mbps'
const multiplier = cli.flags.bytes ? 1 / 8 : 1

function remapServer(server) {
  /* eslint-disable prefer-destructuring */
  server.host = url.parse(server.url).host
  server.location = server.name
  server.distance = server.dist

  return server
}

// store stats in influxdb
const influx = new Influx.InfluxDB({
  // TODO 2 flags + 2 constants
  host: 'localhost',
  port: 8086,
  database: 'network',
  schema: [
    {
      measurement: 'qos',
      fields: {
        ping: Influx.FieldType.INTEGER,
        download: Influx.FieldType.FLOAT,
        upload: Influx.FieldType.FLOAT,

        distance: Influx.FieldType.FLOAT,

        ip: Influx.FieldType.STRING,
        isp_rating: Influx.FieldType.FLOAT,
        latitude: Influx.FieldType.FLOAT,
        longitude: Influx.FieldType.FLOAT,
      },
      tags: ['host', 'location'],
    },
  ],
})
influx
  .ping(5)
  .then(cluster => debug(`connected to Influx: ${cluster[0].online}`))
  .catch(err => debug(`failed to connect to Influx: ${err}`))

// TODO flag
const st = speedtest({ maxTime: 20000 })

st.once('testserver', server => {
  debug('connected to test server')
  if (cli.flags.verbose) {
    stats.data = {
      server: remapServer(server),
    }
  }

  stats.ping = Math.round(server.bestPing)
})

st.once('downloadspeed', speed => {
  debug(`download speed: ${speed}`)
  speed *= multiplier
  stats.download = roundTo(speed, 2)
})

st.once('uploadspeed', speed => {
  debug(`upload speed: ${speed}`)
  speed *= multiplier
  stats.upload = roundTo(speed, 2)
})

st.on('data', data => {
  if (cli.flags.verbose) {
    stats.data = data
  }
})

st.on('done', () => {
  debug('storing measurements')
  influx
    .writePoints([
      {
        measurement: 'qos',
        tags: {
          host: stats.data.server.host,
          location: stats.data.server.location,
        },
        fields: {
          ping: stats.ping,
          download: stats.download,
          upload: stats.upload,

          distance: stats.data.server.distance,

          ip: stats.data.client.ip,
          isp_rating: stats.data.client.isprating,
          latitude: stats.data.client.lat,
          longitude: stats.data.client.lon,
        },
      },
    ])
    .catch(err => debug(`Error saving data to InfluxDB! ${err.stack}`))
})

st.on('error', err => {
  if (err.code === 'ENOTFOUND') {
    debug(`Please check your internet connection: ${err}`)
  } else {
    debug(`something unexpected happened: ${err}`)
  }

  process.exit(1)
})
