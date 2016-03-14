define([
	'jquery',
	'lodash'],
	function ($, _) {
		var _subscription = function (data) {
			console.log(data);
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

			getRtcTime: {

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