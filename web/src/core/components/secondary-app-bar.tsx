import {
    AppBar, Theme, Toolbar,
    WithStyles, withStyles,
} from '@material-ui/core';
import React from 'react';
import { isBrowser } from 'react-device-detect';

interface SecondaryAppBarProps {
}

const useStyles = (theme: Theme) => ({
    root: {
        backgroundColor: theme.palette.primary['400'],
        boxShadow: isBrowser ? 'rgb(0 0 0 / 15%) 0 3px 3px inset' : undefined,
    },
});

type FullProps = SecondaryAppBarProps & WithStyles<typeof useStyles>;

export class RawSecondaryAppBar extends React.Component<FullProps> {
    render() {
        return (
            <AppBar position="relative" className={this.props.classes.root}>
                <Toolbar>
                    {this.props.children}
                </Toolbar>
            </AppBar>
        );
    }
}

export const SecondaryAppBar = withStyles(useStyles)(RawSecondaryAppBar);
