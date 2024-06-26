export const RouteLookup = (() => {
    return {
        index: '/',
        home: '/home',
        account: '/account',
        login: (() => {
            const base = '/login';
            return {
                base: base,
                login: base,
                callback: `${base}/callback/:sessionToken/`,
                error: `${base}/error/:message/`,
            };
        })(),
        logout: '/logout',
        playlists: (() => {
            const base = '/playlists';
            return {
                base: base,
                create: `${base}/create`,
                edit: `${base}/edit/:id`,
                publish: `${base}/publish/:id`,
            };
        })(),
        privacyPolicy: '/privacy-policy',
    };
})();
