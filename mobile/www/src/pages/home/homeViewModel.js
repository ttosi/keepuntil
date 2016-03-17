define([
	'knockout',
	'lodash',
	'services/keepuntil',
	'services/utils',
	'sugar'],
	function (ko, _, keepuntil, utils) {
		'use strict';

		var viewModel = function (ko, utils) {
			var self = this;

			self.isConnected = ko.observable(false);

			self.rtcTime = ko.observable();

			self.oatTime = ko.observable();

			self.lockPosition = ko.observable();

			self.setOat = function () {
				keepuntil.getOat()
				console.log('clicked');
			};

			self.bluetoothStatus = ko.observable('NOTCONNECTED'); // NOTCONNECTED, CONNECTED, BLUETOOTHOFF, NOTFOUND

			self.connect = function () {
				utils.waitDialog.show('Connecting to your KeepUntil Box...');

				keepuntil.connect()
					.done(function () {
						keepuntil.getRtc();

						setTimeout(function () {
							keepuntil.getOat()
						}, 1500);

						self.isConnected(true);
					})
					.fail(function (error) {
						alert(error);
					})
					.always(function () {
						utils.waitDialog.dismiss();
					});
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