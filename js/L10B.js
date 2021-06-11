/// <reference path="jquery.min.js" />

function OpenDialogForDisplay(TargetURL, TargetQueryString, DialogStyle, Width, ReloadButton, ReloadFunction, Param) {

    var ScreenWidth  = screen.width;
    var ScreenHeight = screen.availHeight;
    var FrameURL = "/L10B_Briefing/L10B_Frame.aspx";
    var QueryString  = "?TargetURL=" + TargetURL + "&" + TargetQueryString;
    var myReturnValue;

    if (typeof isMobile == 'function' && isMobile()) {
        myReturnValue = OpenDialogForDisplay_Mobile(TargetURL, TargetQueryString, DialogStyle, Width, ReloadButton, ReloadFunction, Param);
    }
    else {
        switch (DialogStyle) {
            //非iPad，開啟Dialog
            case 1:
                myReturnValue = window.showModalDialog(FrameURL + QueryString, document, 'dialogWidth:' + Width + 'px; dialogHeight:' + (ScreenHeight - 0) + 'px; help:0; dialogTop:0px; dialogLeft:0px; status:1; resizable:0; center:1');
                break;
            case 2:
            case 3:
                myReturnValue = window.showModalDialog(FrameURL + QueryString, document, 'dialogWidth:' + Width + 'px; dialogHeight:' + (ScreenHeight - 0) + 'px; help:0; dialogTop:0px; dialogLeft:' + (ScreenWidth - Width) + 'px; status:1; resizable:0; center:1');
                break;
        }

        //執行ReloadButton、ReloadFunction
        if (DialogStyle == 1 || DialogStyle == 2) {
            //非 Search
            if (ReloadButton != null) {
                if (document.getElementById(ReloadButton) != null) {
                    document.getElementById(ReloadButton).click();
                }
            }

            if (ReloadFunction != null) {
                if (ReloadFunction != '') {
                    ReloadFunction = ReloadFunction + "()";
                    eval(ReloadFunction);
                }
            }
        }
    }
    
    return myReturnValue;
}

function ReturnSelection(ReturnValue) {
    ReturnValue = decodeURIComponent(ReturnValue);    
    
    if (top.window.opener !== undefined) {
        //Chrome        
        top.window.opener.GetReturnValue(ReturnValue, getParameterByName("txtName"));        
        CloseWindow();
    }
    else {
        window.returnValue = ReturnValue;
    }

    CloseWindow();
}

//取得 QueryString 資料
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// 重整視窗
function ReloadWindow()
{   
    if (document.getElementById("cmdReload") !== null)
    {
        document.getElementById("cmdReload").click();
    }
}

// 關閉視窗
function CloseWindow() {

    if (isMobile()) {
        var isInIFrame = (window.location != window.parent.location);

        if (isInIFrame) {
            //用開div包iframe的方式開啟
            var wParent = window.parent;
            if (wParent != null) {
                wParent.CloseDialog();
            }
        }
        else {
            //用window.open的方式開啟
            if (window.opener) {
                window.close();
            }
        }
    }
    else {
        // Chrome 關閉視窗
        if (top.window.opener !== null) {
            top.window.close();
        }
        else
        {            
            window.close();
        }        
    }
}

function isMobile() {
    //var isiPad = navigator.userAgent.match(/iPad/i) != null;

    var isiPad = navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) != null;
    return isiPad;
}

function OpenProg(Prog_Path, Prog_Id) {

    var x = screen.availWidth;
    var y = screen.availHeight;
    var win = window.open(Prog_Path, Prog_Id, "status=no,toolbar=no,location=no,menubar=no, width=" + x + ", height=" + y + ", left=0,top=0");
}

function OpenProg2(Prog_Path, Prog_Id, Url_Hash) {

    var x = screen.availWidth;
    var y = screen.availHeight;
    var win = window.open(Prog_Path, Prog_Id, "status=no,toolbar=no,location=no,menubar=no, scrollbars=yes, width=" + x + ", height=" + y + ", left=0,top=0");
    if (Url_Hash != undefined) {
        win.location.hash = Url_Hash;
    }
}

function Calendar(Caller_Id, Text_Id, Event) {
    //Caller_Id=Button的Id，TextBox的Id, Button的事件
    var myX;
    var myY;
    if (Event.screenX != null) {
        myX = Event.screenX + 30; //IE
    }
    else {
        myX = Event.pageX + 30 //FireFox
    }

    if (Event.screenY != null) {
        myY = Event.screenY - 40;
    }
    else {
        myY = Event.pageY - 40;
    }

    if (window.ActiveXObject) {
        var myDate = window.showModalDialog('L01A_Calendar.htm', '', 'dialogTop=' + myY + ';dialogLeft=' + myX + ';dialogHeight=275px;scroll=no;help=no;status=no;dialogWidth=227px;titlebar=no;edge=sunken,modal=yes');

        if (myDate != undefined) {
            ObjDate = document.getElementById(Text_Id);

            ObjDate.value = myDate;
        }
    }
    else if (document.getBoxObjectFor) {
        var myParameter = "";

        myParameter = Text_Id;

        window.open('/A08M_MiceTour/A08M_Calendar.htm?' + 'ObjId=' + myParameter, 'ColaCalendar', "status=1, location=0, menubar=0, scrollbars=1, top=" + myY + ", left=" + myX + ", Width=227px, Height=275px");
    }
    else {
        alert('很抱歉，您的瀏覽器並不支援此功能，建議您使用IE版本，謝謝'); return false;
    }
}

function QueryUser(User_Id) {
    var ScreenWidth = screen.width;
    var ScreenHeight = screen.availHeight;
    var TargetURL = "/A00B_Enterprise/A00B_Q02_UserData.aspx";
    var TargetQueryString = "UserId=" + User_Id + "&TitleName=" + encodeURIComponent("A00B_Q02　員工資料");
    var FrameURL = "/L10B_Briefing/L10B_Frame.aspx";
    var QueryString = "?TargetURL=" + TargetURL + "&" + TargetQueryString;
    window.showModalDialog(FrameURL + QueryString, document, 'dialogWidth:500px; dialogHeight:' + (ScreenHeight - 0) + 'px; help:0; dialogTop:0px; dialogLeft:' + (ScreenWidth - 0) + 'px;  status:1; resizable:0; center:1');
}