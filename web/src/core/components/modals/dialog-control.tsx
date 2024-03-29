import {
    Button,
    Dialog, DialogActions, DialogContent, DialogProps, DialogTitle,
} from '@material-ui/core';
import * as React from 'react';

interface DialogControlProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    body: React.ReactNode;
    title?: React.ReactNode;

    confirmButtonText?: React.ReactNode;

    fullWidth?: boolean;
    maxWidth?: DialogProps['maxWidth'];
}

export class DialogControl extends React.Component<DialogControlProps> {
    static defaultProps: Partial<DialogControlProps> = {
        confirmButtonText: 'Confirm',
    };

    render() {
        const { onClose, onConfirm, title } = this.props;

        return (
            <Dialog
                open={this.props.open}
                onClose={onClose}
                fullWidth={this.props.fullWidth}
                maxWidth={this.props.maxWidth}
            >
                {title ? (
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                ) : null}
                <DialogContent>
                    {this.props.body}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={onConfirm}>
                        {this.props.confirmButtonText}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
