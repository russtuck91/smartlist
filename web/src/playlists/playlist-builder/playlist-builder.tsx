import { CircularProgress } from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { Playlist, RuleGroupType, RuleParam } from '../../../../shared';

import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';

import { PlaylistContainer } from '../playlist-container';
import { PlaylistBuilderFormValues } from './models';
import { PlaylistBuilderForm } from './playlist-builder-form';
import './playlist-builder.scss';


interface MatchParams {
    id?: string;
}
interface PlaylistBuilderProps extends RouteComponentProps<MatchParams> {}

interface PlaylistBuilderState {
    existingPlaylist?: Playlist;
}

export class PlaylistBuilder extends React.Component<PlaylistBuilderProps, PlaylistBuilderState> {
    state: PlaylistBuilderState = {};

    componentDidMount() {
        this.loadPlaylist();
    }

    async loadPlaylist() {
        const { id } = this.props.match.params;
        if (!id) {
            return;
        }

        const playlist = await requests.get(`${PlaylistContainer.requestUrl}/${id}`);
        this.setState({
            existingPlaylist: playlist
        });
    }

    render() {
        if (this.isEditMode() && !this.state.existingPlaylist) {
            return <CircularProgress />;
        }

        return (
            <Formik
                initialValues={this.getDefaultFormValues()}
                enableReinitialize
                isInitialValid={!!this.state.existingPlaylist}
                onSubmit={this.onSubmit}
                render={(formikProps: FormikProps<PlaylistBuilderFormValues>) => (
                    <PlaylistBuilderForm
                        formik={formikProps}
                    />
                )}
            />
        );
    }

    private isEditMode() {
        return !!this.props.match.params.id;
    }

    private getDefaultFormValues(): PlaylistBuilderFormValues {
        if (this.state.existingPlaylist) {
            return this.state.existingPlaylist;
        }

        return {
            name: '',
            rules: [
                {
                    type: RuleGroupType.And,
                    rules: [
                        { param: RuleParam.Saved, value: true },
                        { param: RuleParam.Artist, value: '' }
                    ]
                }
            ]
        };
    }

    private onSubmit = async (values: PlaylistBuilderFormValues) => {
        const { id } = this.props.match.params;

        const playlist = this.mapPlaylistBuilderFormValuesToPlaylist(values);

        if (id) {
            await requests.put(`${PlaylistContainer.requestUrl}/${id}`, playlist);
        } else {
            await requests.post(`${PlaylistContainer.requestUrl}`, playlist);
        }

        this.transitionToBrowse();
    }

    private mapPlaylistBuilderFormValuesToPlaylist(values: PlaylistBuilderFormValues): Partial<Playlist> {
        return {
            ...values
        };
    }

    private transitionToBrowse() {
        history.push(RouteLookup.playlists.base);
    }
}