import React from 'react';
import useHttpLocations from 'hooks/useHttpLocations';

import { Logo } from 'components';

interface ListLogoProps {
  logoURI: string;
  size?: string;
  alt?: string;
}

const ListLogo: React.FC<ListLogoProps> = ({ logoURI, size, alt }) => {
  const srcs: string[] = useHttpLocations(logoURI);

  return <Logo size={size} alt={alt} srcs={srcs} />;
};

export default ListLogo;
