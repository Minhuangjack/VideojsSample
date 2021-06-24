using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;

namespace VideojsSample
{
    public class FFmpegHelper
    {
        //安裝的ffmpeg的路徑 寫在配置文件的 你也可以直接寫你的路徑 D:\ffmpeg\bin\ffmpeg.exe
        //static string FFmpegPath = System.Configuration.ConfigurationManager.AppSettings["ffmepg"];

        /// <summary>
        /// 視頻轉碼爲ts文件
        /// </summary>
        /// <param name="videoUrl"></param>
        /// <param name="targetUrl"></param>
        public static void VideoToTs(string videoUrl, string targetUrl)
        {
            //視頻轉碼指令
            string para = string.Format("ffmpeg -y -i \"{0}\" -vcodec copy -acodec copy -vbsf h264_mp4toannexb \"{1}\"", videoUrl, targetUrl);
            RunMyProcess(para);
        }

        /// <summary>
        /// 將ts文件轉換爲mu3u8文件
        /// </summary>
        /// <param name="tsUrl"></param>
        /// <param name="m3u8Url">這個路徑不要帶擴展名</param>
        /// <param name="videoLength">視頻切片時長，默認5秒</param>
        public static void TsToM3u8(string tsUrl, string m3u8Url, int videoLength = 5)
        {
            //視頻轉碼指令
            //string para = [email protected]"ffmpeg -i {tsUrl} -c copy -map 0 -f segment -segment_list {m3u8Url}.m3u8 -segment_time 5 {m3u8Url}-%03d.ts";
            //這裏是關鍵點，一般平時切視頻都是用FFmpeg -i  地址 -c這樣，但是在服務器時，這樣調用可能找不到ffmpeg的路徑 所以這裏直接用ffmpeg.exe來執行命令
            //string para = [email protected]"{FFmpegPath} -i {tsUrl} -c copy -map 0 -f segment -segment_list {m3u8Url}.m3u8 -segment_time 5 {m3u8Url}-%03d.ts";
            string para = string.Format("ffmpeg -i \"{0}\" -c copy -map 0 -f segment -segment_list \"{1}.m3u8\" -segment_time 5 \"{1}-%03d.ts\"", tsUrl, m3u8Url);
            RunMyProcess(para);
        }

        /// <summary>
        /// 執行cmd指令
        /// </summary>
        /// <param name="Parameters"></param>
        public static void RunMyProcess(string Parameters)
        {
            using (Process p = new Process())
            {
                try
                {
                    p.StartInfo.FileName = "cmd.exe";
                    p.StartInfo.UseShellExecute = false;//是否使用操作系統shell啓動
                    p.StartInfo.RedirectStandardInput = true;//接受來自調用程序的輸入信息
                    p.StartInfo.RedirectStandardOutput = true;//由調用程序獲取輸出信息
                    p.StartInfo.RedirectStandardError = true;//重定向標準錯誤輸出
                    p.StartInfo.CreateNoWindow = false;//不顯示程序窗口                                                
                    p.Start();//啓動程序
                    //向cmd窗口發送輸入信息
                    p.StandardInput.WriteLine(Parameters + "&&exit");
                    p.StandardInput.AutoFlush = true;
                    p.StandardInput.Close();
                    //獲取cmd窗口的輸出信息
                    string output = p.StandardError.ReadToEnd(); //可以輸出output查看具體報錯原因
                    System.Diagnostics.EventLog.WriteEntry("Error", output);
                    //等待程序執行完退出進程
                    p.WaitForExit();
                    p.Close();

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }
    }
}