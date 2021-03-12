import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export function ContentView() {
    return (
        <View style={styles.container}>
            <WebView source={{ uri: 'https://btcbox.com.br/mobile.php' }} />
        </View>
      );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
