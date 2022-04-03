import { ClickAwayListener, IconButton, StyleRules, Tooltip, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';


interface SmTooltipProps {
    children: React.ReactElement;
    title: React.ReactNode;
}

const useStyles = (): StyleRules => ({
    tooltip: {
        margin: 0,
        fontSize: '0.875rem',
        textAlign: 'center',
    },
    iconButton: {
        padding: 0,
    },
});

type FullProps = SmTooltipProps & WithStyles<typeof useStyles>;

const RawSmTooltip: React.FC<FullProps> = ({
    children,
    title,
    classes,
}) => {
    const [open, setOpen] = React.useState(false);

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!open);
    };

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
                <Tooltip
                    open={open}
                    onOpen={handleTooltipOpen}
                    onClose={handleTooltipClose}
                    title={title}
                    classes={{
                        tooltip: classes.tooltip,
                    }}
                >
                    <IconButton onClick={handleTooltipToggle} size="small" className={classes.iconButton}>
                        {children}
                    </IconButton>
                </Tooltip>
            </div>
        </ClickAwayListener>
    );
};

const SmTooltip = withStyles(useStyles)(RawSmTooltip);

export default SmTooltip;
