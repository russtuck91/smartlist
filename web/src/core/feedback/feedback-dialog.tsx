import { Formik } from 'formik';
import React, { useState } from 'react';

import { sleep } from '../../../../shared';

import { requests } from '../requests/requests';
import { useFetchUserMe } from '../user/use-fetch-user-me';

import FeedbackDialogForm from './feedback-dialog-form';
import { FeedbackFormValues, FeedbackType } from './models';


interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    dialogTitle?: React.ReactNode;
    initialValues?: Partial<FeedbackFormValues>;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = (props) => {
    const { data: user } = useFetchUserMe();
    const [submitSuccess, setSubmitSuccess] = useState(false);

    return (
        <Formik
            initialValues={getDefaultFormValues()}
            enableReinitialize
            onSubmit={onSubmit}
        >
            {(formikProps) => (
                <FeedbackDialogForm
                    formik={formikProps}
                    isOpen={props.isOpen}
                    onClose={props.onClose}
                    submitSuccess={submitSuccess}
                    dialogTitle={props.dialogTitle}
                />
            )}
        </Formik>
    );

    function getDefaultFormValues(): FeedbackFormValues {
        return {
            email: user?.email || '',
            type: FeedbackType.General,
            message: '',
            ...props.initialValues,
        };
    }

    async function onSubmit(values: FeedbackFormValues) {
        // Submit to form service
        const extraHeaders = {
            Accept: 'application/json',
        };
        await requests.post('https://submit-form.com/JrTBGsMo', values, extraHeaders);

        setSubmitSuccess(true);
        await sleep(3000);
        props.onClose();
        setSubmitSuccess(false);
    }
};

export default FeedbackDialog;
