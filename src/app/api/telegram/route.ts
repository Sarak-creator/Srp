import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { botToken, chatId, text, parseMode = 'HTML' } = body;

    if (!botToken || !chatId || !text) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: botToken, chatId, or text' },
        { status: 400 }
      );
    }

    const cleanToken = String(botToken).trim();
    const cleanChatId = String(chatId).trim();
    const telegramUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        parse_mode: parseMode,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data.description || `Telegram API Error (${response.status})`,
        },
        { status: response.status >= 400 && response.status < 600 ? response.status : 400 }
      );
    }

    return NextResponse.json({ ok: true, result: data.result });
  } catch (error: any) {
    console.error('Error in /api/telegram:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

