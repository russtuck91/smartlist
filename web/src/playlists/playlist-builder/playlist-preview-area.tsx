import {
    Avatar, Box, Grid, StyleRules, Theme, Typography,
    WithStyles, withStyles,
} from '@material-ui/core';
import { Error } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import React from 'react';
import LazyLoad from 'react-lazyload';

import { Track } from '../../../../shared';

import Ellipsis from '../../core/components/ellipsis';
import { VirtualTableRenderer } from '../../core/components/tables';
import { ColumnFormatType, ColumnSet, CustomCellFormatterProps, FooterLabelRendererProps } from '../../core/components/tables/models';
import SmTooltip from '../../core/components/tooltips/sm-tooltip';
import { Nullable } from '../../core/shared-models/types';

import { TrackRowDetails } from './track-row-details';


interface PlaylistPreviewAreaProps {
    listPreview?: Nullable<Track[]>;
}

const useStyles = (theme: Theme): StyleRules => ({
    previewArea: {
        '& .MuiTable-root': {
            tableLayout: 'fixed',
        },
        '& .MuiTableCell-root': {
            width: '100%',
            color: theme.palette.text.secondary,
        },
        '& .MuiAvatar-root': {
            '& img': {
                maxWidth: '100%',
            },
        },
        '& .MuiSkeleton-root': {
            '& .MuiAvatar-root': {
                '& .MuiAvatar-fallback': {
                    display: 'none',
                },
            },
        },
    },
});

type FullProps = PlaylistPreviewAreaProps & WithStyles<typeof useStyles>;

class RawPlaylistPreviewArea extends React.Component<FullProps> {
    private listPreviewColumnSet: ColumnSet<Track> = [
        { title: 'Name', mapsToField: 'name', type: ColumnFormatType.TrackName, width: '60%' },
        { title: 'Album', mapsToField: 'albumName', type: ColumnFormatType.Ellipsis, width: '40%' },
    ];

    render() {
        return (
            <Box className={this.props.classes.previewArea} flex="1 1 auto" display="flex" justifyContent="center">
                {this.renderPreviewContent()}
            </Box>
        );
    }

    private renderPreviewContent() {
        const { listPreview } = this.props;

        if (listPreview === null) {
            return (
                <Box>
                    <Alert severity="error">There was a problem loading the playlist. Please try again.</Alert>
                </Box>
            );
        }

        return (
            <VirtualTableRenderer
                data={listPreview || []}
                columns={this.listPreviewColumnSet}

                isLoading={listPreview === undefined}
                customCellFormatter={this.cellFormatter}
                footerLabel={this.renderFooterLabel}
                expandableRows={{
                    renderExpandedRow: this.renderExpandedRow,
                }}
            />
        );
    }

    private cellFormatter = ({ cellValue, column, rowData, isLoading }: CustomCellFormatterProps<Track>) => {
        if (column.type === ColumnFormatType.TrackName) {
            return (
                <Grid container wrap="nowrap" spacing={1}>
                    <Grid item>
                        {isLoading ? (
                            <Skeleton variant="rect">
                                <Avatar variant="square" />
                            </Skeleton>
                        ) : (
                            <Avatar variant="square">
                                <LazyLoad overflow offset={5000}>
                                    <img src={rowData.albumThumbnail} />
                                </LazyLoad>
                            </Avatar>
                        )}
                    </Grid>
                    <Grid item xs style={{ overflow: 'hidden' }}>
                        {isLoading ? <Skeleton /> : <Typography color="textPrimary" component="div"><Ellipsis>{cellValue}</Ellipsis></Typography>}
                        {isLoading ? <Skeleton /> : <Ellipsis>{rowData.artistNames.join(', ')}</Ellipsis>}
                    </Grid>
                </Grid>
            );
        }
    };

    private renderFooterLabel({ count }: FooterLabelRendererProps) {
        return (
            <>
                tracks
                {' '}
                {count > 10000 && (
                    <SmTooltip title="Playlists are limited to 10,000 songs, anything more than that won't be published">
                        <Error color="error" />
                    </SmTooltip>
                )}
            </>
        );
    }

    private renderExpandedRow(rowData: Track) {
        return (
            <TrackRowDetails
                track={rowData}
            />
        );
    }
}

const PlaylistPreviewArea = withStyles(useStyles)(RawPlaylistPreviewArea);

export default PlaylistPreviewArea;
