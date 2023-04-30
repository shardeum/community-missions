import React, { useState, useMemo } from 'react';
import { Box, Divider } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import { AlertTriangle } from 'react-feather';
import {
  CustomModal,
  NumericalInput,
  QuestionHelper,
  ToggleSwitch,
} from 'components';
import { useSwapActionHandlers } from 'state/swap/hooks';
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/SettingsModal.scss';
import { useTranslation } from 'react-i18next';

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [
    userSlippageTolerance,
    setUserslippageTolerance,
  ] = useUserSlippageTolerance();
  const [ttl, setTtl] = useUserTransactionTTL();
  const { onChangeRecipient } = useSwapActionHandlers();
  const [expertMode, toggleExpertMode] = useExpertModeManager();
  const [slippageInput, setSlippageInput] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [expertConfirm, setExpertConfirm] = useState(false);
  const [expertConfirmText, setExpertConfirmText] = useState('');

  const slippageInputIsValid =
    slippageInput === '' ||
    (userSlippageTolerance / 100).toFixed(2) ===
      Number.parseFloat(slippageInput).toFixed(2);
  const deadlineInputIsValid =
    deadlineInput === '' || (ttl / 60).toString() === deadlineInput;

  const slippageError = useMemo(() => {
    if (slippageInput !== '' && !slippageInputIsValid) {
      return SlippageError.InvalidInput;
    } else if (slippageInputIsValid && userSlippageTolerance < 50) {
      return SlippageError.RiskyLow;
    } else if (slippageInputIsValid && userSlippageTolerance > 500) {
      return SlippageError.RiskyHigh;
    } else {
      return undefined;
    }
  }, [slippageInput, userSlippageTolerance, slippageInputIsValid]);

  const slippageAlert =
    !!slippageInput &&
    (slippageError === SlippageError.RiskyLow ||
      slippageError === SlippageError.RiskyHigh);

  const deadlineError = useMemo(() => {
    if (deadlineInput !== '' && !deadlineInputIsValid) {
      return DeadlineError.InvalidInput;
    } else {
      return undefined;
    }
  }, [deadlineInput, deadlineInputIsValid]);

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value);

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt(
        (Number.parseFloat(value) * 100).toString(),
      );
      if (
        !Number.isNaN(valueAsIntFromRoundedFloat) &&
        valueAsIntFromRoundedFloat < 5000
      ) {
        setUserslippageTolerance(valueAsIntFromRoundedFloat);
      }
    } catch {}
  };

  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value);

    try {
      const valueAsInt: number = Number.parseInt(value) * 60;
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt);
      }
    } catch {}
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <CustomModal open={expertConfirm} onClose={() => setExpertConfirm(false)}>
        <Box paddingX={3} paddingY={4}>
          <Box mb={3} className='flex justify-between items-center'>
            <h5>{t('areyousure')}</h5>
            <CloseIcon
              className='cursor-pointer'
              onClick={() => setExpertConfirm(false)}
            />
          </Box>
          <Divider />
          <Box mt={2.5} mb={1.5}>
            <p>{t('expertModeDesc')}</p>
            <Box mt={3}>
              <p className='text-bold text-uppercase'>{t('expertModeUse')}</p>
            </Box>
            <Box mt={3}>
              <p className='text-bold'>{t('typeConfirmExpertMode')}</p>
            </Box>
          </Box>
          <Box className='expertConfirmInput'>
            <input
              value={expertConfirmText}
              onChange={(e: any) => setExpertConfirmText(e.target.value)}
            />
          </Box>
          <Box
            className={`expertButtonWrapper${
              expertConfirmText === 'confirm' ? '' : ' opacity-disabled'
            }`}
            onClick={() => {
              if (expertConfirmText === 'confirm') {
                toggleExpertMode();
                setExpertConfirm(false);
              }
            }}
          >
            <p className='weight-600'>{t('turnonExpert')}</p>
          </Box>
        </Box>
      </CustomModal>
      <Box paddingX={3} paddingY={4}>
        <Box mb={3} className='flex justify-between items-center'>
          <h5>{t('settings')}</h5>
          <CloseIcon onClick={onClose} />
        </Box>
        <Divider />
        <Box my={2.5} className='flex items-center'>
          <Box mr='6px'>
            <p>{t('slippageTolerance')}</p>
          </Box>
          <QuestionHelper size={20} text={t('slippageHelper')} />
        </Box>
        <Box mb={2.5}>
          <Box className='flex items-center'>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 10 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(10);
              }}
            >
              <small>0.1%</small>
            </Box>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 50 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(50);
              }}
            >
              <small>0.5%</small>
            </Box>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 100 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(100);
              }}
            >
              <small>1%</small>
            </Box>
            <Box
              className={`settingsInputWrapper ${
                slippageAlert ? 'border-primary' : 'border-secondary1'
              }`}
            >
              {slippageAlert && <AlertTriangle color='#ffa000' size={16} />}
              <NumericalInput
                placeholder={(userSlippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                fontSize={14}
                fontWeight={500}
                align='right'
                onBlur={() => {
                  parseCustomSlippage((userSlippageTolerance / 100).toFixed(2));
                }}
                onUserInput={(value) => parseCustomSlippage(value)}
              />
              <small>%</small>
            </Box>
          </Box>
          {slippageError && (
            <Box mt={1.5}>
              <small className='text-yellow3'>
                {slippageError === SlippageError.InvalidInput
                  ? t('enterValidSlippage')
                  : slippageError === SlippageError.RiskyLow
                  ? t('txMayFail')
                  : t('txMayFrontrun')}
              </small>
            </Box>
          )}
        </Box>
        <Divider />
        <Box my={2.5} className='flex items-center'>
          <Box mr='6px'>
            <p>{t('txDeadline')}</p>
          </Box>
          <QuestionHelper size={20} text={t('txDeadlineHelper')} />
        </Box>
        <Box mb={2.5} className='flex items-center'>
          <Box className='settingsInputWrapper' maxWidth={168}>
            <NumericalInput
              placeholder={(ttl / 60).toString()}
              value={deadlineInput}
              fontSize={14}
              fontWeight={500}
              onBlur={() => {
                parseCustomDeadline((ttl / 60).toString());
              }}
              onUserInput={(value) => parseCustomDeadline(value)}
            />
          </Box>
          <Box ml={1}>
            <small>{t('minutes')}</small>
          </Box>
        </Box>
        {deadlineError && (
          <Box mt={1.5}>
            <small className='text-yellow3'>{t('enterValidDeadline')}</small>
          </Box>
        )}
        <Divider />
        <Box my={2.5} className='flex justify-between items-center'>
          <Box className='flex items-center'>
            <p style={{ marginRight: 6 }}>{t('expertMode')}</p>
            <QuestionHelper size={20} text={t('expertModeHelper')} />
          </Box>
          <ToggleSwitch
            toggled={expertMode}
            onToggle={() => {
              if (expertMode) {
                toggleExpertMode();
                onChangeRecipient(null);
              } else {
                setExpertConfirm(true);
              }
            }}
          />
        </Box>
        <Divider />
        <Box mt={2.5} className='flex justify-between items-center'>
          <p>{t('language')}</p>
          <Box className='flex items-center'>
            <p>
              {t('english')} ({t('default')})
            </p>
            <KeyboardArrowDown />
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default SettingsModal;
