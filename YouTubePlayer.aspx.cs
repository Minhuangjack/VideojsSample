﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace VideojsSample
{
    public partial class YouTubePlayer : System.Web.UI.Page
    {
        protected string YoutubeId { get; set; }
        protected void Page_Load(object sender, EventArgs e)
        {
            // MsbBBx-3HyI
            YoutubeId = "MsbBBx-3HyI";
        }
    }
}