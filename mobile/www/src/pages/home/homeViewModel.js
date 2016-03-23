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

			self.oatRemaining = ko.computed(function () {
				if (app.keepuntil.oat()) {
					var timeRemaining = '';
					var now = new Date();

					if (now.daysUntil(app.keepuntil.oat()))
						timeRemaining += now.daysUntil(app.keepuntil.oat()) + 'd ';

					if (Math.floor(now.hoursUntil(app.keepuntil.oat()) % 24))
						timeRemaining += Math.floor(now.hoursUntil(app.keepuntil.oat()) % 24) + 'h ';

					if (Math.floor(now.minutesUntil(app.keepuntil.oat()) % 60))
						timeRemaining += Math.floor(now.minutesUntil(app.keepuntil.oat()) % 60) + 'm ';

					if (Math.floor(now.secondsUntil(app.keepuntil.oat()) % 60))
						timeRemaining += Math.floor(now.secondsUntil(app.keepuntil.oat()) % 60) + 's ';

					return timeRemaining;
				}
			});

			self.isOatPast = ko.computed(function () {
				if (app.keepuntil.oat()) {
					return app.keepuntil.oat().isPast()
				}
			});

			self.oatFormatted = ko.computed(function () {
				if (app.keepuntil.oat())
					return app.keepuntil.oat().format();
			});

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
					.done(function (subscription) {
						keepuntil.getOat();

						setTimeout(function () {
							keepuntil.getRtc();

							self.isConnected(true);
							utils.waitDialog.dismiss();
						}, 1500);
					})
					.fail(function (error) {
						utils.waitDialog.dismiss();
						alert(error);
					});
			};

			self.connect();

			//if (app.keepuntil.oat()) {
				setInterval(function () {
					app.keepuntil.oat.notifySubscribers();
				}, 1000);
			//}
		};

		return {
			load: function () {
				return new viewModel(ko, utils);
			}
		};
	});