import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core';
import * as React from 'react';

interface DialogControlProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    body: React.ReactElement;
}

export class DialogControl extends React.Component<DialogControlProps> {
    render() {
        const { open, onClose, onConfirm, body } = this.props;

        return (
            <Dialog
                open={open}
                onClose={onClose}
            >
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