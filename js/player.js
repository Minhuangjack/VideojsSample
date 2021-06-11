/*
    * Silverlight 與 Html 播放器主要 javascript
    * 前置引用 javascript：
    *   1. jQuery.js
    *   2. Silverlight.js
    *
    *
    *
    *
    *
    *
    *
    *
*/

/// <reference path="jquery-1.9.1.js" />
/// <reference path="Silverlight.js" />

//#region 初始化處理

var mediaPlayerReady = false;

$(document).ready(function () {

    //var body = $('body, html');
    // 鎖右鍵、選取、拖拉
    //body.on('dragstart contextmenu selectstart', function () {
    //    return false;
    //});
});

//#endregion

//#region 數位課程播放器

(function ($) {

    // 預設參數
    var defaults = {

        // 基本設定
        autoPlay: true,             // 自動播放        
        mediaSource: '',         // 影片路徑
        thumbSource: '',         // 影片預覽圖片路徑        
        learnerMark: true,          // 學員記號（是否顯示新增筆記、問答）
        sourceType: "course",        // 來源型別 課程（course）、簡報（briefing）

        // 事件
        onLoaded: false,            // 播放器載入後處理 function
        onPlayEnded: false,         // 播放結束處理 function
        onTimelineChanged: false,   // 時間軸變化處理 function                
        onMarkerReached: false      // marker 到達觸發 function
    }

    //#region html 5 播放器（同時處理 video、audio）    
    $.fn.htmlPlayer = function (option) {
        var settings = $.extend(defaults, option),
            player;        

        if (this.length != 1) return;

        if (!supports_video() || !supports_audio()) {
            alert('您的瀏覽器不支援 HTML 5 影音播放標記');
            return this;
        }        

        if (settings.mediaSource.toString().toUpperCase().indexOf(".MP3") != -1) {
            player = document.createElement("audio");
        }
        else {
            player = document.createElement("video");

            if ($.trim(settings.thumbSource) != '') {
                player.setAttribute("poster", settings.thumbSource);
            }

            player.setAttribute("style", "width:100%;");
        }

        settings.mediaSource = settings.mediaSource.replace("ism/Manifest", "mp4");

        player.setAttribute("id", "videoPlayer");
        player.setAttribute("controls", "controls");

        if (settings.mediaSource != "") {
            player.setAttribute("src", settings.mediaSource);
        }

        if (settings.autoPlay) {
            player.setAttribute("autoplay", "autoplay");
        }

        // 鎖右鍵
        player.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            return false;
        });

        // 播放結束
        player.addEventListener("ended", function () {
            settings.playEnded(true);
        });

        // 影片載入錯誤
        player.addEventListener("error", function () {
            alert("無法連接影片");
            return false;
        });

        // 準備可以播放
        player.addEventListener("canplay", function () {
            this.play();
        });

        // 離開視窗暫停播放
        window.addEventListener("blur", function () {
            player.pause();
        });

        // 清空 container
        this.empty();
        this.append(player);

        return $(player);
    }

    // #endregion

    // Silverlight 播放器
    $.fn.smoothplayer = function (option) {

        if (this.length != 1) {
            return this;
        }

        var $this = this,
            settings = $.extend(defaults, option);

        if ($.trim(settings.mediaSource) != "") {
            if (settings.mediaSource.toLowerCase().indexOf(".ism/manifest") == -1 && settings.mediaSource.toLowerCase().indexOf(".mp4") == -1 && settings.mediaSource.toLowerCase().indexOf(".mp3") == -1)
                settings.mediaSource += ".ism/Manifest";
        }

        // 初始化參數，傳進 Silverlight        
        var initparams = "mediaSource=" + settings.mediaSource + ",autoPlay=" + settings.autoPlay.toString() + ",thumbSource=" + settings.thumbSource + ",learnerMark=" + settings.learnerMark;
        initparams += ",sourceType=" + settings.sourceType;        

        var silverlightObject = Silverlight.createObjectEx({
            source: "ClientBin/MediaPlayer.xap?" + "v=20140409",
            parentElement: null, // 父節點 id, 動態新增設成 null
            id: "videoPlayer",
            properties: {
                width: "100%", height: "100%",
                version: "5.0.60401.0", autoUpgrade: "true",
                windowless: "true"
            },
            events: { onError: onSilverlightError, onLoad: onSilverlightLoad },
            initParams: initparams,
            context: settings // 帶給 onLoad 的 args
        });

        var $videoObject = $(silverlightObject);

        $this.empty();
        $this.append($videoObject);        

        // 離開視窗暫停播放
        // IE 處理方式
        document.onfocusout = function (e) {
            if (e === undefined) {//ie
                var evt = event;//ie uses event
                if (evt.toElement == null) {//check where focus was lost to  
                    if (!!$videoObject.length && mediaPlayerReady) {
                        if (!$videoObject[0].Content.Player.GetFullScreen()) {
                            var state = $videoObject.getCurrentState().toLowerCase();
                            if ((state != 'paused' && state != 'stopped' && state != '')) {
                                $videoObject.videoControl('pause');
                                $('.player-message').find('.text').text('影片已暫停播放，是否繼續觀看?').end().show();
                            }
                        }
                    }
                }
            }
        };

        window.onblur = function (e) {
            if (e !== undefined) {//ie will have an undefined e here, so this screens them out                                
                if (!!$videoObject.length && mediaPlayerReady) {
                    if (!$videoObject[0].Content.Player.GetFullScreen()) {
                        var state = $videoObject.getCurrentState().toLowerCase(); 
                        if ((state != 'paused' && state != 'stopped' && state != '')) {
                            $videoObject.videoControl('pause');
                            $('.player-message').find('.text').text('影片已暫停播放，是否繼續觀看?').end().show();
                        }
                    }
                }
            }
        };

        return $videoObject;
    }

    $.fn.mediaplayer = function (option) {
    	/// <summary>
    	/// 初始化播放器
    	/// </summary>
    	/// <param name="option"></param>
    	/// <returns type=""></returns>
        if (check_isMobile()) {
            // HTML 5
            return this.htmlPlayer(option);
        }
        else {
            // Silverlight
            return this.smoothplayer(option);
            //return this.htmlPlayer(option);
        }
    }

    // 設定播放器播放時間
    $.fn.setPosition = function (position, autoplay) {
    	/// <summary>
    	/// 設定開始播放時間位置
    	/// </summary>
    	/// <param name="position">設定時間</param>
    	/// <returns type=""></returns>
        var $this = this;
        var el = $this[0];
        if (el.Content == null) {
            el.currentTime = position;
        }
        else {
            el.Content.Player.SetVideoPosition(position, autoplay);            
        }
        return $this;
    }

    $.fn.getTotalSeconds = function () {
        /// <summary>
        /// 取得影片總長
        /// </summary>
        /// <returns type=""></returns>
        var $this = this;
        var el = $this[0];
        var position = 0;
        if (el.Content == null) {
            //position = el.currentTime;
        }
        else {
            position = el.Content.Player.GetVideoTotalSeconds();
        }
        return position;
    }
    
    $.fn.getPosition = function () {
    	/// <summary>
    	/// 取得現在播放時間位置
    	/// </summary>
    	/// <returns type=""></returns>
        var $this = this;
        var el = $this[0];
        var position = 0;
        if (el.Content == null) {
            position = el.currentTime;
        }
        else {
            position = el.Content.Player.GetVideoPosition();
        }
        return position;
    }

    $.fn.getCurrentState = function () {
        /// <summary>
        /// 取得現在播放狀態
        /// </summary>
        /// <returns type=""></returns>
        var $this = this;
        var el = $this.get(0);
        var state = '';
        if (el.Content == null) {
            if (el.paused === true) {
                state = 'paused';
            }            
            else {
                state = 'playing';
            }            
        }
        else {
            state = el.Content.Player.GetCurrentState();
        }
        return state;
    }

    $.fn.setMarker = function (markers) {
    	/// <summary>
    	/// 設定筆記顯示 marker
    	/// </summary>
        /// <param name="option"></param>
        var $this = this;
        var el = $this[0];
        var position = 0;
        if (el.Content == null) {
            //el.removeEventListener('timeupdate');            
            el.addEventListener('timeupdate', function () {

            });
        }
        else {
            el.Content.Player.SetMarker(JSON.stringify(markers));
        }
        return position;
    }

    $.fn.addMarker = function (data) {
        /// <summary>
        /// 設定筆記顯示 marker
        /// </summary>
        /// <param name="option"></param>
        var $this = this;
        var el = $this[0];        
        if (el.Content == null) {            
        }
        else {
            el.Content.Player.AddMarker(JSON.stringify(data));
        }
        return this;
    }

    $.fn.modifyMarker = function (option) {
        /// <summary>
        /// 設定筆記顯示 marker
        /// </summary>
        /// <param name="option"></param>
        var $this = this;
        var el = $this.get(0);        
        if (el.Content == null) {
        }
        else {
            el.Content.Player.ModifyMarker(option.Data_No, option.Marker_Text, option.Marker_Position, option.Marker_Duration);
        }
        return this;
    }

    $.fn.deleteMarker = function (data_no) {
        /// <summary>
        /// 設定筆記顯示 marker
        /// </summary>
        /// <param name="option"></param>
        var $this = this;
        var el = $this[0];        
        if (el.Content == null) {
        }
        else {
            el.Content.Player.DeleteMarker(data_no);
        }
        return this;
    }

    $.fn.videoControl = function (type) {
    	/// <summary>
    	/// 設定播放控制（暫停、播放）
    	/// </summary>
    	/// <param name="type">play, pause</param>
    	/// <returns type=""></returns>
        var $this = this;
        var el = $this[0];        
        if (el.Content == null) {

        }
        else {
            el.Content.Player.VideoControl(type);
        }

        return $this;
    }
    
    $.fn.setSource = function (option) {
    	/// <summary>
    	/// 設定播放器 media source
    	/// </summary>
        /// <param name="option"></param>                
        var def = { learnerMark : true };

        var $this = this;
        var el    = $this.get(0);

        //if (option.learnerMark == undefined)
        //    option.learnerMark = true;

        option = $.extend(def, option);

        var method = "GetMediaSource";
        var params = { Source_Type: option.sourceType, Mobile_Mark: true, Learner_Mark: option.learnerMark };        

        if (option.dataNo) {
            params.Data_No = option.dataNo;
            method += '2';
        }
        else {
            params.Video_Id = option.videoId
        }

        // Silverlight 播放器
        if (el.Content) {
            if (!mediaPlayerReady) {
                alert('請等待播放器載入完畢');
                return;
            }

            params.Mobile_Mark = false;
        }

        StartAjax(method, params, function (result) {
            // 成功取得影片路徑
            if (!result.Success_Mark) {
                if (result.Display_Message != '')
                    alert(result.Display_Message);
            }
            else {
                var responseData = result.Response_Data,
                    mediaSource = responseData.MediaSource;

                if (el.Content) {
                    var lastVideoPotision = responseData.Last_Video_Position;

                    // 呼叫 Silverlight Public Function
                    el.Content.Player.SetMediaSource(mediaSource, lastVideoPotision, responseData.autoPlay);                    
                }
                else {
                    // 檢查以建立的播放器類別（audio、video）
                    // 如果不跟之前的一樣，重新建立一個
                    if (mediaSource.toString().toUpperCase().indexOf(".MP3") != -1) {
                        if ($this.prop('tagName') == "video") {
                            $this = $('#mediaPlayer').mediaplayer({ mediaSource: mediaSource });
                        }
                    }
                    else {
                        if ($this.prop('tagName') == "audio") {
                            $this = $('#mediaPlayer').mediaplayer({ mediaSource: mediaSource });
                        }

                        $this.attr("poster", mediaSource.replace(".mp4", "_Thumb.jpg"));
                    }

                    $this.attr("src", mediaSource);
                    $this.attr("autoplay", "autoplay");
                }

                if (option.onComplete != undefined) {
                    option.onComplete(responseData);
                }
            }
        });              

        return $this;
    }

    $.fn.setCourseSettings = function (option) {
        if (!this.length) return;

        if (option.courseNo = null) return;

        this[0].Content.Player.SetCourseSetting(option.courseNo);
        return this;
    }

    var progressTimer = null;

    $.progress = {
        showLoading: function (duration, text) {
            if (!text || $.trim(text) == '')
                text = '資料處理中...';

            var $loadingEl = $('<div class="loading"><div class="overlay"></div><div class="message"><img src="css/images/ajax-loader-snack.gif" alt="Loading..." />' + text + '</div></div>');
            $loadingEl.appendTo(document.body);

        },
        showSuccess: function (duration, text) {
            if (!text || $.trim(text) == '')
                text = '設定完成';

            var $progressEl = $('<div class="progress-message"></div>');            

            if (progressTimer != null) {
                $('.progress-message').remove();
                clearTimeout(progressTimer);
            }

            $progressEl.text(text).hide().appendTo(document.body);
            $progressEl.fadeIn();

            progressTimer = setTimeout(function () {
                $progressEl.fadeOut(function () {
                    $progressEl.remove();
                });
            }, duration);
        }
    };    

})(jQuery);

function check_isMobile() {
    /// <signature>
    ///   <summary>檢查手持裝置</summary>    
    ///   <returns type="bool" />
    /// </signature>    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function supports_video() {
    /// <signature>
    ///   <summary>檢查支援 html video</summary>    
    ///   <returns type="bool" />
    /// </signature>
    return !!document.createElement('video').canPlayType;
}

function supports_audio() {
    /// <signature>
    ///   <summary>檢查支援 html audio</summary>    
    ///   <returns type="bool" />
    /// </signature>
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
}

function onSilverlightError(sender, args) {
    /// <summary>
    /// Silverlight 發生錯誤處理
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="args"></param>
    var appSource = "";
    if (sender != null && sender != 0) {
        appSource = sender.getHost().Source;
    }

    var errorType = args.ErrorType;
    var iErrorCode = args.ErrorCode;

    if (errorType == "ImageError" || errorType == "MediaError") {
        return;
    }

    var errMsg = "Silverlight 應用程式中有未處理的錯誤 " + appSource + "\n";

    errMsg += "代碼: " + iErrorCode + "    \n";
    errMsg += "分類: " + errorType + "       \n";
    errMsg += "訊息: " + args.ErrorMessage + "     \n";

    if (errorType == "ParserError") {
        errMsg += "檔案: " + args.xamlFile + "     \n";
        errMsg += "行: " + args.lineNumber + "     \n";
        errMsg += "位置: " + args.charPosition + "     \n";
    }
    else if (errorType == "RuntimeError") {
        if (args.lineNumber != 0) {
            errMsg += "行: " + args.lineNumber + "     \n";
            errMsg += "位置: " + args.charPosition + "     \n";
        }
        errMsg += "方法名稱: " + args.methodName + "     \n";
    }
    
    console.log(errMsg);
}

function onSilverlightLoad(sender, args) {
    /// <summary>
    /// 當 Silverlight 確定載入完成時
    /// </summary>
    /// <param name="sender">Silverlight Obj</param>
    /// <param name="args">自訂傳入的參數</param>    
    
    mediaPlayerReady = true;

    var settings = args;    

    // 設定 Silverlight 播放結束 callback
    if (settings.onPlayEnded) {
        sender.Content.Player.SetPlayEndedCallBack(settings.onPlayEnded);        
    }
    else {
        sender.Content.Player.SetPlayEndedCallBack(function (complete) {
            if (!complete) {
                alert('無法連接影片');
            }
        });
    }

    // 設定 Silverlight 使用者移動時間軸時 callback
    if (settings.onTimelineChanged) {
        sender.Content.Player.SetTimelineChagnedCallBack(settings.onTimelineChanged);
    }

    // 設定 Silverlight marker 到達時 callback
    if (settings.onMarkerReached) {
        sender.Content.Player.SetMarkerReachedCallBack(settings.onMarkerReached);
    }

    // 載入初始化 Player function
    if (settings.onLoaded) {
        settings.onLoaded();
    }    
}

//#endregion

// WebSerivce 路徑
var elearningService = "/L000_Service/ElearningService.asmx/";

// 自訂 jQuery Ajax Function
function StartAjax(url, data, success, async) {
    /// <signature>
    ///   <summary>呼叫 jQuery Ajax（以 JSON 傳遞資料）</summary>
    ///   <param name="url" type="String">路徑</param>
    ///   <param name="data" type="JSON">引數</param>
    ///   <param name="success(result)" type="Function">成功處理 Function</param>    
    ///   <param name="async" type="bool">是否以非同步傳輸</param>
    /// </signature>
    if (typeof jQuery == 'undefined')
        throw 'jQuery Not Found';

    $.ajax({
        type: 'post',
        async: async == undefined ? true : async,
        contentType: "application/json; charset=utf-8",
        url: elearningService + url,
        data: JSON.stringify(data),
        dataType: "json",
        success: function (result) {
            var d = JSON.parse(result.d);
            if (success != undefined)
            {
                success(d);
            }            
        },
        error: function (result) {            
            var err = JSON.stringify(result);            
            var errData = JSON.parse(err);
            var errMsg = JSON.parse(errData.responseText)
            alert(errMsg.Message);
            //console.log(err);
        }
    });
}

String.prototype.toHHMMSS = function (option) {
	/// <summary>
	/// 將秒數轉換成 hh:mm:ss.fff 的字串
	/// </summary>
    /// <param name="option">showFullTime 是否顯示毫秒</param>
	/// <returns type=""></returns>
    var mili = 0;
    if (this.indexOf('.') != -1) {
        var mili = this.split('.')[1];
    }

    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    var time = hours + ':' + minutes + ':' + seconds;

    if (option) {
        if (option.showFullTime === true) {
            time += "." + mili.toString().substr(0, 1);
        }
    }    

    return time;
}