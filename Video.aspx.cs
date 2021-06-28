using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace VideojsSample
{
    public partial class Video : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            GetVideoFile();
        }


        public void GetVideoFile()
        {
            string myVideoId = "";
            string httpMethod = Server.HtmlEncode(Request.RequestType);
            /*
            // 禁止使用 POST 以外的方式進入
            if (httpMethod.ToUpper() != "POST")
            {
                return;
            }

            // 確認是否有傳值
            if (Request.Form["VideoId"] != null)
            {
                myVideoId = Request.Form["VideoId"].ToString();
            }
            else 
            {
                return;
            }
            */
            // 讀取檔案路徑
            string filePath = this.Server.MapPath("~/mp4/test.m3u8" + myVideoId);
            // string filePath = "https://localhost:44358/mp4/test.m3u8";
            // 讀取檔案
            var fileName = Path.GetFileName(filePath);
            this.Response.ClearHeaders();
            this.Response.ContentType = "application/octet-stream";
            //this.Response.ContentType = "application/vnd.apple.mpegurl";

            this.Response.AppendHeader("Content-Disposition", "attachment; filename=" + fileName);
            this.Response.BinaryWrite(System.IO.File.ReadAllBytes(filePath));
            this.Response.End();
        }
    }
}