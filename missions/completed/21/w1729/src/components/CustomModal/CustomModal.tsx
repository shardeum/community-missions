import React from 'react';
import { Modal, Box, Backdrop, Fade } from '@material-ui/core';
import 'components/styles/CustomModal.scss';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: any;
  background?: string;
  overflow?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box className='modalWrapper' bgcolor={background} overflow={overflow}>
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

export default CustomModal;
