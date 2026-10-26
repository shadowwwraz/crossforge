import { useEffect } from 'react';
import { AppProvider, useApp } from './state/app';
import { TitleBar } from './components/TitleBar';
import { Rail } from './components/Rail';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { Toasts } from './components/Toasts';
import { ImportModal, ShareModal } from './components/modals';
import { Discover } from './pages/Discover';
import { Browse } from './pages/Browse';
import { Saved } from './pages/Saved';
import { Workshop } from './pages/Workshop';
import { Editor } from './pages/Editor';
import { Keybinds } from './pages/Keybinds';
import { Settings } from './pages/Settings';
import { Cursor } from './pages/Cursor';
import { Randomizer } from './pages/Randomizer';

function Shell() {
  const { page } = useApp();

  useEffect(() => {
    const content = document.getElementById('cf-content');
    if (content) content.scrollTop = 0;
  }, [page]);

  return (
    <div className="app">
      <TitleBar />
      <div className="frame">
        <Rail />
        <div className="workspace">
          <Header />
          <div className="content" id="cf-content">
            {page === 'discover' ? <Discover /> : null}
            {page === 'browse' ? <Browse /> : null}
            {page === 'saved' ? <Saved /> : null}
            {page === 'workshop' ? <Workshop /> : null}
            {page === 'editor' ? <Editor /> : null}
            {page === 'keybinds' ? <Keybinds /> : null}
            {page === 'settings' ? <Settings /> : null}
            {page === 'cursor' ? <Cursor /> : null}
            {page === 'randomizer' ? <Randomizer /> : null}
          </div>
        </div>
      </div>
      <StatusBar />
      <Toasts />
      <ShareModal />
      <ImportModal />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
