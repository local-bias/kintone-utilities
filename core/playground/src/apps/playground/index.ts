import { LoadingOverlay } from '@konomi-app/kintone-utilities';

console.log('javascript file loaded!');

document.addEventListener('DOMContentLoaded', () => {
  const loadingOverlay = new LoadingOverlay();

  const loading = () => {
    loadingOverlay.label = 'Loading...';
    loadingOverlay.show();

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        loadingOverlay.label = `ステップ${i + 1}を実行中...`;
        loadingOverlay.progress = (i + 1) * 20;
      }, i * 1200);
    }
    setTimeout(() => {
      loadingOverlay.hide();
    }, 5200);
  };

  const button = document.createElement('button');
  button.textContent = 'show loading overlay';
  document.body.append(button);
  button.addEventListener('click', () => {
    console.log('clicked');
    loading();
  });
});
