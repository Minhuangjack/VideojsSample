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

            myVideoRow = myVideoListDT.NewRow();
            myVideoRow["Video_Id"] = "yzrUSzkLQNU";
            myVideoRow["Publish_User"] = "A";
            myVideoRow["Publish_Name"] = "B";
            myVideoRow["Doc_Topic"] = "C";
            myVideoRow["Watch_Status"] = "";
            myVideoListDT.Rows.Add(myVideoRow);

            myVideoRow = myVideoListDT.NewRow();
            myVideoRow["Video_Id"] = "yzrUSzkLQNU";
            myVideoRow["Publish_User"] = "D";
            myVideoRow["Publish_Name"] = "E";
            myVideoRow["Doc_Topic"] = "F";
            myVideoRow["Watch_Status"] = "";
            myVideoListDT.Rows.Add(myVideoRow);

            string myVideoData = ConverDataTableToString(myVideoListDT);

            string myData = "var myvideoList =" + myVideoData + ";";
            myData += "var myvideoListComplete = [];";
            ScriptManager.RegisterClientScriptBlock(this, this.GetType(), "DataInit", myData, true);
        }

        private string ConverDataTableToString(DataTable Data_Table) 
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            foreach (DataRow dr in Data_Table.Rows)
            {
                row = new Dictionary<string, object>();
                foreach (DataColumn col in Data_Table.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                rows.Add(row);
            }
            return serializer.Serialize(rows);
        }
    }
}