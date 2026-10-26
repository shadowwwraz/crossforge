import { Check, Info } from './Icons';
import { useApp } from '../state/app';

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <span className={`toast-ico${toast.tone === 'green' ? ' green' : ''}`}>
            {toast.tone === 'green' ? <Check size={14} /> : <Info size={14} />}
          </span>
          <span className="toast-msg">{toast.msg}</span>
        </div>
      ))}
    </div>
  );
}
