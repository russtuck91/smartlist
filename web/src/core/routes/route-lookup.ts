export const RouteLookup = (() => {
    return {
        home: '/',
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
            };
        })(),
    };
})();
