import {
    Box, Button, CircularProgress,
    Container, Grid, IconButton, List,
    StyleRules,
    Tab, Tabs,
    Theme, Typography,
    WithStyles, withStyles, WithWidth, withWidth,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { FormikProps } from 'formik';
import { isEmpty } from 'lodash';
import * as React from 'react';

import { PlaylistRuleGroup } from '../../../../shared';

import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import { ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { TextField } from '../../core/forms/fields';
import { history } from '../../core/history/history';
import logger from '../../core/logger/logger';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { Nullable } from '../../core/shared-models/types';

import { PlaylistContainer } from '../playlist-container';

import { PlaylistBuilderFormValues } from './models';
import { RuleGroup } from './rule-group';
import TabPanel from './tab-panel';


export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    isEditMode: boolean;
    isLoading: boolean;
}

interface PlaylistBuilderFormState {
    listPreview?: Nullable<SpotifyApi.TrackObjectFull[]>;
    selectedTab: number;
}

const useStyles = (theme: Theme): StyleRules => ({
    container: {
        overflowY: 'auto',
        display: 'flex',
        flex: '1 1 auto',

        '& .MuiTable-root': {
            minHeight: '100%',
        },
    },
    form: {
        overflowY: 'auto',
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        paddingTop: theme.spacing(1),
    },
    tabBar: {
        backgroundColor: theme.palette.background.default,
    },
    contentColumns: {
        overflowY: 'auto',
        display: 'flex',
        flex: '1 1 auto',
        '& > .MuiGrid-container > .MuiGrid-item': {
            overflowY: 'auto',
            height: '100%',
            display: 'flex',
            '&:not(:first-child)': {
                marginLeft: theme.spacing(1),
            },
            '&:not(:last-child)': {
                marginRight: theme.spacing(1),
            },
        },
    },
    formAreaList: {
        '& > .MuiListItem-root': {
            padding: 0,
        },
    },
});

type FullProps = PlaylistBuilderFormProps & WithStyles<typeof useStyles> & WithWidth;

export class RawPlaylistBuilderForm extends React.Component<FullProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {
        listPreview: [],
        selectedTab: 0,
    };

    private listPreviewColumnSet: ColumnSet<SpotifyApi.TrackObjectFull> = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Artist', mapsToField: 'artists[0].name' },
        { title: 'Album', mapsToField: 'album.name' },
    ];

    async componentDidMount() {
        await this.props.formik.validateForm();

        this.getListPreview();
    }

    getListPreview = async () => {
        const { values } = this.props.formik;

        if (!this.areRulesValid()) {
            return;
        }
        this.setState({ listPreview: undefined });

        try {
            const list = await requests.post(`${PlaylistContainer.requestUrl}/populateList`, values.rules);

            this.setState({
                listPreview: list,
            });
        } catch (e) {
            logger.error('Problem populating list for playlist', e);
            this.setState({ listPreview: null });
        }
    }

    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <SecondaryAppBar>
                    <IconButton onClick={this.onClickBackButton}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6">
                        {this.props.isEditMode ? 'Edit Playlist' : 'Create Playlist'}
                    </Typography>
                </SecondaryAppBar>
                {this.renderFormContainer()}
            </Box>
        );
    }

    renderFormContainer() {
        const { classes, formik: { handleSubmit, values, isValid, isSubmitting }, isLoading } = this.props;

        if (isLoading) {
            return (
                <Box flex="1 1 auto" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <Container className={classes.container}>
                <form className={classes.form} onSubmit={handleSubmit}>
                    <Box my={1} overflow="hidden" flexShrink={0}>
                        <Grid container spacing={2} alignItems="flex-end">
                            <Grid item xs>
                                <TextField
                                    id="name"
                                    value={values.name}
                                    label="Name"
                                    required
                                />
                            </Grid>
                            <Grid item>
                                <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>Save</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" disabled={!this.areRulesValid()} onClick={this.getListPreview}>Refresh</Button>
                            </Grid>
                        </Grid>
                    </Box>
                    {this.renderContentArea()}
                </form>
            </Container>
        );
    }

    private renderContentArea() {
        if ([ 'xs', 'sm' ].includes(this.props.width)) {
            return this.renderContentAsTabs();
        }

        return this.renderContentAsColumns();
    }

    private renderContentAsTabs() {
        const { selectedTab } = this.state;

        return (
            <>
                <Tabs
                    className={this.props.classes.tabBar}
                    value={selectedTab}
                    onChange={this.onTabChange}
                    indicatorColor="primary"
                    centered
                >
                    <Tab label="Rules" />
                    <Tab label="Songs" />
                </Tabs>
                <TabPanel value={selectedTab} index={0}>
                    <Box py={1}>
                        {this.renderFormArea()}
                    </Box>
                </TabPanel>
                <TabPanel value={selectedTab} index={1}>
                    {this.renderPreviewArea()}
                </TabPanel>
            </>
        );
    }

    private renderContentAsColumns() {
        return (
            <div className={this.props.classes.contentColumns}>
                <Grid container spacing={0}>
                    <Grid item xs>
                        {this.renderFormArea()}
                    </Grid>
                    <Grid item xs>
                        {this.renderPreviewArea()}
                    </Grid>
                </Grid>
            </div>
        );
    }

    private renderFormArea() {
        const { formik: { values }, classes } = this.props;

        return (
            <List disablePadding className={classes.formAreaList}>
                {values.rules.map((rule, index) => this.renderRuleGroup(rule, index))}
            </List>
        );
    }

    private renderRuleGroup = (ruleGroup: PlaylistRuleGroup, groupIndex: number, treeIdPrefix = '') => {
        const thisItemTreeId = `${treeIdPrefix ? `${treeIdPrefix }.` : ''}rules[${groupIndex}]`;
        return (
            <RuleGroup
                key={groupIndex}
                formik={this.props.formik}
                ruleGroup={ruleGroup}
                treeId={thisItemTreeId}
            />
        );
    }

    private renderPreviewArea() {
        return (
            <Box flex="1 1 auto" display="flex" justifyContent="center">
                {this.renderPreviewContent()}
            </Box>
        );
    }

    private renderPreviewContent() {
        const { listPreview } = this.state;

        if (listPreview === undefined) {
            return <CircularProgress />;
        }

        if (listPreview === null) {
            return <Alert severity="error">There was a problem loading the playlist. Please try again.</Alert>;
        }

        return (
            <TableRenderer
                data={listPreview}
                columns={this.listPreviewColumnSet}

                stickyHeader
                footerLabel="tracks"
            />
        );
    }

    private onClickBackButton() {
        history.push(RouteLookup.playlists.base);
    }

    private onTabChange = (event: React.ChangeEvent, newValue: number) => {
        this.setState({
            selectedTab: newValue,
        });
    }

    private areRulesValid(): boolean {
        return isEmpty(this.props.formik.errors.rules);
    }
}

export const PlaylistBuilderForm = withWidth()( withStyles(useStyles)(RawPlaylistBuilderForm) );
