import {
    Box, Container, Grid,
    StyleRules, Theme, Typography, WithStyles, withStyles,
} from '@material-ui/core';
import { FilterList, Search } from '@material-ui/icons';
import { FormikProps, withFormik } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { generatePath } from 'react-router-dom';

import { convertEnumToArray, Playlist, PlaylistDeleteOptions } from '../../../../shared';

import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import { DropdownField, TextField } from '../../core/forms/fields';
import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';

import { PlaylistContainer } from '../playlist-container';
import { useFetchPlaylists } from '../use-fetch-playlists';

import CreatePlaylistButton from './create-playlist-button';
import { DeleteDialogContainer } from './delete-dialog/delete-dialog-container';
import { PlaylistBrowserListRenderer } from './playlist-browser-list-renderer';
import PublishDialog from './publish-dialog';

interface PlaylistBrowserProps {
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

const useStyles = (theme: Theme): StyleRules => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing(2),
    },
});

type FullProps = PlaylistBrowserProps & WithStyles<typeof useStyles> & FormikProps<PlaylistBrowserFormValues>;

const RawPlaylistBrowser: React.FC<FullProps> = (props) => {
    const [activeItem, setActiveItem] = useState<Playlist|undefined>(undefined);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);

    const { data: playlists, isLoading, refetch: refetchPlaylists } = useFetchPlaylists();

    return (
        <Box position="relative" display="flex" flex="1 1 auto" flexDirection="column" overflow="auto">
            <SecondaryAppBar>
                <Typography variant="h6">
                    Playlists
                </Typography>
                <Typography style={{ flexGrow: 10 }} />
                <CreatePlaylistButton iosVersion />
            </SecondaryAppBar>
            <Container className={props.classes.container}>
                <CreatePlaylistButton />
                {renderFormArea()}
                {renderPlaylistList()}
                {renderDeleteDialog()}
                {renderPublishDialog()}
            </Container>
        </Box>
    );

    function renderFormArea() {
        return (
            <Box my={2}>
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

    function renderPlaylistList() {
        return (
            <PlaylistBrowserListRenderer
                playlists={(playlists?.filter(filterPlaylist).sort(sortPlaylists)) || []}
                isLoading={isLoading}
                onClickListItem={transitionToEdit}
                onClickPublishBtn={openPublishDialog}
                onClickDeleteBtn={openDeleteDialog}
            />
        );
    }

    function filterPlaylist(playlist: Playlist) {
        const { values: { search } } = props;
        return playlist.name.toLowerCase().includes(search.toLowerCase());
    }

    function sortPlaylists(a: Playlist, b: Playlist): number {
        const { values: { sort } } = props;
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
    }

    function renderDeleteDialog() {
        return (
            <DeleteDialogContainer
                isOpen={showDeleteDialog}
                onClose={closeDeleteDialog}
                onConfirm={onConfirmDelete}
                playlist={activeItem}
            />
        );
    }

    function renderPublishDialog() {
        return (
            <PublishDialog
                showPublishDialog={showPublishDialog}
                playlist={activeItem}
                onClose={closePublishDialog}
            />
        );
    }

    function transitionToEdit(item: Playlist) {
        history.push(generatePath(RouteLookup.playlists.edit, { id: item.id }));
    }

    function openDeleteDialog(playlist: Playlist) {
        setShowDeleteDialog(true);
        setActiveItem(playlist);
    }

    function closeDeleteDialog() {
        setShowDeleteDialog(false);
    }

    async function onConfirmDelete(options: PlaylistDeleteOptions) {
        if (!activeItem) { return; }

        await deletePlaylist(activeItem, options);

        closeDeleteDialog();

        refetchPlaylists();
    }

    async function deletePlaylist(playlist: Playlist, options: PlaylistDeleteOptions) {
        await requests.delete(`${PlaylistContainer.requestUrl}/${playlist.id}`, options);
    }

    function openPublishDialog(playlist: Playlist) {
        setActiveItem(playlist);
        setShowPublishDialog(true);
    }

    function closePublishDialog() {
        setShowPublishDialog(false);
    }
};

export const PlaylistBrowser = withStyles(useStyles)( withFormik({
    handleSubmit() {},
    mapPropsToValues(): PlaylistBrowserFormValues {
        return {
            search: '',
            sort: PlaylistBrowserSortOptions.newestFirst,
        };
    },
})(RawPlaylistBrowser) );
