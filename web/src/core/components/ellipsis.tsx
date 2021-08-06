import { StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';


interface EllipsisProps {
}

const useStyles = (theme: Theme): StyleRules => ({
    root: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
});

type FullProps = EllipsisProps & WithStyles<typeof useStyles>;

const RawEllipsis: React.FC<FullProps> = ({
    children,
    classes,
}) => {
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
};

const Ellipsis = withStyles(useStyles)(RawEllipsis);

export default Ellipsis;
