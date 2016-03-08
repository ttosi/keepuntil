define([],
	function () {
		return {
			waitDialog: {
				show: function (message) {
					cordova.plugin.pDialog.init({
						theme: 'HOLO_DARK',
						progressStyle: 'SPINNER',
						cancelable: false,
						title: 'Please Wait...',
						message: message
					});
				},

				dimiss: function () {
					cordova.plugin.pDialog.dismiss();
				}
			}
		};
	});