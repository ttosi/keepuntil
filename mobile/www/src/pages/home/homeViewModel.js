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

			self.oatRemaining = ko.computed(function () {
				if (app.keepuntil.oat()) {
					var timeRemaining = '';
					var now = new Date();

					if (now.yearsUntil(app.keepuntil.oat()) - 1 > 0)
						timeRemaining += now.yearsUntil(app.keepuntil.oat()) - 1 + 'y ';

					if (Math.floor(now.daysUntil(app.keepuntil.oat()) % 365) > 1)
						timeRemaining += Math.floor(now.daysUntil(app.keepuntil.oat()) % 365) - 1 + 'd ';

					if (Math.floor(now.hoursUntil(app.keepuntil.oat()) % 24))
						timeRemaining += Math.floor(now.hoursUntil(app.keepuntil.oat()) % 24) + 'h ';

					if (Math.floor(now.minutesUntil(app.keepuntil.oat()) % 60))
						timeRemaining += Math.floor(now.minutesUntil(app.keepuntil.oat()) % 60) + 'm ';

					var seconds = Math.floor(now.secondsUntil(app.keepuntil.oat()) % 60);
					timeRemaining += (seconds < 10 ? '0' + seconds : seconds) + 's ';

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
					return app.keepuntil.oat().format('{Month} {d}, {yyyy} at {h}:{mm}{tt}');
			});

			self.resetOat = function () {
				keepuntil.setOat(Date.create());
			};

			self.setOat = function () {
				var date;

				datePicker.show({ date: new Date(), mode: 'date' }, function (pickedDate) {
					if (pickedDate) {
						date = pickedDate;

						datePicker.show({ date: new Date(), mode: 'time' }, function (time) {
							if (time) {
								var oat = Date.create(
									date.format('{M}-{d}-{yyyy}') + ' ' +
									time.format('{H}:{mm}:00')
								);

								keepuntil.setOat(oat);
							}
						});
					}
				});
			}

			self.connect = function () {
				utils.waitDialog.show('Connecting to your KeepUntil Box...');

				keepuntil.connect()
					.done(function (subscription) {
						keepuntil.getOat();

						setTimeout(function () {
							keepuntil.setRtc()
								.done(function (date) {
									console.log(date);
								});
						}, 3000);

						setTimeout(function () {
							keepuntil.getRtc();

							app.keepuntil.connected(true);
							utils.waitDialog.dismiss();
						}, 1500);
					})
					.fail(function (error) {
						utils.waitDialog.dismiss();
						alert(error);
					});
			};

			self.connect();

			setInterval(function () {
				app.keepuntil.oat.notifySubscribers();
			}, 1000);
		};

		return {
			load: function () {
				return new viewModel(ko, utils);
			}
		};
	});