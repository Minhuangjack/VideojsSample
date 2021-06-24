<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UpCourse.aspx.cs" Inherits="VideojsSample.UpCourse" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>MP4視頻轉換爲M3U8格式</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <p>視頻名稱：<asp:TextBox ID="txtCourseName" runat="server"></asp:TextBox></p>
            <p>本地視頻：<asp:FileUpload ID="upVideoFile" runat="server" /></p>
            <p>片段時長：<asp:TextBox ID="txtVideoLength" runat="server" Text="5" TextMode="Number"></asp:TextBox></p>
            <p><asp:Button ID="btnSave" runat="server" Text="開始轉換" OnClick="btnSave_Click" /></p>
        </div>
    </form>
</body>
</html>