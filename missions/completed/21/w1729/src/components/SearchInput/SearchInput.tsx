import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import 'components/styles/SearchInput.scss';

interface SearchInputProps {
  placeholder: string;
  value: string;
  setValue: (val: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  setValue,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <Box className={`searchInput${searchFocused ? ' focusedSearchInput' : ''}`}>
      <SearchIcon />
      <input
        placeholder={placeholder}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        value={value}
        onChange={(evt: any) => setValue(evt.target.value)}
      />
    </Box>
  );
};

export default SearchInput;
