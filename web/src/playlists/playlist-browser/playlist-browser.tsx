import { Button, CircularProgress, IconButton, Link, Paper, TableContainer } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Playlist } from '../../../../shared/src/playlists/models';

import { ColumnConfig, ColumnFormatType, ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { baseRequestUrl, requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';


interface PlaylistBrowserState {
    playlists?: Playlist[];
}

export class PlaylistBrowser extends React.Component<any, PlaylistBrowserState> {
    state: PlaylistBrowserState = {};

    private columnSet: ColumnSet = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Actions', mapsToField: '', type: ColumnFormatType.Actions }
    ];

    componentDidMount() {
        this.loadPlaylists();
    }

    async loadPlaylists() {
        const playlists = await requests.get(`${baseRequestUrl}/playlists/lists`);
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
                <IconButton onClick={() => {}}>
                    <Edit fontSize="small" />
                </IconButton>
                <IconButton onClick={() => {}}>
                    <Delete fontSize="small" />
                </IconButton>
            </div>
        );
    }
}