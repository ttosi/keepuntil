define([
	'knockout',
	'text!components/header/header.html'],
	function (ko, template) {
		'use strict';

		ko.components.register('siteheader', {
			viewModel: function (params) {
				var self = this;
			},

			template: template
		});
	});