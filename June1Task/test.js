var PPP_PARA = new Array("Enable", "WANCName", "ConnType", "LANDViewName", "StrServList", "ServList", "IsNAT", "IsDefGW", "IsForward", "VLANID", "Priority", "WBDMode", "IPAddress", "SubnetMask", "GateWay", "DNS1", "DNS2", "DNS3", "WorkIFMac", "UpTime", "ConnStatus", "UserName", "Password", "MRU", "MTU", "ConnTrigger", "TransType", "AuthType", "IdleTime", "ConnError", "DestAddress", "ATMLinkType", "ATMEncapsulation", "ATMQoS", "ATMPeakCellRate", "ATMMaxBurstSize", "ATMMinCellRate", "ATMSCR", "ATMCDV", "RxPackets", "TxPackets", "RxBytes", "TxBytes", "EnableProxy", "MaxUser", "DSCP", "EnablePassThrough", "ValidWANRx", "ValidLANTx", "bitBind", "dhcpEnable", "HostTrigger", "IPMode", "GUASrc", "DNSv6Src", "Gatewayv6Src", "MTUv6Src", "GUA1", "IsOutPreferredLft1", "GUA2", "IsOutPreferredLft2", "GUA3", "IsOutPreferredLft3", "Gatewayv6", "DNS1v6", "DNS2v6", "DNS3v6", "MTUv6", "MCVlANID", "GuaNum", "PdNum", "IPv6CPExt", "PrefixSrc", "Prefix1", "Prefix1Len", "PrefixNum", "IsADSL");
var Cur_IPMode = "";
var Cur_wantype = "";
var Cur_ServList = "";
function getmsg(id) {
    var str = new Array();
    str[0] = new Array(128, "不允许重复，请重新输入。");
    str[1] = new Array(101, "不允许为空，请重新输入。");
    str[2] = new Array(102, "长度有误，请输入长度为");
    str[3] = new Array(103, "之间的字符。");
    str[4] = new Array(114, "有误，请输入合法字符。");
    str[5] = new Array(501, "非法参数！");
    return getMsgFormArray(str, arguments);

} function pageLoad(url) {
    getObj("fSubmit").action = url;
    var errstr = getValue("IF_ERRORSTR");
    var errpara = getValue("IF_ERRORPARAM");
    OldProcessRet(errstr, errpara);
    moveErrLayer(590, 110);
    pageGetValue();
    jslDisable("Frm_mode");
    if ("324" == "329") {
        jslDisable("Frm_ConnTrigger", "Frm_IdleTime");

    }
} function pageGetValue() {
    var pwdStr = "";
    var key = getValue("IF_INDEX");
    if (key == "-1") {
        DisableALL();
        jslEnable("Frm_WANCName0");

    } else {
        setValue("Frm_WANCName0", key);
        Cur_wantype = getValue("ConnType" + key);
        Cur_ServList = getValue("ServList" + key);
        Cur_IPMode = getValue("IPMode" + key);
        if (Cur_IPMode != "ipv4" && Cur_wantype != "PPPoE_Bridged") {
            Cur_wantype = "IP_Routed_PPP";

        } setValue("Frm_mode", Cur_wantype);
        jslSetValue("Frm_UserName", "UserName" + key);
        jslSetValue("Frm_Password", "Password" + key, "GET");
        Change_mode();
        jslSetValue("Frm_MaxUser", "MaxUser" + key);
        jslDisable("Frm_MaxUser");
        if ((Cur_IPMode == "ipv4") && Cur_wantype == "IP_Routed") {
            jslEnDisplay("TR_ConnTrigger", "TR_IdleTime");
            jslSetValue("Frm_ConnTrigger", "ConnTrigger" + key);
            jslSetValue("Frm_IdleTime", "IdleTime" + key);
            ConnTrigger();

        } else {
            jslDiDisplay("TR_ConnTrigger", "TR_IdleTime");

        }
    } return;
} function Change_Link() {
    var link = getValue("Frm_WANCName0");
    if (link == "-1") {
        setValue("IF_INDEX", "-1");
        setValue("IF_ACTION", "");
        formSubmit();

    } else {
        var obj = getObj("Frm_WANCName0");
        var name = obj.options[obj.selectedIndex].text;
        setValue("IF_NAME", name);
        setValue("IF_ACTION", "wanctype");
        setValue("IF_INDEX", link);
        setValue("IF_MULTIDISPLAY", "0");
        formSubmit();

    }
} function pageCheckValue() {
    var msg = "";
    var username = getValue("Frm_UserName");
    if (checkGenStringForASC(username) != true) {
        msg = getmsg(114);
        ShowErrorForCom("Frm_UserName", "Fnt_UserName", msg);
        return false;

    } if (getDisplay("TR_UserName") == true) {
        if (Check_StrLengthRange(username, 1, 64, "Frm_UserName", "Fnt_UserName") != true) {
            return false;

        }
    } if (checkStr(username) != true) {
        msg = getmsg(501);
        ShowErrorForCom("Frm_UserName", "Fnt_UserName", msg);
        return false;

    } var pass = getValue("Frm_Password");
    if (checkGenStringForASC(pass) != true) {
        msg = getmsg(114);
        ShowErrorForCom("Frm_Password", "Fnt_Password", msg);
        return false;

    } var pass_range = checkStrLengthRange(pass, 0, 64);
    if (pass_range == -3) {
        msg = getmsg(102, 0, 64);
        ShowErrorForCom("Frm_Password", "Fnt_Password", msg);
        return false;

    } if (checkStr(pass) != true) {
        msg = getmsg(501);
        ShowErrorForCom("Frm_Password", "Fnt_Password", msg);
        return false;

    } if (pass != "******") {
        if (checkForKeyPassphrase(pass, username) == false) {
            return false;

        }
    } if (Cur_wantype == "IP_Routed" && Cur_IPMode == "ipv4") {
        var idletime = getValue("Frm_IdleTime");
        if (getValue("Frm_ConnTrigger") == "OnDemand") {
            if (Check_IntegerRange(idletime, 0, 4294967295, "Frm_IdleTime", "Fnt_IdleTime") != true) {
                return false;

            }
        }
    } return true;
} function pageSetValue() {
    var wanc_value = getValue("Frm_WANCName0");
    var index;
    if (wanc_value != -1) {
        index = getValue("Frm_WANCName0");
        HiddenMultiInstParaInit(PPP_PARA, index);
        if (Cur_wantype == "IP_Routed_PPP") {
            Cur_wantype = "IP_Routed";

        } setValue("ConnType" + index, Cur_wantype);
        jslSetValue("UserName" + index, "Frm_UserName");
        setEncodePara();
        jslSetPostEncode("Password" + index, "Frm_Password", "SET");
        if (Cur_wantype == "IP_Routed" && Cur_IPMode == "ipv4") {
            if (getValue("EnableProxy" + index) == 1) {
                jslSetValue("MaxUser" + index, "Frm_MaxUser");

            } jslSetValue("ConnTrigger" + index, "Frm_ConnTrigger");
            if (getValue("Frm_ConnTrigger") == "OnDemand") {
                jslSetValue("IdleTime" + index, "Frm_IdleTime");

            }
        } setValue("IF_INDEX", index);
        setValue("Enable" + index, "1");
        setValue("IsADSL" + index, "0");
    }
} function pageCancel() {
    DisableALL();
    formSubmit();

} function pageSubmit() {
    ReSetValueRmZero("Frm_WanVlan");
    pageSetValue();
        setValue("IF_ACTION", "apply");
        setValue("IF_IDLE", "edit");
        setValue("IF_MULTIDISPLAY", "0");
        DisableALL();
        formSubmit();

} function pageDel() { } function Check_StrLengthRange(value, min, max, Frm, Fnt) {
    var temp = checkStrLengthRange(value, min, max);
    if (temp == -1) {
        msg = getmsg(101);
        ShowErrorForCom(Frm, Fnt, msg);
        return false;

    } else if (temp == -3) {
        msg = getmsg(102, min, max);
        ShowErrorForCom(Frm, Fnt, msg);
        return false;

    } return true;
} function Change_mode() {
    var old_wantype = Cur_wantype;
    Cur_wantype = getValue("Frm_mode");
    if (Cur_wantype == "PPPoE_Bridged") {
        jslDiDisplay("TR_UserName", "TR_Password", "TR_MaxUser", "TR_ConnTrigger", "TR_IdleTime", "TR_connect");

    } else {
        jslEnDisplay("TR_UserName", "TR_Password");
        if (Cur_IPMode == "ipv4") {
            if (Cur_ServList == 1) {
                jslEnDisplay("TR_MaxUser");

            } jslEnDisplay("TR_ConnTrigger", "TR_IdleTime");
            jslDiDisplay("TR_connect");
        } if ((getValue("IF_INDEX") != "-1") && old_wantype == "PPPoE_Bridged" && Cur_wantype == "IP_Routed") {
            setValue("Frm_MaxUser", "4");
            setValue("Frm_IdleTime", "120");

        }
    }
} function Change_Dialup() {
    var dailup = getValue("Frm_ConnTrigger");
    switch (dailup) {
        case "AlwaysOn": {
            jslDisable("Frm_IdleTime");
            jslDiDisplay("TR_connect");
            break;

        } case "OnDemand": {
            jslEnable("Frm_IdleTime");
            jslDiDisplay("TR_connect");
            break;

        } case "Manual": {
            var pppoename;
            var pppoeobject;
            var status = getValue("IF_STATUS");
            if (status == "1") {
                var pppnum = getValue("IF_PPPNUM");
                for (var i = 0;
                    i < pppnum;
                    i++) {
                    var PPP_WANCName = getValue("IF_CONNNAME" + i);
                    var PPP_ConnStatus = getValue("IF_CONNSTATUS" + i);
                    pppoeobject = getObj("Frm_WANCName0");
                    pppoename = pppoeobject.options[pppoeobject.selectedIndex].text;
                    if (PPP_WANCName == pppoename) {
                        if (PPP_ConnStatus == "true") {
                            jslDisable("Btn_Connect");
                            jslEnable("Btn_Disconnect");

                        } else {
                            jslDisable("Btn_Disconnect");
                            jslEnable("Btn_Connect");

                        }
                    }
                }
            } else {
                jslDisable("Btn_Disconnect");
                jslDisable("Btn_Connect");

            } jslDisable("Frm_IdleTime");
            jslEnDisplay("TR_connect");
            break;
        } default: break;
    }var key = getValue("IF_INDEX");
    if (key == -1 || getValue("ConnTrigger" + key) != "Manual") {
        jslDiDisplay("TR_connect");

    }
} function ConnTrigger() {
    var dailup = getValue("Frm_ConnTrigger");
    switch (dailup) {
        case "AlwaysOn": {
            jslDisable("Frm_IdleTime");
            jslDiDisplay("TR_connect");
            break;

        } case "OnDemand": {
            jslEnable("Frm_IdleTime");
            jslDiDisplay("TR_connect");
            break;

        } case "Manual": {
            var tem = getValue("IF_IDLE");
            if (tem == "pppconnect" || tem == "pppdisconnect" || tem == "edit") {
                setValue("IF_IDLE", "");
                jslDisable("Btn_Connect", "Btn_Disconnect", "Frm_WANCName0");
                setTimeout(function () {
                    refresh();

                }, 2000);
            } else {
                var pppoename;
                var pppoeobject;
                var status = getValue("IF_STATUS");
                if (status == "1") {
                    var pppnum = getValue("IF_PPPNUM");
                    for (var i = 0;
                        i < pppnum;
                        i++) {
                        var PPP_WANCName = getValue("IF_CONNNAME" + i);
                        var PPP_ConnStatus = getValue("IF_CONNSTATUS" + i);
                        pppoeobject = getObj("Frm_WANCName0");
                        pppoename = pppoeobject.options[pppoeobject.selectedIndex].text;
                        if (PPP_WANCName == pppoename) {
                            if (PPP_ConnStatus == "true") {
                                jslDisable("Btn_Connect");
                                jslEnable("Btn_Disconnect");

                            } else {
                                jslDisable("Btn_Disconnect");
                                jslEnable("Btn_Connect");

                            }
                        }
                    }
                } else {
                    jslDisable("Btn_Disconnect");
                    jslDisable("Btn_Connect");

                }
            } jslDisable("Frm_IdleTime");
            jslEnDisplay("TR_connect");
            break;
        } default: break;
    }var key = getValue("IF_INDEX");
    if (key == -1 || getValue("ConnTrigger" + key) != "Manual") {
        jslDiDisplay("TR_connect");

    }
} function Check_IntegerRange(value, min, max, Frm, Fnt) {
    var tem = checkIntegerRange(value, min, max);
    if (tem == -1) {
        msg = getmsg(101);
        ShowErrorForCom(Frm, Fnt, msg);
        return false;

    } else if (tem == -2) {
        msg = getmsg(115);
        ShowErrorForCom(Frm, Fnt, msg);
        return false;

    } else if (tem == -3) {
        msg = getmsg(116, min, max);
        ShowErrorForCom(Frm, Fnt, msg);
        return false;

    } return true;
} function refresh() {
    var link = getValue("Frm_WANCName0");
    var obj = getObj("Frm_WANCName0");
    var name = obj.options[obj.selectedIndex].text;
    setValue("IF_NAME", name);
    setValue("IF_ACTION", "wanctype");
    setValue("IF_INDEX", link);
    setValue("IF_MULTIDISPLAY", "0");
    DisableALL();
    formSubmit();

} function PPP_connect() {
    setValue("IF_INDEX", getValue("Frm_WANCName0"));
    setValue("IF_MODE", "PPPoE");
    setValue("IF_ACTION", "pppconnect");
    setValue("IF_IDLE", "pppconnect");
    DisableALL();
    formSubmit();

} function PPP_disconnect() {
    setValue("IF_INDEX", getValue("Frm_WANCName0"));
    setValue("IF_MODE", "PPPoE");
    setValue("IF_ACTION", "pppdisconnect");
    setValue("IF_IDLE", "pppdisconnect");
    DisableALL();
    formSubmit();

}