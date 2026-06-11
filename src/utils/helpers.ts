export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateReferralCode(name: string): string {
  const base = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NXR${base}${suffix}`;
}

export function formatCurrency(amount: number): string {
  return `GHC ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateDailyEarning(amount: number): number {
  const rate = 0.069;
  return parseFloat((amount * rate).toFixed(2));
}

export function calculateWithdrawalCharges(amount: number, config: {
  serviceChargeRate: number;
  taxRate: number;
  maintenanceFeeRate: number;
  operationalFeeRate: number;
}) {
  const serviceCharge = parseFloat(((config.serviceChargeRate / 100) * amount).toFixed(2));
  const tax = parseFloat(((config.taxRate / 100) * amount).toFixed(2));
  const maintenanceFee = parseFloat(((config.maintenanceFeeRate / 100) * amount).toFixed(2));
  const operationalFee = parseFloat(((config.operationalFeeRate / 100) * amount).toFixed(2));
  const totalCharge = parseFloat((serviceCharge + tax + maintenanceFee + operationalFee).toFixed(2));
  const netReceivable = parseFloat((amount - totalCharge).toFixed(2));

  return {
    gross: amount,
    serviceCharge,
    tax,
    maintenanceFee,
    operationalFee,
    totalCharge,
    netReceivable,
  };
}

export function getDaysRemaining(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    youtube: '▶',
    facebook: 'f',
    instagram: '📷',
    twitter: '𝕏',
    tiktok: '♪',
  };
  return icons[platform] || '🔗';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    youtube: 'bg-red-500',
    facebook: 'bg-blue-600',
    instagram: 'bg-pink-500',
    twitter: 'bg-slate-800',
    tiktok: 'bg-black',
  };
  return colors[platform] || 'bg-gray-500';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    active: 'text-blue-600 bg-blue-50 border-blue-200',
    expired: 'text-gray-600 bg-gray-50 border-gray-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Notification helpers ------------------------------------------------------
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  // Native browser notifications removed — resolve as 'denied'.
  return 'denied';
}

export function playNotificationTone() {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    o.stop(ctx.currentTime + 0.95);
    // Close context after short delay to free resources
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1200);
  } catch (err) {
    // ignore audio errors
  }
}

export function showBrowserNotification(title: string, body?: string) {
  // Browser notifications disabled — play the in-site notification tone only.
  try {
    playNotificationTone();
  } catch (err) {
    // ignore
  }
}
