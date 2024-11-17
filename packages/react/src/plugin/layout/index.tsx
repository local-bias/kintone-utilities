import styled from '@emotion/styled';

type Props = { singleCondition?: boolean; disableBanner?: boolean };

const gridTemplate = (row: string[][]) => {
  return `grid-template: '${row.map(([name]) => name).join(' ')}' minmax(600px, 1fr) '${new Array(
    row.length
  )
    .fill('footer')
    .join(' ')}' auto/${row.map(([_, size]) => size).join(' ')};`;
};

export const PluginLayout = styled.div<Props>`
  display: grid;
  gap: 16px;

  ${(props) => {
    const { singleCondition = false, disableBanner = false } = props;

    const row: string[][] = [];
    if (!singleCondition) {
      row.push(['sidebar', '300px']);
    }
    row.push(['content', '1fr']);

    let result = gridTemplate(row);

    if (!disableBanner) {
      row.push(['banner', '300px']);
    }

    result += `@media (min-width: 1520px) {${gridTemplate(row)}}`;

    return result;
  }}
`;
