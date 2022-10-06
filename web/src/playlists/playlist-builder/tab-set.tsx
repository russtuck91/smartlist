import {
    Tab, Tabs,
    Theme, WithStyles, withStyles,
} from '@material-ui/core';
import React, { useState } from 'react';

import TabPanel from './tab-panel';


interface TabSetProps {
    tabs: ({
        label: string;
        render: () => React.ReactNode;
    })[];
}

const useStyles = (theme: Theme) => ({
    tabBar: {
        backgroundColor: theme.palette.background.default,
    },
});

type FullProps = TabSetProps & WithStyles<typeof useStyles>;

const RawTabSet: React.FC<FullProps> = ({
    tabs,
    classes,
}) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const onTabChange = (event: React.ChangeEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <Tabs
                className={classes.tabBar}
                value={selectedTab}
                onChange={onTabChange}
                indicatorColor="primary"
                centered
            >
                {tabs.map((tab, index) => (
                    <Tab key={index} label={tab.label} />
                ))}
            </Tabs>
            {tabs.map((tab, index) => (
                <TabPanel key={index} index={index} value={selectedTab}>
                    {tab.render()}
                </TabPanel>
            ))}
        </>
    );
};

const TabSet = withStyles(useStyles)(RawTabSet);

export default TabSet;
