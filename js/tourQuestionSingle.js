/// <reference path="jquery-1.9.1.js" />
/// <reference path="player.js" />
/// <reference path="L10B.js" />
/// <reference path="knockout-3.0.0.debug.js" />
/// <reference path="jquery.autosize.min.js" />

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
    //$(document.body).on('dragstart contextmenu', function () {
    //    return false;
    //});

    if ($('.container').width() > 550) {
        $('.container').width(550);
    }

    var videoData = $('#hdVideoData').val() == "" ? null : JSON.parse($('#hdVideoData').val());
    var replyForm = '<div id="replyForm" class="question reply"><div class="media msg"><div class="media-body text-right"><textarea placeholder="請輸入回覆內容" class="form-control col-lg-12" id="txtReplyContent"></textarea><div class="pull-left help-block"></div><a title="插入圖片" class="atch picture pull-left" style="text-decoration:none" href="javascript://">&nbsp;</a><input style="margin-right:2px" data-role="sendReply" type="button" value="送出" class="btn btn-primary btn-xs"/></div></div><hr /></div>';
    var $replyForm = $(replyForm);
    var editForm = '<div class="editForm"><div class="msg"><div class="media-body text-right"><textarea class="form-control col-lg-12 input-content"></textarea><div class="pull-left help-block"></div><a title="插入圖片" class="atch picture pull-left" style="text-decoration:none" href="javascript://">&nbsp;</a><input style="margin-right:2px" data-role="sendEdit" type="button" value="送出" class="btn btn-primary btn-xs"/><input style="margin-right:2px" type="button" value="取消" class="btn btn-default btn-xs"/></div></div>';
    var $editForm;
    var pics = '<div class="text-right pics"><ul></ul></div>';
    var body = $('html, body');
    var $settings = $('.settings');
    var $tooltab = $('.tooltab');
    var playlistMark = false;

    var vm;
    var questionArray;

    function viewModel() {
        var self = this;
        self.questions = ko.observableArray(questionArray);
        self.type = '';
        self.canScroll = true;
        self.canReply = ko.observable(true);
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

            //StartAjax("GetQuestion", { Doc_No: videoData.Doc_No }, function (result) {
            //    if (!result.Success_Mark) {
            //        alert(result.Display_Message);
            //        return;
            //    }
            //    else {
            //        $replyForm.remove();

            //        questionArray = result.Response_Data.Question;

            //        for (var i = 0, j = questionArray.length; i < j; i++) {
            //            questionArray[i].Follow_Mark = ko.observable(questionArray[i].Follow_Mark);
            //            questionArray[i].Follow_Nos = ko.observable(questionArray[i].Follow_Nos);
            //            questionArray[i].Question_Content = ko.observable(questionArray[i].Question_Content);
            //            questionArray[i].Modify_Time = ko.observable(questionArray[i].Modify_Time);
            //            questionArray[i].Attachment = ko.observableArray(questionArray[i].Attachment);
            //        }

            //        self.questions(questionArray);
            //        $('.new').removeClass('new');

            //        if (questionArray.length == 0) {
            //            $('.loading-snack').removeClass('loading-snack').text('沒有問答資料');
            //        }
            //        else {
            //            $('.loading-snack').remove();
            //            $('#questionWrap').removeClass('hide');
            //        }
            //    }
            //}, true);

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

    //function viewModel() {
    //    var self = this;
    //    self.questions = ko.observableArray(questionArray);
    //    self.canScroll = true;
    //    self.canReply = ko.observable(false);
    //    self.questionCount = ko.computed(function () {
    //        return '(' + self.questions().length + ')';
    //    });
    //    self.afterAddEvent = function (el, index, data) {
    //        if (self.canScroll) {
    //            if (el.nodeType === 1 && $(el).hasClass('media')) {
    //                $('.new').removeClass('new');
    //                $(el).addClass('new');

    //                var complete = false;
    //                if (!complete) {
    //                    body.on("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
    //                        body.stop();
    //                    });

    //                    var top = $(el).offset().top;

    //                    body.animate({
    //                        scrollTop: top
    //                    }, 500, function () {
    //                        complete = true;
    //                        body.off("scroll mousedown DOMMouseScroll mousewheel keyup");
    //                    });
    //                }
    //            }
    //        }
    //    };

    //    self.setPosition = function (question) {
    //        $mediaPlayer.setPosition(question.Question_Position);
    //        return false;
    //    };

    //    self.replyQuestionNo = ko.observable(0);

    //    self.replyQuestion = function (question) {
    //        self.replyQuestionNo(question.Question_No);

    //        if ($editForm && $.contains(document.body, $editForm[0])) self.edit($editForm.data('question'), undefined, true);
    //        $replyForm.remove();
    //        $replyForm = $(replyForm);

    //        $replyForm.insertAfter($('[data-no="' + question.Question_No + '"]').last());
    //        $replyForm.find('textarea').autosize().focus();

    //        var top = $replyForm.offset().top;

    //        var complete = false;
    //        if (!complete) {
    //            body.on("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
    //                body.stop();
    //            });

    //            body.animate({
    //                scrollTop: top
    //            }, 500, function () {
    //                complete = true;
    //                body.off("scroll mousedown DOMMouseScroll mousewheel keyup");
    //            });
    //        }

    //        StartAjax("ClearQuestionAttachment", {}, function (result) {
    //            if (!result.Success_Mark) {
    //                alert(result.Display_Message);
    //            }
    //        });

    //        return false;
    //    };

    //    self.followQuestion = function (question, event) {
    //        if (event.stopPropagation) event.stopPropagation();
    //        if ($(event.target).is(':disabled')) return;

    //        var followMark = !question.Follow_Mark();


    //        StartAjax("SetFollowMark", { Question_No: question.Question_No, Follow_Mark: followMark }, function (result) {
    //            if (!result.Success_Mark) {
    //                if (result.Display_Message != '') {
    //                    alert(result.Display_Message);
    //                    return;
    //                }
    //            }
    //            else {
    //                if (followMark) {
    //                    question.Follow_Nos(question.Follow_Nos() + 1);
    //                }
    //                else {
    //                    question.Follow_Nos(question.Follow_Nos() - 1);
    //                }

    //                question.Follow_Mark(followMark);
    //            }
    //        });

    //        return false;
    //    };

    //    self.readMore = function (question, event) {
    //        if (event.stopPropagation) event.stopPropagation();

    //        var $this = $(event.target ? event.target : event.srcElement);

    //        $this.prev().html(question.Question_Content);
    //        $this.remove();

    //        return false;
    //    };

    //    self.edit = function (question, event, close) {

    //        var $question = $('#q' + question.Question_No);
    //        var $questionContent = $question.find('.question-content');

    //        if ($editForm && $.contains(document.body, $editForm[0])) {
    //            var old = $editForm.data('question');

    //            if (close) {
    //                $('#q' + old.Question_No).find('.question-content').show();
    //                $editForm.remove();
    //                return;
    //            }

    //            if (question.Question_No === old.Question_No) return;

    //            $('#q' + old.Question_No).find('.question-content').show();
    //            $editForm.remove();
    //        }

    //        if (!question.Modify_Mark) {
    //            alert('您無法編輯此問題內容');
    //            return;
    //        }

    //        $replyForm.remove();
    //        $questionContent.hide();

    //        // 重新產生編輯的 html
    //        $editForm = $(editForm);
    //        $editForm.data('question', question);
    //        $pics = null;

    //        var $input = $editForm.find('textarea');

    //        StartAjax("GetQuestionContent", { Question_No: question.Question_No }, function (result) {
    //            if (!result.Success_Mark) {
    //                alert(result.Display_Message);
    //            }
    //            else {
    //                $editForm.insertAfter($questionContent);

    //                $input.val('').focus().val(result.Response_Data.c).autosize();

    //                var $list = $(pics);

    //                for (var index in result.Response_Data.attach) {
    //                    var file = result.Response_Data.attach[index];

    //                    var pic = '<a data-no="' + file.n + '" data-path="' + file.p + '" style="position:relative" href="' + gvWebPicPath + file.p + '" rel="edit-group' + question.Question_No + '"><button style="position:absolute;left:0" title="刪除" type="button" class="close">&times;</button><img src="' + gvWebPicPath + file.p + '" rel="" /></a>';

    //                    $list.find('ul').append('<li>' + pic + '</li>');
    //                }

    //                $list.insertAfter($input);
    //            }
    //        });
    //    };
    //}    

    var $txtQuestionContent = $('#txtQuestionContent');
    $txtQuestionContent.autosize().height(20);

    StartAjax("GetQuestionList", { Question_No: videoData.Question_No, Include_Cancel: false }, function (result) {
        if (!result.Success_Mark) {
            alert(result.Display_Message);
            return;
        }
        else {

            questionArray = result.Response_Data.Question;

            for (var i = 0, j = questionArray.length; i < j; i++) {
                questionArray[i].Follow_Mark = ko.observable(questionArray[i].Follow_Mark);
                questionArray[i].Follow_Nos = ko.observable(questionArray[i].Follow_Nos);
                questionArray[i].Question_Content = ko.observable(questionArray[i].Question_Content);
                questionArray[i].Modify_Time = ko.observable(questionArray[i].Modify_Time);
                questionArray[i].Attachment = ko.observableArray(questionArray[i].Attachment);
            }

            if (questionArray.length == 0) {
                $('.progress').removeClass('loading-snack').text('沒有問答資料');
            }
            else {
                $('.loading-snack').remove();
                $('#questionWrap').removeClass('hide');
            }

            if (vm === undefined) {
                // 第一次 bind
                vm = new viewModel();
                vm.type = result.Response_Data.type;
                ko.applyBindings(vm);
            }
            else {
                vm.type = result.Response_Data.type;
                vm.canScroll = false;
                vm.questions(result.Question);
                vm.canScroll = true;
            }

            vm.canReply(true);            
            $replyForm.remove();

            if (!$tooltab.is(':visible')) $tooltab.show();

            if (location.hash !== '') {

                var target = location.hash.substring(1);

                // 從問題連結過來，跳到問題
                if (target.indexOf('q') == 0) {
                    var q;

                    try {
                        q = parseInt(location.hash.substring(1));
                    } catch (e) { return; }

                    var $target = $('#' + target);

                    $target.addClass('new');

                    // scroll 到問題位置
                    $('#content').scrollTop($target.offset().top);
                }
            }

            // 附加圖片
            $('.pics a').colorbox({ maxWidth: '90%', maxHeight: '90%', transition: 'fade'});
        }
    }, true);    

    // 發問問題送出按鈕
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
            //$txtQuestionContent.next().text('問題內容請勿超過 500 個字').removeClass('invisible');
            alert('問題內容請勿超過 500 個字');
            return;
        }

        if (questionContent.length == 0) {
            //$txtQuestionContent.next().text('請輸入問題內容').removeClass('invisible');
            alert('請輸入問題內容');
            return;
        }

        $this.prop('disabled', true);

        //var videoPosition = $mediaPlayer.getPosition();
        var videoPosition = 0;        

        var params = { Doc_No: videoData.Doc_No, Question_Position: videoPosition, Question_Content: questionContent, Reply_Question_No: 0 };

        StartAjax("NewQuestion", params, function (result) {
            if (!result.Success_Mark)
            { alert(result.Display_Message); }
            else {
                $('.video-question-group .nodata').hide();

                var question = result.Response_Data;
                var positionText = videoPosition.toString().toHHMMSS();

                var insertIndex = 0, maxQuestionNo = 0;

                // 找出回覆要插入陣列的位置
                for (var i = 0, j = vm.questions().length; i < j; i++) {
                    var q = vm.questions()[i];
                    if (!q.Top_Mark) {                        
                        insertIndex = i;
                        break;
                    }
                }

                if ($('.progress')) {
                    $('.progress').remove();
                    $('#questionWrap').removeClass('hide');
                }                

                // 新增問題插入到最前面
                vm.questions.splice(insertIndex, 0, { Doc_No: videoData.Doc_No, Reply_Mark: false, Manage_Mark: true, Modify_Mark: true, Modify_Time: ko.observable(), Attach_Mark: question.am, Attachment: ko.observableArray(question.at), Position_Text: positionText, Question_Position: videoPosition, Question_Content: ko.observable(question.c), Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: question.n, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: question.top, cancel: question.cancel });
                //vm.questions.unshift({ Doc_No: videoData.Doc_No, Reply_Mark: false, Manage_Mark: true, Modify_Mark: true, Modify_Time: ko.observable(), Attach_Mark: question.am, Attachment: ko.observableArray(question.at), Position_Text: positionText, Question_Position: videoPosition, Question_Content: ko.observable(question.c), Question_No: question.n, Input_User: question.u, Input_Name: question.a, Input_Time: question.t, User_Photo: question.p, Reply_Question_No: question.n, Follow_Mark: ko.observable(null), Follow_Nos: ko.observable(0), Top_Mark: false });

                //activeTab($('a[href="#question"]'));
            }

            $this.prop('disabled', false);
            $txtQuestionContent.val('').next().html('');            
        }, true);
    });

    // 發問問題 tooltip
    var $qTips = $('.question-tips');

    $('#txtQuestionContent').focus(function () {
        if ($qTips.is(':visible')) $qTips.hide();
    }).blur(function () {
        var $this = $(this);
        if ($.trim($this.val()) === '') $qTips.show();
    });    

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
                    $('[rel="group' + question.n + '"]').colorbox({ maxWidth: '90%', maxHeight: '90%', transition: 'fade' });
                }

                $replyForm.remove();
            }

        }, true);
    });

    $(document).on('click', '.editForm input[type="button"]', function () {
        var $this = $(this),
            $input = $editForm.find('textarea'),
            question = $editForm.data('question');

        if ($this.data('role') === 'sendEdit') {
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

            StartAjax("ModifyQuestion", { Doc_No: videoData.Doc_No, Question_No: question.Question_No, Question_Content: questionContent }, function (result) {
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

        StartAjax("HandleQuestionAttachment", { Attach_Files: selectFiles, New_Question: !!id}, function (result) {
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

        $.colorbox({ href: $this.attr('href'), maxWidth: '90%', maxHeight: '90%', transition: 'fade' });
    });
});