import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga4';

export const history = createBrowserHistory();

history.listen((location) => {
    ReactGA.set({ page: location.pathname });
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
});
