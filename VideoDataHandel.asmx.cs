using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

namespace VideojsSample
{
    /// <summary>
    ///VideoDataHandel 的摘要描述
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // 若要允許使用 ASP.NET AJAX 從指令碼呼叫此 Web 服務，請取消註解下列一行。
    [System.Web.Script.Services.ScriptService]
    public class VideoDataHandel : System.Web.Services.WebService
    {

        [WebMethod]
        public string HelloWorld()
        {
            System.Diagnostics.EventLog.WriteEntry("Test", "tesst");
            return "Hello World";
        }

        [WebMethod]
        public void completeVideo(string Video_Id)
        {
            System.Diagnostics.EventLog.WriteEntry("Video_Id", Video_Id);
        }

        [WebMethod]
        public void SaveVideoFavorite(string Video_Id)
        {
            System.Diagnostics.EventLog.WriteEntry("Favorite", Video_Id);
        }

    }
}
