import {
    Box, Button, CircularProgress, Container, Grid, Link, List, ListItem, ListItemText, Paper,
    StyleRules, Theme, Typography, WithStyles, withStyles,
} from '@material-ui/core';
import { Delete, FilterList, Publish, Search } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { FormikProps, withFormik } from 'formik';
import moment from 'moment';
import * as React from 'react';
import { generatePath, Link as RouterLink, RouteComponentProps } from 'react-router-dom';

import { convertEnumToArray, Playlist, PlaylistDeleteOptions } from '../../../../shared';

import { DialogControl } from '../../core/components/modals/dialog-control';
import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import SmTooltip from '../../core/components/tooltips/sm-tooltip';
import { DropdownField, TextField } from '../../core/forms/fields';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { toDateTimeFormat } from '../../core/utils';

import { PlaylistContainer } from '../playlist-container';

import { DeleteDialogContainer } from './delete-dialog/delete-dialog-container';

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
        listContainer: {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            overflowY: 'auto',

            '& .MuiAlert-root': {
                fontSize: 'inherit',
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                '& .MuiAlert-icon': {
                    padding: 0,
                    marginRight: theme.spacing(1),
                    fontSize: '1.3em',
                },
                '& .MuiAlert-message': {
                    padding: 0,
                },
            },

            '& .MuiButton-root': {
                margin: theme.spacing(0.5),
            },
        },
        actionArea: {
            display: 'flex',

            [theme.breakpoints.down('xs')]: {
                flexDirection: 'column',
            },
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
        const { playlists } = this.state;

        if (!playlists) {
            return (
                <Box display="flex" justifyContent="center">
                    <CircularProgress size={60} />
                </Box>
            );
        }

        return (
            <Paper className={this.props.classes.listContainer}>
                {playlists.length === 0 ? (
                    <Box
                        display="flex"
                        flex="1 1 auto"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        p={4}
                    >
                        You have no playlists. Create a new playlist and it will show up here.
                    </Box>
                ) : (
                    <List>
                        {playlists
                            .filter(this.filterPlaylist)
                            .sort(this.sortPlaylists)
                            .map(this.renderPlaylistItem)}
                    </List>
                )}
            </Paper>
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

    private renderPlaylistItem = (playlist: Playlist, index: number, playlists: Playlist[]) => {
        return (
            <ListItem
                key={index}
                divider={index < playlists.length - 1}
                button
                onClick={() => this.transitionToEdit(playlist)}
            >
                <ListItemText
                    primary={playlist.name}
                    secondary={(
                        <>
                            Last Published:
                            {' '}
                            {this.renderLastPublishedValue(playlist)}
                        </>
                    )}
                />
                <Box className={this.props.classes.actionArea}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(event) => {
                            this.openPublishDialog(playlist);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                        startIcon={<Publish fontSize="small" />}
                    >
                        Publish
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(event) => {
                            this.openDeleteDialog(playlist);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                        startIcon={<Delete fontSize="small" />}
                    >
                        Delete
                    </Button>
                </Box>
            </ListItem>
        );
    };

    private renderLastPublishedValue(playlist: Playlist) {
        const isPublishInProgress: boolean = this.state.publishInProgress[playlist.id];
        if (isPublishInProgress) {
            return <CircularProgress size={20} />;
        }

        if (playlist.deleted) {
            const title = (
                <div>
                    Playlist was deleted from Spotify.
                    <br />
                    Re-publish to resume automatic updates.
                </div>
            );
            return (
                <SmTooltip title={title}>
                    <Alert severity="error">
                        Deleted
                    </Alert>
                </SmTooltip>
            );
        }

        if (!playlist.lastPublished) {
            return '--';
        }
        return toDateTimeFormat(playlist.lastPublished);
    }

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
