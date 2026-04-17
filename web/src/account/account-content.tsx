import { Box, Button, Container, Link } from '@material-ui/core';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { User } from '../../../shared';

import FeedbackDialog from '../core/feedback/feedback-dialog';
import { RouteLookup } from '../core/routes/route-lookup';
import UserPermissionError from '../core/user/user-permission-error';


interface AccountContentProps {
    user: User;
}

const AccountContent: React.FC<AccountContentProps> = ({
    user,
}) => {
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

    return (
        <Container>
            <Box my={3}>
                <h2>
                    Logged in as
                    {' '}
                    {user.username}
                </h2>
                <UserPermissionError />
                <div>
                    ID:
                    {' '}
                    {user.username}
                </div>
                <div>
                    Email:
                    {' '}
                    {user.email}
                </div>

                <Box mt={4}>
                    <p>
                        <Button variant="contained" color="primary" onClick={() => setShowFeedbackDialog(true)}>
                            Send Feedback
                        </Button>
                    </p>
                    <p>
                        <Link component={RouterLink} underline="none" to={RouteLookup.logout}>
                            <Button variant="contained" color="primary">Log Out</Button>
                        </Link>
                    </p>
                </Box>
            </Box>

            <FeedbackDialog
                isOpen={showFeedbackDialog}
                onClose={() => setShowFeedbackDialog(false)}
            />
        </Container>
    );
};

export default AccountContent;
