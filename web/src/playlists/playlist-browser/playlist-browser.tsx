import { Button, CircularProgress, IconButton, Link, Paper, TableContainer, Grid, Box } from '@material-ui/core';
import { Edit, Delete, Publish } from '@material-ui/icons';
import * as React from 'react';
import { Link as RouterLink, generatePath } from 'react-router-dom';

import { Playlist } from '../../../../shared';

import { ColumnConfig, ColumnFormatType, ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { DialogControl } from '../../core/components/modals/dialog-control';

import { PlaylistContainer } from '../playlist-container';


interface PlaylistBrowserState {
    playlists?: Playlist[];
    
    activeItem?: Playlist;
    showDeleteDialog: boolean;
    showPublishDialog: boolean;
    publishInProgress: { [id: string]: boolean };
}

export class PlaylistBrowser extends React.Component<any, PlaylistBrowserState> {
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
            <div>
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
            </div>
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
                />
            </TableContainer>
        );
    }

    private cellFormatter = (cellValue: any, column: ColumnConfig, columnIndex: number, rowData: Playlist, rowIndex: number) => {
        if (column.type === ColumnFormatType.DateTime) {
            const isPublishInProgress: boolean = !!rowData._id && this.state.publishInProgress[rowData._id];
            if (isPublishInProgress) {
                return <CircularProgress size={20} />;
            }
        } else if (column.type === ColumnFormatType.Actions) {
            return this.renderActionsCell(rowData);
        }
    }

    private renderActionsCell(item: Playlist) {
        return (
            <div>
                <IconButton onClick={() => this.transitionToEdit(item)}>
                    <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => this.openDeleteDialog(item)}>
                    <Delete fontSize="small" />
                </IconButton>
                <IconButton onClick={() => this.openPublishDialog(item)}>
                    <Publish fontSize="small" />
                </IconButton>
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
        if (!playlist._id) { return; }

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
}