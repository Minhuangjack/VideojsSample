/// <reference path="jquery-1.9.1.js" />
var $txtVideoText;
var $txtTextDuration;
var $txtTextPosition;
var $videoTextDialog;

$(function () {
    //$.widget("ui.timespinner", $.ui.spinner, {
    //    options: {
    //        // seconds
    //        step: 1,
    //        // minutes
    //        page: 60
    //    },

    //    _parse: function (value) {
    //        if (typeof value === "string") {
    //            // already a timestamp
    //            //if (Number(value) == value) {
    //            //    return Number(value);
    //            //} 

    //            // 只有秒數
    //            if (value.indexOf(':') == -1) {
    //                return +value;
    //            }

    //            var time     = value.split(':');
    //            var minnutes = 0;
    //            var seconds  = 0;
    //            var hours    = 0;

    //            // 分 + 秒;
    //            if (time.length == 2) {
    //                minnutes = time[0];
    //                seconds  = time[1];
    //            }
    //            else {
    //                hours    = time[0];
    //                minnutes = time[1];
    //                seconds  = time[2];
    //            }

    //            return hours * 3600 + minnutes * 60 + seconds;
    //        }                    
    //        return +value;
    //    },

    //    _format: function (value) {
    //        if (value > 60) {
    //            return (value / 3600) + ":" + ((value % 3600) / 60) + ":" + ((value % 3600) % 60);
    //        }
    //        return value;
    //    }
    //});

    //$('#test').timespinner();

    var videoData = $('#hdVideoData').val() == "" ? null : JSON.parse($('#hdVideoData').val());
    $txtVideoText = $('#txtVideoText');
    $txtTextDuration = $('#txtTextDuration');
    $txtTextPosition = $('#txtTextPosition');
    $videoTextDialog = $('.video-text-dialog');

    var timer = null

    $mediaPlayer = $('#mediaPlayer').mediaplayer({
        onTimelineChanged: function (position) {
            $txtTextPosition.val(position.toString().toHHMMSS({ showFullTime: true }));
            $txtTextPosition.data('position', position);
        },
        onLoaded: function () {
            $mediaPlayer.setSource({
                videoId: videoData.Video_Id,
                sourceType: 'briefing',
                learnerMark: false,
                onComplete: function (data) {
                    videoData = data;
                    StartAjax("GetVideoText", { Doc_No: videoData.Doc_No }, function (result) {
                        if (!result.Success_Mark) {
                            alert(result.Display_Message);
                            return;
                        }
                        else {
                            var videoText = result.Response_Data.VideoText;
                            var markers = [];
                            markers.push({ type: 'text', data: videoText });
                            $mediaPlayer.setMarker(markers);
                        }
                    }, true);
                }
            });
        },
        onMarkerReached: function (data_no, text, type, duration) {
            var $div = $('.video-text-list'),
                $li = $div.find('.text[data-no="' + data_no + '"]').siblings('.reach').removeClass('reach').end().addClass('reach');            

            if (timer != null) {
                clearTimeout(timer);
            }

            timer = setTimeout(function () {
                $li.removeClass('reach');
            }, duration * 1000);

            if ($li.length > 0) {
                // scroll 到 div 中間
                $div.stop().animate({
                    scrollTop: $div.scrollTop() + $li.position().top
                        - $div.height() / 2 + $li.height() / 2
                }, '500', 'swing');
            }
        },
        learnerMark: false
    });
    

    $txtTextPosition.change(function () {
        var textPosition = $txtTextPosition.val().toString();
        var position = ConvertPosition(textPosition);

        if (!position) return;

        $mediaPlayer.setPosition(position, false);
    });

    $txtTextPosition.keypress(function (e) {
        if (e.keyCode == 13) {
            $txtTextPosition.change();
            return false;
        }
    });

    $('.insertText').click(function () {
        $videoTextDialog.data('mode', 'insert').find('.panel-title').text('新增字幕').end().toggle(!$videoTextDialog.is(":visible"));
        $txtVideoText.val('');
        $mediaPlayer.videoControl('pause');
        $txtTextPosition.val($mediaPlayer.getPosition().toString().toHHMMSS({ showFullTime: true }));
    });

    $videoTextDialog.on('click', '[type="button"]', function () {
        var $this = $(this);
        var role = $this.data('role');
        var textContent, textPosition, textDuration;

        if (role == 'send' || role == 'preview') {
            textContent = $.trim($txtVideoText.val());
            textDuration = $txtTextDuration.val();
            textPosition = $txtTextPosition.val().toString();

            if (textContent === '') {
                alert('請輸入字幕內容');
                $txtVideoText.focus();
                return;
            }

            if (textContent.length > 30) {
                alert('字幕內容請勿輸入超過 30 個字');
                $txtVideoText.focus();
                return;
            }

            if ($.trim(textDuration) == '') {
                alert('請輸入持續顯示持間');
                return;
            }

            if (!/^\d+\.?\d*$/.test(textDuration)) {
                alert('持續顯示持間只能輸入數字');
                return;
            }

            var videoPosition = ConvertPosition(textPosition);

            if (!videoPosition) return;

            if (videoPosition > $mediaPlayer.getTotalSeconds()) {
                alert('指定位置超過影片總長');
                return;
            }

            if (role == 'send') {
                $this.prop('disabled', true);
                var params = { Doc_No: videoData.Doc_No, Text_Position: videoPosition, Text_Duration: textDuration, Text_Content: textContent };

                if ($videoTextDialog.data('mode') == 'insert') {
                    StartAjax("NewVideoText", params, function (result) {
                        if (!result.Success_Mark)
                        { alert(result.Display_Message); }
                        else {

                            $('.video-text-list .nodata').hide();

                            var positionText = videoPosition.toString().toHHMMSS({ showFullTime: true });
                            var dataNo = result.Response_Data.Data_No;
                            var $closestText = null;
                            var closetPosition = 0;

                            $('.video-text-list .text').each(function () {
                                var _this = $(this);
                                var position = parseFloat(_this.data('position'));
                                if (position > videoPosition && ((position - videoPosition) < closetPosition || closetPosition == 0)) {
                                    $closestText = _this;
                                    closetPosition = position - videoPosition;
                                }
                            });

                            var $insertText = $('<div class="list-group-item text" data-no=' + dataNo + ' data-position=' + videoPosition + ' style="overflow: hidden">' +
                                                    '<div class="row">' +
                                                        '<div class="col-xs-7">' +
                                                            '<div>' +
                                                                '<span class="text-muted position">' +
                                                                    positionText +
                                                                '</span>' +
                                                            '</div>' +                                                            
                                                        '</div>' +
                                                        '<div class="col-xs-5 text-right option"><a href="#" data-role="edit">編輯</a> <a href="#" data-role="delete">刪除</a></div>' +
                                                    '</div>' +
                                                    '<div class="content" style="-ms-word-wrap: break-word; word-wrap: break-word">' +
                                                        textContent +
                                                    '</div>' +
                                                '</div>');

                            if ($closestText == null) {
                                $insertText.hide().appendTo('.video-text-list')
                                    .css('opacity', 0)
                                    .slideDown(200)
                                    .animate(
                                        { opacity: 1 },
                                        { queue: false, duration: 200 }
                                    );
                            }
                            else {
                                $insertText.insertBefore($closestText)
                                    .css('opacity', 0)
                                    .slideDown(200)
                                    .animate(
                                        { opacity: 1 },
                                        { queue: false, duration: 200 }
                                    );
                            }

                            $mediaPlayer.addMarker({ Data_No: dataNo, Marker_Position: videoPosition, Marker_Text: textContent, Marker_Type: 'text', Marker_Duration: textDuration });
                        }

                        $this.prop('disabled', false);
                        CloseDialog();
                    }, true);
                }
                else if ($videoTextDialog.data('mode') == 'edit') {
                    var $text = $('.video-text-list .text.active');
                    $text.removeClass('active');
                    var dataNo = $text.data('no');
                    StartAjax("ModifyVideoText", { Data_No: dataNo, Text_Content: textContent, Text_Position: videoPosition, Text_Duration: textDuration }, function (result) {
                        if (!result.Success_Mark)
                        { alert(result.Display_Message); }
                        else {                            
                            $text.find('.content').text(textContent);                            
                            $text.find('.position').text(videoPosition.toString().toHHMMSS({ showFullTime: true }));

                            $this.prop('disabled', false);
                            $mediaPlayer.modifyMarker({ Data_No: dataNo, Marker_Text: textContent, Marker_Position: videoPosition, Marker_Duration: textDuration });
                            CloseDialog();
                        }
                    }, true);
                }
            } else {
                $mediaPlayer.addMarker({ Data_No: -999, Marker_Position: videoPosition, Marker_Text: textContent, Marker_Type: 'preview', Marker_Duration: textDuration });
            }
        } else if (role == 'cancel') {
            $('.video-text-list .text.active').removeClass('active');
            CloseDialog();
        }
    });

    $('.video-text-list').on('click', '[data-role]', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var role = $this.data('role');
        var $parent = $this.parents('.text:first');
        var dataNo = $parent.data('no');
        if (role === 'delete') {
            if (confirm('確定刪除?')) {
                StartAjax("DeleteVideoText", { Data_No: dataNo }, function (result) {
                    if (!result.Success_Mark)
                    { alert(result.Display_Message); }
                    else {
                        $mediaPlayer.deleteMarker(dataNo);

                        $parent.fadeOut(200, function () {
                            $parent.remove();

                            if ($('.text').length == 0) {
                                $('.nodata').show();
                            }                            
                        });
                    }
                }, true);
            }
        }
        else if (role === 'edit') {
            StartAjax("ReadVideoText", { Data_No: dataNo }, function (result) {
                if (!result.Success_Mark)
                { alert(result.Display_Message); }
                else {
                    var data = result.Response_Data;

                    $mediaPlayer.setPosition(data.Text_Position, false);
                    $mediaPlayer.videoControl('pause');

                    $txtTextDuration.val(data.Text_Duration);
                    $txtTextPosition.val(data.Text_Position.toString().toHHMMSS({ showFullTime: true }));
                    $txtVideoText.val(data.Text_Content);

                    $videoTextDialog.data('mode', 'edit').find('.panel-title').text('編輯字幕').end().show();
                    $parent.addClass('active');
                }
            }, true);
        }
    });

    $('.video-text-list').on('click', '.text', function () {
        var $this = $(this);
        var dataNo = $this.data('no');
        var position = $this.data('position');

        $mediaPlayer.setPosition(position, true);
    });

    function CloseDialog() {
        //$txtVideoText.val('');
        $videoTextDialog.hide();
    }

    function ConvertPosition(textPosition) {
        if (!/^(\d{1,2}):([0-5]?[0-9]):[0-5]?[0-9](\.\d)?$/.test(textPosition)) {
            alert('顯示時間格式輸入錯誤');
            return;
        }

        var time = textPosition.split(':');
        var minnutes = 0;
        var seconds = 0;
        var hours = 0;
        var ff = 0;
        var position = 0;

        if (textPosition.indexOf('.') != -1) {
            ff = textPosition.substring(textPosition.indexOf('.') + 1, textPosition.length);
        }

        hours = Number(time[0]);
        minnutes = Number(time[1]);
        seconds = Number(time[2]);

        position = hours * 3600 + minnutes * 60 + seconds;
        position = parseFloat(position + "." + ff);

        return position;
    }
});