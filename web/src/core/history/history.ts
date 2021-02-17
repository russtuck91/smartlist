import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';

export const history = createBrowserHistory();

history.listen((location) => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
});
