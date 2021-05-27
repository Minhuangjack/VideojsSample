<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="YouTubePlayer.aspx.cs" Inherits="VideojsSample.YouTubePlayer" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <div id="ytplayer"></div>
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
            player = new YT.Player('ytplayer', {
                height: '390',
                width: '640',
                playerVars: vars,
                videoId: '<%=YoutubeId%>',
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                } 
            });
        }

        // 自動撥放影片
        function onPlayerReady(event) {
            // event.target.playVideo();
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
