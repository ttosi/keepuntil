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

			self.oatText = ko.observable();

			self.setOat = function () {
				var date;

				datePicker.show({ date: new Date(), mode: 'date' }, function (pickedDate) {
					date = pickedDate;

					datePicker.show({ date: new Date(), mode: 'time' }, function (time) {
						var oat = Date.create(
							date.format('{M}-{d}-{yyyy}') + ' ' +
							time.format('{H}:{mm}')
						);

						keepuntil.setOat(oat);

					});
				});
			}

			self.connect = function () {
				utils.waitDialog.show('Connecting to your KeepUntil Box...');

				keepuntil.connect()
					.done(function () {
						keepuntil.getOat();

						setTimeout(function () {
							keepuntil.setRtc();

							setTimeout(function () {
								keepuntil.getRtc();
							}, 1500);
						}, 1500);

						self.isConnected(true);

						utils.waitDialog.dismiss();
					})
					.fail(function (error) {
						utils.waitDialog.dismiss();
						alert(error);
					});
			};

			self.connect();
		};

		return {
			load: function () {
				return new viewModel(ko, utils);
			}
		};
	});