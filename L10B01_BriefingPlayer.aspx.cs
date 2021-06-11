using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace VideojsSample
{
    public partial class L10B01_BriefingPlayer : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            /*
             * 
             * <a href="#" id="cmdUnWatchVideo" 
             * data-video-id='<%# Eval("Video_Id") %>' 
             * class="list-group-item video" runat="server">
             * <%# SetText_VideoTopic(Eval("Publish_User").ToString().Trim(), 
             * Eval("Publish_Name").ToString().Trim(), Eval("Doc_Topic").ToString().Trim()) %></a>
            */
            DataTable myVideoListDT = new DataTable();
            DataRow myVideoRow;
            myVideoListDT.Columns.Add("Video_Id", typeof(string));
            myVideoListDT.Columns.Add("Publish_User", typeof(string));
            myVideoListDT.Columns.Add("Publish_Name", typeof(string));
            myVideoListDT.Columns.Add("Doc_Topic", typeof(string));
            myVideoListDT.Columns.Add("Watch_Status", typeof(string));

            myVideoRow = myVideoListDT.NewRow();
            myVideoRow["Video_Id"] = "MsbBBx-3HyI";
            myVideoRow["Publish_User"] = "Publish_User";
            myVideoRow["Publish_Name"] = "Publish_Name";
            myVideoRow["Doc_Topic"] = "Doc_Topic";
            myVideoRow["Watch_Status"] = "";
            myVideoListDT.Rows.Add(myVideoRow);

            myVideoRow = myVideoListDT.NewRow();
            myVideoRow["Video_Id"] = "8O3teHziU_E";
            myVideoRow["Publish_User"] = "測試";
            myVideoRow["Publish_Name"] = "測試";
            myVideoRow["Doc_Topic"] = "Vue.js 教學 - 幼幼班入門篇 (上)";
            myVideoRow["Watch_Status"] = "";
            myVideoListDT.Rows.Add(myVideoRow);

            myVideoRow = myVideoListDT.NewRow();
            myVideoRow["Video_Id"] = "yzrUSzkLQNU";
            myVideoRow["Publish_User"] = "測試";
            myVideoRow["Publish_Name"] = "測試";
            myVideoRow["Doc_Topic"] = "Vue.js 教學 - 幼幼班入門篇 (下)";
            myVideoRow["Watch_Status"] = "";
            myVideoListDT.Rows.Add(myVideoRow);

        
        }


        protected void List_UnWatchVideo_ItemDataBound(object sender, ListViewItemEventArgs e)
        {
            if (e.Item.ItemType == ListViewItemType.DataItem)
            {
                // 未瀏覽影片（狀態＝空白）增加 new 圖示
                HtmlAnchor cmdUnWatchVideo = (HtmlAnchor)e.Item.FindControl("cmdUnWatchVideo");
                string myWatchStatus = ((DataRowView)e.Item.DataItem)["Watch_Status"].ToString().Trim();

                if (myWatchStatus == "")
                {
                    cmdUnWatchVideo.Attributes["class"] += " new";
                }
                   

            }
        }

        protected string SetText_VideoTopic(string Publish_User, string Publish_Name, string Doc_Topic)
        {
            string myReturn = "<span class=\"colaUser\" data-user-id=\"" + Publish_User + "\">" + Publish_Name + "</span>：";
            myReturn += "<span class=\"video-topic\">" + Doc_Topic + "</span>";

            return myReturn;
        }

        protected string SetText_VideoTopic(string Publish_User)
        {
            string myReturn = "<span class=\"video-topic\">" + Publish_User + "</span>";
            return myReturn;
        }
    }
}