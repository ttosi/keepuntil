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

			self.devices = ko.observableArray();

			self.deviceStatus = ko.observable('NOTCONNECTED'); // NOTCONNECTED, CONNECTED, BLUETOOTHOFF, NOTFOUND

			utils.waitDialog.show('Connecting to your KeepUntil Box...');
			bluetooth.connect()
				.done(function (device) {
					console.log(device);
				})
				.fail(function (error) {
					alert(error);
				})
				.always(function () {
					utils.waitDialog.dismiss();
				});


			//self.command = ko.observable();

			//self.rtcTime = ko.observable();

			//self.openAtDate = ko.observable();

			//self.openAtTime = ko.observable();



			self.listDevices = function () {
				//bluetoothSerial.list(function (devices) {
				//	console.info(devices);
				//	utils.waitDialog.show('Connecting to your KeepUntil Box...');

				//	if (devices.length > 0) {
				//		var keepuntil = _.find(devices, { name: 'keepuntil' });
				//		if (keepuntil) {
				//			self.connect(keepuntil.address);
				//			return;
				//		}
				//	}

				//	alert("KeepUntil box not found");
				//});
			};

			//self.connect = function (address) {
			//	bluetoothSerial.connect(
		    //			address,
		    //			function () {
		    //				self.isConnected(true);
		    //				utils.waitDialog.dismiss();

		    //				bluetoothSerial.subscribe('\n', function (data) {
		    //					var packet = data.split('|');
		    //					var command = packet[0],
		    //						payload = packet[1];

		    //					switch (command) {
		    //						case 'time':
		    //							self.rtcTime(payload);
		    //							break;
		    //						default:
		    //							break;
		    //					}
		    //				});
		    //			},

		    //			function (err) {
		    //				utils.waitDialog.dismiss();
		    //				alert(err);
		    //			}
		    //		);
			//};

			//self.listDevices();

			self.getRTC = function () {

			};

			self.setRTC = function () {

			};


			//self.openAtDateChange = ko.computed(function () {
			//	console.log(self.openAtDate());
			//});

			//self.openAtTimeCHange = ko.computed(function () {
			//	console.log(self.openAtTime());
			//});

			//self.selectDate = function () {
			//	$('#openatdate').trigger('click');
			//}

			//self.selectTime = function () {
			//	$('#openattime').trigger('click');
			//}



			//var pickedDate;
			//var pickedTime;

			//function onTimePicked(time) {
			//	console.log(pickedDate);
			//	console.log(time);
			//}

			//function onError(error) { // Android only
			//	alert('Error: ' + error);
			//}

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



			//self.listDevices();



			//self.connectionError = function (err) {
			//	alert(err);
			//};

			//self.ledOn = function () {
			//	bluetoothSerial.write('on', self.done, self.fail);
			//};

			//self.ledOff = function () {
			//	bluetoothSerial.write('off', self.done, self.fail);
			//};

			//self.getTime = function () {
			//	bluetoothSerial.write('gettime', self.done, self.fail);
			//};

			//self.done = function (d) {
			//};

			//self.fail = function () {
			//	alert('failed');
			//};
		};

		return {
			load: function () {
				return new viewModel(ko, utils);
			}
		};
	});