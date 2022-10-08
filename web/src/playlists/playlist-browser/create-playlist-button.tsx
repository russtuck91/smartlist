import {
    Fab, IconButton, Link,
    StyleRules, Theme, WithStyles, withStyles,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import React from 'react';
import { isIOS } from 'react-device-detect';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from '../../core/routes/route-lookup';


interface CreatePlaylistButtonProps {
    iosVersion?: boolean;
}

const useStyles = (theme: Theme): StyleRules => ({
    root: {},
    fab: {
        position: 'absolute',
        bottom: theme.spacing(7),
        right: theme.spacing(1),
        [theme.breakpoints.up('lg')]: {
            right: `calc((100vw - ${theme.breakpoints.width('lg')}px) / 4 - 16px)`,
        },
        zIndex: 10,
    },
});

type FullProps = CreatePlaylistButtonProps & WithStyles<typeof useStyles>;

const RawCreatePlaylistButton: React.FC<FullProps> = ({
    classes,
    iosVersion,
}) => {
    function renderSpecialCaseButtons() {
        if (!iosVersion && isIOS) { return null; }
        if (iosVersion) {
            if (!isIOS) { return null; }
            return (
                <IconButton>
                    <Add />
                </IconButton>
            );
        }
    }

    function renderButton() {
        const specialCaseButton = renderSpecialCaseButtons();
        if (specialCaseButton !== undefined) { return specialCaseButton; }
        return (
            <Fab className={classes.fab} color="primary">
                <Add />
            </Fab>
        );
    }

    return (
        <Link to={RouteLookup.playlists.create} component={RouterLink} underline="none">
            {renderButton()}
        </Link>
    );
};

const CreatePlaylistButton = withStyles(useStyles)(RawCreatePlaylistButton);

export default CreatePlaylistButton;

