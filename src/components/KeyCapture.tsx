import { useEffect, useState } from 'react';
import { useApp } from '../state/app';

const NAMED: Record<string, string> = {
  Space: 'Space',
  Escape: 'Escape',
  Enter: 'Enter',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Insert: 'Insert',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`',
  NumpadAdd: 'numadd',
  NumpadSubtract: 'numsub',
  NumpadMultiply: 'nummult',
  NumpadDivide: 'numdiv',
  NumpadDecimal: 'numdec',
  NumpadEnter: 'Enter',
};

export function toAccelerator(event: KeyboardEvent): string | null {
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return null;
  const modifiers: string[] = [];
  if (event.ctrlKey) modifiers.push('Control');
  if (event.altKey) modifiers.push('Alt');
  if (event.shiftKey) modifiers.push('Shift');
  if (event.metaKey) modifiers.push('Super');

  const code = event.code;
  let key: string | null = null;
  if (NAMED[code]) key = NAMED[code];
  else if (code.startsWith('Key')) key = code.slice(3);
  else if (code.startsWith('Digit')) key = code.slice(5);
  else if (code.startsWith('Numpad')) key = `num${code.slice(6).toLowerCase()}`;
  else if (/^F\d{1,2}$/.test(code)) key = code;

  if (!key) return null;
  return [...modifiers, key].join('+');
}

export function prettyAccelerator(value: string): string {
  return value
    .replace(/Control/g, 'Ctrl')
    .replace(/CommandOrControl/g, 'Ctrl')
    .replace(/\+/g, ' + ');
}

export function KeyCapture({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (accelerator: string) => void;
  disabled?: boolean;
}) {
  const { t } = useApp();
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!capturing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') {
        setCapturing(false);
        return;
      }
      const accelerator = toAccelerator(event);
      if (!accelerator) return;
      setCapturing(false);
      onChange(accelerator);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [capturing, onChange]);

  return (
    <button
      type="button"
      className={`kbd${capturing ? ' capturing' : ''}`}
      style={{ minWidth: 62, height: 24, cursor: disabled ? 'default' : 'pointer' }}
      onClick={() => !disabled && setCapturing((current) => !current)}
    >
      {capturing ? t('keybinds.press') : prettyAccelerator(value) || t('keybinds.unbound')}
    </button>
  );
}
