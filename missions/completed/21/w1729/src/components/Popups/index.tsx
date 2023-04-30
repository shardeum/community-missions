import React from 'react';
import { Box } from '@material-ui/core';
import { useActivePopups } from 'state/application/hooks';
import { useURLWarningVisible } from 'state/user/hooks';
import PopupItem from './PopupItem';
import 'components/styles/Popups.scss';

const Popups: React.FC = () => {
  // get all popups
  const activePopups = useActivePopups();
  const urlWarningActive = useURLWarningVisible();

  return (
    <>
      <Box
        className='fixedPopupColumn'
        top={urlWarningActive ? '108px' : '88px'}
      >
        {activePopups.map((item) => (
          <PopupItem
            key={item.key}
            content={item.content}
            popKey={item.key}
            removeAfterMs={item.removeAfterMs}
          />
        ))}
      </Box>
      <Box
        className='mobilePopupWrapper'
        height={activePopups?.length > 0 ? 'fit-content' : 0}
        margin={activePopups?.length > 0 ? '0 auto 20px' : 0}
      >
        <Box className='mobilePopupInner'>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            ))}
        </Box>
      </Box>
    </>
  );
};

export default Popups;
