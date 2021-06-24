<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="VideojsSample.WebForm1" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>影片播放</title>
    <%--<link href=".\css\video-js.css" rel="stylesheet">--%>
    <link href="https://vjs.zencdn.net/7.11.4/video-js.css" rel="stylesheet" />
    <script src=".\js\jquery.min.js"></script>
    <%--<script src=".\js\video.js"></script>--%>
    <script src="https://vjs.zencdn.net/7.11.4/video.min.js"></script>
    
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <div>
                <video id="video_player" class="video-js vjs-big-play-centered vjs-fluid">
                    <p class="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a
                        web browser that
                    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
                    </p>
                </video>
            </div>
        </div>
    </form>
<script>

    // 限制影片不能按右鍵
    $('#video_player').bind('contextmenu', function () { return false; });

    //創建XMLHttpRequest對象
    var xhr = new XMLHttpRequest();
    //配置請求方式、請求地址以及是否同步
    xhr.open('post', 'Video.aspx/GetVideoFile', true);
    
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    //設置請求结果類型为blob
    xhr.responseType = 'blob';
    var myVideoId = 'test.m3u8';
    // var myVideoId = 'ssss.mp4';

    var url = "VideoId=" + myVideoId;
    var blob;
    var binary;
    var getresponse;
    //請求成功回调函數
    xhr.onload = function (e) {
        console.log(this);
        getresponse = this;
        if (this.status == 200) {//請求成功
            //獲取blob對象
            blob = this.response;
            console.log(blob);
            // binary = convertDataURIToBinary(this.response)
            //獲取blob對象地址，并把值赋给容器
             videojs(document.getElementById('video_player'), {
                controls: true, // 是否顯示控制條
                poster: '', // 視頻封面圖地址
                preload: 'auto',
                autoplay: false,
                fluid: true, // 自適應寬高
                language: 'zh-CN', // 設置語言
                muted: false, // 是否静音
                inactivityTimeout: false,
                controlBar: { // 設置控制條组件
                    /* 設置控制條裡面组件的相關屬性及顯示與否
                    'currentTimeDisplay':true,
                    'timeDivider':true,
                    'durationDisplay':true,
                    'remainingTimeDisplay':false,
                    volumePanel: {
                      inline: false,
                    }
                    */
                    /* 使用children的形式可以控制每一个控件的位置，以及顯示與否 */
                    children: [
                        { name: 'playToggle' }, // 播放按钮
                        { name: 'currentTimeDisplay' }, // 當前已播放时間
                        { name: 'progressControl' }, // 播放進度條
                        { name: 'durationDisplay' }, // 總时間
                        { // 倍數播放
                            name: 'playbackRateMenuButton',
                            'playbackRates': [0.5, 1, 1.5, 2, 2.5]
                        },
                        {
                            name: 'volumePanel', // 音量控制
                            inline: false, // 不使用水平方式
                        },
                        { name: 'FullscreenToggle' } // 全屏
                    ]
                },
                sources: [ // 視頻源
                    {
                        // src: window.URL.createObjectURL(blob), //'test.mp4',
                        src: blob, //'test.mp4',
                        //src: 'mp4/test.m3u8', //'mp4/test.m3u8',
                        //type: 'application/x-mpegURL',
                        //type: 'video/mp4',
                        type: 'application/vnd.apple.mpegurl',
                        poster: ''
                    }
                ]
            });
        }
    };
    xhr.send(url);

    function revokeUrl(url) {
        window.URL.revokeObjectURL(url);
    }

    function BinToText(bin) {
        return parseInt(bin, 2).toString(10);
    }

</script>
</body>
</html>
