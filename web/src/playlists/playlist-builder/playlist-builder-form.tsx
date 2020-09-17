import { Button, CircularProgress, Grid, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { FormikProps } from 'formik';
import { isEmpty } from 'lodash';
import * as React from 'react';

import { PlaylistRuleGroup } from '../../../../shared';

import { ColumnSet } from '../../core/components/tables/models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { TextField } from '../../core/forms/fields';
import { requests } from '../../core/requests/requests';
import { Nullable } from '../../core/shared-models/types';

import { PlaylistContainer } from '../playlist-container';
import { PlaylistBuilderFormValues } from './models';
import { RuleGroup } from './rule-group';


export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
}

interface PlaylistBuilderFormState {
    listPreview?: Nullable<SpotifyApi.TrackObjectFull[]>;
}

const useStyles = (theme: Theme) => {
    const rules: StyleRules = {
        previewArea: {
            position: 'fixed',
            top: 65,
            bottom: 0,
            overflowY: 'auto'
        }
    };
    return rules;
};

type FullProps = PlaylistBuilderFormProps & WithStyles<typeof useStyles>;

export class RawPlaylistBuilderForm extends React.Component<FullProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {
        listPreview: []
    };

    private listPreviewColumnSet: ColumnSet<SpotifyApi.TrackObjectFull> = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Artist', mapsToField: 'artists[0].name' },
        { title: 'Album', mapsToField: 'album.name' }
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
                listPreview: list
            });
        } catch (e) {
            console.log(e);
            this.setState({ listPreview: null });
        }
    }

    render() {
        const { formik } = this.props;
        const { handleSubmit } = formik;

        return (
            <form id="playlist-builder" onSubmit={handleSubmit}>
                <h5>Playlist Builder</h5>
                <Grid container spacing={2}>
                    <Grid item xs>
                        {this.renderFormArea()}
                    </Grid>
                    <Grid item xs>
                        {this.renderPreviewArea()}
                    </Grid>
                </Grid>
            </form>
        );
    }

    private renderFormArea() {
        const { formik } = this.props;
        const { values, isValid, isSubmitting } = formik;

        return (
            <Grid container spacing={2}>
                <Grid item container spacing={2} alignItems="flex-end">
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
                {this.renderRulesFormArea()}
            </Grid>
        );
    }

    private renderRulesFormArea() {
        const { values } = this.props.formik;
        return (
            <Grid item container>
                {values.rules.map((rule, index) => this.renderRuleGroup(rule, index))}
            </Grid>
        );
    }

    private renderRuleGroup = (ruleGroup: PlaylistRuleGroup, groupIndex: number, treeIdPrefix = '') => {
        const thisItemTreeId = `${treeIdPrefix ? treeIdPrefix + '.' : ''}rules[${groupIndex}]`;
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
        const { classes } = this.props;
        return (
            <div className={classes.previewArea}>
                {this.renderPreviewContent()}
            </div>
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
            />
        );
    }

    private areRulesValid(): boolean {
        return isEmpty(this.props.formik.errors.rules);
    }
}

export const PlaylistBuilderForm = withStyles(useStyles)(RawPlaylistBuilderForm);