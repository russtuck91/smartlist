import { Box, Button, CircularProgress, Container, Grid, Link, List, ListItem, ListItemText, Paper, StyleRules, Theme, Tooltip, Typography, WithStyles, withStyles } from '@material-ui/core';
import { Delete, Publish } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { generatePath, Link as RouterLink, RouteComponentProps } from 'react-router-dom';

import { Playlist } from '../../../../shared';

import { DialogControl } from '../../core/components/modals/dialog-control';
import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { toDateTimeFormat } from '../../core/utils';

import { PlaylistContainer } from '../playlist-container';


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
    showJustCreatedDialog?: boolean;
}

const useStyles = (theme: Theme) => {
    const rules: StyleRules = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
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

type FullProps = PlaylistBrowserProps & WithStyles<typeof useStyles>;

export class RawPlaylistBrowser extends React.Component<FullProps, PlaylistBrowserState> {
    state: PlaylistBrowserState = {
        showDeleteDialog: false,
        showPublishDialog: false,
        publishInProgress: {},
    };

    componentDidMount() {
        this.loadPlaylists();
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
                    <Box my={3}>
                        <Grid container alignItems="flex-end">
                            <Grid item xs />
                            <Grid item>
                                <Link to={RouteLookup.playlists.create} component={RouterLink} underline="none">
                                    <Button variant="contained">Create New Playlist</Button>
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                    {this.renderPlaylistList()}
                    {this.renderDeleteDialog()}
                    {this.renderPublishDialog()}
                    {this.renderJustCreatedDialog()}
                </Container>
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
                <List>
                    {playlists.map(this.renderPlaylistItem)}
                </List>
            </Paper>
        );
    }

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
                        onClick={() => this.openPublishDialog(playlist)}
                        startIcon={<Publish fontSize="small" />}
                    >
                        Publish
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => this.openDeleteDialog(playlist)}
                        startIcon={<Delete fontSize="small" />}
                    >
                        Delete
                    </Button>
                </Box>
            </ListItem>
        );
    }

    private renderLastPublishedValue(playlist: Playlist) {
        const isPublishInProgress: boolean = this.state.publishInProgress[playlist._id];
        if (isPublishInProgress) {
            return <CircularProgress size={20} />;
        }

        if (playlist.deleted) {
            const title = (
                <div style={{ textAlign: 'center' }}>
                    Playlist was deleted from Spotify.
                    <br />
                    Re-publish to resume automatic updates.
                </div>
            );
            return (
                <Tooltip title={title}>
                    <Alert severity="error" style={{ display: 'inline-flex' }}>
                        Deleted
                    </Alert>
                </Tooltip>
            );
        }

        if (!playlist.lastPublished) {
            return '';
        }
        return toDateTimeFormat(playlist.lastPublished);
    }

    private renderDeleteDialog() {
        const { showDeleteDialog } = this.state;

        return (
            <DialogControl
                open={showDeleteDialog}
                onClose={this.closeDeleteDialog}
                onConfirm={this.onConfirmDelete}
                body={this.renderDeleteModalBody()}
            />
        );
    }

    private renderDeleteModalBody() {
        return (
            <div>
                <p>Are you sure you want to delete this playlist?</p>
            </div>
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

    private renderJustCreatedDialog() {
        const { showJustCreatedDialog } = this.props.location.state || {};

        return (
            <DialogControl
                open={!!showJustCreatedDialog}
                onClose={this.closeJustCreatedDialog}
                onConfirm={this.onConfirmPublishJustCreated}
                title="Playlist successfully created!"
                body={<p>Would you like to publish it to Spotify now? If not, it will be published at the next regular update.</p>}
            />
        );
    }

    private transitionToEdit(item: Playlist) {
        history.push(generatePath(RouteLookup.playlists.edit, { id: item._id }));
    }

    private openDeleteDialog = (playlist: Playlist) => {
        this.setState({
            showDeleteDialog: true,
            activeItem: playlist,
        });
    }

    private closeDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false,
            activeItem: undefined,
        });
    }

    private onConfirmDelete = async () => {
        if (!this.state.activeItem) { return; }

        await this.deletePlaylist(this.state.activeItem);

        this.closeDeleteDialog();

        this.loadPlaylists(true);
    }

    private async deletePlaylist(playlist: Playlist) {
        await requests.delete(`${PlaylistContainer.requestUrl}/${playlist._id}`);
    }

    private openPublishDialog = (playlist: Playlist) => {
        this.setState({
            activeItem: playlist,
            showPublishDialog: true,
        });
    }

    private closePublishDialog = () => {
        this.setState({
            activeItem: undefined,
            showPublishDialog: false,
        });
    }

    private onConfirmPublish = () => {
        if (!this.state.activeItem) { return; }

        this.publishPlaylist(this.state.activeItem);

        this.closePublishDialog();
    }

    private async publishPlaylist(playlist: Playlist) {
        this.setPublishInProgress(playlist._id, true);

        await requests.post(`${PlaylistContainer.requestUrl}/publish/${playlist._id}`);
        await this.loadPlaylists();

        this.setPublishInProgress(playlist._id, false);
    }

    private setPublishInProgress(id: string, value: boolean) {
        this.setState((prevState) => ({
            publishInProgress: {
                ...prevState.publishInProgress,
                [id]: value,
            },
        }));
    }

    private closeJustCreatedDialog = () => {
        this.props.history.replace({
            state: {
                activeItem: undefined,
                showJustCreatedDialog: false,
            },
        });
    }

    private onConfirmPublishJustCreated = () => {
        const { activeItem } = this.props.location.state || {};
        if (!activeItem) { return; }

        this.publishPlaylist(activeItem);

        this.closeJustCreatedDialog();
    }
}

export const PlaylistBrowser = withStyles(useStyles)(RawPlaylistBrowser);
