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

//var viewModel = function () {
//	var self = this;

	//self.devices = ko.observableArray();

	//self.isConnected = ko.observable(false);

	//self.command = ko.observable();

	//self.rtcTime = ko.observable();

	//self.listDevices = function () {
	//	bluetoothSerial.list(function (results) {
	//		self.devices(results);
	//	});
	//};

	//self.connect = function () {
	//	self.showWaitDialog('Connecting to your KeepUntil Box...');

	//	bluetoothSerial.connect(
	//			this.address,
	//			function () {
	//				self.isConnected(true);
	//				self.dismissWaitDialog();

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
	//				self.dismissWaitDialog();
	//				alert(err);
	//			}
	//		);
	//};

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

	//self.showWaitDialog = function (message) {
	//	cordova.plugin.pDialog.init({
	//		theme: 'HOLO_DARK',
	//		progressStyle: 'SPINNER',
	//		cancelable: false,
	//		title: 'Please Wait...',
	//		message: message
	//	});
	//};

	//self.dismissWaitDialog = function () {
	//	cordova.plugin.pDialog.dismiss();
	//};
//};

require([
	'knockout',
	'pager',
	'lib/fastclick',
	'pages/home/homeViewModel',
	'lib/domReady!'],
	function (ko, pager, fastclick, HomeViewModel) {
		'use strict';

		var onDeviceReady = function () {
			//if (app.debug) {
				alert('ready to start debugging');
			//}

			pager.extendWithPage(HomeViewModel);
			ko.applyBindings(HomeViewModel);

			pager.Href.hash = '#!/';
			pager.start();

			fastclick.attach(document.body);

			console.info('app initialized');
		}

		document.addEventListener('deviceready', onDeviceReady, false);
	});

//var app = {
//	debug: true,

//	initialize: function () {
//		this.bindEvents();
//	},

//	bindEvents: function () {
//		document.addEventListener('deviceready', this.onDeviceReady, false);
//	},

//	onDeviceReady: function () {
//		app.receivedEvent('deviceready');

//		if (app.debug) {
//			alert('ready to start debugging');
//		}

//		var vm = new viewModel()

//		ko.applyBindings(vm);

//		vm.listDevices();
//	},

//	receivedEvent: function (id) {
//	}
//};
