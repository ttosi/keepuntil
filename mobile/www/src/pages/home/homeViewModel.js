define([
	'knockout',
	'lodash'],
	function (ko, _) {
		'use strict';

		var viewModel = function (ko) {
			var self = this;

			self.devices = ko.observableArray();

			self.isConnected = ko.observable(false);

			self.command = ko.observable();

			self.rtcTime = ko.observable();

			self.listDevices = function () {
				bluetoothSerial.list(function (results) {
					self.devices(results);
				});
			};

			self.listDevices();

			self.connect = function () {
				self.showWaitDialog('Connecting to your KeepUntil Box...');

				bluetoothSerial.connect(
						this.address,
						function () {
							self.isConnected(true);
							self.dismissWaitDialog();

							bluetoothSerial.subscribe('\n', function (data) {
								var packet = data.split('|');
								var command = packet[0],
									payload = packet[1];

								switch (command) {
									case 'time':
										self.rtcTime(payload);
										break;
									default:
										break;
								}
							});
						},

						function (err) {
							self.dismissWaitDialog();
							alert(err);
						}
					);
			};

			self.connectionError = function (err) {
				alert(err);
			};

			self.ledOn = function () {
				bluetoothSerial.write('on', self.done, self.fail);
			};

			self.ledOff = function () {
				bluetoothSerial.write('off', self.done, self.fail);
			};

			self.getTime = function () {
				bluetoothSerial.write('gettime', self.done, self.fail);
			};

			self.done = function (d) {
			};

			self.fail = function () {
				alert('failed');
			};

			self.showWaitDialog = function (message) {
				cordova.plugin.pDialog.init({
					theme: 'HOLO_DARK',
					progressStyle: 'SPINNER',
					cancelable: false,
					title: 'Please Wait...',
					message: message
				});
			};

			self.dismissWaitDialog = function () {
				cordova.plugin.pDialog.dismiss();
			};
		};

		return {
			load: function () {
				return new viewModel(ko);
			}
		};
	});