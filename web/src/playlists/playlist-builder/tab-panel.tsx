import { Box } from '@material-ui/core';
import * as React from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export default function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;

    const isShown = value === index;
    return (
        <Box
            role="tabpanel"
            display={isShown ? 'flex' : undefined}
            flex="1 1 auto"
            justifyContent="center"
            overflow="auto"
            hidden={!isShown}
        >
            {isShown && (
                <Box display="flex" flex="1 1 auto">
                    {children}
                </Box>
            )}
        </Box>
    );
}
