<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="YouTubePlayer2.aspx.cs" Inherits="VideojsSample.YouTubePlayer2" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>影片播放2</title>
    <link href=".\css\video-js.css" rel="stylesheet">
    <script src=".\js\jquery.min.js"></script>
    <script src=".\js\video.js"></script>
</head>
<body>
    <form id="form1" runat="server">
        <div>
             <%--<video id='video' width="100%" controls preload="auto" class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9"></video>--%>
             <video id="video_player" class="video-js vjs-big-play-centered vjs-fluid">
                    <p class="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a
                        web browser that
                    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
                    </p>
                </video>
        </div>
    </form>

    <script type="text/javascript">
        // Load the IFrame Player API code asynchronously.
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        //
        // Replaces the 'ytplayer' element with an <iframe> and
        // YouTube player after the API code downloads.
        // https://developers.google.com/youtube/player_parameters
        var player;
        var videosQueuedCount;
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
            player = videojs(document.getElementById('video_player'), {
                height: '390',
                width: '640',
                playerVars: vars,
                videoId: 'MsbBBx-3HyI',
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                } 
            });
        }

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
    </script>
</body>
</html>
