import { Box, Button, CircularProgress, Container, Grid, IconButton, Link, Paper, TableContainer, Tooltip, Theme, withStyles, WithStyles, StyleRules } from '@material-ui/core';
import { Delete, Edit, Publish } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { generatePath, Link as RouterLink, RouteComponentProps } from 'react-router-dom';

import { Playlist } from '../../../../shared';

import { DialogControl } from '../../core/components/modals/dialog-control';
import { ColumnConfig, ColumnFormatType, ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';

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
        }
    };
    return rules;
};

type FullProps = PlaylistBrowserProps & WithStyles<typeof useStyles>;

export class RawPlaylistBrowser extends React.Component<FullProps, PlaylistBrowserState> {
    state: PlaylistBrowserState = {
        showDeleteDialog: false,
        showPublishDialog: false,
        publishInProgress: {}
    };

    private columnSet: ColumnSet<Playlist> = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Last Published', mapsToField: 'lastPublished', type: ColumnFormatType.DateTime },
        { title: 'Actions', mapsToField: '', type: ColumnFormatType.Actions }
    ];

    componentDidMount() {
        this.loadPlaylists();
    }

    async loadPlaylists(reload?: boolean) {
        if (reload) {
            this.setState({
                playlists: undefined
            });
        }

        const playlists = await requests.get(`${PlaylistContainer.requestUrl}/lists`);
        this.setState({
            playlists: playlists
        });
    }

    render() {
        return (
            <Container className={this.props.classes.container}>
                <Box my={3}>
                    <Grid container alignItems="flex-end">
                        <Grid item xs>
                            <h1 style={{ marginBottom: 0 }}>Playlists</h1>
                        </Grid>
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
            <TableContainer component={Paper}>
                <TableRenderer
                    data={playlists}
                    columns={this.columnSet}

                    customCellFormatter={this.cellFormatter}
                    stickyHeader
                />
            </TableContainer>
        );
    }

    private cellFormatter = (cellValue: any, column: ColumnConfig, columnIndex: number, rowData: Playlist, rowIndex: number) => {
        if (column.type === ColumnFormatType.DateTime) {
            const isPublishInProgress: boolean = this.state.publishInProgress[rowData._id];
            if (isPublishInProgress) {
                return <CircularProgress size={20} />;
            }

            if (rowData.deleted) {
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
        } else if (column.type === ColumnFormatType.Actions) {
            return this.renderActionsCell(rowData);
        }
    }

    private renderActionsCell(item: Playlist) {
        return (
            <div>
                <Tooltip title="Edit">
                    <IconButton onClick={() => this.transitionToEdit(item)}>
                        <Edit fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton onClick={() => this.openDeleteDialog(item)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Publish">
                    <IconButton onClick={() => this.openPublishDialog(item)}>
                        <Publish fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>
        );
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
            activeItem: playlist
        });
    }

    private closeDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false,
            activeItem: undefined
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
            showPublishDialog: true
        });
    }

    private closePublishDialog = () => {
        this.setState({
            activeItem: undefined,
            showPublishDialog: false
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
        this.setState(prevState => ({
            publishInProgress: {
                ...prevState.publishInProgress,
                [id]: value
            }
        }));
    }

    private closeJustCreatedDialog = () => {
        this.props.history.replace({
            state: {
                activeItem: undefined,
                showJustCreatedDialog: false
            }
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