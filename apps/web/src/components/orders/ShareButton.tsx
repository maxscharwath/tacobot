import { Copy01, Link01 } from '@untitledui/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { routes } from '../../lib/routes';
import { Button } from '../ui';

interface ShareButtonProps {
  readonly groupOrderId: string;
  readonly shareCode: string | null;
  readonly orderName?: string | null;
}

export function ShareButton({ groupOrderId, shareCode }: ShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const shareUrl = routes.root.orderDetail.url({ orderId: groupOrderId });

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(shareUrl, 'link');
  };

  const handleCopyCode = () => {
    if (shareCode) {
      copyToClipboard(shareCode, 'code');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-slate-900 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
      <h3 className="mb-4 font-semibold text-lg">{t('orders.detail.hero.share.title')}</h3>

      <div className="space-y-4">
        {/* Share Code - if available */}
        {shareCode && (
          <div>
            <div className="flex items-stretch overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex flex-1 items-center justify-center bg-slate-100 px-4 py-3 text-center font-bold font-mono text-slate-900 text-xl dark:bg-slate-800/60 dark:text-white">
                {shareCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="flex shrink-0 items-center justify-center gap-2 border-slate-200 border-l bg-slate-50 px-4 py-3 font-semibold text-slate-900 text-sm transition-colors hover:border-brand-400/60 hover:bg-slate-100 hover:text-brand-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-brand-50"
              >
                <Copy01 size={18} />
                {copied === 'code'
                  ? t('orders.detail.hero.share.codeCopied')
                  : t('orders.detail.hero.share.copyCode')}
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={handleCopyLink} variant="outline" className="flex-1 gap-2">
            <Link01 size={18} />
            {copied === 'link'
              ? t('orders.detail.hero.share.linkCopied')
              : t('orders.detail.hero.share.copyLink')}
          </Button>
        </div>

        {/* Instructions */}
        <p className="border-slate-200 border-t pt-2 text-slate-500 text-sm dark:border-white/10 dark:text-slate-400">
          {t('orders.detail.hero.share.inviteInstructions')}
        </p>
      </div>
    </div>
  );
}
