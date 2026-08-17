type ToastType = 'success' | 'error' | 'warning';

export type AppToast = {
  id: number;
  type: ToastType;
  message: string;
  durationMs: number;
};

type ToastListener = (toast: AppToast | null) => void;

let currentToast: AppToast | null = null;
let toastId = 0;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<ToastListener>();

function emit() {
  listeners.forEach((listener) => listener(currentToast));
}

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener);
  listener(currentToast);
  return () => {
    listeners.delete(listener);
  };
}

export function getToastSnapshot() {
  return currentToast;
}

export function showToast(
  type: ToastType,
  message: string,
  durationMs = 3200,
) {
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }

  toastId += 1;
  currentToast = { id: toastId, type, message, durationMs };
  emit();

  clearTimer = setTimeout(() => {
    currentToast = null;
    clearTimer = null;
    emit();
  }, durationMs);
}

export function clearToast() {
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  currentToast = null;
  emit();
}
