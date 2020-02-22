import { Button, CircularProgress, IconButton, Link, Paper, TableContainer } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import * as React from 'react';
import { Link as RouterLink, generatePath } from 'react-router-dom';

import { Playlist } from '../../../../shared/src/playlists/models';

import { ColumnConfig, ColumnFormatType, ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { DialogControl } from '../../core/components/modals/dialog-control';

import { PlaylistContainer } from '../playlist-container';


interface PlaylistBrowserState {
    playlists?: Playlist[];
    
    showDeleteModal: boolean;
    activeItem?: Playlist;
}

export class PlaylistBrowser extends React.Component<any, PlaylistBrowserState> {
    state: PlaylistBrowserState = {
        showDeleteModal: false
    };

    private columnSet: ColumnSet = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Actions', mapsToField: '', type: ColumnFormatType.Actions }
    ];

    componentDidMount() {
        this.loadPlaylists();
    }

    async loadPlaylists() {
        this.setState({
            playlists: undefined
        });
        const playlists = await requests.get(`${PlaylistContainer.requestUrl}/lists`);
        this.setState({
            playlists: playlists
        });
    }

    render() {
        return (
            <div>
                <h1>Playlists</h1>
                <Link to={RouteLookup.playlists.create} component={RouterLink}>
                    <Button variant="contained">Create New Playlist</Button>
                </Link>
                {this.renderPlaylistList()}
                {this.renderDeleteModal()}
            </div>
        );
    }
    
    private renderPlaylistList() {
        const { playlists } = this.state;

        if (!playlists) { return <CircularProgress />; }

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
        if (column.type === ColumnFormatType.Actions) {
            return this.renderActionsCell(rowData);
        }
    }

    private renderActionsCell(item: Playlist) {
        return (
            <div>
                <IconButton onClick={() => this.transitionToEdit(item)}>
                    <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => this.openDeleteModal(item)}>
                    <Delete fontSize="small" />
                </IconButton>
            </div>
        );
    }

    private renderDeleteModal() {
        const { showDeleteModal } = this.state;

        return (
            <DialogControl
                open={showDeleteModal}
                onClose={this.closeDeleteModal}
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

    private transitionToEdit(item: Playlist) {
        history.push(generatePath(RouteLookup.playlists.edit, { id: item._id }));
    }

    private openDeleteModal = (playlist: Playlist) => {
        this.setState({
            showDeleteModal: true,
            activeItem: playlist
        });
    }

    private closeDeleteModal = () => {
        this.setState({
            showDeleteModal: false,
            activeItem: undefined
        });
    }

    private onConfirmDelete = () => {
        if (!this.state.activeItem) { return; }

        this.deletePlaylist(this.state.activeItem);

        this.closeDeleteModal();

        this.loadPlaylists();
    }

    private async deletePlaylist(playlist: Playlist) {
        await requests.delete(`${PlaylistContainer.requestUrl}/${playlist._id}`);
    }
}