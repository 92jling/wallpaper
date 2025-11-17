/********************************
 * 电脑壁纸网站
 * 孟坤网页实验室（http://lab.mkblog.cn）出品
 * ver 1.2
 * !!盗版必究!!
 ********************************/

var seting = {
    apiUrl: "/api/",    // Vercel API 路径
    ratio: 0.618,       // 图片宽高比
    types: '360new',    // 加载壁纸的种类
    // [!! MODIFIED !!] 1. 更换为 i3.wp.com 代理
    downApi: 'https://i3.wp.com/' // 新的下载代理
};

var jigsaw = {
    count: 0,         // 已加载的总数
    halfHtml: '',     // 最后一个加载的html
    loadBig: false,     // 是否已加载最大的那个
    ajaxing: false      //是否正在ajax加载
};

// 大小改变
window.onresize = function () {
    resizeHeight();
};

// 初始化
window.onload = function () {
    ajax360Tags();
    loadData(seting.types, true);    // 初始加载壁纸
    resizeHeight();
};

$(function () {
    
    // 监听滚动消息
    $(window).scroll(function () {
        if ($(this).scrollTop() + $(window).height() + 20 >= $(document).height() && $(this).scrollTop() > 20) {
            loadData(seting.types, false);
        }
        if(seting.types != 'bing' && seting.types != 'ciba'){
            if($(window).scrollTop() >= 300){ 
                $('#toolBall').fadeIn(400); 
            }else{ 
                $('#toolBall').fadeOut(200);
            } 
        }
    });

    $("#toolBall").click(function() {
        if(seting.types == 'bing' || seting.types == 'ciba') {
            return true;
        }
        $("html, body").animate({scrollTop:0}, "normal"); 
        return false;
    });
    
    // 点击关闭弹出层
    $("body").on("click","#full-img", function() {
        $("#full-img").remove();
    });
    
    // 点击小图显示大图
    $("#walBox").on("click","img", function() {
        showImg($(this).data('realurl'));
    });
});


// 加载壁纸容器中的壁纸
function loadData(types, newload) {
    if(types != seting.types || newload === true)
    {
        seting.types = types;
        jigsaw = {
            count: 0,         // 已加载的总数
            halfHtml: '',     // 最后一个加载的html
            loadBig: false,     // 是否已加载最大的那个
            ajaxing: false      //是否正在ajax加载
        };
        $("#walBox").html('');
        $(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');    // 解除全屏滚动的绑定
        $(".onepage-pagination").remove();
        $("body").removeClass();
        $(".jigsaw").removeAttr("style"); 
        $("#toolBall").attr('href', 'javascript:void(0);');
        $("#toolBall").attr('class', 'uptoTop');
        $("#toolBall").attr('title', '返回顶部');
        $("#toolBall").hide();
    }
    
    switch (seting.types)
    {
        case 'bing':    //加载必应壁纸
            ajaxBingWal(-1, 8);
            ajaxBingWal(7, 8);
            $("#toolBall").show();
            $("#toolBall").attr('class', 'downBing');
            $("#toolBall").attr('title', '下载这张图片');
        break;
        
        case 'ciba':    // 加载金山词霸每日一句壁纸
            if(newload === false) return;
            ajaxCiba(1);
            $("#toolBall").show();
            $("#toolBall").attr('class', 'downBing');
            $("#toolBall").attr('title', '下载这张图片');
        break;
        
        default:    // 加载来自360的壁纸
            ajax360Wal(seting.types, jigsaw.count, 30);
    } 
}

resizeHeight();

// 重新调整高度
function resizeHeight() {
    switch (seting.types)
    {
        default:
            var newHeight = $("#walBox").width() * (seting.ratio / 2);
            $(".jigsaw .item").css('height', newHeight);
            $(".jigsaw .Hhalf").css('height', newHeight/2);
    }
    return true;
}

// 显示一张拼图壁纸
function addJigsaw(img, alt) {
    var newHtml;    // 新增的内容
    var imgWidth,imgHeight;
    jigsaw.count++;    // 已加载壁纸数自加
    
    if(jigsaw.halfHtml !== '')     //  1/4 的壁纸
    {
        imgWidth = parseInt(screen.width / 4);
        imgHeight = parseInt(imgWidth * seting.ratio);
            
        // (图片显示 - 保持不变)
        newHtml = '    <div class="Hhalf oneImg" onmouseover="hoverJigsaw(this)">'
                + '        <img data-original="' + createProxyUrl(decode360Url(img, imgWidth, imgHeight, 0)) + '" alt="' + alt + '" title="关键字：' + alt + '" data-realurl="' + img + '">'
                + '    </div>'
                + '</div>';
        contAdd(jigsaw.halfHtml + newHtml);
        jigsaw.halfHtml = '';
        return true;
    }
    
    if(((jigsaw.count-1) % 5) === 0){jigsaw.loadBig = false;}
    
    if((jigsaw.loadBig === false) && ( (Math.floor(Math.random()*3) === 0) || ((jigsaw.count % 5) === 0) ))     // 随机加载大张壁纸
    {
        imgWidth = parseInt(screen.width / 2);
        imgHeight = parseInt(imgWidth * seting.ratio);
            
        // (图片显示 - 保持不变)
        newHtml = '<div class="item half oneImg" onmouseover="hoverJigsaw(this)">'
                + '    <img data-original="' + createProxyUrl(decode360Url(img, imgWidth, imgHeight, 0)) + '" alt="' + alt + '" title="关键字：' + alt + '" data-realurl="' + img + '">'
                + '</div>';
        contAdd(newHtml);
        jigsaw.loadBig = true;
        return true;
    }
    
    // 加载半张的壁纸
    imgWidth = parseInt(screen.width / 4);
    imgHeight = parseInt(imgWidth * seting.ratio);
        
    // (图片显示 - 保持不变)
    jigsaw.halfHtml = '<div class="item quater">'
            + '    <div class="Hhalf oneImg" onmouseover="hoverJigsaw(this)">'
            + '        <img data-original="' + createProxyUrl(decode360Url(img, imgWidth, imgHeight, 0)) + '" alt="' + alt + '" title="关键字：' + alt + '" data-realurl="' + img + '">'
            + '    </div>';
    return true;
}

// 往壁纸容器中加入内容
function contAdd(html)   
{
    var myBox = $("#walBox");
    var $newHtml = $(html);
    myBox.append($newHtml);
    $("img", $newHtml).lazyload({
        effect:'fadeIn',
        threshold: 200
    });
}

// ajax加载必应壁纸
function ajaxBingWal(start, count){
    $.ajax({
        type: "GET", 
        url: seting.apiUrl, 
        data: "cid=bing&start=" + start + "&count=" + count,
        dataType : "json",
        success: function(jsonData){
            var newHtml = '<link rel="stylesheet" href="css/onepage-scroll.css">',downUrl = '';
            $("#walBox").append(newHtml);
            
            for (var i = 0; i < jsonData.images.length; i++){
                downUrl = 'https://cn.bing.com' + jsonData.images[i].url;
                newHtml += '<section data-url="' + downUrl + '" data-img="https://cn.bing.com' + jsonData.images[i].url + '"><p class="note">' + jsonData.images[i].copyright + '</p></section>';
            }
            $("#walBox").append(newHtml);
            
            $('#walBox').onepage_scroll({
                loop: false,
                beforeMove: function(index){
                    $("#toolBall").attr('href', $(".section").eq(index-1).attr('data-url'));
                    $(".section").eq(index-1).attr('style','background-image: url('+ $(".section").eq(index-1).attr('data-img') +')');
                },
                afterMove: function(index){
                    $(".section").eq(index).attr('style','background-image: url('+ $(".section").eq(index).attr('data-img') +')');
                    $(".section").eq(index-2).attr('style','background-image: url('+ $(".section").eq(index-2).attr('data-img') +')');
                }
            });
            $("#toolBall").attr('href', $(".section").eq(0).attr('data-url'));
            $(".section").eq(0).attr('style','background-image: url('+ $(".section").eq(0).attr('data-img') +')');
            
        }
    });
    return true;
}

// ajax加载金山词霸每日图片
function ajaxCiba(data) {
    $.ajax({
        type: "GET", 
        url: "https://open.iciba.com/dsapi/", 
        dataType : "jsonp",
        success: function(jsonData){
            var newHtml = '<style>#walBox .note{position: fixed;}body{background-image: url(' + jsonData.picture2 + ');overflow: hidden;}</style>' +
            '<p class="note" title="' + jsonData.translation + '"><span onclick="$(\'audio\')[0].play();" title="点击朗读" class="ciba-eng">' + jsonData.content + '</span><br>' + jsonData.note +
            ' <span title="' + jsonData.love + '人喜欢" class="ciba-love" onclick="$(\'.love-count\').html(parseInt($(\'.love-count\').html()) + 1)"><span style="color: red;">❤</span>+<span class="love-count">' + jsonData.love + '</span></span></p>' + 
            '<audio src="' + jsonData.tts + '" hidden></audio>';
            
            $("#walBox").append(newHtml);
            
            // [!! MODIFIED !!] 2. 使用新的下载代理
            $("#toolBall").attr('href', createDownloadUrl(jsonData.picture2));    // 下载链接
            
        }
    });
    return true;
}

// ajax加载360壁纸标签
function ajax360Tags() {
    $.ajax({
        type: "GET", 
        url: seting.apiUrl, 
        data: "cid=360tags",
        dataType : "json",
        success: function(jsonData){
            var newHtml = '';
            for (var i = 0; i < jsonData.data.length; i++){
                newHtml += '<li data-id=' + jsonData.data[i].id + ' onclick="loadData(' + jsonData.data[i].id + ', true);changeTitle(this)">' + jsonData.data[i].name + '</li>';
            }
            $("#tags").append(newHtml);
        }
    });
    return true;
}

// ajax加载来自360的壁纸
function ajax360Wal(cid, start, count) {
    if(jigsaw.ajaxing === true) return false;
    $("#loadmore").html('努力加载中……');
    $("#loadmore").show();
    jigsaw.ajaxing = true;
    $.ajax({
        type: "GET", 
        url: seting.apiUrl, 
        data: "cid=" + cid + "&start=" + start + "&count=" + count,
        dataType : "json",
        success: function(jsonData){
            for (var i = 0; i < jsonData.data.length; i++){
                addJigsaw(jsonData.data[i].url, decode360Tag(jsonData.data[i].tag));
            }
            resizeHeight();
            jigsaw.ajaxing = false;
            if(jsonData.data.length === 0){
                $("#loadmore").html('所有的壁纸都已经加载完啦！');
            }else{
                $("#loadmore").hide();
            }
        }
    });
    return true;
}

// 解码360api获取的tag标签
function decode360Tag(oldTag) {
    return oldTag.match(/_category_[^_]+_/g).join(" ").replace(/_category_([^_]+)_/g, "$1");
}

// 解码360图片的链接，获得指定尺寸图片
function decode360Url(oldUrl, width, height, quality) {
    var newUrl = oldUrl.replace("r\/__85", "m\/" + parseInt(width) + "_" + parseInt(height) + "_" + quality);
    newUrl = newUrl.replace(/http:\/\//g, "https://");
    return newUrl;
}

// 拼图图块鼠标移动显示分辨率下载
function hoverJigsaw(obj) {
    if ($(obj).find('.down').length > 0) return true;
    
    var realUrl = $(obj).find('img').attr("data-realurl");
    var downBox = '';
    
    // [!! MODIFIED !!] 3. 使用新的下载代理
    downBox = '<ul class="down" title="下载壁纸">'
    + '<li><a href="' + createDownloadUrl(decode360Url(realUrl, 2560, 1600, 100))+ '" download="wallpaper-2560x1600.jpg" target="_blank">2560x1600</a></li>'
    + '<li><a href="' + createDownloadUrl(decode360Url(realUrl, 1440, 900, 100))+ '" download="wallpaper-1440x900.jpg" target="_blank">1440x900</a></li>'
    + '<li><a href="' + createDownloadUrl(decode360Url(realUrl, 1024, 768, 100))+ '" download="wallpaper-1024x768.jpg" target="_blank">1024x768</a></li>'
    + '<li><a href="' + createDownloadUrl(decode360Url(realUrl, 800, 600, 100))+ '" download="wallpaper-800x600.jpg" target="_blank">800x600</a></li>'
    + '<li><a href="' + createDownloadUrl(decode360Url(realUrl, 0, 0, 100))+ '" download="wallpaper-original.jpg" target="_blank" title="下载原始尺寸图片">原始尺寸</a></li></ul>'
    $(obj).append(downBox);
}

// 同步改变浏览器标题
function changeTitle(obj) {
    $('title').html($(obj).html()+' - 在线壁纸');
}

// (图片显示代理 - 保持不变)
function createProxyUrl(originalUrl) {
    if (!originalUrl) {
        return "";
    }
    return seting.apiUrl + '?img_url=' + encodeURIComponent(originalUrl); 
}

// [!! NEW FUNCTION !!]
/**
 * 创建 i3.wp.com 下载代理 URL
 * @param {string} originalUrl - 原始图片 URL (e.g., https://example.com/img.jpg)
 * @returns {string} - i3.wp.com 代理后的 URL (e.g., https://i3.wp.com/example.com/img.jpg)
 */
function createDownloadUrl(originalUrl) {
    if (!originalUrl) {
        return "";
    }
    // 移除 "https://" 或 "http://"
    var cleanUrl = originalUrl.replace(/^https?:\/\//, '');
    return seting.downApi + cleanUrl;
}

var imgDom;

// 全屏展示图片
function showImg(img) {
    // (图片显示代理 - 保持不变)
    imgDom = $('<img>').attr('id', 'full-img').attr('src', createProxyUrl(img)).appendTo('body');
}

// 版权信息
console.info('作者：mengkun(https://mkblog.cn)\n壁纸来源于：360壁纸库、必应首页壁纸以及金山词霸开放平台\nGithub：https://github.com/mengkunsoft/wallpaper');
