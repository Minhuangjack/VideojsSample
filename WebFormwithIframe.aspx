<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebFormwithIframe.aspx.cs" Inherits="VideojsSample.WebFormwithIframe" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <iframe id="myFrame" width="720" height="800" src="m3u8Player.html">

            </iframe>
        </div>
    </form>
</body>
</html>
