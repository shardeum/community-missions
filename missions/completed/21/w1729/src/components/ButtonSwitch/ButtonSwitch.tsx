import React from 'react';
import { Box, Tab, Tabs } from '@material-ui/core';
import 'components/styles/ButtonSwitch.scss';

interface Item {
  label: React.ReactNode;
  icon?: any;
  value: string;
}

interface ButtonSwitchProps {
  items?: Item[];
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  padding?: number;
  width?: number | string;
}

const ButtonSwitch: React.FC<ButtonSwitchProps> = ({
  items = [],
  height = 44,
  padding = 5,
  width = '100%',
  value,
  onChange,
}) => {
  const minHeight = height - padding * 2;

  return (
    <Box width={width} maxWidth='100%' display='inline-block'>
      <Box className='buttonSwitchContainer' padding={`${padding}px`}>
        <Tabs
          style={{ minHeight }}
          value={value}
          variant='fullWidth'
          onChange={(event, newValue) => {
            onChange && onChange(newValue);
          }}
          classes={{
            indicator: 'indicator',
          }}
        >
          {items.map((tab, index) => {
            return (
              <Tab
                key={index}
                disableRipple={true}
                label={
                  Array.isArray(tab.label)
                    ? tab.label.map((item, index) => (
                        <span key={index}>{item}</span>
                      ))
                    : tab.label
                }
                value={tab.value}
                wrapped
                className={`tab ${
                  value === tab.value ? 'tabActive' : 'tabInactive'
                }`}
                style={{
                  minHeight: minHeight,
                  height: minHeight,
                }}
              />
            );
          })}
        </Tabs>
      </Box>
    </Box>
  );
};

export default ButtonSwitch;
