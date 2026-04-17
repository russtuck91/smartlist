import { brandGreen } from './constants/theme.js';


export default (() => {
    const APP_VARIANT = process.env.APP_VARIANT;

    return {
        'expo': {
            'name': `Smartlist Music${APP_VARIANT ? ` - ${APP_VARIANT}` : ''}`,
            'slug': 'smartlist-music',
            'version': '1.6.0',
            'orientation': 'portrait',
            'icon': './assets/images/icon.png',
            'scheme': 'smartlist-music',
            'userInterfaceStyle': 'automatic',
            'platforms': [
                'android',
            ],
            'android': {
                'package': `com.smartlistmusic.smartlist${APP_VARIANT ? `.${APP_VARIANT}` : ''}`,
                'adaptiveIcon': {
                    'foregroundImage': './assets/images/android-icon-foreground.png',
                    'backgroundColor': brandGreen,
                },
                'predictiveBackGestureEnabled': false,
            },
            'plugins': [
                'expo-router',
                [
                    'expo-splash-screen',
                    {
                        'image': './assets/images/splash-icon.png',
                        'imageWidth': 320,
                        'resizeMode': 'contain',
                        'backgroundColor': brandGreen,
                    },
                ],
            ],
            'experiments': {
                'typedRoutes': true,
                'reactCompiler': true,
            },
            'extra': {
                'router': {},
                'eas': {
                    'projectId': 'd9d3b1ff-f51b-4569-9924-5bd5dee19928',
                },
            },
        },
    };
});
