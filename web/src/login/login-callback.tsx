import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router';

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
    }

    render() {
        return <Redirect to={RouteLookup.account} />;
    }
}

export const LoginCallback = connector(RawLoginCallback);
