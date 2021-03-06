# homebridge-http-garage

[![npm](https://img.shields.io/npm/v/homebridge-http-garage-dp2.svg)](https://www.npmjs.com/package/homebridge-http-garage-dp2) [![npm](https://img.shields.io/npm/dt/homebridge-http-garage-dp2.svg)](https://www.npmjs.com/package/homebridge-http-garage-dp2)

## Description

Forked from: [Tomm Rodrigues](https://github.com/Tommrodrigues/homebridge-http-garage)

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based garage opener to Apple's [HomeKit](http://www.apple.com/ios/home/). Using simple HTTP requests, the plugin allows you to open/close the garage.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-http-garage`
3. Update your `config.json`

## Configuration

```json
"accessories": [
     {
       "accessory": "GarageDoorOpener",
       "name": "Garage",
       "openURL": "http://myurl.com/open",
       "closeURL": "http://myurl.com/close",
       "stateURL": "http://myurl.com"
     }
]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `GarageDoorOpener` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `openURL` | URL to trigger the opening of your garage | N/A |
| `closeURL` | URL to trigger the closing of your garage | N/A |
| `stateURL` | URL to get the status of the garage (must return OPEN or CLOSED as text) | N/A | 

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `openTime` _(optional)_ | Time (in seconds) to simulate your garage opening | `5` |
| `closeTime` _(optional)_ | Time (in seconds) to simulate your garage closing | `5` |
| `autoLock` _(optional)_ | Whether your garage should auto-close after being opened | `false` |
| `autoLockDelay` _(optional)_ | Time (in seconds) until your garage will automatically close (if enabled) | `10` |
| `enablePolling` _(optional)_ | Poll the garage for its status and update HomeKit | `true` |
| `pollingDelay` _(opttional)_ | How often the garage is polled for its status | `5000` |

### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `3000` |
| `http_method` _(optional)_ | HTTP method used to communicate with the device | `GET` |
| `username` _(optional)_ | Username if HTTP authentication is enabled | N/A |
| `password` _(optional)_ | Password if HTTP authentication is enabled | N/A |
| `model` _(optional)_ | Appears under the _Model_ field for the accessory | plugin |
| `serial` _(optional)_ | Appears under the _Serial_ field for the accessory | version |
| `manufacturer` _(optional)_ | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` _(optional)_ | Appears under the _Firmware_ field for the accessory | version |

