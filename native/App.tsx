import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { WebView } from 'react-native-webview';

declare const global: {HermesInternal: null | Record<string, unknown>};

const App = () => {
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeAreaView}>
                {global.HermesInternal == null ? null : (
                    <View style={styles.engine}>
                        <Text style={styles.footer}>Engine: Hermes</Text>
                    </View>
                )}
                <WebView
                    source={{
                        uri: 'https://smart--list.herokuapp.com/',
                    }}
                    style={styles.webview}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    webview: {
        flex: 1,
        minHeight: 400,
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default App;
