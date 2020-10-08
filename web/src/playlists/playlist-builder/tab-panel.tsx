import { Box, Typography } from '@material-ui/core';
import * as React from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export default function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            style={{ overflow: 'scroll' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}
