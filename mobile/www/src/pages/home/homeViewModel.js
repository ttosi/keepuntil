define([
	'knockout',
	'lodash',
	'services/bluetooth',
	'services/utils'],
	function (ko, _, bluetooth, utils) {
		'use strict';

		var viewModel = function (ko, utils) {
			var self = this;

			self.isConnected = ko.observable(false);

			self.rtcTime = ko.observable();

			self.oatTime = ko.observable();

			self.lockPosition = ko.observable();

			self.click = function () {
				console.log('clicked');
			};

			self.deviceStatus = ko.observable('NOTCONNECTED'); // NOTCONNECTED, CONNECTED, BLUETOOTHOFF, NOTFOUND

			self.connect = function () {
				utils.waitDialog.show('Connecting to your KeepUntil Box...');

				bluetooth.connect()
					.done(function () {
						bluetoothSerial.subscribe('\n', self.subscription);
						bluetooth.getRtcTime();

						self.isConnected(true);
					})
					.fail(function (error) {
						alert(error);
					})
					.always(function () {
						utils.waitDialog.dismiss();
					});
			};

			self.subscription = function (data) {
				data = JSON.parse(data);

				switch (data.key) {
					case 'rtctime':
						self.rtcTime(data.value);
						break;
					case 'oattime':
						self.oatTime(data.value);
						break;
					case 'lockposition':
						self.lockPosition(data.value);
						break;
					default:
						console.log('Invalid data recieved: ' + data);
						break;
				}
			};
		
			//function onDatePicked(date) {
			//	pickedDate = date;

			//	datePicker.show({
			//		date: new Date(),
			//		mode: 'time',
			//		is24HourView: false,
			//		androidTheme: 'THEME_HOLO_LIGHT'
			//	}, onTimePicked, onError);
			//}

			//datePicker.show({
			//	date: new Date(),
			//	mode: 'date',
			//	androidTheme: 'THEME_HOLO_DARK'
			//}, onDatePicked, onError);

			self.connect();
		};

		return {
			load: function () {
				return new viewModel(ko, utils);
			}
		};
	});