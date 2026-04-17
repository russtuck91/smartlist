import {
    Box, Button, CircularProgress,
    Container, FormLabel, Grid, IconButton, List, Paper,
    StyleRules,
    Theme, Typography,
    WithStyles, withStyles, WithWidth, withWidth,
} from '@material-ui/core';
import { ArrowBack, FilterList } from '@material-ui/icons';
import { FormikProps } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import * as React from 'react';

import {
    convertEnumToArray,
    PlaylistRuleGroup, PlaylistTrackSortOption, RuleGroupType,
    Track,
} from '../../../../shared';

import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import { ErrorBoundary } from '../../core/errors/error-boundary';
import { CustomOptionRendererProps, DropdownField, TextField } from '../../core/forms/fields';
import goBackOrBackupUrl from '../../core/history/go-back-or-backup-url';
import logger from '../../core/logger/logger';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';
import { Nullable } from '../../core/shared-models/types';

import { PlaylistContainer } from '../playlist-container';

import ExceptionList from './exception-list';
import { DEFAULT_NEW_CONDITION, PlaylistBuilderFormValues } from './models';
import PlaylistPreviewArea from './playlist-preview-area';
import RefreshButton from './refresh-button';
import { RuleGroup } from './rule-group';
import TabSet from './tab-set';


export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    isEditMode: boolean;
    isLoading: boolean;
}

interface PlaylistBuilderFormState {
    listPreview?: Nullable<Track[]>;
    justLoadedPreview: boolean;
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
        flex: '1 1 auto',

        '& > .MuiListItem-root': {
            padding: 0,
        },
    },
    trackSortContainer: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
});

type FullProps = PlaylistBuilderFormProps & WithStyles<typeof useStyles> & WithWidth;

export class RawPlaylistBuilderForm extends React.Component<FullProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {
        listPreview: [],
        justLoadedPreview: false,
    };

    async componentDidMount() {
        await this.props.formik.validateForm();

        if (!this.props.isLoading) {
            this.getListPreview();
        }
    }

    componentDidUpdate(prevProps: FullProps) {
        // If values are reinitialized, new playlist data was loaded, then reload the preview
        if (!isEqual(this.props.formik.initialValues, prevProps.formik.initialValues)) {
            this.getListPreview();
        }

        // If whole rules list becomes empty, add 1 rule back
        if (this.props.formik.values.rules.length === 0 && prevProps.formik.values.rules.length > 0) {
            this.resetToOneRule();
        }
    }

    getListPreview = async () => {
        const { values } = this.props.formik;

        if (!this.areRulesValid()) {
            return;
        }
        this.setState({ listPreview: undefined });

        try {
            const list = await requests.post(`${PlaylistContainer.requestUrl}/populateList`, values);

            this.setState({
                listPreview: list,
                justLoadedPreview: true,
            });
            setTimeout(() => {
                this.setState({
                    justLoadedPreview: false,
                });
            }, 3000);
        } catch (e) {
            logger.error('Problem populating list for playlist', e);
            this.setState({ listPreview: null });
        }
    };

    resetToOneRule() {
        const { setFieldValue } = this.props.formik;

        const newRules = [ {
            type: RuleGroupType.And,
            rules: [ DEFAULT_NEW_CONDITION ],
        } ];
        setFieldValue('rules', newRules);
    }

    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column" overflow="auto">
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
                            {!this.isMobileScreenSize() && (
                                <Grid item>
                                    {this.renderRefreshButton()}
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                    {this.renderContentArea()}
                </form>
            </Container>
        );
    }

    private renderRefreshButton() {
        const { listPreview, justLoadedPreview } = this.state;
        const isLoading = listPreview === undefined;
        return (
            <RefreshButton
                isMobileScreenSize={this.isMobileScreenSize()}
                isLoading={isLoading}
                justLoadedPreview={justLoadedPreview}
                disabled={isLoading || !this.areRulesValid()}
                onClick={this.getListPreview}
            />
        );
    }

    private isMobileScreenSize() {
        return [ 'xs', 'sm' ].includes(this.props.width);
    }

    private renderContentArea() {
        if (this.isMobileScreenSize()) {
            return this.renderContentAsTabs();
        }

        return this.renderContentAsColumns();
    }

    private renderContentAsTabs() {
        return (
            <TabSet
                tabs={[
                    { label: 'Rules', render: this.renderFormArea },
                    { label: 'Except', render: this.renderExceptList },
                    {
                        label: (
                            <Box display="flex" alignItems="center">
                                <Box mr={0.5}>Songs</Box>
                                {this.renderRefreshButton()}
                            </Box>
                        ),
                        render: this.renderPreviewArea,
                    },
                ]}
            />
        );
    }

    private renderContentAsColumns() {
        return (
            <div className={this.props.classes.contentColumns}>
                <Grid container spacing={0}>
                    <Grid item xs>
                        {this.renderDesktopTabsArea()}
                    </Grid>
                    <Grid item xs>
                        {this.renderPreviewArea()}
                    </Grid>
                </Grid>
            </div>
        );
    }

    private renderDesktopTabsArea() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <TabSet
                    tabs={[
                        { label: 'Rules', render: this.renderFormArea },
                        { label: 'Except', render: this.renderExceptList },
                    ]}
                />
            </Box>
        );
    }

    private renderFormArea = () => {
        const { formik: { values }, classes } = this.props;

        return (
            <Box py={1} flexGrow={1} overflow="auto">
                <Paper className={classes.trackSortContainer}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <FormLabel>Sort tracks:</FormLabel>
                        </Grid>
                        <Grid item xs>
                            <DropdownField
                                id="trackSort"
                                options={convertEnumToArray(PlaylistTrackSortOption)}
                                IconComponent={FilterList}
                                customOptionRenderer={this.sortOrderRenderer}
                            />
                        </Grid>
                    </Grid>
                </Paper>
                <List disablePadding className={classes.formAreaList}>
                    {values.rules.map(this.renderRuleGroup)}
                </List>
            </Box>
        );
    };

    private sortOrderRenderer({ option }: CustomOptionRendererProps) {
        if (option === PlaylistTrackSortOption.SavedDate) {
            return 'Saved Date';
        }
        return option;
    }

    private renderRuleGroup = (ruleGroup: PlaylistRuleGroup, groupIndex: number) => {
        const thisItemTreeId = `rules[${groupIndex}]`;
        return (
            <ErrorBoundary key={groupIndex}>
                <RuleGroup
                    key={groupIndex}
                    formik={this.props.formik}
                    ruleGroup={ruleGroup}
                    treeId={thisItemTreeId}
                />
            </ErrorBoundary>
        );
    };

    private renderExceptList = () => {
        return (
            <ErrorBoundary>
                <Box py={1} flexGrow={1}>
                    <ExceptionList
                        formik={this.props.formik}
                        exceptions={this.props.formik.values.exceptions}
                    />
                </Box>
            </ErrorBoundary>
        );
    };

    private renderPreviewArea = () => {
        return (
            <ErrorBoundary>
                <PlaylistPreviewArea
                    listPreview={this.state.listPreview}
                />
            </ErrorBoundary>
        );
    };

    private onClickBackButton() {
        goBackOrBackupUrl(RouteLookup.playlists.base);
    }

    private areRulesValid(): boolean {
        return isEmpty(this.props.formik.errors.rules) && isEmpty(this.props.formik.errors.exceptions);
    }
}

export const PlaylistBuilderForm = withWidth()( withStyles(useStyles)(RawPlaylistBuilderForm) );
