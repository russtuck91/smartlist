import {
    Box, Button, Container, Grid, Link,
    StyleRules, Theme, Typography, WithStyles, withStyles,
} from '@material-ui/core';
import { FilterList, Search } from '@material-ui/icons';
import { FormikProps, withFormik } from 'formik';
import moment from 'moment';
import * as React from 'react';
import { generatePath, Link as RouterLink, RouteComponentProps } from 'react-router-dom';

import { convertEnumToArray, Playlist, PlaylistDeleteOptions } from '../../../../shared';

import { DialogControl } from '../../core/components/modals/dialog-control';
import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import { DropdownField, TextField } from '../../core/forms/fields';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';

import { PlaylistContainer } from '../playlist-container';

import { DeleteDialogContainer } from './delete-dialog/delete-dialog-container';
import { PlaylistBrowserListRenderer } from './playlist-browser-list-renderer';

interface PlaylistBrowserProps extends RouteComponentProps<any, any, PlaylistBrowserLocationState> {
}

interface PlaylistBrowserState {
    playlists?: Playlist[];

    activeItem?: Playlist;
    showDeleteDialog: boolean;
    showPublishDialog: boolean;
    publishInProgress: { [id: string]: boolean };
}
export interface PlaylistBrowserLocationState {
    activeItem?: Playlist;
}

interface PlaylistBrowserFormValues {
    search: string;
    sort: PlaylistBrowserSortOptions;
}
enum PlaylistBrowserSortOptions {
    alphabetical = 'Alphabetical',
    newestFirst = 'Newest First',
    oldestFirst = 'Oldest First',
}

const useStyles = (theme: Theme) => {
    const rules: StyleRules = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
            paddingBottom: theme.spacing(2),
        },
    };
    return rules;
};

type FullProps = PlaylistBrowserProps & WithStyles<typeof useStyles> & FormikProps<PlaylistBrowserFormValues>;

export class RawPlaylistBrowser extends React.Component<FullProps, PlaylistBrowserState> {
    state: PlaylistBrowserState = {
        showDeleteDialog: false,
        showPublishDialog: false,
        publishInProgress: {},
    };

    componentDidMount() {
        this.loadPlaylists();

        this.publishJustUpdatedPlaylist();
    }

    async loadPlaylists(reload?: boolean) {
        if (reload) {
            this.setState({
                playlists: undefined,
            });
        }

        const playlists = await requests.get(`${PlaylistContainer.requestUrl}/lists`);
        this.setState({
            playlists: playlists,
        });
    }

    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <SecondaryAppBar>
                    <Typography variant="h6">
                        Playlists
                    </Typography>
                </SecondaryAppBar>
                <Container className={this.props.classes.container}>
                    <Box mt={3}>
                        <Grid container alignItems="flex-end">
                            <Grid item xs />
                            <Grid item>
                                <Link to={RouteLookup.playlists.create} component={RouterLink} underline="none">
                                    <Button variant="contained">Create New Playlist</Button>
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                    {this.renderFormArea()}
                    {this.renderPlaylistList()}
                    {this.renderDeleteDialog()}
                    {this.renderPublishDialog()}
                </Container>
            </Box>
        );
    }

    private renderFormArea() {
        return (
            <Box my={1}>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item xs={12} sm="auto" style={{ flexGrow: 1 }}>
                        <TextField
                            id="search"
                            label="Search"
                            startAdornment={<Search />}
                        />
                    </Grid>
                    <Grid item xs={12} sm="auto">
                        <DropdownField
                            id="sort"
                            options={convertEnumToArray(PlaylistBrowserSortOptions)}
                            IconComponent={FilterList}
                            variant="filled"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    private renderPlaylistList() {
        return (
            <PlaylistBrowserListRenderer
                playlists={(this.state.playlists?.filter(this.filterPlaylist).sort(this.sortPlaylists)) || []}
                isLoading={this.state.playlists === undefined}
                publishInProgress={this.state.publishInProgress}
                onClickListItem={this.transitionToEdit}
                onClickPublishBtn={this.openPublishDialog}
                onClickDeleteBtn={this.openDeleteDialog}
            />
        );
    }

    private filterPlaylist = (playlist: Playlist) => {
        const { values: { search } } = this.props;
        return playlist.name.toLowerCase().includes(search.toLowerCase());
    };

    private sortPlaylists = (a: Playlist, b: Playlist): number => {
        const { values: { sort } } = this.props;
        if (sort === PlaylistBrowserSortOptions.alphabetical) {
            return a.name.localeCompare(b.name);
        }
        if (sort === PlaylistBrowserSortOptions.newestFirst) {
            return moment(b.createdAt).diff(a.createdAt);
        }
        if (sort === PlaylistBrowserSortOptions.oldestFirst) {
            return moment(a.createdAt).diff(b.createdAt);
        }
        return 0;
    };

    private renderDeleteDialog() {
        const { activeItem, showDeleteDialog } = this.state;

        return (
            <DeleteDialogContainer
                isOpen={showDeleteDialog}
                onClose={this.closeDeleteDialog}
                onConfirm={this.onConfirmDelete}
                playlist={activeItem}
            />
        );
    }

    private renderPublishDialog() {
        const { showPublishDialog } = this.state;

        return (
            <DialogControl
                open={showPublishDialog}
                onClose={this.closePublishDialog}
                onConfirm={this.onConfirmPublish}
                body={<p>Publish this playlist?</p>}
            />
        );
    }

    private transitionToEdit(item: Playlist) {
        history.push(generatePath(RouteLookup.playlists.edit, { id: item.id }));
    }

    private openDeleteDialog = (playlist: Playlist) => {
        this.setState({
            showDeleteDialog: true,
            activeItem: playlist,
        });
    };

    private closeDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false,
        });
    };

    private onConfirmDelete = async (options: PlaylistDeleteOptions) => {
        if (!this.state.activeItem) { return; }

        await this.deletePlaylist(this.state.activeItem, options);

        this.closeDeleteDialog();

        this.loadPlaylists(true);
    };

    private async deletePlaylist(playlist: Playlist, options: PlaylistDeleteOptions) {
        await requests.delete(`${PlaylistContainer.requestUrl}/${playlist.id}`, options);
    }

    private openPublishDialog = (playlist: Playlist) => {
        this.setState({
            activeItem: playlist,
            showPublishDialog: true,
        });
    };

    private closePublishDialog = () => {
        this.setState({
            activeItem: undefined,
            showPublishDialog: false,
        });
    };

    private onConfirmPublish = () => {
        if (!this.state.activeItem) { return; }

        this.publishPlaylist(this.state.activeItem);

        this.closePublishDialog();
    };

    private async publishPlaylist(playlist: Playlist) {
        this.setPublishInProgress(playlist.id, true);

        try {
            await requests.post(`${PlaylistContainer.requestUrl}/publish/${playlist.id}`);
            await this.loadPlaylists();
        } finally {
            this.setPublishInProgress(playlist.id, false);
        }
    }

    private setPublishInProgress(id: string, value: boolean) {
        this.setState((prevState) => ({
            publishInProgress: {
                ...prevState.publishInProgress,
                [id]: value,
            },
        }));
    }

    private publishJustUpdatedPlaylist = () => {
        const { activeItem } = this.props.location.state || {};
        if (!activeItem) { return; }
        if (activeItem.deleted) { return; }

        this.publishPlaylist(activeItem);
    };
}

export const PlaylistBrowser = withStyles(useStyles)( withFormik({
    handleSubmit() {},
    mapPropsToValues(): PlaylistBrowserFormValues {
        return {
            search: '',
            sort: PlaylistBrowserSortOptions.newestFirst,
        };
    },
})(RawPlaylistBrowser) );
