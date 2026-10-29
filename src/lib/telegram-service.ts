import { Order, CustomerPayment, BrokenProduct, SystemSettings } from '@/types/water-factory';
import { formatUsd, formatKhr } from './financial-engine';

/**
 * Escapes characters for Telegram HTML mode
 */
export function escapeHtml(unsafe: string = ''): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send message to Telegram Bot
 * Tries server-side API route first to avoid CORS / ad-blockers,
 * falls back to direct Telegram API if running in client-only mode.
 */
export async function sendTelegramNotification(
  settings: SystemSettings,
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  if (!token || !chatId) {
    return { success: false, error: 'Telegram Bot Token ឬ Chat ID មិនទាន់បានកំណត់' };
  }

  // 1. Try local server-side API route
  try {
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken: token,
        chatId: chatId,
        text: messageText,
        parseMode: 'HTML',
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true };
    }
    if (data.error) {
      console.warn('API route failed, trying direct Telegram fallback:', data.error);
    }
  } catch (apiErr) {
    console.warn('API route call error, attempting direct Telegram API fallback:', apiErr);
  }

  // 2. Fallback to direct Telegram Bot API
  try {
    const directRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    const directData = await directRes.json();
    if (directRes.ok && directData.ok) {
      return { success: true };
    }
    return {
      success: false,
      error: directData.description || 'បរាជ័យក្នុងការផ្ញើសារតាម Telegram Bot',
    };
  } catch (directErr: any) {
    console.error('Direct Telegram API failed:', directErr);
    return {
      success: false,
      error: directErr.message || 'មិនអាចភ្ជាប់ទៅកាន់ Telegram Server បានទេ',
    };
  }
}

/**
 * Test Telegram Bot connection
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string,
  factoryName: string = 'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី'
): Promise<{ success: boolean; message: string }> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken) {
    return { success: false, message: 'សូមបញ្ចូល Bot Token ជាមុនសិន' };
  }
  if (!cleanChatId) {
    return { success: false, message: 'សូមបញ្ចូល Chat ID ឬ Group ID ជាមុនសិន' };
  }

  const now = new Date().toLocaleString('km-KH', { hour12: false });
  const testMessage = `🎉 <b>តេស្តការភ្ជាប់ Telegram Bot ជោគជ័យ!</b>
━━━━━━━━━━━━━━━━━━
🏭 <b>សហគ្រាស:</b> ${escapeHtml(factoryName)}
🤖 <b>ស្ថានភាព:</b> បានភ្ជាប់ប្រព័ន្ធ ERP & POS រួចរាល់
🕒 <b>កាលបរិច្ឆេទ:</b> ${now}
━━━━━━━━━━━━━━━━━━
✨ <i>ចាប់ពីពេលនេះទៅ រាល់ការលក់ថ្មី ការទូទាត់បំណុល និងរបាយការណ៍បិទបញ្ជី នឹងត្រូវផ្ញើដំណឹងមកកាន់ទីនេះស្វ័យប្រវត្តិ។</i>`;

  // Try API route
  try {
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken: cleanToken,
        chatId: cleanChatId,
        text: testMessage,
        parseMode: 'HTML',
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true, message: 'បានផ្ញើសារតេស្តទៅកាន់ Telegram ជោគជ័យ!' };
    }
    if (data.error) {
      return { success: false, message: data.error };
    }
  } catch {
    // Try direct fallback
  }

  try {
    const directRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const directData = await directRes.json();
    if (directRes.ok && directData.ok) {
      return { success: true, message: 'បានផ្ញើសារតេស្តទៅកាន់ Telegram ជោគជ័យ!' };
    }
    return {
      success: false,
      message: directData.description || 'បរាជ័យក្នុងការតេស្ត Telegram Bot',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'មិនអាចភ្ជាប់ទៅ Telegram Bot API បានទេ',
    };
  }
}

/**
 * Format New POS Order Notification
 */
export function buildOrderTelegramMessage(order: Order, settings: SystemSettings): string {
  const factoryName = settings.factoryNameKh || 'សហគ្រាសផលិតទឹកបរិសុទ្ធ';
  const orderNum = order.invoiceNumber || order.id.slice(-6).toUpperCase();
  const dateStr = new Date(order.orderDate).toLocaleString('km-KH', { hour12: false });
  const remainingDebtKhr = order.remainingDebtUsd * (settings.exchangeRateKhrPerUsd || 4100);

  const itemsList = order.items
    .map(
      (item) =>
        `  • <b>${escapeHtml(item.productNameKh)}</b> x ${item.quantity} = ${formatUsd(
          item.totalUsd
        )} (${formatKhr(item.totalKhr)})`
    )
    .join('\n');

  let discountText = '';
  if (order.discountType && order.discountType !== 'none') {
    if (order.discountType === 'free') {
      discountText = `\n🎁 <b>ការបញ្ចុះតម្លៃ:</b> ឥតគិតថ្លៃ (Free 100%)`;
    } else if (order.discountType === 'percent') {
      discountText = `\n🏷 <b>បញ្ចុះតម្លៃ ${order.discountValue}%:</b> -${formatUsd(
        order.discountUsd
      )}`;
    } else if (order.discountType === 'khr') {
      discountText = `\n🏷 <b>បញ្ចុះតម្លៃ:</b> -${order.discountKhr?.toLocaleString()} ៛ (-${formatUsd(
        order.discountUsd
      )})`;
    }
  }

  const delivered = order.containersDelivered20L || 0;
  const returned = order.containersReturned20L || 0;
  const prevHeld = order.previousEmptyContainersHeld !== undefined ? order.previousEmptyContainersHeld : 0;
  const totalHeld =
    order.totalEmptyContainersHeld !== undefined
      ? order.totalEmptyContainersHeld
      : Math.max(0, prevHeld + delivered - returned);

  let bottleText = '';
  if (delivered > 0 || returned > 0 || prevHeld > 0 || totalHeld > 0) {
    bottleText = `\n🔄 <b>ចរន្តសំបកធុង ២០L (Bottle Ledger):</b>\n  • ជំពាក់ពីមុន: ${prevHeld} ធុង\n  • ដឹកជញ្ជូន (Delivered): +${delivered} ធុង\n  • យកត្រឡប់ (Returned): -${returned} ធុង\n  • <b>សំបកធុងនៅជំពាក់សរុប (Total Held): ${totalHeld} ធុង</b>`;
  }

  let debtText = '';
  if (order.remainingDebtUsd > 0) {
    debtText = `\n⏳ <b>ជំពាក់នៅសល់:</b> <b>${formatUsd(order.remainingDebtUsd)}</b> (${formatKhr(
      remainingDebtKhr
    )})`;
  }

  const paymentLabel =
    order.paymentMethod === 'cash_khr'
      ? '💵 សាច់ប្រាក់រៀល (Cash KHR)'
      : order.paymentMethod === 'cash_usd'
      ? '💵 សាច់ប្រាក់ដុល្លារ (Cash USD)'
      : order.paymentMethod === 'khqr'
      ? '📱 ស្កេន KHQR (Bakong)'
      : '⏳ ជំពាក់ (Credit)';

  return `💧 <b>ការលក់ថ្មី #${orderNum}</b>
🏭 <i>${escapeHtml(factoryName)}</i>
━━━━━━━━━━━━━━━━━━
👤 <b>អតិថិជន:</b> <b>${escapeHtml(order.customerName)}</b>
📦 <b>មុខទំនិញ:</b>
${itemsList}${discountText}
━━━━━━━━━━━━━━━━━━
💰 <b>សរុបទូទាត់:</b> <b>${formatUsd(order.grandTotalUsd)}</b> (${formatKhr(order.grandTotalKhr)})
💳 <b>វិធីបង់ប្រាក់:</b> ${paymentLabel}${debtText}${bottleText}
🕒 <b>កាលបរិច្ឆេទ:</b> ${dateStr}`;
}

/**
 * Format Customer Debt Repayment Notification
 */
export function buildDebtPaymentTelegramMessage(
  payment: CustomerPayment,
  remainingDebtUsd: number,
  settings: SystemSettings
): string {
  const factoryName = settings.factoryNameKh || 'សហគ្រាសផលិតទឹកបរិសុទ្ធ';
  const receiptNum = payment.receiptNumber || payment.id.slice(-6).toUpperCase();
  const dateStr = new Date(payment.paymentDate).toLocaleString('km-KH', { hour12: false });
  const remainingDebtKhr = remainingDebtUsd * (settings.exchangeRateKhrPerUsd || 4100);

  const paymentLabel =
    payment.paymentMethod === 'cash_khr'
      ? '💵 សាច់ប្រាក់រៀល (Cash KHR)'
      : payment.paymentMethod === 'cash_usd'
      ? '💵 សាច់ប្រាក់ដុល្លារ (Cash USD)'
      : payment.paymentMethod === 'khqr'
      ? '📱 ស្កេន KHQR'
      : '⏳ ជំពាក់ (Credit)';

  const amountUsd = payment.amountPaidUsd || payment.equivalentUsd;
  const amountKhr =
    payment.amountPaidKhr || payment.equivalentUsd * (settings.exchangeRateKhrPerUsd || 4100);

  return `💰 <b>ទទួលប្រាក់ទូទាត់បំណុល #${receiptNum}</b>
🏭 <i>${escapeHtml(factoryName)}</i>
━━━━━━━━━━━━━━━━━━
👤 <b>អតិថិជន:</b> <b>${escapeHtml(payment.customerName)}</b>
💵 <b>ទឹកប្រាក់បានបង់:</b> <b>${formatUsd(amountUsd)}</b> (${formatKhr(amountKhr)})
💳 <b>វិធីបង់ប្រាក់:</b> ${paymentLabel}
📉 <b>បំណុលនៅសល់:</b> <b>${formatUsd(remainingDebtUsd)}</b> (${formatKhr(remainingDebtKhr)})
${payment.notes ? `📝 <b>សម្គាល់:</b> ${escapeHtml(payment.notes)}\n` : ''}🕒 <b>កាលបរិច្ឆេទ:</b> ${dateStr}`;
}

/**
 * Format Daily Report Summary Notification
 */
export function buildDailyClosingTelegramMessage(
  summary: {
    totalOrders: number;
    totalRevenueUsd: number;
    totalRevenueKhr: number;
    cashUsd: number;
    khqrUsd: number;
    debtUsd: number;
    containersDelivered: number;
    containersReturned: number;
    expensesUsd: number;
    netProfitUsd: number;
  },
  settings: SystemSettings
): string {
  const factoryName = settings.factoryNameKh || 'សហគ្រាសផលិតទឹកបរិសុទ្ធ';
  const todayStr = new Date().toLocaleDateString('km-KH');

  return `📊 <b>របាយការណ៍សង្ខេបប្រចាំថ្ងៃ (Daily Closing)</b>
🏭 <i>${escapeHtml(factoryName)}</i>
📅 <b>កាលបរិច្ឆេទ:</b> ${todayStr}
━━━━━━━━━━━━━━━━━━
🛒 <b>ចំនួនវិក្កយបត្រលក់:</b> <b>${summary.totalOrders}</b>
💰 <b>ចំណូលលក់សរុប:</b> <b>${formatUsd(summary.totalRevenueUsd)}</b> (${formatKhr(
    summary.totalRevenueKhr
  )})
  • 💵 សាច់ប្រាក់ (Cash): ${formatUsd(summary.cashUsd)}
  • 📱 ស្កេន KHQR: ${formatUsd(summary.khqrUsd)}
  • ⏳ ជំពាក់ថ្មី (Debt): ${formatUsd(summary.debtUsd)}
━━━━━━━━━━━━━━━━━━
💸 <b>ចំណាយប្រតិបត្តិការ:</b> ${formatUsd(summary.expensesUsd)}
📈 <b>ចំណេញសុទ្ធប៉ាន់ស្មាន:</b> <b>${formatUsd(summary.netProfitUsd)}</b>
🔄 <b>ចរន្តសំបកធុង ២០L:</b> ចេញ ${summary.containersDelivered} / ចូល ${summary.containersReturned}
━━━━━━━━━━━━━━━━━━
✨ <i>របាយការណ៍ស្វ័យប្រវត្តិចេញពីប្រព័ន្ធ SRP ERP POS</i>`;
}

/**
 * Format Broken Product / Damage Notification
 */
export function buildBrokenProductTelegramMessage(
  broken: BrokenProduct,
  settings: SystemSettings
): string {
  const factoryName = settings.factoryNameKh || 'សហគ្រាសផលិតទឹកបរិសុទ្ធ';
  const dateStr = new Date(broken.incidentDate).toLocaleString('km-KH', { hour12: false });

  return `⚠️ <b>របាយការណ៍ទំនិញខូចខាត/បាក់បែក</b>
🏭 <i>${escapeHtml(factoryName)}</i>
━━━━━━━━━━━━━━━━━━
📦 <b>មុខទំនិញ:</b> <b>${escapeHtml(broken.productNameKh)}</b>
🔢 <b>ចំនួនខូចខាត:</b> <b>${broken.quantity}</b>
💸 <b>តម្លៃខាតបង់សរុប:</b> <b>${formatUsd(broken.totalLossUsd)}</b>
📝 <b>មូលហេតុ:</b> ${escapeHtml(broken.reason)}
👤 <b>រាយការណ៍ដោយ:</b> ${escapeHtml(broken.reportedBy)}
${broken.notes ? `📌 <b>ចំណាំ:</b> ${escapeHtml(broken.notes)}\n` : ''}🕒 <b>កាលបរិច្ឆេទ:</b> ${dateStr}`;
}
