define([
	'jquery',
	'lodash',
	'sugar'],
	function ($, _) {
		'use strict';

		var _subscription = function (data) {
			data = JSON.parse(data);

			if (data.key === 'rtc' || data.key === 'oat') {
				data.value = Date.create(parseFloat(data.value * 1000));
			}

			switch (data.key) {
				case 'rtc':
					app.keepuntil.rtc(data.value.format());
					break;
				case 'oat':
					app.keepuntil.oat(Date.create(data.value));
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

				setInterval(function () {
					bluetoothSerial.write('getrtc');
				}, 60000);
			},

			setRtc: function () {
				var rtcDate = Date.create();

				bluetoothSerial.write('setrtc:' +
					new Date().utc(true).format('{dd}|{MM}|{yy}|{HH}|{mm}|{s}0')
				);
			},

			getOat: function () {
				bluetoothSerial.write('getoat');
			},

			setOat: function (oat) {
				console.log(Math.floor(oat.getTime() / 1000));
				bluetoothSerial.write('setoat:' + Math.floor(oat.getTime() / 1000));
			},

			getLockPosition: {

			}
		};
	});