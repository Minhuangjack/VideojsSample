/// <reference path="jquery-1.9.1.js" />
/// <reference path="player.js" />
/// <reference path="L10B.js" />
/// <reference path="bootstrap.js" />
/// <reference path="knockout-3.0.0.debug.js" />

var $mediaPlayer,
    $memoDialog,
    $questionDialog,
    sourceAvailable;
       

$(function () {
    // 避免使用者按 enter post form    
    $('form').submit(function () {
        return false;
    });

    // 鎖右鍵、拖拉物件
    $(document.body).on('dragstart contextmenu', function () {
        return false;
    });

    var videoData = $('#hdVideoData').val() == "" ? null : JSON.parse($('#hdVideoData').val());

    // 產生 player
    $mediaPlayer = $('#mediaPlayer').mediaplayer({
        sourceType: 'briefing',        
        onPlayEnded: function (complete) {
        	/// <summary>
        	/// 播放結束處理
        	/// </summary>
        	/// <param name="complete">成功播放完畢、播放失敗</param>
            if (!complete) {
                // 無法播放：播放尚未上傳的影片
                $mediaPlayer.get(0).Content.Player.SetMediaSource("http://ntestmedia.colatour.com.tw/Cola_MediaFiles/inproc/pd_notfound.mp4", 0, false);
            }

            sourceAvailable = complete;
        },
        onLoaded: function () {
            if (videoData != null) {
                $mediaPlayer.setSource({
                    videoId: videoData.Video_Id,
                    sourceType: 'briefing',
                    onComplete: OnGetMediaSourceComplete
                });
            }
        },
        onMarkerReached: function (data_no, marker_text, marker_type, duration) {
            var $div;

            if (marker_type == 'memo') {
                //if ($('#videomemo').data('activeDocNo') == undefined) return;
                $div = $('.video-memo-list');
            }
            else {
                //if ($('#videotext').data('activeDocNo') == undefined) return;
                $div = $('.video-text-list');

                //if (textTimer != null)
                //    clearTimeout(textTimer);
            }

            //$('.video-memo-text').text(marker_text).stop().hide().fadeIn(function () {
            //    var _this = $(this);        
            //    memoTimer = setTimeout(function () {
            //        _this.fadeOut();
            //    }, 5000);
            //});

            var $li = $div.find('li[data-data-no="' + data_no + '"]').siblings('.reach').removeClass('reach').end().addClass('reach');

            if ($li.length > 0) {
                // scroll 到 div 中間
                $div.stop().animate({
                    scrollTop: $div.scrollTop() + $li.position().top
                        - $div.height() / 2 + $li.height() / 2
                }, '500', 'swing');
            }
        }
    });

    // 移除載入中 overlay
    $('.loading').remove();    

    var replyForm = '<div id="replyForm"><div class="media msg reply"><div class="media-body text-right"><textarea placeholder="請輸入回覆內容" class="form-control col-lg-12" id="txtReplyContent"></textarea><div class="pull-left help-block"></div><input data-role="sendReply" type="button" value="送出" class="btn btn-primary btn-xs"/></div></div><hr class="reply"/></div>';
    var $replyForm = $(replyForm);
    var body = $('html, body');    
    var $subscribe = $('[data-role="subscribe"]'), $finishWatch = $('[data-role="finishwatch"]');
    var $settings = $('.settings');
    var $tooltab = $('.tooltab');
    var playlistMark = false;    

    var vm;
    var questionArray;

    function viewModel() {
        var self = this;
        self.questions = ko.observableArray(questionArray);
        self.canScroll = true;
        self.canReply = ko.observable(false);
        self.questionCount = ko.computed(function () {
            return '(' + self.questions().length + ')';
        });
        self.afterAddEvent = function (el, index, data) {
            if (self.canScroll) {                
                if (el.nodeType === 1 && $(el).hasClass('media')) {
                    $('.new').removeClass('new');
                    $(el).addClass('new');

                    var complete = false;
                    if (!complete) {
                        body.on("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
                            body.stop();
                        });

                        var top = $(el).offset().top;                        

                        body.animate({
                            scrollTop: top
                        }, 500, function () {
                            complete = true;                            
                            body.off("scroll mousedown DOMMouseScroll mousewheel keyup");
                        });
                    }                    
                }
            }
        };

        self.setPosition = function (question) {
            $mediaPlayer.setPosition(question.Question_Position);
            return false;
        };

        self.replyQuestionNo = ko.observable(0);

        self.replyQuestion = function (question) {
            self.replyQuestionNo(question.Question_No);

            $replyForm.remove();
            $replyForm = $(replyForm);

            $replyForm.insertAfter($('[data-no="' + question.Question_No + '"]').last().next());
            $replyForm.find('textarea').focus();

            var top = $replyForm.offset().top;

            var complete = false;
            if (!complete) {
                body.on("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
                    body.stop();
                });

                body.animate({
                    scrollTop: top
                }, 500, function () {
                    complete = true;
                    body.off("scroll mousedown DOMMouseScroll mousewheel keyup");
                });
            }

            return false;
        };

        self.followQuestion = function (question, event) {
            if (event.stopPropagation) event.stopPropagation();
            if ($(event.target).is(':disabled')) return;

            var followMark = !question.Follow_Mark();
            

            StartAjax("SetFollowMark", { Question_No: question.Question_No, Follow_Mark: followMark }, function (result) {
                if (!result.Success_Mark) {
                    if (result.Display_Message != '') {
                        alert(result.Display_Message);
                        return;
                    }
                }
                else {
                    if (followMark) {
                        question.Follow_Nos(question.Follow_Nos() + 1);
                    }
                    else {
                        question.Follow_Nos(question.Follow_Nos() - 1);
                    }

                    question.Follow_Mark(followMark);                    
                }
            });

            return false;
        };

        self.readMore = function (question, event) {
            if (event.stopPropagation) event.stopPropagation();

            var $this = $(event.target ? event.target : event.srcElement);

            $this.prev().html(question.Question_Content);
            $this.remove();

            return false;
        };
    }

    // 成功取得影片路徑處理
    function OnGetMediaSourceComplete(result) {        
        videoData = result;
        playlistMark = result.Playlist_Mark;
        if (playlistMark) {
            $subscribe.prop('disabled', true).text('已收藏');
            if (result.Finish_Mark == true){
                $finishWatch.prop('disabled', true).text('已完成');
            }
            else {
                $finishWatch.prop('disabled', false).text('完成觀看');
            }                
        }
        else {
            $subscribe.prop('disabled', false).text('收藏');
            $finishWatch.prop('disabled', true).text('完成觀看');
        }

        var markers = new Array();

        if (result.Video_Memo != undefined) {
            var $list = $('.video-memo-group');

            $list.find('.nodata').addClass('loading-bg').text('資料載入中...').show();                        

            $list.find('*').not('.nodata').remove();

            var videoMemo = result.Video_Memo;

            if (videoMemo.length == 0) {
                $list.find('.nodata').removeClass('loading-bg').text('沒有資料').show();
            }
            else {

                $list.find('.nodata').hide();

                var myHtml = '';
                for (index in videoMemo) {
                    var videoMemoRow = videoMemo[index];
                    var positionText = videoMemoRow.Video_Position.toString().toHHMMSS();
                    myHtml += '<li class="marker" data-data-no="' + videoMemoRow.Data_No + '" data-position="' + videoMemoRow.Video_Position + '"><div class="pull-left"><span class="position" title="影片時間">' + positionText + '</span> <span class="memo">' + videoMemoRow.Video_Memo + '</span></div><button type="button" title="刪除筆記" data-data-no="' + videoMemoRow.Data_No + '" class="close delete-memo">&times;</button></li>';
                }

                $(myHtml).hide().prependTo($list)
                    .css('opacity', 0)
                    .slideDown(200)
                    .animate(
                        { opacity: 1 },
                        { queue: false, duration: 200 }
                );
            }            
            markers.push({ type: 'memo', data: result.Video_Memo });
        }   

        if (result.Video_Text != undefined) {
            var $list = $('.video-text-group');

            $list.find('.nodata').addClass('loading-bg').text('資料載入中...').show();            

            $list.find('*').not('.nodata').remove();

            var videoText = result.Video_Text;

            if (videoText.length == 0) {
                $list.find('.nodata').removeClass('loading-bg').text('沒有資料').show();
            }
            else {

                $list.find('.nodata').hide();

                var myHtml = '';
                for (index in videoText) {
                    var videoTextRow = videoText[index];
                    var positionText = videoTextRow.Text_Position.toString().toHHMMSS();
                    myHtml += '<li class="marker" data-data-no="' + videoTextRow.Data_No + '" data-position="' + videoTextRow.Text_Position + '"><div class="pull-left"><span class="position" title="影片時間">' + positionText + '</span> <span class="memo">' + videoTextRow.Text_Content + '</span></div></li>';
                }

                $(myHtml).hide().prependTo($list)
                    .css('opacity', 0)
                    .slideDown(200)
                    .animate(
                        { opacity: 1 },
                        { queue: false, duration: 200 }
                );
            }
            markers.push({ type: 'text', data: result.Video_Text });
        }

        for (var i = 0, j = result.Question.length; i < j; i++) {
            result.Question[i].Follow_Mark = ko.observable(result.Question[i].Follow_Mark);
            result.Question[i].Follow_Nos  = ko.observable(result.Question[i].Follow_Nos);
        }

        if (vm === undefined) {

            questionArray = result.Question;

            // 第一次 bind
            vm = new viewModel();            
            ko.applyBindings(vm);            
        }
        else {
            vm.canScroll = false;
            vm.questions(result.Question);
            vm.canScroll = true;
        }

        vm.canReply(result.Can_Reply);
        $replyForm.remove();

        //if (result.Question != undefined) {
        //    var $list = $('.video-question-group');

        //    $list.find('.nodata').addClass('loading-bg').text('資料載入中...').show();

        //    $list.find('*').not('.nodata').remove();

        //    var questions = result.Question;

        //    if (questions.length == 0) {
        //        $list.find('.nodata').removeClass('loading-bg').text('沒有資料').show();
        //    }
        //    else {

        //        $list.find('.nodata').hide();

        //        var myHtml = '';
        //        for (index in questions) {
        //            var questionRow = questions[index];
        //            var positionText = questionRow.Question_Position.toString().toHHMMSS();
        //            myHtml += '<div class="marker" data-data-no="' + questionRow.Question_No + '" data-position="' + questionRow.Question_Position + '"><div class="pull-left"><span class="position" title="影片時間">' + positionText + '</span> <span class="memo">' + questionRow.Question_Content + '</span></div></div>';
        //        }

        //        $(myHtml).hide().prependTo($list)
        //            .css('opacity', 0)
        //            .slideDown(200)
        //            .animate(
        //                { opacity: 1 },
        //                { queue: false, duration: 200 }
        //        );
        //    }
        //    //markers.push({ type: 'text', data: result.Video_Text });
        //}

        if (markers.length > 0) {
            // 設定播放器 marker
            $mediaPlayer.setMarker(markers);
        }

        if (result.Last_Video_Position != 0 && result.Last_Video_Position != undefined) {
            $('.player-message').find('.text').text('上次影片播放未結束，是否繼續觀看?').end().show();
        }
        else {
            $('.player-message').hide();
        }        

        $('#videosummary').find('.cola-user').text(videoData.Publish_Name).attr('data-user-id', videoData.Publish_User).end()
            .find('#online-time').text(videoData.Online_Time).end()
            .find('.summary').html(videoData.Doc_Summary).end()
            .find('#last-watch-time').text(videoData.Last_Watch_Time).end()
            .find('#watch-nos').text(videoData.Watch_Nos);

        //$('.video-topic').text(videoData.Doc_Topic + videoData.Video_Id);

        $('#cmdDocTopic').click(function () {
            OpenProg('L10B01_BriefingPlayer.aspx?VideoId=' + videoData.Video_Id, 'L10B01');
        }).text(videoData.Doc_Topic);

        // 顯示簡報相關設定
        if (!$settings.is(':visible')) $settings.show();
        if (!$tooltab.is(':visible')) $tooltab.show();        

        if (location.hash !== '') {

            var target = location.hash.substring(1);

            // 從問題連結過來，跳到問題
            if (target.indexOf('q') == 0) {
                var q;

                try {
                    q = parseInt(location.hash.substring(1));
                } catch (e) { return; }                

                activeTab($('a[href="#question"]'), function () {                    
                    $('#' + target).addClass('new');
                    location.hash = location.hash;
                });
            }            
        }
    }

    // 收藏按鈕
    $subscribe.click(function (e) {
        e.preventDefault();
        if ($(this).prop('disabled')) return;
        StartAjax("SubscribeVideo", { Doc_No: videoData.Doc_No, Online_Time: videoData.Online_Time }, function (result) {
            if (!result.Success_Mark) {
                alert(result.Display_Message);
                return;
            }

            playlistMark = true;

            $.progress.showSuccess(3000, '已收藏');
            $subscribe.prop('disabled', true).text('已收藏');
            $finishWatch.prop('disabled', false).text('完成觀看');

            //var myHtml = "";
            //myHtml += '<a href="#" class="list-group-item video active new" data-video-id="' + videoData.Video_Id + '">';
            //myHtml += '<span class="colaUser" data-user-id="' + videoData.Publish_User + '">' + videoData.Publish_Name + '</span>：';
            //myHtml += '<span class="video-topic">' + videoData.Doc_Topic + '</span>';
            //myHtml += '</a>';

            //// 原本沒有資料、移除［沒有未看完的視訊簡報］div
            //if ($(".list-group-content.unwatch").children('.nodata').length == 1)
            //    $(".list-group-content.unwatch").empty();

            //$(myHtml).hide().prependTo(".list-group-content.unwatch").slideDown(200);
        });
    });

    // 完成觀看按鈕
    $finishWatch.click(function (e) {
        e.preventDefault();
        if ($(this).prop('disabled')) return;
        if (!playlistMark) {
            $.progress.showSuccess(3000, '請先收藏影片');
            return;
        }

        FinishWatchVideo({
            onComplete: function () {
                $.progress.showSuccess(3000, '已設定完成觀看');
            }
        });
    });

    $('.player-message').on('click', 'input[type=button]', function () {
        var role = $(this).data('role');

        if (role == 'yes')
        {   
            $mediaPlayer.videoControl('play');
        }

        if (role == 'no') {
            $mediaPlayer.videoControl('stop');
            $mediaPlayer.videoControl('play');
        }

        $('.player-message').hide();
    });

    // 紀錄結束播放時間
    $(window).on('beforeunload', function () {
        if (mediaPlayerReady && playlistMark == true) {
            StopWatchVideo();
        }
    });

    // 影片播放完畢處理
    function FinishWatchVideo(option) {        
        var videoId = videoData.Video_Id;
        StartAjax("FinishWatchVideo", { Video_Id: videoId }, function (result) {            
            if (!result.Success_Mark)
            {
                if (result.Display_Message != '') {
                    alert(result.Display_Message);
                    return;
                }
            }
            else
            {
                $finishWatch.prop('disabled', true).val('已完成');

                // 將影片移到下面的完成列表
                if (videoData.Finish_Mark == false) {

                    // 原本沒有資料、移除［沒有看完的視訊簡報］div                        
                    //if ($(".list-group-content.watched").children('.nodata').length == 1)
                    //    $(".list-group-content.watched").empty();

                    //$('[data-video-id=' + videoId + ']').hide().prependTo(".list-group-content.watched").slideDown(200);

                    //if ($(".list-group-content.unwatch").children().length == 0)
                    //    $('.list-group-content.unwatch').append('<div class="list-group-item nodata">沒有未看完的視訊簡報</div>');
                }

                if (option != undefined && option.onComplete != undefined)
                    option.onComplete();
            }
        });
    }

    // 離開網頁時處理
    function StopWatchVideo() {
        var lastVideoPosition = $mediaPlayer.getPosition();
        var videoId = videoData.Video_Id;
        StartAjax("StopWatchVideo", { Video_Id: videoId, Last_Video_Position: lastVideoPosition }, function (result) {
            if (!result.Success_Mark)
            {
                if (result.Display_Message != '')
                    alert(result.Display_Message);
            }
        }, false);
    }

    $('.video-memo-group, .video-text-group').on('click', 'li.marker', function () {
        var position = parseFloat($(this).data('position'));
        $mediaPlayer.setPosition(position, true);
    });

    $(document).on('click', '[data-role="tab"]', function (e) {        
        e.preventDefault();        
        activeTab($(this));        
    });

    $('.video-memo-group').on('click', '.delete-memo', function (e) {
        e.stopPropagation();
        var $this = $(this);

        $this.prop('disabled', true);

        var dataNo = $this.data("dataNo");

        StartAjax("DeleteVideoMemo", { Data_No: dataNo }, function (result) {
            if (!result.Success_Mark)
            { alert(result.Display_Message); }
            else {
                $mediaPlayer.deleteMarker(dataNo);
                $this.parent().fadeOut(200, function () {
                    $(this).remove();

                    if ($('.video-memo-group li:visible').length == 0) {
                        $('.video-memo-group .nodata').removeClass('loading-bg').text('沒有資料').show();
                    }
                });
            }
        }, true);
    });

    function activeTab(tab, callback) {
        var $this = tab;
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var $previous = $ul.find('.active:last a');
        var from = $previous.attr('href');
        var $old = $(from);

        if ($this.parent().hasClass('active')) return;

        $previous.parent().removeClass('active');
        $this.parent().addClass('active');
        var target = $this.attr('href');
        var $panel = $(target);

        // 紀錄上一個 div scroll 位置
        if (from === '#videomemo' || from === '#videotext') {
            $old.data('scroll', $old.find('.panel-group').scrollTop());
        }

        $old.stop().fadeOut(200, function () {
            $old.removeClass('active');
            $panel.stop().hide().addClass('active').fadeIn(200, function () {
                if ($panel.data('scroll') !== undefined) {
                    $panel.find('.panel-group').stop().animate({ scrollTop: $panel.data('scroll') }, 200);
                }                

                if (callback) callback();
            });
        });
    }

    var $txtVideoMemo;
    $memoDialog = $('.video-memo-dialog');

    $memoDialog.on('click', '[type="button"]', function () {
        var $this = $(this);
        var role  = $this.data('role');

        if ($txtVideoMemo === undefined) {
            $txtVideoMemo = $('#txtVideoMemo');
        }

        if (role === 'send') {
            var videoMemo = $.trim($txtVideoMemo.val());

            if (videoMemo.length > 20) {
                $txtVideoMemo.next().text('筆記內容請勿超過 20 個字').removeClass('invisible');
                return;
            }

            if (videoMemo.length == 0) {
                $txtVideoMemo.next().text('請輸入筆記內容').removeClass('invisible');
                return;
            }

            $this.prop('disabled', true);            

            var videoPosition = $mediaPlayer.getPosition();
            var params = { Doc_No: videoData.Doc_No, Video_Position: videoPosition, Video_Memo: videoMemo };

            StartAjax("NewVideoMemo", params, function (result) {
                if (!result.Success_Mark)
                { alert(result.Display_Message); }
                else {

                    $('.video-memo-group .nodata').hide();

                    var positionText = videoPosition.toString().toHHMMSS();
                    var dataNo = result.Response_Data.Data_No;
                    var $closestMemo = null;
                    var closetPosition = 0;

                    $('.video-memo-group li.marker').each(function () {
                        var _this = $(this);
                        var position = parseFloat(_this.data('position'));
                        if (position > videoPosition && ((position - videoPosition) < closetPosition || closetPosition == 0)) {
                            $closestMemo = _this;
                            closetPosition = position - videoPosition;
                        }
                    });

                    var $insertMemo = $('<li class="marker" data-data-no="' + dataNo + '" data-position="' + videoPosition + '"><span class="position" title="影片時間">' + positionText + '</span> <span class="memo">' + videoMemo + '</span><button type="button" title="刪除筆記" data-data-no="' + dataNo + '" class="close delete-memo">&times;</button></li>');

                    if ($closestMemo == null) {
                        $insertMemo.hide().appendTo('.video-memo-group')
                            .css('opacity', 0)
                            .slideDown(200)
                            .animate(
                                { opacity: 1 },
                                { queue: false, duration: 200 }
                            );
                    }
                    else {
                        $insertMemo.insertBefore($closestMemo)
                            .css('opacity', 0)
                            .slideDown(200)
                            .animate(
                                { opacity: 1 },
                                { queue: false, duration: 200 }
                            );
                    }                    

                    $mediaPlayer.addMarker({ Data_No: dataNo, Marker_Position: videoPosition, Marker_Text: videoMemo, Marker_Type: 'memo' });
                }
                
                $this.prop('disabled', false);
                $txtVideoMemo.val('').next().addClass('invisible');
                $mediaPlayer.videoControl('close-memo');
            }, true);
        }
        else {
            $txtVideoMemo.val('').next().addClass('invisible');
            $mediaPlayer.videoControl('close-memo');
        }
    });

    var $txtQuestionContent;
    $questionDialog = $('.video-question-dialog');

    $questionDialog.on('click', '[type="button"]', function () {
        var $this = $(this);
        var role = $this.data('role');

        if ($txtQuestionContent === undefined) {
            $txtQuestionContent = $('#txtQuestionContent');
        }

        if (role === 'send') {
            var questionContent = $.trim($txtQuestionContent.val());
            var length = questionContent.length;
            var line = questionContent.match(/\n/g);

            if (line) length += line.length;

            if (length > 500) {
                $txtQuestionContent.next().text('問題內容請勿超過 500 個字').removeClass('invisible');
                return;
            }

            if (questionContent.length == 0) {
                $txtQuestionContent.next().text('請輸入問題內容').removeClass('invisible');
                return;
            }

            $this.prop('disabled', true);

            var videoPosition = $mediaPlayer.getPosition();
            var params = { Doc_No: videoData.Doc_No, Question_Position: videoPosition, Question_Content: questionContent, Reply_Question_No: 0 };

            StartAjax("NewQuestion", params, function (result) {
                if (!result.Success_Mark)
                { alert(result.Display_Message); }
                else {
                    $('.video-question-group .nodata').hide();

                    var question     = result.Response_Data;
                    var positionText = videoPosition.toString().toHHMMSS();                    

                    // 新增問題插入到最前面
                    vm.questions.unshift({ Doc_No: videoData.Doc_No, Reply_Mark: false, Position_Text: positionText, Question_Position: videoPosition, Question_Content: question.c, Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: question.n, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: false });

                    activeTab($('a[href="#question"]'));
                }

                $this.prop('disabled', false);
                $txtQuestionContent.val('').next().html('');
                $mediaPlayer.videoControl('close-question');
            }, true);
        }
        else {
            $txtQuestionContent.val('').next().html('');
            $mediaPlayer.videoControl('close-question');
        }
    });

    $(document).on('click', '[data-role="cola-user"]', function (e) {
        e.preventDefault();
        var $this = $(this);
        var userid = $this.attr('data-user-id');        
        OpenDialogForDisplay('/A00B_Enterprise/A00B_Q02_UserData.aspx', 'TitleName=' + encodeURIComponent('A00B_Q02　員工資料查詢') + '&UserId=' + userid, 2, 540);

        //StartAjax("GetUserData", { User_Id: userid }, function (result) {
        //    if (!result.Success_Mark)
        //    { alert(result.Display_Message); }
        //    else {
        //        console.log(JSON.stringify(result));
        //    }
        //}, true);
    });

    $('#cmdSendQuestion').click(function () {
        var $this = $(this);
        var role = $this.data('role');

        if ($txtQuestionContent === undefined) {
            $txtQuestionContent = $('#txtQuestionContent');
        }

        var questionContent = $.trim($txtQuestionContent.val());
        var length = questionContent.length;
        var line = questionContent.match(/\n/g);

        if (line) length += line.length;

        if (length > 500) {
            $txtQuestionContent.next().text('問題內容請勿超過 500 個字').removeClass('invisible');
            return;
        }

        if (questionContent.length == 0) {
            $txtQuestionContent.next().text('請輸入問題內容').removeClass('invisible');
            return;
        }

        $this.prop('disabled', true);

        var videoPosition = $mediaPlayer.getPosition();
        var params = { Doc_No: videoData.Doc_No, Question_Position: videoPosition, Question_Content: questionContent, Reply_Question_No: 0 };

        StartAjax("NewQuestion", params, function (result) {
            if (!result.Success_Mark)
            { alert(result.Display_Message); }
            else {
                $('.video-question-group .nodata').hide();

                var question = result.Response_Data;
                var positionText = videoPosition.toString().toHHMMSS();

                // 新增問題插入到最前面
                vm.questions.unshift({ Doc_No: videoData.Doc_No, Reply_Mark: false, Position_Text: positionText, Question_Position: videoPosition, Question_Content: question.c, Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: question.n, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: false });

                activeTab($('a[href="#question"]'));
            }

            $this.prop('disabled', false);
            $txtQuestionContent.val('').next().html('');            
        }, true);
    });

    $(document).on('click', '[data-role="sendReply"]', function (e) {
        e.preventDefault();
        var $this = $(this);
        $this.prop('disable', true);

        var questionNo = vm.replyQuestionNo();        

        if (!questionNo || questionNo === 0) return;

        var questionContent = $.trim($('#txtReplyContent').val());

        var length = questionContent.length;
        var line = questionContent.match(/\n/g);        

        if (line) length += line.length;

        if (questionContent.length === 0) {
            alert('請輸入回覆內容');
            return false;
        }

        if (length > 500) {
            alert('回覆請勿輸入超過 500 個字');
            return false;
        }

        var params = { Doc_No: videoData.Doc_No, Question_Position: 0, Question_Content: questionContent, Reply_Question_No: questionNo };

        StartAjax("NewQuestion", params, function (result) {
            if (!result.Success_Mark)
            {
                alert(result.Display_Message);
                $this.prop('disabled', false);
            }
            else {
                //$('.video-question-group .nodata').hide();

                var question = result.Response_Data;                
                var insertIndex, maxQuestionNo = 0;

                // 找出回覆要插入陣列的位置
                for (var i = 0, j = vm.questions().length; i < j; i++) {
                    var q = vm.questions()[i];
                    if (q.Reply_Question_No == questionNo) {
                        if (q.Question_No > maxQuestionNo) {
                            maxQuestionNo = q.Question_No;
                            insertIndex = i;
                        }
                    }
                }                

                vm.questions.splice(insertIndex + 1, 0, { Doc_No: videoData.Doc_No, Reply_Mark: true, Position_Text: '', Question_Position: 0, Question_Content: question.c, Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: questionNo, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: false });
                
                $replyForm.remove();                
            }
            
        }, true);
    });

    $(document).on('keyup', '#txtReplyContent, #txtQuestionContent', function () {
        var $this = $(this);        
        var length = $.trim($this.val()).length;
        var line = $this.val().match(/\n/g);        

        if (line) length += line.length;

        if (length > 500) {
            $this.next().html('<span class="text-danger">已輸入 ' + length + ' 字，超過可輸入的字數 500 字</span>');
        }
        else if (length > 0) {
            $this.next().html('還可輸入 ' + (500 - length) + ' 字');
        }
        else {
            $this.next().html('');
        }        
    });

    $qTips = $('.question-tips');

    $('#txtQuestionContent').focus(function () {
        if ($qTips.is(':visible')) $qTips.hide();
    }).blur(function () {
        var $this = $(this);
        if ($.trim($this.val()) === '') $qTips.show();
    });

    $('[data-toggle="collapse"]').click(function () {
        var $target = $($(this).data('target'));
        if ($target.is(':visible')) {
            $target.stop().slideUp(200);
        } else {
            $target.stop().slideDown(200);
        }
    });
});

function ToggleMemoDialog(display) {

    if (display) {
        $memoDialog.show();
    }
    else {
        $memoDialog.hide();
    }
}

function ToggleQuestionDialog(display) {

    if (display) {
        $questionDialog.show();
    }
    else {
        $questionDialog.hide();
    }
}