import React from 'react';
import { Box } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import 'components/styles/CustomMenu.scss';

interface CustomMenuItem {
  text: string;
  onClick: () => void;
}

interface CustomMenuProps {
  title: string;
  menuItems: CustomMenuItem[];
}

const CustomMenu: React.FC<CustomMenuProps> = ({ title, menuItems }) => {
  const [openMenu, setOpenMenu] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<CustomMenuItem | null>(null);
  return (
    <>
      <Box className='customMenuWrapper' onClick={() => setOpenMenu(!openMenu)}>
        <small>
          {title} {menuItem?.text}
        </small>
        {openMenu ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openMenu && (
        <Box className='menuContent'>
          {menuItems.map((item, index) => (
            <Box
              my={1}
              key={index}
              onClick={() => {
                item.onClick();
                setOpenMenu(false);
                setMenuItem(item);
              }}
            >
              <small className='text-secondary'>{item.text}</small>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default CustomMenu;
