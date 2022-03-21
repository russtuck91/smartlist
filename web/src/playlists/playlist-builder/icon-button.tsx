import { Button, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';


interface PlaylistIconButtonProps {
    onClick: () => void;
    className?: string;
}

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),

        '& .MuiSvgIcon-root': {
            fontSize: '1rem',
            marginRight: theme.spacing(1),
            marginTop: -2,
        },
    },
}));

const IconButton: React.FC<PlaylistIconButtonProps> = ({
    children,
    onClick,
    className,
    ...rest
}) => {
    const classes = useStyles();
    return (
        <Button
            {...rest}
            variant="outlined"
            className={classNames(className, classes.root)}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};

export default IconButton;
