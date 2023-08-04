import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { Playlist, PlaylistTrackSortOption, RuleGroupType, RuleParam } from '../../../../shared';

import { requests } from '../../core/requests/requests';

import { PlaylistContainer } from '../playlist-container';

import { DEFAULT_NEW_CONDITION, getNewConditionByParam, PlaylistBuilderFormValues } from './models';
import PlaylistAfterUpdateActions from './playlist-after-update-actions';
import { PlaylistBuilderForm } from './playlist-builder-form';


interface MatchParams {
    id?: string;
}
interface PlaylistBuilderProps extends RouteComponentProps<MatchParams> {}

interface PlaylistBuilderState {
    existingPlaylist?: Playlist;
    updatedPlaylist?: Playlist;
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
            existingPlaylist: playlist,
        });
    }

    render() {
        return (
            <>
                <Formik
                    initialValues={this.getDefaultFormValues()}
                    enableReinitialize
                    isInitialValid={!!this.state.existingPlaylist}
                    onSubmit={this.onSubmit}
                    render={(formikProps: FormikProps<PlaylistBuilderFormValues>) => (
                        <PlaylistBuilderForm
                            formik={formikProps}
                            isEditMode={this.isEditMode()}
                            isLoading={this.isEditMode() && !this.state.existingPlaylist}
                        />
                    )}
                />
                {this.state.updatedPlaylist && (
                    <PlaylistAfterUpdateActions
                        playlist={this.state.updatedPlaylist}
                    />
                )}
            </>
        );
    }

    private isEditMode() {
        return !!this.props.match.params.id;
    }

    private getDefaultFormValues(): PlaylistBuilderFormValues {
        const defaults = {
            name: '',
            rules: [
                {
                    type: RuleGroupType.And,
                    rules: [
                        getNewConditionByParam(RuleParam.Saved),
                        DEFAULT_NEW_CONDITION,
                    ],
                },
            ],
            exceptions: [],
            trackSort: PlaylistTrackSortOption.None,
        };

        if (this.state.existingPlaylist) {
            return {
                ...defaults,
                ...this.state.existingPlaylist,
            };
        }

        return defaults;
    }

    private onSubmit = async (values: PlaylistBuilderFormValues) => {
        const { id } = this.props.match.params;

        const playlist = this.mapPlaylistBuilderFormValuesToPlaylist(values);

        let result: Playlist;
        if (id) {
            result = await requests.put(`${PlaylistContainer.requestUrl}/${id}`, playlist);
        } else {
            result = await requests.post(`${PlaylistContainer.requestUrl}`, playlist);
        }

        this.setState({
            updatedPlaylist: result,
        });
    };

    private mapPlaylistBuilderFormValuesToPlaylist(values: PlaylistBuilderFormValues): Partial<Playlist> {
        return {
            ...values,
        };
    }
}
