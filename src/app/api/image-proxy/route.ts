import { NextResponse } from 'next/server';

export const runtime = 'edge'; // 確保 Cloudflare 編譯不會報錯

// OrionTV 兼容接口 - 使用百度代理
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  try {
    // 組合百度代理網址，務必使用 encodeURIComponent 避免特殊字元壞掉
    const baiduProxyUrl = `https://image.baidu.com/search/down?url=${encodeURIComponent(imageUrl)}`;

    // 透過百度代理抓取圖片 (百度通常不需要特別的 Referer 就能抓)
    const imageResponse = await fetch(baiduProxyUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: imageResponse.statusText },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get('content-type');

    if (!imageResponse.body) {
      return NextResponse.json(
        { error: 'Image response has no body' },
        { status: 500 }
      );
    }

    // 建立回應標頭並設定快取
    const headers = new Headers();
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    headers.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000'); 
    headers.set('CDN-Cache-Control', 'public, s-maxage=15720000');

    // 回傳圖片流
    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching image' },
      { status: 500 }
    );
  }
}
