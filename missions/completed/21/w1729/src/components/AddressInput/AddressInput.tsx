import React from 'react';
import { Box } from '@material-ui/core';
import useENS from 'hooks/useENS';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils';
import 'components/styles/AddressInput.scss';
import { useTranslation } from 'react-i18next';

interface AddressInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const { chainId } = useActiveWeb3React();
  const { address, loading, name } = useENS(value);
  const error = Boolean(value.length > 0 && !loading && !address);
  const { t } = useTranslation();

  return (
    <Box
      className={`addressInput ${
        error ? 'border-error' : 'border-primaryDark'
      }`}
    >
      <Box className='flex justify-between items-center'>
        <p>{label}</p>
        {address && chainId && (
          <a
            href={getEtherscanLink(chainId, name ?? address, 'address')}
            target='_blank'
            rel='noopener noreferrer'
          >
            ({t('viewonBlockExplorer')})
          </a>
        )}
      </Box>
      <input
        value={value}
        className={error ? 'text-error' : 'text-primaryText'}
        placeholder={placeholder}
        onChange={(evt) => {
          const input = evt.target.value;
          const withoutSpaces = input.replace(/\s+/g, '');
          onChange(withoutSpaces);
        }}
      />
    </Box>
  );
};

export default AddressInput;
