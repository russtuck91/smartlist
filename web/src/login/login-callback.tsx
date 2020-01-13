import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';

import { RouteLookup } from '../core/routes/route-lookup';
import { session } from '../core/session/session';

interface LoginCallbackParams {
    accessToken: string;
    refreshToken: string;
}

export class LoginCallback extends React.Component<RouteComponentProps<LoginCallbackParams>> {
    componentDidMount() {
        const { match: { params } } = this.props;

        session.setAccessToken(params.accessToken);
    }

    render() {
        return <Redirect to={RouteLookup.account} />;
    }
}