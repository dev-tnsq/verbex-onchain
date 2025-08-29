import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Container({ children }: { children: React.ReactNode }) {
	return <View style={styles.outer}><View style={styles.inner}>{children}</View></View>;
}

const styles = StyleSheet.create({
	outer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#0b0b0c',
	},
	inner: {
		width: '100%',
		maxWidth: 500,
		alignSelf: 'center',
		paddingHorizontal: 16,
	},
});