import { Box, Button, CircularProgress, Container, Link, Typography } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { SecondaryAppBar } from '../core/components/secondary-app-bar';
import FeedbackDialog from '../core/feedback/feedback-dialog';
import { baseRequestUrl, requests } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';

interface AccountState {
    userInfo?: SpotifyApi.CurrentUsersProfileResponse;
    showFeedbackDialog: boolean;
}

export class Account extends React.Component<any, AccountState> {
    state: AccountState = {
        showFeedbackDialog: false,
    };

    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <SecondaryAppBar>
                    <Typography variant="h6">
                        Account
                    </Typography>
                </SecondaryAppBar>
                <Container>
                    <Box my={3}>
                        {this.renderUserInfo()}
                        <Box mt={4}>
                            <p>
                                <Button variant="contained" color="primary" onClick={this.openFeedbackDialog}>Send Feedback</Button>
                            </p>
                            <p>
                                <Link component={RouterLink} underline="none" to={RouteLookup.logout}>
                                    <Button variant="contained" color="primary">Log Out</Button>
                                </Link>
                            </p>
                        </Box>
                    </Box>
                    {this.renderFeedbackDialog()}
                </Container>
            </Box>
        );
    }

    private async getUserInfo() {
        const url = `${baseRequestUrl}/users/me`;
        const userInfo = await requests.get(url);

        this.setState({
            userInfo: userInfo,
        });
    }

    private renderUserInfo() {
        const { userInfo } = this.state;

        if (!userInfo) {
            return <CircularProgress />;
        }

        return (
            <>
                <h2>
                    Logged in as
                    {' '}
                    {userInfo.display_name}
                </h2>
                {userInfo.images && userInfo.images.length > 0 ? (
                    <div><img src={userInfo.images[0].url} /></div>
                ) : null}
                <div>
                    Display name:
                    {' '}
                    {userInfo.display_name}
                </div>
                <div>
                    ID:
                    {' '}
                    {userInfo.id}
                </div>
                <div>
                    Email:
                    {' '}
                    {userInfo.email}
                </div>
            </>
        );
    }

    private renderFeedbackDialog() {
        return (
            <FeedbackDialog
                isOpen={this.state.showFeedbackDialog}
                onClose={this.closeFeedbackDialog}
            />
        );
    }

    private openFeedbackDialog = () => {
        this.setState({
            showFeedbackDialog: true,
        });
    };

    private closeFeedbackDialog = () => {
        this.setState({
            showFeedbackDialog: false,
        });
    };
}
