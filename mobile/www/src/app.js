require.config({
	baseUrl: 'src/',
	waitSeconds: 20,
	paths: {
		jquery: 'lib/jquery',
		knockout: 'lib/knockout',
		bootstrap: 'lib/bootstrap',
		pager: 'lib/pager',
		lodash: 'lib/lodash',
		sugar: 'lib/sugar',
		stringformat: 'lib/stringformat',
		text: 'lib/require-text'
	},
	shim: {
		'bootstrap': { deps: ['jquery'] }
	},
});

var app = {
	load: function (viewModel) {
		return function (callback) {
			require([viewModel], function (vm) {
				callback(vm.load());
			});
		};
	},

	dispose: function (viewModel) {
		return function (callback) {
			require([viewModel], function (vm) {
				vm.dispose();
			});
		};
	},

	afterShow: function (viewModel) {
		return function (callback) {
			require([viewModel], function (vm) {
				vm.afterShow();
			});
		};
	},

	pause: function () {
		console.log('paused');
	},

	resume: function () {
		console.log('resumed');
	}
};

require([
	'knockout',
	'pager',
	'lib/fastclick',
	'pages/home/homeViewModel',
	'components/header/header',
	'bootstrap',
	'lib/domReady!'],
	function (ko, pager, fastclick, HomeViewModel) {
		'use strict';

		app.keepuntil = {
			rtc: ko.observable(),

			oat: ko.observable(),

			lockposition: ko.observable(true),

			connected: ko.observable(false)
		};

		app.rtcFormatted = ko.computed(function () {
			if (app.keepuntil.rtc())
				return app.keepuntil.rtc().format();
		});

		var deviceready = function () {
			pager.extendWithPage(HomeViewModel);
			ko.applyBindings(HomeViewModel);

			pager.Href.hash = '#!/';
			pager.start();

			fastclick.attach(document.body);

			console.info('app initialized');
		}

		document.addEventListener('deviceready', deviceready, false);

		document.addEventListener('pause', app.pause);

		document.addEventListener('resume', app.resume);
	});
