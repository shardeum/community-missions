import React from 'react';
import { Box } from '@material-ui/core';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { CheckCircle, Copy } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface CopyHelperProps {
  toCopy: string;
  children?: React.ReactNode;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ toCopy, children }) => {
  const [isCopied, setCopied] = useCopyClipboard();
  const { t } = useTranslation();

  return (
    <Box className='copyIcon' onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <>
          <CheckCircle size='20' />
          <small>{t('copied')}</small>
        </>
      ) : (
        <Copy size='20' />
      )}
      {isCopied ? '' : children}
    </Box>
  );
};

export default CopyHelper;
