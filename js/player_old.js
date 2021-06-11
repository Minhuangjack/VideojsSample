/// <reference path="jquery-1.9.1.js" />
/// <reference path="Silverlight.js" />

var $mediaPlayer;
var silverlightControl;
var resultDialog;
var readingPostition = 0;
var body;
var mediaPlayerReady = false;

//#region 初始化處理

$().ready(function () {

    body = $('body, html');

    body.contextmenu(function () {
        return false;
    });    

    // 講師測試結果 div
    resultDialog = document.getElementById('resultDialog');

    //#region 播放器

    var courseNo = null;

    if (!!$('#hdCourseNo').val()) {
        courseNo = parseInt($('#hdCourseNo').val());
    }

    //$mediaPlayer = $('#mediaPlayer').mediaplayer({ mediaSource: '', playEnded: PlayEnded, EndFuncName: 'PlayEnded', LoadedFuncName: 'PlayerLoaded', autoPlay: true, courseNo: courseNo });

    //#endregion

    ////#region 大綱列表

    $(".ulSection > li > a").click(function () {
        var $this = $(this);
        var outlineNo = $this.attr("data-outline-no");
        var videoId = $this.data("videoId");
        var $parentlist = $this.parent();

        $(".reading").removeClass('reading');
        $this.parent("li:first").addClass("reading").siblings(".reading").removeClass("reading");

        // 指定閱讀
        if ($parentlist.hasClass('article')) {
            OpenProg('L01A041X_ArticleList.aspx?OutlineNo=' + outlineNo, 'L01A041X');
            return false;
        }

        // 作業練習
        if ($parentlist.hasClass('drill')) {
            OpenProg('L01A051X_DrillList.aspx?OutlineNo=' + outlineNo, 'L01A051X');
            return false;
        }

        // 名詞解釋
        if ($parentlist.hasClass('glossary')) {
            //OpenProg('L01A051X_DrillList.aspx?OutlineNo=' + outlineNo, 'L01A051X');
            return false;
        }

        // 線上測驗
        if ($parentlist.hasClass('exam')) {
            //OpenProg('L01A051X_DrillList.aspx?OutlineNo=' + outlineNo, 'L01A051X');
            return false;
        }

        if ($parentlist.hasClass('exam')) return false;
        

        // 更新播放中大綱的位置，播放完畢回到此位置
        readingPostition = $this.offset().top;

        // 滾輪移到數位課程播放器的位置，避免大綱太長影響閱讀（-70 上面 Fix NavBar 的高度）

        if ($(window).width() < 992) {
            var top = $('#rightContainer').offset().top - 70;
            var dTop = top - body.scrollTop();
            var completedCall = false;

            body.animate({ scrollTop: body.scrollTop() + dTop }, 500, 'swing', function () {
                if (!completedCall) {
                    $mediaPlayer.setSource({                        
                        videoId: videoId,
                        sourceType: 'course'
                    });

                    completedCall = true;
                }
            });
        }
        else {
            $mediaPlayer.setSource({                
                videoId: videoId,
                sourceType: 'course'
            });
        }

        return false;
    });

    ////#endregion
});

//#endregion

//#region 數位課程播放器

(function ($) {    

    // html5 播放器
    $.fn.htmlPlayer = function (option) {
        var settings = $.extend({}, { mediaSource: '', autoPlay: false, thumbSource: '', playEnded: null }, option);
        var player;

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

    // Silverlight 播放器
    $.fn.smoothplayer = function (option) {

        if (this.length != 1) {
            return this;
        }

        var settings = {
            autoPlay: true,
            mediaSource: "",
            thumbSource: "",
            learnerMark: true,
            onPlayEnded: "OnPlayEnded",
            onTimelineChanged: "",
            sourceType: "course"
        }

        settings = $.extend(settings, option);        

        var player;

        //var jsFile = document.createElement("script");
        //jsFile.setAttribute("type", "text/javascript")
        //jsFile.setAttribute("src", "js/Silverlight.js");
        //if (typeof jsFile != "undefined")
        //    document.getElementsByTagName("head")[0].appendChild(jsFile)

        if ($.trim(settings.mediaSource) != "") {
            if (settings.mediaSource.toLowerCase().indexOf(".ism/manifest") == -1 && settings.mediaSource.toLowerCase().indexOf(".mp4") == -1 && settings.mediaSource.toLowerCase().indexOf(".mp3") == -1)
                settings.mediaSource += ".ism/Manifest";
        }

        // 初始化參數，傳進 Silverlight        
        var initparams = "mediasource=" + settings.mediaSource + ",autoplay=" + settings.autoPlay.toString() + ",thumbsource=" + settings.thumbSource + ",playended=" + settings.onPlayEnded + ",onTimelineChanged=" + settings.onTimelineChanged + ",leanerMark=" + settings.learnerMark;
        initparams += ",sourceType=" + settings.sourceType;

        if (settings.courseNo != undefined) {
            initparams += ",courseNo=" + settings.courseNo;
        }

        var silverlightObject = Silverlight.createObjectEx({
            source: "ClientBin/MediaPlayer.xap?" + "v=20140409" + Math.random().toString(),
            parentElement: null, // 父節點 id, 動態新增設成 null
            id: "videoPlayer",
            properties: {
                width: "100%", height: "100%",
                version: "5.0.60401.0", autoUpgrade: "true",
                windowless: "true"
            },
            events: { onError: onSilverlightError, onLoad: onSilverlightLoad },
            initParams: initparams,
            context: "" // 帶給 onLoad 的 args
        });

        var $this = this;

        var $videoObject = $(silverlightObject);

        //var $videoObject = $('<object id="videoPlayer" data="data:application/x-silverlight-2," type="application/x-silverlight-2" style="width: 100%; height:100%;">' +
        //                '<param name="source" value="ClientBin/L01A_CoursePlayer.xap?v=20140409"/>' +
        //                '<param name="onError" value="onSilverlightError" />' +
        //                '<param name="background" value="white" />' +
        //                '<param name="onLoad" value="onSilverlightLoad" />' +
        //                '<param name="minRuntimeVersion" value="5.0.61118.0" />' +
        //                '<param name="autoUpgrade" value="true" />' +
        //                '<param name="windowless" value="true"/>' +
        //                '<param name="initparams" value="' + initparams + '" />' +
        //                '<a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=5.0.61118.0" style="text-decoration:none">' +
        //                    '<img src="http://go.microsoft.com/fwlink/?LinkId=108181" alt="取得 Microsoft Silverlight" style="border-style:none"/>' +
        //                '</a>' +
        //               '</object>');

        $this.empty();
        $this.append($videoObject);

        // 離開視窗暫停播放
        //ie workaround
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

        // 關閉講師測試結果 Dialog
        //if (resultDialog != null) $(resultDialog).hide();

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

                var responseData = result.Response_Data;
                var mediaSource = responseData.MediaSource;

                if (el.Content) {
                    var lastVideoPotision = responseData.Last_Video_Position;

                    // 呼叫 Silverlight Public Function
                    el.Content.Player.SetMediaSource(mediaSource, lastVideoPotision, responseData.autoPlay);                    
                }
                else {
                    // 檢查以建立的播放器類別（audio、video）
                    // 如果不跟之前的一樣，重新建立一個
                    if (mediaSource.toString().toUpperCase().indexOf(".MP3") != -1) {
                        if ($mediaPlayer.prop('tagName') == "video") {
                            $mediaPlayer = $('#mediaPlayer').mediaplayer({ mediaSource: mediaSource });
                        }
                    }
                    else {
                        if ($mediaPlayer.prop('tagName') == "audio") {
                            $mediaPlayer = $('#mediaPlayer').mediaplayer({ mediaSource: mediaSource });
                        }

                        $mediaPlayer.attr("poster", mediaSource.replace(".mp4", "_Thumb.jpg"));
                    }

                    $mediaPlayer.attr("src", mediaSource);
                    $mediaPlayer.attr("autoplay", "autoplay");                    
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
            $loadingEl.appendTo(body);

        },
        showSuccess: function (duration, text) {
            if (!text || $.trim(text) == '')
                text = '設定完成';

            var $progressEl = $('<div class="progress-message"></div>');            

            if (progressTimer != null) {
                $('.progress-message').remove();
                clearTimeout(progressTimer);
            }

            $progressEl.text(text).hide().appendTo('body');
            $progressEl.fadeIn();

            progressTimer = setTimeout(function () {
                $progressEl.fadeOut(function () {
                    $progressEl.remove();
                });
            }, duration);
        }
    };    

})(jQuery);

function MediaPlayer(option) {
    
}

$.extend(MediaPlayer.prototype, {
    _init: function () {

    },
    setMediaSource: function (url) {
        alert(this._mediaSource);
        return this;
    },
    setPosition: function () {
        return this;
    }    
});

var OnPlayEnded = function (complete) {
    /// <summary>
    /// 學員影片播放完畢處理
    /// </summary>
    /// <param name="complete">是否正確播放完畢</param>
    if (complete) {
        var $reading = $(".reading");
        if (!!$reading.length) {
            var $nextSection = $reading.next(".section");

            if (!$nextSection.length) {
                var $nextChapter = $reading.parent().parent().nextAll(".ulSection:first");

                if (!!$nextChapter.length) {
                    $nextSection = $nextChapter.children(".section:first");
                }
            }

            if ($reading.hasClass("unread")) {
                $reading.removeClass("unread").addClass("read");
            }

            if (!$nextSection.hasClass("exam")) {
                // 單元播放間隔 1 秒
                setTimeout(function () { $nextSection.find("a").trigger("click"); }, 1000);
            }
        }
    }
    else {
        alert('無法連接影片');
    }
}

//function PlayEnded(complete) {
//    /// <summary>
//    /// 學員影片播放完畢處理
//    /// </summary>
//    /// <param name="complete">是否正確播放完畢</param>
//    if (complete) {
//        var $reading = $(".reading");
//        if (!!$reading.length) {
//            var $nextSection = $reading.next(".section");

//            if (!$nextSection.length) {
//                var $nextChapter = $reading.parent().parent().nextAll(".ulSection:first");

//                if (!!$nextChapter.length) {
//                    $nextSection = $nextChapter.children(".section:first");
//                }
//            }

//            if ($reading.hasClass("unread")) {
//                $reading.removeClass("unread").addClass("read");
//            }

//            if (!$nextSection.hasClass("exam")) {
//                // 單元播放間隔 1 秒
//                setTimeout(function () { $nextSection.find("a").trigger("click"); }, 1000);
//            }
//        }
//    }
//    else {
//        alert('無法連接影片');
//    }
//}

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
    /// Silverlight 發生錯誤處理的function 
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

    //throw new Error(errMsg);
    console.log(errMsg);
}

var InitPlayer = function () {

}

function onSilverlightLoad(sender, args) {
    /// <summary>
    /// 當 Silverlight control 確定載入完成時呼叫的function 
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="args"></param>    
    mediaPlayerReady = true;
    InitPlayer();    
}

//#endregion

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

function getFunctionName(fun) {
	/// <summary>
    /// 取得 javascript function 名稱
    /// 此方法不適用 var fun = function (){} 動態方法
	/// </summary>
	/// <param name="fun">傳入 function</param>
    /// <returns type="string">function name</returns>
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}

String.prototype.toHHMMSS = function (option) {
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