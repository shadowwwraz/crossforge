import { createRoot } from 'react-dom/client';
import { Overlay } from './Overlay';

const container = document.getElementById('overlay-root');
if (!container) throw new Error('Overlay root missing');
createRoot(container).render(<Overlay />);
