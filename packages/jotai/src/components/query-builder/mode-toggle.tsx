import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import BuildIcon from '@mui/icons-material/Build';
import styled from '@emotion/styled';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  margin-bottom: 16px;
`;

export function QueryBuilderModeToggle({
  modeValue,
  handleToggle,
  t,
}: {
  modeValue: 'builder' | 'raw';
  handleToggle: (event: React.MouseEvent<HTMLElement>, newValue: 'builder' | 'raw') => void;
  t: (key: 'rawLabel' | 'switchToBuilder' | 'builderMode' | 'switchToRaw' | 'rawMode') => string;
}) {
  return (
    <StyledToggleButtonGroup
      exclusive
      size='small'
      value={modeValue}
      onChange={handleToggle}
      aria-label={t('rawLabel')}
    >
      <ToggleButton value='builder' aria-label={t('switchToBuilder')}>
        <BuildIcon fontSize='small' sx={{ mr: 0.5 }} />
        {t('builderMode')}
      </ToggleButton>
      <ToggleButton value='raw' aria-label={t('switchToRaw')}>
        <CodeIcon fontSize='small' sx={{ mr: 0.5 }} />
        {t('rawMode')}
      </ToggleButton>
    </StyledToggleButtonGroup>
  );
}
