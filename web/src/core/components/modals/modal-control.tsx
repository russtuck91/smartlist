import { Modal, Theme, withStyles, WithStyles, Paper } from '@material-ui/core';
import * as React from 'react';

interface ModalControlProps {
    open: boolean;
    onClose: () => void;
    body: React.ReactElement;
}

const useStyles = (theme: Theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

type FullProps = ModalControlProps & WithStyles<typeof useStyles>;

export class RawModalControl extends React.Component<FullProps> {
    render() {
        const { classes, open, onClose, body } = this.props;

        return (
            <Modal
                className={classes.modal}
                open={open}
                onClose={onClose}
            >
                <Paper>
                    {body}
                </Paper>
            </Modal>
        );
    }
}

export const ModalControl = withStyles(useStyles)(RawModalControl);