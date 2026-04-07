import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  // 組合百度代理網址
  const baiduProxyUrl = `https://image.baidu.com/search/down?url=${encodeURIComponent(imageUrl)}`;

  // 直接 HTTP 302 重定向，讓使用者的瀏覽器自己去百度代理抓圖片
  return NextResponse.redirect(baiduProxyUrl);
}
