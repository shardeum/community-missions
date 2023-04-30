import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface OptionProps {
  link?: string | null;
  clickable?: boolean;
  size?: number | null;
  onClick?: () => void;
  color: string;
  header: React.ReactNode;
  subheader: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
}

const Option: React.FC<OptionProps> = ({
  link = null,
  onClick,
  header,
  subheader = null,
  icon,
  active = false,
  id,
}) => {
  const { t } = useTranslation();
  const content = (
    <Box className='optionCardClickable' id={id} onClick={onClick}>
      <Box className='flex items-center' my={0.5}>
        <img src={icon} alt={'Icon'} width={24} />
        <p style={{ marginLeft: 8 }}>{header}</p>
      </Box>
      {active && (
        <Box className='flex items-center'>
          <Box className='optionConnectedDot' />
          <small>{t('connected')}</small>
        </Box>
      )}
      {subheader && (
        <Box my={0.5} width={1}>
          <span>{subheader}</span>
        </Box>
      )}
    </Box>
  );
  if (link) {
    return (
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        className='optionLink'
      >
        {content}
      </a>
    );
  }

  return content;
};

export default Option;
