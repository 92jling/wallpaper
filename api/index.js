// [!!] 这是 api/index.js 文件的全部内容
// (已修复 500 错误)

import { Readable } from 'node:stream'; // [!!] 已添加此行

// 允许的图片来源域名
const ALLOWED_HOSTS = ['qhimg.com', '360img.cn', '360cdn.com'];

/**
 * 主处理函数
 */
export default async function handler(request, response) {
    // ... (这部分代码是正确的，不需要修改) ...
    const { cid, start, count, callback, img_url } = request.query;

    try {
        // 1. 处理图片代理
        if (img_url) {
            await proxyImage(img_url, response);
            return; 
        }

        let data;
        const cidParam = cid || '360new';
        const startParam = start || 0;
        const countParam = count || 10;

        // 2. 处理 API 路由
        switch (cidParam) {
            case '360new':
                const newUrl = `http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&start=${startParam}&count=${countParam}&from=360chrome`;
                data = await fetchJson(newUrl);
                break;
            
            case '360tags':
                const tagsUrl = `http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome`;
                data = await fetchJson(tagsUrl);
                break;
            
            case 'bing':
                const bingStart = start || -1;
                const bingCount = count || 8;
                const bingUrl = `http://cn.bing.com/HPImageArchive.aspx?format=js&idx=${bingStart}&n=${bingCount}`;
                data = await fetchJson(bingUrl);
                break;

            default: 
                const catUrl = `http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid=${cidParam}&start=${startParam}&count=${countParam}&from=360chrome`;
                data = await fetchJson(catUrl);
                break;
        }

        // 3. 发送 JSONP 或 JSON 响应
        sendJsonResponse(data, callback, response);

    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}

/**
 * 辅助函数：获取 JSON 数据
 */
async function fetchJson(url) {
    // ... (这部分代码是正确的) ...
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }
    return await fetchResponse.json(); 
}

/**
 * 辅助函数：发送 JSON 或 JSONP 响应
 */
function sendJsonResponse(data, callback, response) {
    // ... (这部分代码是正确的) ...
    if (callback) {
        response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        response.status(200).send(`${callback}(${JSON.stringify(data)})`);
    } else {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.status(200).json(data);
    }
}

/**
 * 辅助函数：代理图片
 */
async function proxyImage(url, response) {
    // 1. 安全检查 (这部分代码是正确的)
    let domain;
    try {
        domain = new URL(url).hostname;
    } catch (e) {
        response.status(400).send("无效的URL");
        return;
    }

    const isAllowed = ALLOWED_HOSTS.some(host => domain.endsWith(host));
    if (!isAllowed) {
        response.status(403).send("不允许的图片来源");
        return;
    }

    // 2. 获取图片 (这部分代码是正确的)
    const imageResponse = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': '' 
        }
    });

    if (!imageResponse.ok) {
        response.status(502).send(`无法从源服务器获取图片 (Code: ${imageResponse.status})`);
        return;
    }

    // 3. 将图片流式传输回浏览器
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'public, max-age=86400');
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    // [!!] 关键修复
    // 将 Web Stream (imageResponse.body) 转换为 Node.js Stream
    Readable.fromWeb(imageResponse.body).pipe(response);
}
