import React from 'react';
import Shake from 'shake.js';

import FeedbackDialog from '../core/feedback/feedback-dialog';
import { FeedbackType } from '../core/feedback/models';


interface ShakeFeedbackState {
    showFeedbackDialog: boolean;
}

class ShakeFeedback extends React.Component<unknown, ShakeFeedbackState> {
    state = {
        showFeedbackDialog: false,
    };

    shakeEvent = new Shake({
        threshold: 4,
    });

    componentDidMount() {
        this.shakeEvent.start();
        window.addEventListener('shake', this.handleShake, false);
    }

    componentWillUnmount() {
        this.shakeEvent.stop();
        window.removeEventListener('shake', this.handleShake, false);
    }

    render() {
        return (
            <FeedbackDialog
                isOpen={this.state.showFeedbackDialog}
                onClose={this.closeFeedbackDialog}
                dialogTitle="Having issues? Let us know"
                initialValues={{
                    type: FeedbackType.Bug,
                }}
            />
        );
    }

    private handleShake = () => {
        this.openFeedbackDialog();
    }

    private openFeedbackDialog = () => {
        this.setState({
            showFeedbackDialog: true,
        });
    }

    private closeFeedbackDialog = () => {
        this.setState({
            showFeedbackDialog: false,
        });
    }
}

export default ShakeFeedback;
