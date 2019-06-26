var Service, Characteristic;
const request = require('request');
const packageJson = require('./package.json')
var pollingtoevent = require("polling-to-event");

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-http-garage-dp2', 'GarageDoorOpener', GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
  this.log = log;

  this.name = config.name;

  this.manufacturer = config.manufacturer || packageJson.author.name;
  this.serial = config.serial || packageJson.version;
  this.model = config.model || packageJson.name;
  this.firmware = config.firmware || packageJson.version;

  this.username = config.username || null;
  this.password = config.password || null;
  this.timeout = config.timeout || 3000;
  this.http_method = config.http_method || 'GET';

  this.openURL = config.openURL;
  this.closeURL = config.closeURL;
  this.stateURL = config.stateURL;

  this.openTime = config.openTime || 5;
  this.closeTime = config.closeTime || 5;

  this.autoLock = config.autoLock || false;
  this.autoLockDelay = config.autoLockDelay || 10;

  this.pollingDelay = config.pollingDelay || 5000;

  if (this.username != null && this.password != null) {
    this.auth = {
      user: this.username,
      pass: this.password
    };
  }

  this.log(this.name);

  this.service = new Service.GarageDoorOpener(this.name);

  this.init();
}

GarageDoorOpener.prototype = {

  identify: function(callback) {
    this.log('Identify requested!');
    callback();
  },

  _httpRequest: function(url, body, method, callback) {
    request({
        url: url,
        body: body,
        method: this.http_method,
        timeout: this.timeout,
        rejectUnauthorized: false,
        auth: this.auth
      },
      function(error, response, body) {
        callback(error, response, body);
      });
  },

  getCurrentState: function(callback) {
    var state = -0;
    this._httpRequest(this.stateURL, '', this.http_method, function(error, response, responseBody) {
      if (error) {
        this.log('[!] Error getting targetDoorState: %s', error.message);
        callback(error);
      } else {
        this.log('[i] Current State %s', state);
        callback(null, state);
      }
    }.bind(this)); 
  },

  setTargetDoorState: function(value, callback) {
    this.log('[+] Setting targetDoorState to %s', value);
    if (value === 1) {
      url = this.closeURL;
    } else {
      url = this.openURL;
    }
    this._httpRequest(url, '', this.http_method, function(error, response, responseBody) {
      if (error) {
        this.log('[!] Error setting targetDoorState: %s', error.message);
        callback(error);
      } else {
        if (value === 1) {
          this.log('[*] Started closing');
          this.simulateClose();
        } else {
          this.log('[*] Started opening');
          if (this.autoLock) {
            this.autoLockFunction();
          }
          this.simulateOpen();
        }
        callback();
      }
    }.bind(this));
  },

  simulateOpen: function() {
    this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
      this.log('[*] Finished opening');
    }, this.openTime * 1000);
  },

  simulateClose: function() {
    this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
      this.log('[*] Finished closing');
    }, this.closeTime * 1000);
  },

  autoLockFunction: function() {
    this.log('[+] Waiting %s seconds for autolock', this.autoLockDelay);
    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
      this.log('[*] Autolocking');
    }, this.autoLockDelay * 1000);
  },

  getServices: function() {
    this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);

    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware);

    this.service
      .getCharacteristic(Characteristic.TargetDoorState)
      .on('set', this.setTargetDoorState.bind(this));

    this.service
      .getCharacteristic(Characteristic.CurrentDoorState)
      .on('get', this.getCurrentState.bind(this));

    return [this.informationService, this.service];
  }
};

GarageDoorOpener.prototype.init = function() {
  var self = this;
  self.log("Starting polling with an interval of %s ms", self.pollingDelay);
  var emitter = pollingtoevent(function (done) {
    self._httpRequest(self.stateURL, '', self.http_method, function(error, response, responseBody) {
      if (error) {
        self.log('[!] Error polling current state: %s', error.message);
        done(error);
      } else {
        // self.log('[i] got response in poll: %s', responseBody);
        done(null, responseBody);
      }
    });
  }, {longpolling:true, interval: self.pollingDelay});
  
  emitter.on("longpoll", function (value) {
    self.log("[i] Polling noticed status changed to: %s, notifying devices", value);
    
    switch (value) {
      case "OPEN":
        self.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(Characteristic.CurrentDoorState.OPEN);
        self.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(Characteristic.CurrentDoorState.OPEN);
        self.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(Characteristic.CurrentDoorState.OPEN);
        break;
      case "CLOSED":
        self.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(Characteristic.CurrentDoorState.CLOSED);
        self.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(Characteristic.CurrentDoorState.CLOSED);
        self.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(Characteristic.CurrentDoorState.CLOSED);
        break;
    }
  });

  emitter.on("error", function(error) {
    self.log("Polling failed, error was %s", error);
  });
}

