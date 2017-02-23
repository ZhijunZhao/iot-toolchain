/*
* Gulp Common - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var bi = require('az-iot-bi');
var readlineSync = require('readline-sync');

var biHelper = {};

biHelper.biStart = function(instrumentionKey) {
    var isEnabled = false;

    // promote user to acknowledge on collecting user data
    /*var promptText = '\nMicrosoft would like to collect data about how users use Azure IoT samples and some problems they encounter. ' +
      'Microsoft uses this information to improve our tooling experience. Participation is voluntary and when you choose to participate ' +
      'your device automatically sends information to Microsoft about how you use Azure IoT samples. ' +
      '\n\nSelect y to enable data collection :(y/n, default is y) ';
      
    var options = {
      limit: ['y', 'n'],
      defaultInput: 'y'
    };

    var choice = readlineSync.question(promptText, options);
    if (choice === 'y') {
      console.log('\nYou choose to participate in Microsoft data collection.\n\n');
      isEnabled = true;      
    } else {
      console.log('\nYou choose not to participate in Microsoft data collection.\n\n');
      isEnabled = false;      
    }*/

    // skip promote from az-iot-bi package
    bi.start(instrumentionKey, true);
}

biHelper.trackEvent = function(instrumentionKey, eventName, properties) {
    biHelper.biStart(instrumentionKey);

    bi.trackEvent(eventName, properties);
    bi.flush();
}

module.exports = biHelper



