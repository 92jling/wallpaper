<?php
/**
 * ===================================================================
 * 关键配置：请将这里替换为你的新 API 的根 URL
 * 例如：$NEW_API_BASE_URL = "http://api.360.com";
 * ===================================================================
 */
$NEW_API_BASE_URL = "https://img.mcptool.me"; // !! 必须修改这里

//tags http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome
//new http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&start=【0开始】&count=【加载数】&from=360chrome
//专区 http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid=【分类ID】&start=【0开始】&count=【加载数】&from=360chrome

$cid = getParam('cid', '360new');

switch($cid)
{
    case '360new':  // 获取最新壁纸 (对应新 API: /api/latest)
        $start = getParam('start', 0);
        $count = getParam('count', 10); // 你的旧代码默认是10，新API文档默认是20，这里保持你旧的逻辑
        // 新 URL: /api/latest?start=...&count=...
        echojson(file_get_contents("{$NEW_API_BASE_URL}/api/latest?start={$start}&count={$count}"));
    break;
    
    case '360tags': // 获取所有壁纸分类 (对应新 API: /api/categories)
        // 新 URL: /api/categories
        echojson(file_get_contents("{$NEW_API_BASE_URL}/api/categories"));
    break;
    
    case 'bing': // Bing 壁纸 (此功能在新API中未提及，保持原样)
        $start = getParam('start', -1);
        $count = getParam('count', 8);
        echojson(file_get_contents("http://cn.bing.com/HPImageArchive.aspx?format=js&idx={$start}&n={$count}"));
    break;
    
    default: // 获取指定分类的壁纸列表 (对应新 API: /api/wallpapers)
        $start = getParam('start', 0);
        $count = getParam('count', 10); // 你的旧代码默认是10，新API文档默认是20，这里保持你旧的逻辑
        // 新 URL: /api/wallpapers?cid=...&start=...&count=...
        echojson(file_get_contents("{$NEW_API_BASE_URL}/api/wallpapers?cid={$cid}&start={$start}&count={$count}"));
        
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
