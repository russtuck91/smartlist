import {
    Box, Button, CircularProgress, Fade, IconButton,
    makeStyles, Theme,
} from '@material-ui/core';
import { Check, Refresh } from '@material-ui/icons';
import React from 'react';


interface RefreshButtonIconProps {
    isMobileScreenSize: boolean;
    isLoading: boolean;
    justLoadedPreview: boolean;
    disabled: boolean;
    onClick: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        fontSize: theme.spacing(2.25),
    },
}));

const RefreshButton: React.FC<RefreshButtonIconProps> = ({
    isMobileScreenSize,
    isLoading,
    justLoadedPreview,
    disabled,
    onClick,
}) => {
    const classes = useStyles();

    if (isMobileScreenSize) {
        return renderSmallScreen();
    }
    return renderFullSize();

    function renderSmallScreen() {
        return (
            <IconButton
                size="small"
                aria-label="Refresh"
                title="Refresh"
                disabled={disabled}
                onClick={onClick}
            >
                <Fade in>
                    {renderIcon()}
                </Fade>
            </IconButton>
        );
    }

    function renderFullSize() {
        return (
            <Button
                variant="contained"
                disabled={disabled}
                onClick={onClick}
            >
                {renderIcon()}
                <Box ml={1}>Refresh</Box>
            </Button>
        );
    }

    function renderIcon() {
        if (isLoading) {
            return <CircularProgress size={18} />;
        }
        if (justLoadedPreview) {
            return <Check className={classes.icon} />;
        }
        return <Refresh className={classes.icon} />;
    }
};

export default RefreshButton;
