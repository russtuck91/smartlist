export const RouteLookup = (() => {
    return {
        home: '/',
        account: '/account',
        login: (() => {
            const base = '/login';
            return {
                base: base,
                login: base,
                callback: `${base}/callback/:accessToken/:refreshToken/`
            };
        })(),
        playlists: (() => {
            const base = '/playlists';
            return {
                base: base,
                create: `${base}/create`,
                edit: `${base}/edit/:id`
            };
        })()
    };
})();