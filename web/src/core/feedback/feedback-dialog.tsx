import { Formik } from 'formik';
import React from 'react';

import { sleep } from '../../../../shared';

import { baseRequestUrl, requests } from '../requests/requests';

import FeedbackDialogForm from './feedback-dialog-form';
import { FeedbackFormValues, FeedbackType } from './models';


interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    dialogTitle?: React.ReactNode;
    initialValues?: Partial<FeedbackFormValues>;
}

interface FeedbackDialogState {
    userInfo?: SpotifyApi.CurrentUsersProfileResponse;
    submitSuccess: boolean;
}

class FeedbackDialog extends React.Component<FeedbackDialogProps, FeedbackDialogState> {
    state: FeedbackDialogState = {
        submitSuccess: false,
    };

    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        return (
            <Formik
                initialValues={this.getDefaultFormValues()}
                enableReinitialize
                onSubmit={this.onSubmit}
            >
                {(formikProps) => (
                    <FeedbackDialogForm
                        formik={formikProps}
                        isOpen={this.props.isOpen}
                        onClose={this.props.onClose}
                        submitSuccess={this.state.submitSuccess}
                        dialogTitle={this.props.dialogTitle}
                    />
                )}
            </Formik>
        );
    }

    private async getUserInfo() {
        const url = `${baseRequestUrl}/users/me`;
        const userInfo = await requests.get(url);

        this.setState({
            userInfo: userInfo,
        });
    }

    private getDefaultFormValues(): FeedbackFormValues {
        return {
            email: this.state.userInfo?.email || '',
            type: FeedbackType.General,
            message: '',
            ...this.props.initialValues,
        };
    }

    private onSubmit = async (values: FeedbackFormValues) => {
        // Submit to form service
        const extraHeaders = {
            Accept: 'application/json',
        };
        await requests.post('https://submit-form.com/JrTBGsMo', values, extraHeaders);

        this.setState({
            submitSuccess: true,
        }, async () => {
            await sleep(3000);
            this.props.onClose();
            this.setState({
                submitSuccess: false,
            });
        });
    }
}

export default FeedbackDialog;
