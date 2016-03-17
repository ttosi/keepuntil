define([
	'jquery',
	'lodash',
	'sugar'],
	function ($, _) {
		'use strict';

		var _subscription = function (data) {
			data = JSON.parse(data);

			if (data.key === 'rtc' || data.key === 'oat') {
				data.value = Date.create(parseFloat(data.value + '999')); //figure out why 999...
			}

			switch (data.key) {
				case 'rtc':
					app.keepuntil.rtc(data.value.format());
					break;
				case 'oat':
					app.keepuntil.oat(data.value.format());
					break;
				case 'lockposition':
					app.keepuntil.lockPosition(data.value);
					break;
				default:
					console.error('invalid data recieved: ' + data);
					break;
			}
		};

		return {
			connect: function () {
				var deferred = $.Deferred();

				bluetoothSerial.list(function (devices) {
					console.info(devices);

					var keepuntil = _.find(devices, { name: 'keepuntil' });

					if (keepuntil) {
						bluetoothSerial.connect(
							keepuntil.address,
							function () {
								bluetoothSerial.subscribe('\n', _subscription);
								deferred.resolve(true);
							},
							function (err) {
								console.log(err);
								deferred.reject(err);
							}
						);
					} else {
						deferred.reject('A KeepUntil box was not found');
					}
				});

				return deferred.promise();
			},

			getRtc: function () {
				bluetoothSerial.write('getrtc');
			},

			setRtc: function() {

			},

			getOat: function() {
				bluetoothSerial.write('getoat');
			},

			setOat: function() {

			},

			getLockPosition: {

			}
		};
	});