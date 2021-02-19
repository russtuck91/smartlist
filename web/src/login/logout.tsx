import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect } from 'react-router';

import { clearSessionToken } from '../core/redux/actions';
import { baseRequestUrl, requests } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';


const connector = connect(null, { clearSessionToken });

type FullFinalProps = ConnectedProps<typeof connector>;
export class RawLogout extends React.Component<FullFinalProps> {
    async componentDidMount() {
        await this.revokeSessionToken();
        this.props.clearSessionToken();
    }

    render() {
        return <Redirect to={RouteLookup.login.login} />;
    }

    private async revokeSessionToken() {
        await requests.get(`${baseRequestUrl}/login/logout`);
    }
}

export const Logout = connector(RawLogout);
