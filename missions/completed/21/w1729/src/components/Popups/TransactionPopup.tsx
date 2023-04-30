import React, { useEffect } from 'react';
import { Box, LinearProgress } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils/index';
import { ReactComponent as ArrowTopRight } from 'assets/images/ArrowTopRight.svg';

interface TransactionPopupProps {
  hash: string;
  pending?: boolean;
  success?: boolean;
  summary?: string;
}

const TransactionPopup: React.FC<TransactionPopupProps> = ({
  hash,
  pending,
  success,
  summary,
}) => {
  const { chainId } = useActiveWeb3React();
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        return Math.min(oldProgress + 2.5, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Box mb={1.5} className='flex justify-between items-center'>
        <small
          className={`weight-600 ${
            pending ? 'text-yellow3' : success ? 'text-success' : 'text-error'
          }`}
        >
          {pending ? 'Processing…' : success ? 'Confirmed' : 'Failed'}
        </small>
        {chainId && hash.length > 0 && (
          <a
            href={getEtherscanLink(chainId, hash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
          >
            <ArrowTopRight />
          </a>
        )}
      </Box>
      <small>
        {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
      </small>
      {pending && (
        <Box className='pendingBar'>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
      )}
    </>
  );
};

export default TransactionPopup;
