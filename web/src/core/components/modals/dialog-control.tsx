import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import * as React from 'react';

interface DialogControlProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    body: React.ReactElement;
    title?: React.ReactNode;
}

export class DialogControl extends React.Component<DialogControlProps> {
    render() {
        const { open, onClose, onConfirm, body, title } = this.props;

        return (
            <Dialog
                open={open}
                onClose={onClose}
            >
                {title ? (
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                ) : null}
                <DialogContent>
                    {body}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={onConfirm}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
