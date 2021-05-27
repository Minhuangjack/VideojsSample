using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace VideojsSample
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        protected string cvVideoid { set; get; }
        protected void Page_Load(object sender, EventArgs e)
        {
            cvVideoid = "";
            // 取得影片ID
            // cvVideoid = "Videos.mp4";
            cvVideoid = "oceans.mp4";
        }
    }
}