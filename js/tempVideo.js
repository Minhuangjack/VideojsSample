/// <reference path="jquery-1.9.1.js" />
/// <reference path="knockout-3.0.0.debug.js" />

$(function () {
    var host = 'http://ntestmedia.colatour.com.tw/Cola_MediaFiles/TempVideo/video/';
    var $mediaPlayer;    
    var overlay = '<div class="player"><div class="overlay"></div><div class="main"></div></div>';
    var videoForm = '<div id="videoForm"><fieldset><legend style="font-size: 16px;">新增影片</legend><div class="form-group"><label class="control-label" for="txtVideoName">影片名稱</label><input class="form-control" id="txtVideoName" type="text"/><label class="control-label" for="txtVideoPath">影片檔名</label><input class="form-control" id="txtVideoPath" type="text"/><span class="help-block" style="height: 19px;"></span></div><div class="form-group text-right"><input type="button" class="btn btn-default" value="取消"/><input type="button" data-role="send" class="btn btn-primary" value="送出"/></div></fieldset></div>';

    $(document).on('click', 'li a.play', function (e) {
        e.preventDefault();

        if ($('.player').length === 0) {
            $('<div class="player"><div class="overlay"></div><div class="main"><iframe id="mediaPlayer" frameborder="0"></iframe></div></div>').appendTo('body');
        }

        var source = $(this).attr('href');

        $('#mediaPlayer').attr('src', '/L10B_Briefing/L10B999_F1_Play.aspx?VideoId=' + source);
        $('.player').show();
    });

    $(document).on('click', '.overlay', function () {        
        $(this).parent().remove();        
    });

    var vm = new viewModel();

    $.ajax({
        type: 'post',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: "/L000_Service/ElearningService.asmx/GetVideoPreview",
        data: null,
        success: function (data) {
            var d = JSON.parse(data.d);            

            if (d.Response_Data.Videos.Videos) {
                if (!d.Response_Data.Videos.Videos.Video.length) {
                    var arr = new Array();
                    arr.push(d.Response_Data.Videos.Videos.Video);

                    vm.videos(arr);                    
                }
                else {
                    vm.videos(d.Response_Data.Videos.Videos.Video);
                }                                
            }

            vm.canModify = d.Response_Data.CanModify;

            ko.applyBindings(vm);
            $('#loading').remove();
            $('#video-list').show();
        }
    });

    function viewModel() {
        var self = this;
        self.videos = ko.observableArray();
        self.removeVideo = function (video) {
            var id = video["@VID"];            

            $.ajax({
                type: 'post',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: "/L000_Service/ElearningService.asmx/DeleteVideoPreview",
                data: JSON.stringify({ Video_Id: id }),
                success: function (data) {
                    self.videos.remove(video);                    
                }
            });
        };

        self.forwardVideo = function (video) {
            var id = video["@VID"];            

            $.ajax({
                type: 'post',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: "/L000_Service/ElearningService.asmx/ForwardVideoPreview",
                data: JSON.stringify({ Video_Name: video.Name, Video_Path: video.Path }),
                success: function (data) {
                    var d = JSON.parse(data.d);

                    if (d.Success_Mark) {
                        OpenDialogForDisplay('/A00D_Information/A00D_M31_SendMessage.aspx', 'TitleName=' + encodeURIComponent('A00D_M31　轉寄訊息'), 2, 660);
                    }
                    else {
                        alert('新增失敗');
                    }
                }
            });
        };

        self.canModify = false;
    }

    $('#cmdInsert').click(function () {
        $(overlay).find('.main').append($(videoForm)).end().appendTo('body').show();
    });

    $(document).on('click', '#videoForm input[type="button"]', function () {
        var $this = $(this);
        if ($this.data('role')) {
            var videoName = $('#txtVideoName').val();
            var videoPath = $('#txtVideoPath').val();

            if (videoName === '') {
                $('#videoForm').find('.help-block').text('請輸入影片名稱');
                console.log($('#videoForm').find('.help-block').length);
                return false;
            }

            if (videoPath === '') {
                $('#videoForm').find('.help-block').text('請輸入影片檔案名稱');
                return false;
            }            

            $.ajax({
                type: 'post',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: "/L000_Service/ElearningService.asmx/NewVideoPreview",
                data: JSON.stringify({ Video_Name: videoName, Video_Path: videoPath }),
                success: function (data) {
                    var d = JSON.parse(data.d);

                    if (d.Success_Mark) {
                        var vid = d.Response_Data.VID;                        

                        vm.videos.push({ "@VID": vid, Name: videoName, Path: videoPath });
                        $('.player').remove();
                    }
                    else {
                        alert('新增失敗');
                    }
                }
            });
        }
        else {
            $('.player').remove();
        }
    });

    $('[data-role="send"]').click(function () {        
    });      
});