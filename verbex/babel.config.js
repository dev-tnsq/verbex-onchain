module.exports = function (api) {
	api.cache(true);
	return {
		presets: ['babel-preset-expo'],
		plugins: [
			// NOTE: This must be last in the plugins list
			'react-native-reanimated/plugin',
		],
	};
};