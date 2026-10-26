import type { CrossForgeApi } from '../shared/api';

declare global {
  interface Window {
    crossforge: CrossForgeApi;
  }
}

export {};
