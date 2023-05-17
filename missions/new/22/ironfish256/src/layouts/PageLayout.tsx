import React, { useEffect, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Header, Footer, BetaWarningBanner, CustomModal } from 'components';
import Background from './Background';
import { useIsProMode } from 'state/application/hooks';

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();
  const [openPassModal, setOpenPassModal] = useState(false);
  const getPageWrapperClassName = () => {
    if (isProMode) {
      return '';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  };
  useEffect(() => {
    const unlisten = history.listen((location) => {
      updateIsProMode(false);
    });
    return function cleanup() {
      unlisten();
    };
  }, [history, updateIsProMode]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'localhost:3000'
    ) {
      setOpenPassModal(false);
    }
  }, []);

  const PasswordModal = () => {
    const [devPass, setDevPass] = useState('');
    const confirmPassword = () => {
      if (devPass === 'devPass') {
        setOpenPassModal(false);
      }
    };
    return (
      <CustomModal open={openPassModal} onClose={confirmPassword}>
        <Box className='devPassModal'>
          <p>Please input password to access dev site.</p>
          <input
            type='password'
            value={devPass}
            onChange={(e) => {
              setDevPass(e.target.value);
            }}
          />
          <Box textAlign='right'>
            <Button onClick={confirmPassword}>Confirm</Button>
          </Box>
        </Box>
      </CustomModal>
    );
  };

  return (
    <Box className='page'>
      {openPassModal && <PasswordModal />}
      {/* <BetaWarningBanner /> */}
      <Header />
      {!isProMode && <Background fallback={false} />}
      <Box className={getPageWrapperClassName()}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
