<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="L10B01_BriefingPlayer.aspx.cs" Inherits="VideojsSample.L10B01_BriefingPlayer" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>L10B01 視訊簡報個人播放清單</title>
    <%--<script runat="server">
        protected override void OnInit( EventArgs e )
        {
            if ( HttpContext.Current.Request.Url.Authority.Equals("ebs.colatour.com.tw", StringComparison.OrdinalIgnoreCase) )
            {
                if ( HttpContext.Current.Session["UserInfo"] != null )
                {
                    Cola.A000.BasisWeb.UserInfo UserInfo = (Cola.A000.BasisWeb.UserInfo)HttpContext.Current.Session["UserInfo"];

                    Response.Redirect("https://ebsb.colatour.com.tw/A00A_Portal/A00A_Redir.aspx?ProgPath=" + HttpUtility.UrlEncode(Request.RawUrl) + "&ProgId=L10B01&UserId=" + UserInfo.User_Id + "&OrgCode=" + UserInfo.Org_Code + "&OrgName=" + HttpUtility.UrlEncode(UserInfo.Org_Name));
                    HttpContext.Current.ApplicationInstance.CompleteRequest();
                }
            }
            else
            {
                if ( HttpContext.Current.Session["UserInfo"] != null )
                {
                    Cola.A000.BasisWeb.UserInfo UserInfo = (Cola.A000.BasisWeb.UserInfo)HttpContext.Current.Session["UserInfo"];

                    UserInfo.Login_IP = Request.ServerVariables["REMOTE_ADDR"].ToString().Trim();

                    HttpContext.Current.Session["UserInfo"] = UserInfo;
                }
            }

            base.OnInit(e);
        }
     
    </script>--%>
    <link href="Css/bootstrap.min.css" rel="stylesheet" />
    <link href="Css/player.min.css?v=20140409" rel="stylesheet" />
    <link href="Css/briefing-player.min.css?v=20140409" rel="stylesheet" />
    <!--[if lt IE 9]>
      <script src="js/html5shiv.js"></script>
      <script src="js/respond.min.js"></script>
    <![endif]-->
    <!--[if lt IE 8]>
      <script src="JS/json2.min.js"></script>
      <link href="css/player-theme-ie7.css" rel="stylesheet" />
    <![endif]-->
    <style>
        .navbar {
            width: auto;
            left: 0;
            margin-left: 0;
            margin-bottom: 0;
            border-radius: 0;
        }

        .question-content-wrapper {
            -ms-word-break: break-all;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="lightoff hide-def"></div>
    <form id="form1" runat="server" enableviewstate="false">
        <div class="container" id="app">
            <div class="row">
                <div id="rightContainer" class="col-xs-12 col-sm-7 col-md-8 col-lg-8 col-sm-push-5 col-md-push-4" style="z-index: 2">
                    <div id="itemContainer" class="play-fixed">
                        <div class="navbar-xs">
                            <div class="navbar navbar-default">
                                <div class="navbar-header">
                                    <button type="button" class="navbar-toggle" data-role="none" data-toggle="collapse" data-target=".navbar-collapse">
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                    </button>
                                    <span class="navbar-brand video-topic" style="font-weight: bold">
                                        <asp:Literal ID="ltlDocTopic" runat="server"></asp:Literal></span>
                                </div>
                                <div class="navbar-collapse collapse">
                                    <div class="settings">
                                        <ul class="nav navbar-nav navbar-right visible-xs">
                                            <li><a data-role="subscribe" class="text-center" href="#">收藏</a></li>
                                            <li><a data-role="finishwatch" class="text-center" href="#">完成觀看</a></li>
                                        </ul>
                                    </div>
                                    <div class="settings pull-right" style="line-height: 30px;">
                                        <div class="hidden-xs">
                                            <a data-role="subscribe" class="btn btn-primary btn-xs" href="#">收藏</a>
                                            <a data-role="finishwatch" class="btn btn-primary btn-xs" href="#">完成觀看</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="well well-sm" style="z-index: 3; position: relative">
                            <div class="player-message hide-def">
                                <div class="alert alert-success" style="overflow: hidden">
                                    <div class="row">
                                        <div class="col-sm-12 col-md-8 col-lg-7 text">
                                        </div>
                                        <div class="col-sm-12 col-md-4 col-lg-5 option">
                                            <input type="button" data-role="yes" class="btn btn-success btn-xs" value="是" />
                                            <input type="button" data-role="no" class="btn btn-danger btn-xs" value="否，重新播放" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="video-memo-dialog hide-def" style="position: absolute; left: 50%; top: 12%; width: 50%">
                                <div class="well well-sm" style="position: relative; left: -50%;">
                                    <fieldset>
                                        <legend style="font-size: 16px;">新增筆記</legend>
                                        <div class="form-group">
                                            <label class="control-label" for="txtVideoMemo">筆記內容</label>
                                            <input type="text" id="txtVideoMemo" class="form-control input-group-sm col-lg-12" />
                                            <span class="help-block invisible" style="height: 19px;"></span>
                                        </div>
                                        <div class="form-group text-right">
                                            <input type="button" class="btn btn-default" value="取消" />
                                            <input type="button" data-role="send" class="btn btn-primary" value="送出" />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                            <div class="video-question-dialog hide-def" style="position: absolute; left: 50%; top: 12%; width: 50%">
                                <div class="well well-sm" style="position: relative; left: -50%;">
                                    <fieldset>
                                        <legend style="font-size: 16px;">影片發問</legend>
                                        <div class="form-group">
                                            <label class="control-label" for="txtQuestionContent">問題內容</label>
                                            <textarea id="txtQuestionContent" class="form-control input-group-sm col-lg-12"></textarea>
                                            <span class="help-block" style="height: 19px;"></span>
                                        </div>
                                        <div class="form-group text-right">
                                            <input type="button" class="btn btn-default" value="取消" />
                                            <input type="button" data-role="send" class="btn btn-primary" value="送出" />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                            <div style="position: absolute; left: 50%; bottom: 90px;">
                                <div class="video-memo-text"></div>
                            </div>
                            <div id="ytplayer"></div>
                            <%--<div id="mediaPlayer" class="player">
                            </div>--%>
                            <%--<p class="text-center">數位學習播放器最佳瀏覽解析度為 1024 X 768 或以上</p>--%>
                        </div>
                    </div>
                    <div class="tooltab hide-def">
                        <ul class="nav nav-tabs" style="width: 100%;">
                            <li class="active"><a href="#videosummary" data-role="tab">摘要</a></li>
                            <li><a href="#videotext" data-role="tab">字幕</a></li>
                            <li><a href="#videomemo" data-role="tab">筆記</a></li>
                            <li><a href="#question" data-role="tab">Q&A<span data-bind="text: questionCount, visible: questions().length > 0"></span></a></li>
                        </ul>
                        <div class="tab-content">
                            <div class="tab-pane active" id="videosummary">
                                <div class="row">
                                    <div class="col-xs-12 col-sm-4 col-lg-3">
                                        發行：<a href="javascript://" class="text-primary cola-user" data-role="cola-user" data-user-id=""></a>
                                    </div>
                                    <div class="col-xs-12 col-sm-8 col-lg-3">
                                        上架日期：<span id="online-time" class="online-time"></span>
                                    </div>
                                    <div class="col-xs-12 col-sm-4 col-lg-2">
                                        觀看人次：<span id="watch-nos" class="online-time"></span>
                                    </div>
                                    <div class="col-xs-12 col-sm-8 col-lg-4">
                                        最後觀看：<span id="last-watch-time" class="online-time"></span>
                                    </div>
                                </div>
                                <p class="summary">
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <%--<div class="col-xs-12 visible-xs">
                    <a class="ui-btn ui-btn-icon-left btn btn-primary" style="position: static;" data-toggle="slidebar" href="javascript://">
                        <span class="ui-btn-inner">
                            <span class="ui-btn-text">視訊簡報列表</span>
                            <span class="ui-icon ui-icon-shadow ui-icon-arrow-u">&nbsp;</span>
                        </span>
                    </a>
                </div>--%>
                <div class="col-xs-12 col-sm-5 col-md-4 col-lg-4 col-sm-pull-7 col-md-pull-8" id="slidebar" style="height: 100%; z-index: 1">

                    <a href="#" v-on:click="TestMethod('yzrUSzkLQNU')" id="List_UnWatchVideo_cmdUnWatchVideo_0" data-video-id="MsbBBx-3HyI" class="list-group-item video new">yzrUSzkLQNU</a>
                    <a href="#" v-on:click="TestMethod()"  data-video-id="MsbBBx-3HyI" class="list-group-item video new"><span data-user-id="Publish_User" class="colaUser">Publish_Name</span>：<span class="video-topic">Doc_Topic</span></a>
                    <div class="well well-sm">
                        <div class="panel-group playlist-container" style="position: relative; z-index: 0">
                            <div class="list-group video-group">
                                <div class="list-group-item list-group-heading"><a class="list-group-heading-text" href="javascript://">未看完視訊簡報</a></div>
                                <div class="list-group-content unwatch">
                                    <div>
                                        <div class="list-group-item nodata">沒有未看完的視訊簡報</div>
                                    </div>

                                    <div v-for="video in videoList">
                                        <a href="#" v-on:click="onYouTubePlayerAPIReady(video.Video_Id)"
                                            class="list-group-item video">
                                            <%--<span class="colaUser" data-user-id="{{video.Publish_User}}">{{video.Publish_Name}}</span>：--%>
                                            <span class="colaUser" >{{video.Publish_Name}}</span>：
                                            <span class="video-topic">{{video.Doc_Topic}}</span>
                                        </a>
                                    </div>
                                    <a href="#" id="cmdMoreUnWatch" class="list-group-item text-center more" data-role="unwatch" runat="server">顯示更多</a>
                                </div>
                            </div>
                            <div class="list-group video-group">
                                <div class="list-group-item list-group-heading"><a class="list-group-heading-text" href="javascript://">已看完視訊簡報</a></div>
                                <div class="list-group-content watched">
                                    <asp:ListView ID="List_WatchedVideo" runat="server">
                                        <EmptyDataTemplate>
                                            <div class="list-group-item nodata">沒有看完的視訊簡報</div>
                                        </EmptyDataTemplate>
                                        <ItemTemplate>
                                            <a href="#" data-video-id='<%# Eval("Video_Id") %>' class="list-group-item video"><%# SetText_VideoTopic(Eval("Publish_User").ToString().Trim(), Eval("Publish_Name").ToString().Trim(), Eval("Doc_Topic").ToString().Trim()) %></a>
                                        </ItemTemplate>
                                    </asp:ListView>
                                    <a href="#" id="cmdMoreWatched" class="list-group-item text-center more" data-role="watched" runat="server">顯示更多</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <input id="hdVideoData" type="hidden" runat="server" />
    </form>
    <script src="JS/knockout-3.0.0.js"></script>
    <script src="JS/jquery-1.9.1.min.js"></script>
    <script src="JS/L10B.min.js"></script>
    <script src="JS/vue.js"></script>
    <script type="text/javascript">
        //
        // Replaces the 'ytplayer' element with an <iframe> and
        // YouTube player after the API code downloads.
        // https://developers.google.com/youtube/player_parameters
        var player;
        var videosQueuedCount;
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        new Vue({
            el: '#app',
            data: {
                test: '這是本頁資料',
                videoid:'',
                /*
                 * myVideoRow["Video_Id"] = "MsbBBx-3HyI";
       myVideoRow["Publish_User"] = "Publish_User";
       myVideoRow["Publish_Name"] = "Publish_Name";
       myVideoRow["Doc_Topic"] = "Doc_Topic";
       myVideoRow["Watch_Status"] = "";
                 */
                videoList: [
                    {
                        Video_Id: 'MsbBBx-3HyI',
                        Publish_User: 'Publish_User',
                        Publish_Name: 'Publish_Name',
                        Doc_Topic: 'Doc_Topic',
                        Watch_Status: ''
                    },
                    {
                        Video_Id: '8O3teHziU_E',
                        Publish_User: '測試',
                        Publish_Name: '測試',
                        Doc_Topic: 'Vue.js 教學 - 幼幼班入門篇 (上)',
                        Watch_Status: ''
                    },

                ]
            },
            methods: {
                TestMethod(videoid) {
                    console.log('TestMethod', TestMethod);
                    player.loadVideoById(TestMethod);
                    // sessionStorage.setItem('key', 'MsbBBx-3HyI');
                },
                onYouTubePlayerAPIReady(videoid) {
                    console.log('AA', videoid);
                    var self = this;
                    if (self.videoid != '') {
                        self.videoid = videoid;
                        player.loadVideoById(videoid);
                        return;
                    }
                    videosQueuedCount = 1;
                    var vars = {};
                    
                    self.videoid = videoid;
                    vars =  {
                        autoplay: 0,
                        enablejsapi: 0,
                        controls: 1,
                        modestbranding: 1, // rel=0&autoplay=0&frameborder=0
                        rel: 0,
                        frameborder: 0,
                        fs: 0
                    }
                    player = new YT.Player(document.getElementById('ytplayer'), {
                        height: '390',
                        width: '640',
                        playerVars: vars,
                        videoId: videoid,
                        events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange
                        }
                    });
                }
            },
            
        })

        // Load the IFrame Player API code asynchronously.
     
        /*
        function onYouTubePlayerAPIReady() {
            videosQueuedCount = 1;
            var vars = {
                autoplay: 0,
                enablejsapi: 0,
                controls: 1,
                modestbranding: 1, // rel=0&autoplay=0&frameborder=0
                rel: 0,
                frameborder: 0,
                fs: 0
            }
            player = new YT.Player('ytplayer', {
                height: '390',
                width: '640',
                playerVars: vars,
                videoId: '',
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                }
            });
        }
        */
        // 自動撥放影片
        function onPlayerReady(event) {
            event.target.playVideo();
        }

        // 偵測影片是否撥放完畢
        function onPlayerStateChange(event) {
            if (event.data === 0) {
                alert('done');
            }
        }
        function Test2() {
            console.log('HAA')
        }
    </script>
</body>
</html>
