<?php

// 允许的图片来源域名 (从你的JS源码中获取)
define('ALLOWED_HOSTS', ['qhimg.com', '360img.cn', '360cdn.com']);

// ================================================
//  图片代理逻辑
// ================================================
$img_url = getParam('img_url');
if ($img_url != '') {
    proxy_image($img_url);
}


// ================================================
//  API 逻辑 (你原来的代码)
// ================================================

//tags http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome
//new http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&start=【0开始】&count=【加载数】&from=360chrome
//专区 http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid=【分类ID】&start=【0开始】&count=【加载数】&from=360chrome

$cid = getParam('cid', '360new');

switch($cid)
{
    case '360new':  // 360壁纸 新图片
        $start = getParam('start', 0);
        $count = getParam('count', 10);
        echojson(file_get_contents("http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&start={$start}&count={$count}&from=360chrome"));
    break;
    
    case '360tags': // 360壁纸 分类
        echojson(file_get_contents("http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome"));
    break;
    
    case 'bing': // Bing 壁纸 (保持不变)
        $start = getParam('start', -1);
        $count = getParam('count', 8);
        echojson(file_get_contents("http://cn.bing.com/HPImageArchive.aspx?format=js&idx={$start}&n={$count}"));
    break;
    
    default: // 360壁纸 按分类ID获取
        $start = getParam('start', 0);
        $count = getParam('count', 10);
        echojson(file_get_contents("http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid={$cid}&start={$start}&count={$count}&from=360chrome"));
        
}


/**
 * ================================================
 * 辅助函数
 * ================================================
 */

/**
 * [新增] 代理图片函数
 * @param $url string 要代理的图片URL
 */
function proxy_image($url)
{
    // 1. 安全检查：确保我们只代理来自 360 的图片
    $url_parts = parse_url($url);
    if (!$url_parts || !isset($url_parts['host'])) {
        header("HTTP/1.1 400 Bad Request");
        die("无效的URL");
    }
    
    $host = $url_parts['host'];
    $is_allowed = false;
    foreach (ALLOWED_HOSTS as $allowed_host) {
        // 检查域名是否以允许的后缀结尾
        if (substr($host, -strlen($allowed_host)) === $allowed_host) {
            $is_allowed = true;
            break;
        }
    }
    
    if (!$is_allowed) {
        header("HTTP/1.1 403 Forbidden");
        die("不允许的图片来源");
    }

    // 2. 使用 cURL 从源服务器获取图片
    // (cURL 比 file_get_contents 更健壮，并且能获取到 Content-Type)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 返回内容，而不是直接输出
    curl_setopt($ch, CURLOPT_HEADER, false);        // 不需要响应头
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // 跟随重定向
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 忽略SSL证书验证
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    // 伪造一个浏览器 User-Agent，有些服务器会检查这个
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // 关键：不发送 Referer (PHP cURL 默认不发送)，这样就绕过了防盗链

    $image_data = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    
    curl_close($ch);

    // 3. 检查是否获取成功
    if ($http_code != 200 || !$image_data) {
        header("HTTP/1.1 502 Bad Gateway");
        die("无法从源服务器获取图片 (Code: {$http_code})");
    }

    // 4. 将图片数据和正确的头信息发送回浏览器
    header("Content-Type: " . ($content_type ? $content_type : 'image/jpeg')); // 使用获取到的MIME类型
    header("Content-Length: " . strlen($image_data));
    header("Cache-Control: public, max-age=86400"); // 允许浏览器缓存1天
    header("Access-Control-Allow-Origin: *"); // 允许跨域（如果你的JS在不同域）
    
    die($image_data); // 输出图片
}

/**
 * 获取GET或POST过来的参数
 * @param $key 键值
 * @param $default 默认值
 * @return 获取到的内容（没有则为默认值）
 */
function getParam($key,$default='')
{
    return trim($key && is_string($key) ? (isset($_POST[$key]) ? $_POST[$key] : (isset($_GET[$key]) ? $_GET[$key] : $default)) : $default);
}

/**
 * 输出一个json或jsonp格式的内容
 * @param $data 数组内容
 */
function echojson($data)
{
    header('Content-type: application/json');
    $callback = getParam('callback');
    if($callback != '') {//输出jsonp格式
        die(htmlspecialchars($callback).'('.$data.')');
    } else {
        die($data);
    }
}
