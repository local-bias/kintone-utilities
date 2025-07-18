import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useCallback, useState } from 'react';

type Props = { reset: () => void };

export function PluginConfigResetButton({ reset }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const onIconButtonClick = useCallback(() => {
    setOpen(true);
  }, []);

  const onClick = useCallback(() => {
    reset();
    setOpen(false);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>設定のリセット</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このプラグインの設定を初期状態に戻します。よろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='primary' variant='contained' onClick={onClick}>
            実行
          </Button>
          <Button color='inherit' variant='contained' onClick={onClose}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title='プラグインの設定をリセット'>
        <IconButton onClick={onIconButtonClick}>
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
