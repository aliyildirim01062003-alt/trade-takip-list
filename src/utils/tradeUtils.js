export const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateTradePnL = (trade) => {
  const rawEntryPrice = trade.entryPrice === '' || trade.entryPrice === null || trade.entryPrice === undefined
    ? Number.NaN
    : Number(trade.entryPrice);
  const rawExitPrice = trade.exitPrice === '' || trade.exitPrice === null || trade.exitPrice === undefined
    ? Number.NaN
    : Number(trade.exitPrice);
  const quantity = toNumber(trade.quantity);
  const commission = toNumber(trade.commission);

  if (!Number.isFinite(rawEntryPrice) || !Number.isFinite(rawExitPrice) || quantity <= 0) {
    return null;
  }

  const entryPrice = rawEntryPrice;
  const exitPrice = rawExitPrice;
  const isSellTrade = trade.type === 'sell';
  const priceDelta = isSellTrade ? entryPrice - exitPrice : exitPrice - entryPrice;

  return (priceDelta * quantity) - commission;
};

export const validateTradeInput = (trade) => {
  const symbol = (trade.symbol || '').trim();
  if (!symbol) {
    return 'Lütfen sembol/kod alanını doldurun.';
  }

  const entryPrice = Number(trade.entryPrice);
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
    return 'Giriş fiyatı pozitif bir sayı olmalıdır.';
  }

  const quantity = Number(trade.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 'Miktar pozitif bir sayı olmalıdır.';
  }

  const commission = Number(trade.commission ?? 0);
  if (!Number.isFinite(commission) || commission < 0) {
    return 'Komisyon 0 veya daha büyük olmalıdır.';
  }

  if (trade.exitPrice !== '' && trade.exitPrice !== null && trade.exitPrice !== undefined) {
    const exitPrice = Number(trade.exitPrice);
    if (!Number.isFinite(exitPrice) || exitPrice < 0) {
      return 'Çıkış fiyatı 0 veya daha büyük bir sayı olmalıdır.';
    }
  }

  return '';
};
