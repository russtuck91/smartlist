export const RouteLookup = (() => {
    return {
        home: '/',
        account: '/account/',
        login: '/login/',
        playlists: (() => {
            const base = '/playlists/';
            return {
                base: base
            };
        })()
    };
})();