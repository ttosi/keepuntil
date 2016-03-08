require.config({
	baseUrl: 'src/',
	paths: {
		jquery: 'lib/jquery',
		knockout: 'lib/knockout',
		pager: 'lib/pager',
		lodash: 'lib/lodash',
		sugar: 'lib/sugar',
		stringformat: 'lib/stringformat',
		text: 'lib/require-text'
	}
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
	}
};

require([
	'knockout',
	'pager',
	'lib/fastclick',
	'pages/home/homeViewModel',
	'lib/domReady!'],
	function (ko, pager, fastclick, HomeViewModel) {
		'use strict';

		var onDeviceReady = function () {

			pager.extendWithPage(HomeViewModel);
			ko.applyBindings(HomeViewModel);

			pager.Href.hash = '#!/';
			pager.start();

			fastclick.attach(document.body);

			console.info('app initialized');
		}

		document.addEventListener('deviceready', onDeviceReady, false);
	});
