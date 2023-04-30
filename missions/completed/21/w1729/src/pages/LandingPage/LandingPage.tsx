import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Motif from 'assets/images/Motif.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import Analytics from 'assets/images/featured/Analytics.svg';
import DragonsLair from 'assets/images/featured/DragonsLair.svg';
import ProvideLiquidity from 'assets/images/featured/ProvideLiquidity.svg';
import Rewards from 'assets/images/featured/Rewards.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as MediumIcon } from 'assets/images/social/Medium.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as TwitterIcon } from 'assets/images/social/Twitter.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { RewardSlider, TopMovers } from 'components';
import { getGlobalData } from 'utils';
import { useEthPrice, useGlobalData } from 'state/application/hooks';
import 'pages/styles/landing.scss';
import { HeroSection } from './HeroSection';
import { TradingInfo } from './TradingInfo';
import { SwapSection } from './SwapSection';
import { BuyFiatSection } from './BuyFiatSection';

const LandingPage: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { t } = useTranslation();

  const features = [
    {
      img: FeaturedSwap,
      title: t('swapTokens'),
      desc: t('featureTradeDesc'),
    },
    {
      img: ProvideLiquidity,
      title: t('supplyLiquidity'),
      desc: t('featureLiquidityDesc'),
    },
    {
      img: Rewards,
      title: t('earndQUICK'),
      desc: t('featureDepositDesc'),
    },
    {
      img: DragonsLair,
      title: t('dragonLair'),
      desc: t('featureDragonDesc'),
    },
    {
      img: BuyWithFiat,
      title: t('buyWithFiat'),
      desc: t('featureBuyFiatDesc'),
    },
    {
      img: Analytics,
      title: t('analytics'),
      desc: t('featureAnalyticsDesc'),
    },
  ];

  const socialicons = [
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://discord.gg/dSMd7AFH36',
      icon: <DiscordIcon />,
      title: 'Discord',
    },
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <TwitterIcon />,
      title: 'Twitter',
    },
    {
      link: 'https://quickswap-layer2.medium.com/',
      icon: <MediumIcon />,
      title: 'Medium',
    },
    {
      link: 'https://www.youtube.com/channel/UCrPlF-DBwD-UzLFDzJ4Z5Fw',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
    {
      link: 'https://www.coingecko.com/en/exchanges/quickswap',
      icon: <CoingeckoIcon />,
      title: 'CoinGecko',
    },
  ];

  const history = useHistory();
  const { globalData, updateGlobalData } = useGlobalData();
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    async function fetchGlobalData() {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        const newGlobalData = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
        );
        if (newGlobalData) {
          updateGlobalData({ data: newGlobalData });
        }
      }
    }
    fetchGlobalData();
  }, [updateGlobalData, ethPrice.price, ethPrice.oneDayPrice]);

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 80px'}>
        <HeroSection globalData={globalData} />
      </Box>
      <Box className='flex tradingInfo'>
        <TradingInfo globalData={globalData} />
      </Box>
      <Box className='smallCommunityContainer'>
        {socialicons.map((val, ind) => (
          <a
            href={val.link}
            target='_blank'
            key={ind}
            rel='noopener noreferrer'
          >
            <Box display='flex' mx={1.5}>
              {val.icon}
            </Box>
          </a>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers />
      </Box>
      <Box className='quickInfo'>
        <h4>{t('quickInfoTitle')}</h4>
        <img src={Motif} alt='Motif' />
      </Box>
      <SwapSection />
      <Box className='rewardsContainer'>
        <Box maxWidth='480px' width='100%'>
          <h4>{t('earnRewardsbyDeposit')}</h4>
          <p style={{ marginTop: '20px' }}>{t('depositLPTokensRewards')}</p>
        </Box>
        <RewardSlider />
        <Box
          className='allRewardPairs'
          onClick={() => {
            history.push('/farm');
          }}
        >
          <p>{t('seeAllPairs')}</p>
        </Box>
      </Box>
      <BuyFiatSection />
      <Box className='featureContainer'>
        <Box className='featureHeading'>
          <h3>{t('features')}</h3>
          <Box className='featureDivider' />
        </Box>
        <Grid container spacing={4}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <img src={val.img} alt={val.title} />
              <Box className='featureText'>
                <h5>{val.title}</h5>
                <p>{val.desc}</p>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className='communityContainer'>
        <Box className='featureHeading'>
          <h3>{t('joinCommunity')}</h3>
          <Box className='featureDivider' />
        </Box>
        <Box className='socialContent'>
          {socialicons.map((val, ind) => (
            <Box key={ind}>
              <a href={val.link} target='_blank' rel='noopener noreferrer'>
                {val.icon}
                <p>{val.title}</p>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default LandingPage;
