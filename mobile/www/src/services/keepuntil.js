define([
	'jquery',
	'lodash',
	'sugar'],
	function ($, _) {
		'use strict';

		var _subscription = function (data) {
			data = JSON.parse(data);

			switch (data.key) {
				case 'rtc':
					app.keepuntil.rtc(Date.create(parseFloat(data.value * 1000)));
					break;
				case 'oat':
					app.keepuntil.oat(Date.create(parseFloat(data.value * 1000)));
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
				return $.get('http://www.timeapi.org/utc/now', function (date) {
					var utcNow = Date.create(date).addSeconds(2);
					console.log(utcNow.utc(true).format('{dd}|{MM}|{yy}|{HH}|{mm}|{ss}0'));

					bluetoothSerial.write('setrtc:' +
						utcNow.utc(true).format('{dd}|{MM}|{yy}|{HH}|{mm}|{ss}0')
					)
				});
			},

			getOat: function () {
				bluetoothSerial.write('getoat');
			},

			setOat: function (oat) {
				var self = this;

				bluetoothSerial.write('setoat:' + Math.floor(oat.getTime() / 1000));
				setTimeout(function () {
					self.getOat();
				}, 1500);
			},

			getLockPosition: function () {
			}
		};
	});