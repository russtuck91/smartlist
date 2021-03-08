import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect } from 'react-router';

import { FullStore } from './core/redux/stores';
import { RouteLookup } from './core/routes/route-lookup';

interface IndexRouterProps {
}

const connector = connect((state: FullStore) => ({
    sessionToken: state.session.sessionToken,
}));

type FullProps = IndexRouterProps & ConnectedProps<typeof connector>;

export class RawIndexRouter extends React.Component<FullProps> {
    render() {
        if (this.props.sessionToken) {
            return <Redirect to={RouteLookup.playlists.base} />;
        }
        return <Redirect to={RouteLookup.home} />;
    }
}

export const IndexRouter = connector(RawIndexRouter);
