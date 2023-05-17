import React from 'react';

const SwapProChart: React.FC<{
  pairName: string;
  pairAddress: string;
  pairTokenReversed: boolean;
}> = ({ pairAddress, pairName, pairTokenReversed }) => {
  return (
    <iframe
      src={`https://mode.quickswap.exchange?pairAddress=${pairAddress}&pairName=${pairName}&tokenReversed=${pairTokenReversed}`}
      height='100%'
      width='100%'
      frameBorder='0'
    />
  );
};

export default React.memo(SwapProChart);
