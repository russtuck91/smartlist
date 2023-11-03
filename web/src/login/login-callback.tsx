import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';

import { userLoggedInEvent } from '../core/analytics/analytics-utils';
import { setSessionToken } from '../core/redux/actions';
import { RouteLookup } from '../core/routes/route-lookup';

interface LoginCallbackProps extends RouteComponentProps<LoginCallbackParams> {
}

interface LoginCallbackParams {
    sessionToken: string;
}

const connector = connect(null, { setSessionToken });

type FullFinalProps = LoginCallbackProps & ConnectedProps<typeof connector>;

export class RawLoginCallback extends React.Component<FullFinalProps> {
    componentDidMount() {
        const { match: { params } } = this.props;

        this.props.setSessionToken(params.sessionToken);
        userLoggedInEvent();
    }

    render() {
        return <Redirect to={RouteLookup.playlists.base} />;
    }
}

export const LoginCallback = connector(RawLoginCallback);
