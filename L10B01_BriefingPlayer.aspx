<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="L10B01_BriefingPlayer.aspx.cs" Inherits="VideojsSample.L10B01_BriefingPlayer" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>L10B01 視訊簡報個人播放清單</title>

    <link href="Css/bootstrap.min.css" rel="stylesheet" />
    <link href="Css/player.min.css?v=20140409" rel="stylesheet" />
    <link href="Css/briefing-player.min.css?v=20140409" rel="stylesheet" />

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
                                    <h5>{{videoTitle}}</h5>
                                </div>
                                <div class="navbar-collapse">
                                    <ul class="nav navbar-nav navbar-right" v-if="videoid !== ''">
                                        <li>
                                            <a class="btn btn-warning" href="#" role="button" v-on:click.prevent="saveVideoFavorite()">收藏</a>
                                        </li>
                                        <li>
                                            <a class="btn btn-info" href="#" role="button" v-if="!invalid"  v-on:click.prevent="finishVideoMark()">完成觀看</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="well well-sm" style="z-index: 3; position: relative">
                            <div style="position: absolute; left: 50%; bottom: 90px;">
                                <div class="video-memo-text"></div>
                            </div>
                            <div id="ytplayer"></div>
                        </div>
                    </div>
                </div>
                <div class="col-xs-12 col-sm-5 col-md-4 col-lg-4 col-sm-pull-7 col-md-pull-8" id="slidebar" style="height: 100%; z-index: 1">
                    <div class="well well-sm">
                        <div class="panel-group playlist-container" style="position: relative; z-index: 0">
                            <div class="list-group video-group">
                                <div class="list-group-item list-group-heading"><a class="list-group-heading-text" href="javascript://">未看完視訊簡報</a></div>
                                <div class="list-group-content unwatch">
                                    <div>
                                        <div class="list-group-item nodata" v-if="videoList.length === 0">沒有未看完的視訊簡報</div>
                                    </div>

                                    <div v-for="video in videoListTemp">
                                        <a href="#" v-on:click="onYouTubePlayerAPIReady(video.Video_Id, video.Doc_Topic)"
                                            class="list-group-item video">
                                            <%--<span class="colaUser" data-user-id="{{video.Publish_User}}">{{video.Publish_Name}}</span>：--%>
                                            <span class="colaUser">{{video.Publish_Name}}</span>：
                                            <span class="video-topic">{{video.Doc_Topic}}</span>
                                        </a>
                                    </div>
                                    <a href="#" id="cmdMoreUnWatch" class="list-group-item text-center more" data-role="unwatch" v-if="videoList !== videoListTemp && videoList.length > 0" v-on:click.prevent="copyVideoListToTemp('VideoList', 0)">顯示更多</a>
                                </div>
                            </div>
                            <div class="list-group video-group">
                                <div class="list-group-item list-group-heading"><a class="list-group-heading-text" href="javascript://">已看完視訊簡報</a></div>
                                <div class="list-group-content watched">
                                    <div>
                                        <div class="list-group-item nodata" v-if="videoListComplete.length === 0">沒有看完的視訊簡報</div>
                                    </div>
                                    <div v-for="video in videoListCompleteTemp">
                                        <a href="#" v-on:click="onYouTubePlayerAPIReady(video.Video_Id, video.Doc_Topic)"
                                            class="list-group-item video">
                                            <span class="colaUser">{{video.Publish_Name}}</span>：
                                            <span class="video-topic">{{video.Doc_Topic}}</span>
                                        </a>
                                    </div>
                                    <a href="#" id="cmdMoreWatched" class="list-group-item text-center more" data-role="unwatch" v-if="videoListComplete !== videoListCompleteTemp && videoListComplete.length > 0" v-on:click.prevent="copyVideoListToTemp('VideoListComplete', 0)">顯示更多</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <script src="JS/jquery-1.9.1.min.js"></script>
    <script src="JS/vue.js"></script>
    <script src="JS/axios.js"></script>
    <script src="JS/vue-axios.min.js"></script>
    <script type="text/javascript">


        // Replaces the 'ytplayer' element with an <iframe> and
        // YouTube player after the API code downloads.
        // https://developers.google.com/youtube/player_parameters
        var player;
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        new Vue({
            el: '#app',
            data: {
                videoid: '',
                videoTitle: '',
                videoList: myvideoList,
                videoListTemp: [],
                videoListComplete: myvideoListComplete,
                videoListCompleteTemp: [],
                invalid: true,
                videoTimerCnt:0,
            },
            methods: {
                onYouTubePlayerAPIReady(videoid, Doc_Topic) {
                    var self = this;
                    self.videoTitle = Doc_Topic;
                    self.invalid = true;
                    if (self.videoid != '') {
                        self.videoid = videoid;
                        player.loadVideoById(videoid);
                        return;
                    }
                    var vars = {};

                    self.videoid = videoid;
                    vars = {
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
                        width: '100%',
                        playerVars: vars,
                        videoId: videoid,
                        events: {
                            onReady: self.onPlayerReady,
                            onStateChange: self.onPlayerStateChange
                        }
                    });
                },
                onPlayerReady(event) {
                    // 自動撥放影片
                    event.target.playVideo();
                },
                onPlayerStateChange(event) {
                    /*
                     * 此事件在每次播放器的状态改变时触发。
                     * API传递给事件监听器函数的事件对象的data属性会指定一个与新播放器状态相对应的整数。
                     * 可能的值包括：
                        -1（未开始）
                        0（已结束）
                        1（正在播放）
                        2（已暂停）
                        3（正在缓冲）
                        5（视频已插入）
                     */

                    var self = this;
                    // 偵測影片是否撥放完畢
                    if (event.data === 0) {
                        self.finishVideoMark();
                    }
                    // 偵測影片是否暫停
                    else if (event.data === 2) {
                    }
                        // 偵測影片是否正在播放
                    else if (event.data === 1) {
                    }
                },
                copyVideoListToTemp(List_Type, cnt) {
                    var self = this;
                    if (List_Type === 'VideoList') {
                        if (cnt === 0) {
                            self.videoListTemp = self.videoList;
                        } else {
                            self.videoList.forEach(function (item, index, array) {
                                if (index < cnt) {
                                    self.videoListTemp.push(item);
                                }
                            });
                        }
                    } else {
                        if (cnt === 0) {
                            self.videoListCompleteTemp = self.videoListComplete;
                        } else {
                            self.videoListComplete.forEach(function (item, index, array) {
                                if (index < cnt) {
                                    self.videoListCompleteTemp.push(item);
                                }
                            });
                        }
                    }
                },
                finishVideoMark() {
                    const api = 'https://localhost:44358/VideoDataHandel.asmx/completeVideo'
                    const self = this;
                    self.invalid = false;
                    // 傳送影片完成記號
                    self.axios.post(api, { Video_Id: self.videoid })
                        .then(function (response) {
                            console.log(response);
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                        .then(function () {
                            // always executed
                        });
                },
                saveVideoFavorite() {
                    const api = 'https://localhost:44358/VideoDataHandel.asmx/SaveVideoFavorite'
                    const self = this;
                    self.invalid = false;
                    // 傳送影片完成記號
                    self.axios.post(api, { Video_Id: self.videoid })
                        .then(function (response) {
                            console.log(response);
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                        .then(function () {
                            // always executed
                        });
                },
            },
            created() {
                this.copyVideoListToTemp('VideoList', 3);
                this.copyVideoListToTemp('VideoListComplete', 3);
            }
        })

    </script>
</body>
</html>
