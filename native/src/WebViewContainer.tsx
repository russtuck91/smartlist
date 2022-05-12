import React, { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
// import SplashScreen from 'react-native-splash-screen';
import WebView from 'react-native-webview';
import { WebViewProgressEvent } from 'react-native-webview/lib/WebViewTypes';

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        minHeight: 400,
        backgroundColor: 'transparent',
    },
});

const WebViewContainer = () => {
    const webviewRef = useRef<WebView>(null);
    let canGoBack = false;

    const handleBackButton = (): boolean => {
        if (canGoBack && webviewRef.current) {
            webviewRef.current.goBack();
            return true;
        }
        return false;
    };
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        };
    }, []);

    async function onLoadEnd() {
        // console.log('in WebViewContainer onLoadEnd #1');
        // SplashScreen.hide();
        console.log('in WebViewContainer onLoadEnd #2');

        await RNBootSplash.hide({ fade: true });
        console.log('in WebViewContainer onLoadEnd #3');
    }

    const onLoadProgress = (event: WebViewProgressEvent) => {
        canGoBack = event.nativeEvent.canGoBack;
    };

    return (
        <WebView
            ref={webviewRef}
            source={{
                uri: 'https://www.smartlistmusic.com/',
            }}
            style={styles.webview}
            onLoadEnd={onLoadEnd}
            onLoadProgress={onLoadProgress}
        />
    );
};

export default WebViewContainer;
