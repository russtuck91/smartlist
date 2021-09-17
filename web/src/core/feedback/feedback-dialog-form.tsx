import { CircularProgress, Grid } from '@material-ui/core';
import { FormikProps } from 'formik';
import React from 'react';

import { convertEnumToArray } from '../../../../shared';

import { DialogControl } from '../components/modals/dialog-control';
import { ToggleButtonField } from '../forms/fields';
import { TextField } from '../forms/fields/text-field';

import { FeedbackFormValues, FeedbackType } from './models';


const feedbackTypes = convertEnumToArray(FeedbackType);

interface FeedbackDialogFormProps {
    formik: FormikProps<FeedbackFormValues>;
    isOpen: boolean;
    onClose: () => void;
    submitSuccess: boolean;
}

class FeedbackDialogForm extends React.Component<FeedbackDialogFormProps> {
    componentDidUpdate(prevProps: FeedbackDialogFormProps) {
        if (prevProps.isOpen && !this.props.isOpen) {
            this.onModalClose();
        }
    }

    onModalClose() {
        this.props.formik.resetForm();
    }

    render() {
        return (
            <DialogControl
                open={this.props.isOpen}
                onClose={this.props.onClose}
                onConfirm={this.props.formik.submitForm}
                title="Feedback"
                body={this.renderFeedbackDialogBody()}

                confirmButtonText={this.renderConfirmButtonText()}

                fullWidth
                maxWidth="sm"
            />
        );
    }

    private renderFeedbackDialogBody() {
        return (
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <TextField
                        id="email"
                        label="Email"
                    />
                </Grid>
                <Grid item>
                    <ToggleButtonField
                        id="type"
                        label="Feedback type"
                        options={feedbackTypes}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        id="message"
                        label="Message"
                        multiline
                        variant="outlined"
                        rows={4}
                        required
                    />
                </Grid>
            </Grid>
        );
    }

    private renderConfirmButtonText() {
        if (this.props.submitSuccess) {
            return 'Thank you!';
        }
        if (this.props.formik.isSubmitting) {
            return <CircularProgress size={24} />;
        }
        return 'Send Feedback';
    }
}

export default FeedbackDialogForm;
