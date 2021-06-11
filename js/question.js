/// <reference path="jquery-1.9.1.js" />
/// <reference path="knockout-3.0.0.debug.js" />
/// <reference path="player.js" />
/// <reference path="jquery.autosize.min.js" />
/// <reference path="jquery.colorbox-min.js" />

$(function () {   

    var body = $('html, body');
    var replyForm = '<div id="replyForm" class="question reply"><div class="media msg"><div class="media-body text-right"><textarea placeholder="請輸入回覆內容" class="form-control col-lg-12" id="txtReplyContent"></textarea><div class="pull-left help-block"></div><a title="插入圖片" class="atch picture pull-left" style="text-decoration:none" href="javascript://">&nbsp;</a><input style="margin-right:2px" data-role="sendReply" type="button" value="送出" class="btn btn-primary btn-xs"/></div></div><hr /></div>';
    var editForm = '<div class="editForm"><div class="msg"><div class="media-body text-right"><textarea class="form-control col-lg-12 input-content"></textarea><div class="pull-left help-block"></div><a title="插入圖片" class="atch picture pull-left" style="text-decoration:none" href="javascript://">&nbsp;</a><input style="margin-right:2px" data-role="sendEdit" type="button" value="送出" class="btn btn-primary btn-xs"/><input style="margin-right:2px" type="button" value="取消" class="btn btn-default btn-xs"/></div></div>';
    var $replyForm = $(replyForm);
    var $editForm;

    var pics = '<div class="text-right pics"><ul></ul></div>';

    var videoData = $('#hdVideoData').val() == "" ? null : JSON.parse($('#hdVideoData').val());
    var questionNo = videoData.QuestionNo,
        txCode = videoData.TxCode,
        docType = videoData.Doc_Type;

    if (docType === '影片') {
        // 初始化處理
        $mediaPlayer = $('#mediaPlayer').mediaplayer({
            onLoaded: function () {
                $mediaPlayer.setSource({
                    videoId: videoData.Video_Id,
                    sourceType: 'briefing',
                    learnerMark: false,
                    onComplete: function (data) {
                        videoData = data;

                        loadQuestion();
                    }
                });
            },
            onPlayEnded: function (complete) {
                if (!complete) {
                    if (videoData.Doc_Type === '產品') {
                        // 無法播放：播放尚未上傳的影片
                        $mediaPlayer.get(0).Content.Player.SetMediaSource("http://ntestmedia.colatour.com.tw/Cola_MediaFiles/inproc/pd_notfound.mp4", 0, false);
                    }
                }
            },
            learnerMark: false
        });

    }
    else {
        $('.left_contain').remove();
        $('.right_contain').removeClass('col-xs-6');
        $('.container').width(600);
        loadQuestion();
    }

    function loadQuestion() {
        StartAjax("GetQuestionForManage", { Doc_No: videoData.Doc_No }, function (result) {
            if (!result.Success_Mark) {
                alert(result.Display_Message);
                return;
            }
            else {
                var question;

                if (vm === undefined) {

                    questionArray = result.Response_Data.Question;

                    for (var i = 0, j = questionArray.length; i < j; i++) {
                        questionArray[i].Follow_Mark = ko.observable(questionArray[i].Follow_Mark);
                        questionArray[i].Follow_Nos = ko.observable(questionArray[i].Follow_Nos);
                        questionArray[i].Question_Content = ko.observable(questionArray[i].Question_Content);
                        questionArray[i].Modify_Time = ko.observable(questionArray[i].Modify_Time);
                        questionArray[i].Attachment = ko.observableArray(questionArray[i].Attachment);

                        if (!isNaN(questionNo)) {
                            if (questionArray[i].Question_No == questionNo) {
                                question = questionArray[i];
                            }
                        }
                    }

                    // 第一次 bind
                    vm = new viewModel();

                    vm.type = videoData.Doc_Type;

                    ko.applyBindings(vm);
                }

                if (questionArray.length == 0) {
                    $('.loading-snack').removeClass('loading-snack').text('沒有問答資料');
                }
                else {
                    $('.loading-snack').remove();
                    $('#questionWrap').removeClass('hide');
                }

                if (!isNaN(questionNo) && question) {

                    if (txCode) {
                        vm.edit(question, undefined);
                    }
                    else {
                        vm.replyQuestion(question);
                    }

                    location.hash = "#q" + questionNo;
                }

                //$('#questionWrap').enscroll({
                //    showOnHover: false,
                //    scrollIncrement: 60,
                //    verticalTrackClass: 'track3',
                //    verticalHandleClass: 'handle3'
                //});

                // 附加圖片
                $('.pics a').colorbox();
            }
        }, true);
    }

    var vm;
    var questionArray;

    function viewModel() {
        var self           = this;
        self.questions     = ko.observableArray(questionArray);
        self.type          = '影片';
        self.canScroll     = true;
        self.canReply      = ko.observable(true);
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

        self.replyQuestionNo = undefined;

        self.replyQuestion = function (question) {
            self.replyQuestionNo = question;

            if ($editForm && $.contains(document.body, $editForm[0])) self.edit($editForm.data('question'), undefined, true);
            $replyForm.remove();
            $replyForm = $(replyForm);            

            $replyForm.insertAfter($('[data-no="' + question.Question_No + '"]').last());
            $replyForm.find('textarea').autosize().focus();

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

            StartAjax("ClearQuestionAttachment", {}, function (result) {
                if (!result.Success_Mark) {
                    alert(result.Display_Message);
                }
            });

            return false;
        }

        self.forwardQuestion = function (question) {
            StartAjax("ForwardQuestion", { Question_No: question.Question_No }, function (result) {
                if (!result.Success_Mark) {
                    alert(result.Display_Message);
                    return;
                }
                else {
                    OpenDialogForDisplay('/A00D_Information/A00D_M31_SendMessage.aspx', 'TitleName=' + encodeURIComponent('A00D_M31　轉寄訊息'), 2, 660);
                }
            });
        };

        self.followQuestion = function (question, event) {
            if (event.stopPropagation) event.stopPropagation();
            if ($(event.target ? event.target : event.srcElement).is(':disabled')) return;

            var followMark = !question.Follow_Mark();

            if (followMark) {
                question.Follow_Nos(question.Follow_Nos() + 1);
            }
            else {
                question.Follow_Nos(question.Follow_Nos() - 1);
            }

            StartAjax("SetFollowMark", { Question_No: question.Question_No, Follow_Mark: followMark }, function (result) {
                if (!result.Success_Mark) {
                    if (result.Display_Message != '') {
                        alert(result.Display_Message);
                        return;
                    }
                }
                else {
                    question.Follow_Mark(followMark);
                }
            });

            return false;
        };

        self.category = function (question, event) {
            if (event.stopPropagation) event.stopPropagation();

            OpenDialogForDisplay('/L10B_Briefing/L10B030_F3_Category.aspx', 'TitleName=' + encodeURIComponent('L10B030_F3　問題歸檔') + '&QuestionNo=' + question.Question_No, 2, 600);

            StartAjax("GetQuestionForManage", { Doc_No: videoData.Doc_No }, function (result) {
                if (!result.Success_Mark) {
                    alert(result.Display_Message);
                    return;
                }
                else {
                    $replyForm.remove();

                    questionArray = result.Response_Data.Question;

                    for (var i = 0, j = questionArray.length; i < j; i++) {
                        questionArray[i].Follow_Mark      = ko.observable(questionArray[i].Follow_Mark);
                        questionArray[i].Follow_Nos       = ko.observable(questionArray[i].Follow_Nos);
                        questionArray[i].Question_Content = ko.observable(questionArray[i].Question_Content);
                        questionArray[i].Modify_Time = ko.observable(questionArray[i].Modify_Time);
                        questionArray[i].Attachment = ko.observableArray(questionArray[i].Attachment);
                    }

                    self.questions(questionArray);
                    $('.new').removeClass('new');

                    if (questionArray.length == 0) {
                        $('.loading-snack').removeClass('loading-snack').text('沒有問答資料');
                    }
                    else {
                        $('.loading-snack').remove();
                        $('#questionWrap').removeClass('hide');
                    }
                }
            }, true);

            return false;
        };

        self.readMore = function (question, event) {
            if (event.stopPropagation) event.stopPropagation();

            var $this = $(event.target ? event.target : event.srcElement);

            $this.prev().html(question.Question_Content());
            $this.hide();

            return false;
        };

        self.edit = function (question, event, close) {            

            var $question = $('#q' + question.Question_No);
            var $questionContent = $question.find('.question-content');            

            if ($editForm && $.contains(document.body, $editForm[0])) {
                var old = $editForm.data('question');

                if (close) {
                    $('#q' + old.Question_No).find('.question-content').show();
                    $editForm.remove();                    
                    return;
                }                

                if (question.Question_No === old.Question_No) return;

                $('#q' + old.Question_No).find('.question-content').show();
                $editForm.remove();                          
            }

            if (!question.Modify_Mark) {
                alert('您無法編輯此問題內容');
                return;
            }

            $replyForm.remove();
            $questionContent.hide();

            // 重新產生編輯的 html
            $editForm = $(editForm);
            $editForm.data('question', question);            

            var $input = $editForm.find('textarea');

            StartAjax("GetQuestionContent", { Question_No: question.Question_No }, function (result) {
                if (!result.Success_Mark) {
                    alert(result.Display_Message);
                }
                else {
                    $editForm.insertAfter($questionContent);                    

                    $input.val('').focus().val(result.Response_Data.c).autosize();

                    var $list = $(pics);

                    for (var index in result.Response_Data.attach) {
                        var file = result.Response_Data.attach[index];

                        var pic = '<a data-no="' + file.n + '" data-path="' + file.p + '" style="position:relative" href="' + gvWebPicPath + file.p + '" rel="edit-group' + question.Question_No + '"><button style="position:absolute;left:0" title="刪除" type="button" class="close">&times;</button><img src="' + gvWebPicPath + file.p + '" rel="" /></a>';                        

                        $list.find('ul').append('<li>' + pic + '</li>');                                   
                    }

                    $list.insertAfter($input);
                }
            });
        }; 
    }    

    $(document).on('click', '[data-role="cola-user"]', function (e) {
        e.preventDefault();        

        var $this = $(this);
        var userid = $this.attr('data-user-id');        

        OpenDialogForDisplay('/A00B_Enterprise/A00B_Q02_UserData.aspx', 'TitleName=' + encodeURIComponent('A00B_Q02　員工資料查詢') + '&UserId=' + userid, 2, 540);        
    });

    $(document).on('click', '[data-role="sendReply"]', function (e) {
        e.preventDefault();
        var $this = $(this);
        $this.prop('disable', true);

        var questionNo = vm.replyQuestionNo.Question_No;

        if (!questionNo || questionNo === 0) return;

        var questionContent = $.trim($('#txtReplyContent').val());

        var length = questionContent.length;
        var line = $this.val().match(/\n/g);

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
            if (!result.Success_Mark) {
                alert(result.Display_Message);
                $this.prop('disabled', false);
            }
            else {
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
                
                vm.questions.splice(insertIndex + 1, 0, { Doc_No: videoData.Doc_No, Reply_Mark: true, Attach_Mark: question.am, Attachment: ko.observableArray(question.at), Manage_Mark: true, Modify_Mark: true, Modify_Time: ko.observable(), Position_Text: '', Question_Position: 0, Question_Content: ko.observable(question.c), Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: questionNo, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: vm.replyQuestionNo.Top_Mark, cancel: question.cancel });

                if (question.am) {
                    $('[rel="group' + question.n + '"]').colorbox();
                }

                $replyForm.remove();
            }

        }, true);
    });

    $(document).on('click', '.editForm input[type="button"]', function () {
        var $this = $(this),            
            $input = $editForm.find('textarea'),
            question = $editForm.data('question');

        if ($this.data('role') === 'sendEdit')
        {   
            var questionContent = $.trim($input.val());

            var length = questionContent.length;
            var line = $input.val().match(/\n$/g);

            if (line) length += line.length;

            if (questionContent.length === 0) {
                alert('請輸入回覆內容');
                return false;
            }

            if (length > 500) {
                alert('回覆請勿輸入超過 500 個字');
                return false;
            }

            $this.prop('disabled', true);

            StartAjax("ModifyQuestion", {Doc_No: videoData.Doc_No, Question_No: question.Question_No, Question_Content: questionContent}, function (result) {
                if (!result.Success_Mark) {
                    alert(result.Display_Message);                    
                }
                else {                    
                    var data = result.Response_Data;
                    question.Question_Content(data.c);
                    question.Modify_Time(data.t);
                    question.Attachment(data.attach);                    
                }
                $this.prop('disabled', false);
                vm.edit(question, undefined, true);
            });
        }
        else {
            vm.edit(question, undefined, true);
        }
    });

    var attachContract = {
        p: 'path',
        n: 'no'
    };

    function remapProp(smallObject, contract) {
        var largeObject = [];        

        for (var index in smallObject) {
            var temp = {};
            for (var smallProperty in contract) {                
                temp[contract[smallProperty]] = smallObject[index][smallProperty];
            }            
            largeObject.push(temp);
        }
        return largeObject;
    }        

    $(document).on('click', '.atch', function () {
        var returnVlaue = OpenDialogForDisplay('/L10B_Briefing/L10B_S1_SearchPictureObject.aspx', 'TitleName=' + encodeURIComponent('L10B_S1 搜尋圖片元件'), 2, 700);

        if (returnVlaue === undefined) return;

        var $this = $(this),
            selectFiles = JSON.parse(returnVlaue),
            id = $this.attr('id');

        StartAjax("HandleQuestionAttachment", { Attach_Files: selectFiles, New_Question: !!id }, function (result) {
            if (result.Success_Mark) {
                var data = remapProp(result.Response_Data.attachs, attachContract);

                for (var index in data) {
                    var file = data[index];

                    var pic = '<a data-no="' + file.no + '" data-path="' + file.path + '" style="position:relative" href="' + gvWebPicPath + file.path + '"><button style="position:absolute;left:0" title="刪除" type="button" class="close">&times;</button><img src="' + gvWebPicPath + file.path + '" /></a>';

                    var $list = $this.siblings('.pics');

                    if ($list.length == 0) {
                        $list = $(pics);
                        $list.insertAfter($this.siblings('textarea'));
                    }

                    $list.find('ul').append('<li>' + pic + '</li>');
                }
            }
            else {
                if (result.Display_Message) {
                    alert(result.Display_Message);
                }
            }
        });
    });

    $(document).on('click', '.pics .close', function (e) {
        e.stopPropagation();
        var $this = $(this),
            $list = $this.parents('.pics'),
            path = $this.parent().data('path'),
            isNew = $this.parents('#questionForm') == 1;

        StartAjax("RemoveQuestionAttachment", { File_Type: 'IMAGE', File_Path: path, New_Question: isNew }, function (result) {
            if (result.Success_Mark) {
                $this.parents('li:first').fadeOut(200, function () {
                    $(this).remove();

                    if ($list.find('li').length == 0) {
                        $list.remove();
                        $list = null;
                    }
                });
            }
            else {
                if (result.Display_Message) {
                    alert(result.Display_Message);
                }
            }
        });
    });

    //$(document).on('keyup', '#txtReplyContent, .input-content', function () {
    //    var $this = $(this);
    //    var length = $.trim($this.val()).length;
    //    var line = $this.val().match(/\n$/g);        

    //    if (line) length += line.length;

    //    if (length > 500) {
    //        $this.next().html('<span class="text-danger">' + length + ' | 500 個字數限制</span>');
    //    }
    //    else if (length > 0) {
    //        $this.next().html('還可輸入 ' + (500 - length) + ' 個字');
    //    }
    //    else {
    //        $this.next().html('');
    //    }
    //});

    $(document).on('click', '.modifyLog', function (e) {
        var $this = $(this);
        var questionNo = $this.attr('href').substring(1);
        e.preventDefault();

        StartAjax("GetQuestionLog", { Question_No: questionNo }, function (result) {
            if (result.Success_Mark) {
                var data = result.Response_Data.d;
                var html = '';

                html += '<div style="width: 350px; margin: 10px;">';

                for (var index in data) {
                    var log = data[index];
                    var paths = log.Attachment_Paths;

                    html += '<div class="question">';
                    html += '<div class="media msg">';
                    html += '<a class="pull-left media-left" href="#" data-role="cola-user" data-user-id="' + log.Original_User + '">';
                    html += '<img class="media-object" style="width: 32px;" src="' + log.User_Photo + '">';
                    html += '</a>';
                    html += '<div class="media-body">';
                    html += '<small class="pull-right time" title="發表時間">' + log.Original_Time + '</small>';
                    html += '<div class="media-heading">';
                    html += '<a href="#" data-role="cola-user" data-user-id="' + log.Original_User + '">' + log.Original_Name + '</a>';
                    html += '<div class="question-content">';
                    html += '<span>' + log.Question_Content + '</span>';

                    if (paths !== '') {
                        html += '<div class="pics"><ul>'

                        var pathsArr = paths.split('；');

                        for (var index in pathsArr) {
                            var path = pathsArr[index];

                            if (path === '') continue;

                            html += '<li><a href="' + gvWebPicPath + path + '" rel="group' + questionNo + '"><img src="' + gvWebPicPath + path + '" /></a></li>';
                        }

                        html += '</ul></div>';
                    }

                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                }

                html += '</div>';

                $.colorbox({ html: html, opacity: 0.5 });
            }
            else {
                if (result.Display_Message) alert(result.Display_Message);
            }
        });
    });

    $(document).on('click', '.pics a', function (e) {
        e.preventDefault();
        var $this = $(this);        

        $.colorbox({ href: $this.attr('href') });
    });
});