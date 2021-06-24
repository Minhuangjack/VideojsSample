using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace VideojsSample
{
    public partial class UpCourse : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            System.Diagnostics.EventLog.WriteEntry("d", "d");
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            try
            {
                System.Diagnostics.EventLog.WriteEntry("0", "0");
                if (this.txtCourseName.Text.Trim().Equals(""))
                {
                    Response.Write("<script>alert('請填寫標題！')</script>");
                    return;
                }

                if (!this.upVideoFile.HasFile)
                {
                    Response.Write("<script>alert('請選擇視頻課程！')</script>");
                    return;
                }
                System.Diagnostics.EventLog.WriteEntry("0", "0");
                //上傳文件的名稱的命名規則是標題
                string fileName = this.txtCourseName.Text;

                string filePathTemp = "upload_files/" + this.txtCourseName.Text.Trim();
                string fpath = Path.Combine(Request.PhysicalApplicationPath, filePathTemp);
                System.Diagnostics.EventLog.WriteEntry("1", "1");
                // 目錄不存在，則創建目錄
                if (!Directory.Exists(fpath))
                {
                    Directory.CreateDirectory(fpath);
                }

                //取出上傳的視頻的文件名，進而取出該文件的擴展名
                string sourceFileName = Path.GetFileName(upVideoFile.FileName);
                string extendName = sourceFileName.Substring(sourceFileName.LastIndexOf(".") + 1);

                //檢測上傳文件是否爲MP4文件
                if (!extendName.ToLower().Equals("mp4"))
                {
                    Response.Write("<script>alert('請選擇MP4格式視頻！')</script>");
                    return;
                }

                //上傳到服務器
                //上傳後的文件名的命名規則是：標題+後綴  
                string fileNameTemp = fileName + "." + extendName;
                string savePath = Path.Combine(fpath, fileNameTemp);
                upVideoFile.SaveAs(savePath);
                System.Diagnostics.EventLog.WriteEntry("A", "A");
                //進行視頻轉換
                string tsPath = Path.Combine(fpath, fileName + ".ts");
                FFmpegHelper.VideoToTs(savePath, tsPath);
                System.Diagnostics.EventLog.WriteEntry("B", "B");
                //檢測是否已生成ts文件
                if (!System.IO.File.Exists(tsPath))
                {
                    //刪除MP4源文件
                    System.IO.File.Delete(savePath);

                    Response.Write("<script>alert('視頻轉換失敗！')</script>");
                    return;
                }

                //生成M3U8文件
                string m3u8Path = Path.Combine(fpath, fileName);
                int VideoLength = Convert.ToInt32(this.txtVideoLength.Text);
                FFmpegHelper.TsToM3u8(tsPath, m3u8Path, VideoLength);
                System.Diagnostics.EventLog.WriteEntry("C", "C");
                //檢測是否已生成M3U8文件
                if (!System.IO.File.Exists(m3u8Path + ".m3u8"))
                {
                    //刪除MP4源文件
                    System.IO.File.Delete(savePath);
                    //刪除TS源文件
                    System.IO.File.Delete(tsPath);

                    Response.Write("<script>alert('視頻轉換失敗！')</script>");
                    return;
                }
                System.Diagnostics.EventLog.WriteEntry("D", "D");
                //刪除MP4源文件
                System.IO.File.Delete(savePath);
                //刪除TS源文件
                System.IO.File.Delete(tsPath);

                Response.Write("<script>alert('視頻轉換完成！')</script>");
            }
            catch (Exception ex)
            {
                Response.Write("<script>alert('" + ex.Message + "')</script>");
                return;
            }

        }
    }
}