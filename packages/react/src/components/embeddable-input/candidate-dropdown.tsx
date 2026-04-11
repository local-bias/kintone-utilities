import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EmbeddableCandidate, EmbeddableTab } from './types';

interface CandidateDropdownProps {
  tabs: EmbeddableTab[];
  onSelect: (candidate: EmbeddableCandidate) => void;
}

function getCandidateKey(candidate: EmbeddableCandidate): string {
  return candidate.type === 'fieldCode' ? candidate.code : candidate.key;
}

function getCandidatePrimaryLabel(candidate: EmbeddableCandidate): string {
  return candidate.type === 'fieldCode' ? candidate.label : candidate.label;
}

function getCandidateSecondaryLabel(candidate: EmbeddableCandidate): string {
  return candidate.type === 'fieldCode'
    ? `コード: ${candidate.code}`
    : `プロパティ: ${candidate.key}`;
}

export function CandidateDropdown({ tabs, onSelect }: CandidateDropdownProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  // Reset activeTab if it goes out of bounds when tabs change
  useEffect(() => {
    if (activeTab >= tabs.length) {
      setActiveTab(0);
    }
  }, [tabs.length, activeTab]);

  const currentTab = tabs[activeTab];

  const filtered = useMemo(() => {
    if (!currentTab) return [];
    const q = search.toLowerCase();
    return currentTab.candidates.filter((c) => {
      if (c.type === 'fieldCode') {
        return c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      }
      return c.label.toLowerCase().includes(q) || c.key.toLowerCase().includes(q);
    });
  }, [currentTab, search]);

  const handleTabChange = useCallback((_: unknown, value: number) => {
    setActiveTab(value);
    setSearch('');
  }, []);

  if (tabs.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '100%',
        zIndex: 1300,
        mt: '4px',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 3,
        maxHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
      // Prevent blur on outer elements - but search bar overrides via stopPropagation
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {/* Search bar - stopPropagation so the parent's preventDefault doesn't block focus */}
      <Box
        sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <TextField
          size='small'
          fullWidth
          placeholder='検索...'
          aria-label='候補を検索'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiInputBase-input': { py: 0.75, fontSize: '0.875rem' } }}
        />
      </Box>

      {/* Category tabs */}
      {tabs.length > 1 && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='fullWidth'
          sx={{
            minHeight: 36,
            px: 1,
            '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8125rem' },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
      )}

      {/* Candidates list */}
      <Box role='listbox' sx={{ overflow: 'auto', flexGrow: 1 }}>
        {filtered.length === 0 ? (
          <Typography
            sx={{ py: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}
          >
            候補が見つかりません
          </Typography>
        ) : (
          filtered.map((candidate) => (
            <Box
              key={getCandidateKey(candidate)}
              role='option'
              onClick={() => onSelect(candidate)}
              sx={{
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                display: 'grid',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography
                component='span'
                sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}
              >
                {getCandidateSecondaryLabel(candidate)}
              </Typography>
              <Typography component='span' sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                {getCandidatePrimaryLabel(candidate)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
