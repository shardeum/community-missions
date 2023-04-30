import React, { useState } from 'react';
import { HelpCircle } from 'react-feather';

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps {
  srcs: string[];
  alt?: string;
  size?: string;
}

const Logo: React.FC<LogoProps> = ({ srcs, alt, size = '24px' }) => {
  const [, refresh] = useState<number>(0);

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

  if (src) {
    return (
      <img
        alt={alt}
        src={src}
        style={{ width: size, height: size }}
        onError={() => {
          if (src) BAD_SRCS[src] = true;
          refresh((i) => i + 1);
        }}
      />
    );
  }

  return <HelpCircle />;
};

export default Logo;
