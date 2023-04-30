import useInView from 'react-cool-inview';

export const useInfiniteLoading = (loadNext: () => void) => {
  const { observe } = useInView({
    onChange: () => {
      loadNext();
    },
    rootMargin: '100px 0px',
  });

  return {
    loadMoreRef: observe,
  };
};
