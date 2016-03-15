define([
	'jquery',
	'lodash'],
	function ($, _) {
		var _subscription = function (data) {
			var command = data.split('|')[0],
				payload = data.split('|')[1].trim();

			switch (command) {
				case 'rtctime':
					app.rtctime(payload);
					break;
				case 'oattime':
					app.box.oattime(payload);
					break;
				case 'lockposition':
					app.box.lockposition(payload);
					break;
				default:
					console.log('Invalid command recieved: ' + command);
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

			getRtcTime: function() {
				bluetoothSerial.write('getrtctime');
			},

			setRtcTime: {

			},

			getOatTime: {

			},

			setOatTime: {

			},

			getLockPosition: {

			}
		};
	});