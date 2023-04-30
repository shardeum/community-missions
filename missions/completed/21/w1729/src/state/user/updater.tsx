import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { updateMatchesDarkMode } from './actions';

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>();

  // keep dark mode in sync with the system
  useEffect(() => {
    dispatch(updateMatchesDarkMode({ matchesDarkMode: true }));
  }, [dispatch]);

  return null;
}
