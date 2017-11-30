/**
 * Created by 51216 on 2017/11/22.
 */


$(function(){
    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    if(sessionStorage['loginInviteCode']){
        console.log(1);
    }else{
        location.href="index.html";
    }

    $.ajax({
        url:'/refresh',
        success:function(data){
            console.log(data);
            if(data.status>0){

            }else{
                location.href="index.html";
            }
        }
    })

    $('#tablist li a').click(function(e){
        if ( e && e.preventDefault )
            e.preventDefault();
        else
            window.event.returnValue = false;
        var id=$(this).attr('href');
        if(id=="#agent"){
            getManagers();
        }else if(id=="#vip"){
            getAccounts();
        }else if(id=="#detail"){
            //getDetails();
            getPaylogs(1);
        }else if(id=="#info"){
            getAgentInfo();
        }
        console.log(id);
        $(this).parent().addClass('active').siblings().removeClass('active');
        $(id).show().siblings().hide();

    });

    function logout(){
        $.ajax({
            url:'/logout',
            success:function(data){
                console.log(data);
            }
        });
        sessionStorage.clear();
        location.href='index.html';
    }
    $('#logout').click(function(){
        logout();
    });
    function getAgentInfo(){
        $.ajax({
            url:'/getAgentInfo',
            data:{managerId:15},
            success:function(data){
                console.log(data);
                var html='';
                html=`
                <tr>
                    <td>姓名：</td>
                    <td>${data.name}</td>
                </tr>
                <tr>
                    <td>游戏ID：</td>
                    <td>${data.uuid}</td>
                </tr>
                <tr>
                    <td>游戏昵称：</td>
                    <td>${data.nickName}</td>
                </tr>
                <tr>
                    <td>剩余蓝钻：</td>
                    <td>${data.roomCard}</td>
                </tr>
                <tr>
                    <td>剩余红钻：</td>
                    <td>${data.redCard}</td>
                </tr>
                <tr>
                    <td>代理编码：</td>
                    <td>${data.id}</td>
                </tr>
                <tr>
                    <td>邀请码：</td>
                    <td>${data.inviteCode}</td>
                </tr>
                <tr>
                    <td>手机号：</td>
                    <td>${data.telephone}</td>
                </tr>
                <tr>
                    <td>微信：</td>
                    <td>${data.weixin}</td>
                </tr>
                <tr>
                    <td>QQ：</td>
                    <td>${data.qq}</td>
                </tr>
                <tr>
                    <td>代理级别：</td>
                    <td>${data.power_id==5?'皇冠代理':(data.power_id==4?'钻石代理':(data.power_id==3?'铂金代理':(data.power_id==2?'黄金代理':'系统管理员')))}</td>
                </tr>
                <tr>
                    <td>分成比例：</td>
                    <td>${data.rebate}</td>
                </tr>
            `;
                $('#info table#infoTbl tbody').html(html);
                $('#info table#infoTbl td').each(function(i,dom){
                    if($(this).html()=='null'){
                        $(this).html('');
                    }
                })
            }
        });
    }
    function getManagers(){
        $.ajax({
            url:'/getManagers',
            data:{managerId:15},
            success:function(data){
                console.dir(data);
                for(var unfix=data.length-1; unfix>0; unfix--){
                    /*给进度做个记录，比到未确定位置*/
                    for(var i=0; i<unfix;i++){
                        if(parseInt(data[i].sumMoney)<parseInt(data[i+1].sumMoney)){
                            var temp = data[i];
                            data.splice(i,1,data[i+1]);
                            data.splice(i+1,1,temp);
                        }
                    }
                }
                var totalpages=1;
                if(data.length%10==0){
                    totalpages=parseInt(data.length/10);
                }else{
                    totalpages=parseInt(data.length/10)+1;
                }

                var options = {
                    currentPage: 1,
                    totalPages:totalpages,
                    bootstrapMajorVersion: 3,
                    onPageChanged: function(e,oldPage,newPage){
                        var start=(newPage-1)*10;
                        var end=start+parseInt(10);
                        if(end>data.length)end=data.length;
                        rendAgent(start,end);
                    }
                };

                $('#agent-pages').bootstrapPaginator(options);
                $('#agent .total-number').html(data.length);
                var initend=10;
                if(initend>data.length)initend=data.length;
                rendAgent(0,initend);
                function rendAgent(start,end){
                    for(var i=start,html='';i<end;i++){
                        var o=data[i];
                        if(data[i].agentNumber>0){
                            html+=`
                    <tr>
                        <td data-level="1" class="childAgent level1"><span class="tree-collapse"></span><b>${o.id}</b></td>`;
                        }else{
                            html+=`
                    <tr>
                        <td data-level="1" class="level1"><span></span><b>${o.id}</b></td>`;
                        };

                        html+=`
                    <td>${o.name}</td>
                    <td>${o.uuid}</td>
                    <td>${o.nickName}</td>
                    <td data-powerId="${o.power_id}">${o.power_id==5?'皇冠代理':(o.power_id==4?'钻石代理':(o.power_id==3?'铂金代理':(o.power_id==2?'黄金代理':'系统管理员')))}</td>
                    <td>${o.rebate}</td>
                    <td>${o.telephone}</td>
                    <td>${o.inviteCode}</td>
                    <td>${o.roomCard}</td>
                    <td>${o.redCard}</td>
                    <td>${o.accountNumber}</td>
                    <td>${o.agentNumber}</td>
                    <td>${o.sumMoney}</td>
                    <td data-status="${o.status}">${o.status==0?'正常':'禁用'}</td>
                    <td>
                    <button type="button" class="btn btn-warning btn-sm editAgent" data-id="${o.id}">编辑</button>
                    <button class="btn btn-success btn-sm chargeForAgent" type="button" data-id="${o.id}">充值</button></td>
                </tr>
                `;
                    }
                    $('#agent #agentTbl tbody').html(html);
                }


            }
        });
    }
    function getAccounts(){
        $.ajax({
            url:'/getAccounts',
            data:{managerId:15},
            success:function(data){
                console.dir(data);
                var totalMoney=0;
                for(var k=0;k<data.length;k++){
                     totalMoney+=parseFloat(data[k].sumMoney);
                }
                $('#vip .total-money').html(totalMoney);
                for(var unfix=data.length-1; unfix>0; unfix--){
                    /*给进度做个记录，比到未确定位置*/
                    for(var i=0; i<unfix;i++){
                        if(parseInt(data[i].sumMoney)<parseInt(data[i+1].sumMoney)){
                            var temp = data[i];
                            data.splice(i,1,data[i+1]);
                            data.splice(i+1,1,temp);
                        }
                    }
                }
                var totalpages=1;
                if(data.length%10==0){
                    totalpages=parseInt(data.length/10);
                }else{
                    totalpages=parseInt(data.length/10)+1;
                }

                var options = {
                    currentPage: 1,
                    totalPages:totalpages,
                    bootstrapMajorVersion: 3,
                    onPageChanged: function(e,oldPage,newPage){
                        var start=(newPage-1)*10;
                        var end=start+parseInt(10);
                        if(end>data.length)end=data.length;
                        rendAccounts(start,end);
                    }
                };

                $('#vip-pages').bootstrapPaginator(options);
                $('#vip .total-number').html(data.length);
                var initend=10;
                if(initend>data.length)initend=data.length;
                rendAccounts(0,initend);

                function rendAccounts(start,end){
                    for(var i=start,html='';i<end;i++){
                        var o=data[i];
                        var redCardStr=0;
                        if(o.redCard){
                            redCardStr=o.redCard;
                        }
                        var editStr='';
                        if(o.status==0){
                            editStr=`<option value="1">标记红名</option><option value="2">禁用</option>`;
                        }else if(o.status==1) {
                            editStr=`<option value="0">取消红名</option><option value="2">禁用</option>`;
                        }else if(o.status==2) {
                            editStr=`<option value="0">启用</option>`;
                        }

                        html+=`
                            <tr>
                                <td>${o.uuid}</td>
                                <td>${o.nickName}</td>
                                <td>${o.sumMoney}</td>
                                <td>${o.roomCard}</td>
                                <td>${redCardStr}</td>
                                <td><b>${o.status==0?'正常':'禁用'}</b></td>
                                <td>${new Date(o.createTime).Format("yyyy-MM-dd HH:mm:ss")}</td>
                                <td>
                                    <span class="input-group editStatus">
                                    <select class="form-control">${editStr}</select>
                                    <button data-id="${o.uuid}" class="btn btn-warning updateStatus">确定</button>
                                    </span>
                                </td>
                            </tr>
                            `;
                    }
                    $('#vip #vipTbl tbody').html(html);

                }
            }
        });
    }

    $('#vip').on('click','.updateStatus',function(){
        var uuid=$(this).attr('data-id');
        var status=$(this).prev().val();
        if(confirm('确定修改账号ID' +uuid+ '状态吗？')){
            $.ajax({
                url:'/changeAccountStatus',
                data:{uuid:uuid,status:status},
                success:function(data){
                    console.log(data);
                    if(data>0){
                       alert('修改成功！');
                    }else{
                        alert('修改失败！');
                    }
                    getAccounts();
                }
            })
        }

    })
    function getDetails(){
        $.ajax({
            url:'/getDetails',
            data:{managerId:15},
            success:function(data){
                console.dir(data);
                var totalpages=1;
                if(data.length%10==0){
                    totalpages=parseInt(data.length/10);
                }else{
                    totalpages=parseInt(data.length/10)+1;
                }

                var options = {
                    currentPage: 1,
                    totalPages:totalpages,
                    bootstrapMajorVersion: 3,
                    onPageChanged: function(e,oldPage,newPage){
                        var start=(newPage-1)*10;
                        var end=start+parseInt(10);
                        if(end>data.length)end=data.length;
                        rendDetails(start,end);
                    }
                };

                $('#detail-pages').bootstrapPaginator(options);
                $('#detail .total-number').html(data.length);
                var initend=10;
                if(initend>data.length)initend=data.length;
                rendDetails(0,initend);

                function rendDetails(start,end){
                    for(var i=start,html='';i<end;i++){
                        var o=data[i];
                        html+=`
                <tr>
                    <td>${o.muuid}</td>
                    <td>${o.inviteCode}</td>
                    <td>${o.name}</td>
                    <td>${o.power_id==5?'皇冠代理':(o.power_id==4?'钻石代理':(o.power_id==3?'铂金代理':(o.power_id==2?'黄金代理':'系统管理员')))}</td>
                    <td>${(o.money*o.rebate).toFixed(2)}</td>
                    <td>${new Date(o.payTime).Format("yyyy-MM-dd HH:mm:ss")}</td>
                    <td>${(o.payType==0&&o.status==1)?o.uuid:''}</td>
                    <td>${(o.payType==0&&o.status==1)?o.nickName:''}</td>
                    <td>${(o.payType==0&&o.status==1)?o.money:''}</td>
                    <td>${(o.payType==0&&o.status==1)?o.money*o.rebate:''}</td>
                    <td>${o.payType==0?'分成':'提现'}</td>
                </tr>
                `;
                    }
                    $('#detail #detailTbl tbody').html(html);
                }


            }
        });
        $.ajax({
            url:'/getTotalMoney',
            success:function(data){
                console.log(data);
                $('#detail .totalMoney').html(data.totalmoney);
            }
        })
        $.ajax({
            url:'/getPaylogs',
            success:function(data){
                console.log('paylogs:');
                console.dir(data);
            }
        })
    }
    getAgentInfo();
    function resetPassword(){
        var str1=prompt('请输入新密码：');
        if(str1==null){
            return;
        }
        var str2=prompt('请再次输入新密码：');
        if(str1!=str2){
            alert('两次输入密码不一致！请重新输入！');
            return;
        }else if((str1!=null)&&str1==str2&&confirm("确定修改密码？")){

            $.ajax({
                type: "POST",
                url:"/resetPassword",
                data: {newPwd:hex_md5(str1)},
                success: function data(data){
                    console.log(data);
                    if(data.status==1)
                        alert('修改密码成功！');
                    else
                        alert('修改密码失败!');
                }
            });

        }
    }
    $('#resetPwd').click(function(){
        resetPassword();
    });
    function getChildAgents(id,ele,level){
        console.log(id);
        $.ajax({
            url:'/getChildAgents',
            data:{managerId:id},
            success:function(data){
                console.dir(data);
                for(var i=0,html='';i<data.length;i++){
                    var o=data[i];
                    if(o.agentNumber>0){
                        html+=`
                <tr data-parent="${id}">
                    <td data-level="${level}" class="childAgent ${"level"+level}"><span class="tree-collapse"></span><b>${o.id}</b></td>`
                    }else{
                        html+=`
                <tr data-parent="${id}">
                    <td data-level="${level}" class="${"level"+level}"><span></span><b>${o.id}</b></td>`
                    }

                    html+=`
                    <td>${o.name}</td>
                    <td>${o.uuid}</td>
                    <td>${o.nickName}</td>
                    <td data-powerId="${o.power_id}">${o.power_id==5?'皇冠代理':(o.power_id==4?'钻石代理':(o.power_id==3?'铂金代理':(o.power_id==2?'黄金代理':'系统管理员')))}</td>
                    <td>${o.rebate}</td>
                    <td>${o.telephone}</td>
                    <td>${o.inviteCode}</td>
                    <td>${o.roomCard}</td>
                    <td>${o.redCard}</td>
                    <td>${o.accountNumber}</td>
                    <td>${o.agentNumber}</td>
                    <td>${o.sumMoney}</td>
                    <td data-status="${o.status}">${o.status==0?'正常':'禁用'}</td>
                    <td>
                    <button type="button" class="btn btn-warning btn-sm editAgent" data-id="${o.id}">编辑</button>
                    <button class="btn btn-success btn-sm chargeForAgent" type="button" data-id="${o.id}">充值</button></td>
                </tr>
                `;
                }
                ele.after(html);
            }
        })
    }
    $("#agent #agentTbl tbody").on("click",'td span.tree-collapse',function(){
        var mid=$(this).next().html();
        var ele=$(this).parents('tr');
        $(this).removeClass('tree-collapse').addClass('tree-expend');
        var level=parseInt($(this).parents('td').attr('data-level'))+1;
        getChildAgents(mid,ele,level);
    });
    $("#agent #agentTbl tbody").on("click",'td span.tree-expend',function(){
        var mid=$(this).next().html();
        $(this).removeClass('tree-expend').addClass('tree-collapse');
        $("#agentTbl [data-parent='"+mid+"']").hide();
    })

    $('#agent #agentTbl').on('click','.editAgent',function(){
        var mid=$(this).attr('data-id');
        var nowTr=$(this).parents('tr');
        $('#agent #agentDetail .uname').val(nowTr.find('td:eq(1)').html());
        $("#agent #agentDetail [name='mid']").val(mid);
        $("#agent #agentDetail [name='uuid']").val(nowTr.find('td:eq(2)').html());
        $("#agent #agentDetail [name='rebate']").val(nowTr.find('td:eq(5)').html());
        $("#agent #agentDetail [name='telephone']").val(nowTr.find('td:eq(6)').html());
        $("#agent #agentDetail [name='inviteCode']").val(nowTr.find('td:eq(7)').html());
        $("#agent #agentDetail [name='powerId']").val(nowTr.find('td:eq(4)').attr('data-powerId'));
        $("#agent #agentDetail [name='status']").val(nowTr.find('td:eq(13)').attr('data-status'));
        $('#agent #agentDetail').fadeIn();
    });
    $('#agent #agentDetail .sure').click(function(){
        var str=$('#agentDetailForm').serialize();
        console.log(str);
        var mid=$("#agent #agentDetail [name='mid']").val();
        var inputInviteCode=$("#agent #agentDetail [name='inviteCode']").val();
        var validInviteCode=false;
        var validUuid=false;
        $.ajax({
            url:'/validInviteCode',
            data:{managerId:mid,inviteCode:inputInviteCode},
            async: false,
            success:function(data){
                console.log(data);
                if(data.length>0){
                    alert('该邀请码不可用！请重新输入！');
                    validInviteCode=false;
                    $("#agent #agentDetail [name='inviteCode']").focus();
                }else{
                    validInviteCode=true;
                }

            }
        });
        $.ajax({
            url:'/validUuid',
            async: false,
            data:str,
            success:function(data){
                console.log(data);
                if(data.status==0){
                    alert('该游戏ID不存在或该游戏ID已设置为代理！');
                    $("#agent #agentDetail [name='uuid']").focus();
                    validUuid=false;
                }else if(data.status==1){
                    validUuid=true;
                }
            }
        });
        if(validInviteCode&&validUuid){
            $.ajax({
                url:'/updateManagerInfo',
                type:'POST',
                data:str,
                success:function(data){
                    console.log(data);
                    if(data.status==1){
                        alert('修改成功！');
                        $('#agent #agentDetail').hide();
                        getManagers();
                    }
                }
            })
        }
    });

    $('#agent #agentTbl').on('click','.chargeForAgent',function(){
        var mid=$(this).attr('data-id');
        var nowTr=$(this).parents('tr');
        $("#agent #agentCharge [name='roomCardNum']").val('');
        $('#agent #agentCharge .uname').val(nowTr.find('td:eq(1)').html());
        $("#agent #agentCharge [name='uuid']").val(nowTr.find('td:eq(2)').html());
        $("#agent #agentCharge .roomCard").val(nowTr.find('td:eq(7)').html());
        $("#agent #agentCharge .redCard").val(nowTr.find('td:eq(8)').html());
        $('#agent #agentCharge').fadeIn();
    });
    $('#agent #agentCharge .sure').click(function(){
        var str=$('#agentChargeForm').serialize();
        console.log(str);
        var inputUuid=$("#agent #agentCharge [name='uuid']").val();
        var roomCardNum=$("#agent #agentCharge [name='roomCardNum']").val();
        if(roomCardNum!=''&&roomCardNum%1==0){
            if(sessionStorage['powerId']!=1&&roomCardNum<=0){
                alert('请输入正确的充钻数量！');
                return;
            }
        }else{
            alert('请输入正确的充钻数量！');
            return;
        }
        $.ajax({
            url:'/updateAccount',
            type:'POST',
            data:str,
            success:function(data){
                console.log(data);
                if(data.status==1){
                    alert('充值成功！');
                    $('#agent #agentCharge').hide();
                    getManagers();
                }
            }
        })
    });

    $('#agent>button.add-agent').click(function(){
        $("#agent #add-message [name='parentInviteCode']").val(sessionStorage['loginInviteCode']);
        $('#agent #add-message').fadeIn();
    });
    $('#agent #add-message .sure').click(function(){
        var str=$('#addAgentForm').serialize();
        var pmid=sessionStorage['managerId'];
        var addRedCard=0;
        var validParentInviteCode=false;
        console.log(str);
        var validInviteCode=false;
        var validUuid=false;
        var inputInviteCode=$("#agent #add-message [name='inviteCode']").val();
        var inputUuid=$("#agent #add-message [name='uuid']").val();
        $.ajax({
            url:'/addValidInviteCode',
            data:{inviteCode:inputInviteCode},
            async: false,
            success:function(data){
                console.log(data);
                if(data.length>0){
                    alert('该邀请码不可用！请重新输入！');
                    validInviteCode=false;
                    $("#agent #add-message [name='inviteCode']").focus();
                }else{
                    validInviteCode=true;
                }
            }
        });
        $.ajax({
            url:'/addValidUuid',
            async: false,
            data:{uuid:inputUuid},
            success:function(data){
                console.log(data);
                console.log(data.validuuid);
                if(data.validuuid==0){
                    alert('该游戏ID不存在或该游戏ID已设置为代理！');
                    $("#agent #add-message [name='uuid']").focus();
                    validUuid=false;
                }else {
                    console.log(data.redCard);
                    if(data.redCard){
                        addRedCard=data.redCard;
                    }
                    validUuid=true;
                }
            }
        });
        $.ajax({
            url:'validParentInviteCode',
            async: false,
            data:{parentInviteCode:$("#agent #add-message [name='parentInviteCode']").val()},
            success:function(data){
                console.log(data);
                if(data.length==0){
                    alert('上级代理邀请码不存在，请重新输入！');
                    validParentInviteCode=false;
                    $("#agent #add-message [name='parentInviteCode']").focus();
                }else{
                    console.log(data[0].id+"++++");
                    pmid=data[0].id;
                    validParentInviteCode=true;
                }
            }
        });
        if(validInviteCode&&validUuid&&validParentInviteCode){
            $.ajax({
                url:'insertManager',
                data:str+"&pmid="+pmid+"&redCard="+addRedCard,
                type:'POST',
                success:function(data){
                    console.log(data);
                    if(data.status==1){
                        alert('新增代理成功！');
                        $("#agent #add-message").hide();
                        getManagers();
                    }else{
                        alert('新增代理失败！')
                    }
                }
            })
        }

    })

    $('.close').click(function(){
        $(this).parent().parent().hide();
    });
    $('.cancel').click(function(){
        $(this).parents('form').parent().hide();
    });

    $('#searchAgent').click(function(){
        var str=$('#searchAgentForm').serialize();
        console.log(str);
        $.ajax({
            url:'/searchAgents',
            data:str,
            success:function(data){
                console.dir(data);
                console.log(data);
                if(data.length>0){
                    for(var unfix=data.length-1; unfix>0; unfix--){
                        /*给进度做个记录，比到未确定位置*/
                        for(var i=0; i<unfix;i++){
                            if(parseInt(data[i].sumMoney)<parseInt(data[i+1].sumMoney)){
                                var temp = data[i];
                                data.splice(i,1,data[i+1]);
                                data.splice(i+1,1,temp);
                            }
                        }
                    }

                    $('#agent #agentTbl tbody').html("");
                    var totalpages=1;
                    if(data.length%10==0){
                        totalpages=parseInt(data.length/10);
                    }else{
                        totalpages=parseInt(data.length/10)+1;
                    }

                    var options = {
                        currentPage: 1,
                        totalPages:totalpages,
                        bootstrapMajorVersion: 3,
                        onPageChanged: function(e,oldPage,newPage){
                            var start=(newPage-1)*10;
                            var end=start+parseInt(10);
                            if(end>data.length)end=data.length;
                            rendAgent(start,end);
                        }
                    };

                    $('#agent-pages').bootstrapPaginator(options);
                    $('#agent .total-number').html(data.length);
                    var initend=10;
                    if(initend>data.length)initend=data.length;
                    rendAgent(0,initend);
                    function rendAgent(start,end){
                        for(var i=start,html='';i<end;i++){
                            var o=data[i];
                            if(data[i].agentNumber>0){
                                html+=`
                    <tr>
                        <td data-level="1" class="childAgent level1"><span class="tree-collapse"></span><b>${o.id}</b></td>`;
                            }else{
                                html+=`
                    <tr>
                        <td data-level="1" class="level1"><span></span><b>${o.id}</b></td>`;
                            };

                            html+=`
                    <td>${o.name}</td>
                    <td>${o.uuid}</td>
                    <td>${o.nickName}</td>
                    <td data-powerId="${o.power_id}">${o.power_id==5?'皇冠代理':(o.power_id==4?'钻石代理':(o.power_id==3?'铂金代理':(o.power_id==2?'黄金代理':'系统管理员')))}</td>
                    <td>${o.rebate}</td>
                    <td>${o.telephone}</td>
                    <td>${o.inviteCode}</td>
                    <td>${o.roomCard}</td>
                    <td>${o.redCard}</td>
                    <td>${o.accountNumber}</td>
                    <td>${o.agentNumber}</td>
                    <td>${o.sumMoney}</td>
                    <td data-status="${o.status}">${o.status==0?'正常':'禁用'}</td>
                    <td>
                    <button type="button" class="btn btn-warning btn-sm editAgent" data-id="${o.id}">编辑</button>
                    <button class="btn btn-success btn-sm chargeForAgent" type="button" data-id="${o.id}">充值</button></td>
                </tr>
                `;
                        }
                        $('#agent #agentTbl tbody').html(html);
                    }
                }else{
                    alert('未查询到符合条件的代理！');
                }


            }
        })
    });

    $('#vip>button.charge').click(function(){
        $('#vip #vipCharge').fadeIn();
    });
    $('#vip #vipCharge .sure').click(function(){
        var uuid=$("#vipChargeForm [name='uuid']").val();
        var validUuid=false;
        $.ajax({
            url:'/vipChargeValidUuid',
            data:{uuid:uuid},
            async: false,
            success:function(data){
                console.log(data);
                if(data.validuuid==0){
                    validUuid=false;
                    alert('此用户ID不存在或已禁用，请重新输入！');
                }else if(data.validuuid==1){
                    validUuid=true;
                }
            }
        });
        var roomCardNum=$("#vip #vipCharge [name='roomCardNum']").val();
        var redCardNum=$("#vip #vipCharge [name='redCardNum']").val();
        if(roomCardNum==''&&redCardNum==''){
            alert('请输入正确的充钻数量！');
            return;
        }
        if(roomCardNum.length!=0&&roomCardNum%1==0){
            if(sessionStorage['powerId']!=1&&roomCardNum<=0){
                alert('请输入正确的充钻数量！');
                return;
            }
        }
        if(redCardNum.length!=0&&redCardNum%1==0){
            if(sessionStorage['powerId']!=1&&redCardNum<=0){
                alert('请输入正确的充钻数量！');
                return;
            }
        }
        var str=$('#vipChargeForm').serialize();
        console.log(str);
        if(validUuid){
            $.ajax({
                url:'/vipCharge',
                data:str,
                type:'POST',
                success:function(data){
                    console.log(data);
                    if(data.status==1){
                        $('#vipCharge').hide();
                        alert('充值成功！');
                        getAccounts();
                    }else{
                        alert('充值失败！');
                    }
                }
            })
        }
    });
    $('#vip #searchVip').click(function(){
        var str=$('#searchVipForm').serialize();
        console.log(str);
        var now=new Date();
        now.setDate(now.getDate()+1);
        var overArr=now.toLocaleDateString().split('/');
        for(var i=0;i<overArr.length;i++){
            if(overArr[i]<10){
                overArr[i]=0+overArr[i];
            }
        }
        var overTime=overArr.join('-');
        console.log(overTime);
        var uuid=$("#searchVipForm [name='uuid']").val();
        if(uuid){
            var validUuid=false;
            $.ajax({
                url:'/vipChargeValidUuid',
                data:{uuid:uuid},
                async: false,
                success:function(data){
                    console.log(data);
                    if(data.validuuid==0){
                        validUuid=false;
                        alert('未查询到数据！');
                    }else if(data.validuuid==1){
                        validUuid=true;
                    }
                }
            });
            if(validUuid){
                $.ajax({
                    url:'/searchVipByUuid',
                    data:str,
                    success:function(data){
                        console.log(data);
                        if(data.length>0){
                            var totalMoney=0;
                            for(var k=0;k<data.length;k++){
                                totalMoney+=parseFloat(data[k].sumMoney);
                            }
                            $('#vip .total-money').html(totalMoney);
                            for(var unfix=data.length-1; unfix>0; unfix--){
                                /*给进度做个记录，比到未确定位置*/
                                for(var i=0; i<unfix;i++){
                                    if(parseInt(data[i].sumMoney)<parseInt(data[i+1].sumMoney)){
                                        var temp = data[i];
                                        data.splice(i,1,data[i+1]);
                                        data.splice(i+1,1,temp);
                                    }
                                }
                            }
                            $('#vip #vipTbl tbody').html("");
                            var totalpages=1;
                            if(data.length%10==0){
                                totalpages=parseInt(data.length/10);
                            }else{
                                totalpages=parseInt(data.length/10)+1;
                            }

                            var options = {
                                currentPage: 1,
                                totalPages:totalpages,
                                bootstrapMajorVersion: 3,
                                onPageChanged: function(e,oldPage,newPage){
                                    var start=(newPage-1)*10;
                                    var end=start+parseInt(10);
                                    if(end>data.length)end=data.length;
                                    rendAccounts(start,end);
                                }
                            };

                            $('#vip-pages').bootstrapPaginator(options);
                            $('#vip .total-number').html(data.length);
                            var initend=10;
                            if(initend>data.length)initend=data.length;
                            rendAccounts(0,initend);

                            function rendAccounts(start,end){
                                for(var i=start,html='';i<end;i++){
                                    var o=data[i];
                                    var redCardStr=0;
                                    if(o.redCard){
                                        redCardStr=o.redCard;
                                    }
                                    var editStr='';
                                    if(o.status==0){
                                        editStr=`<option value="1">标记红名</option><option value="2">禁用</option>`;
                                    }else if(o.status==1) {
                                        editStr=`<option value="0">取消红名</option><option value="2">禁用</option>`;
                                    }else if(o.status==2) {
                                        editStr=`<option value="0">启用</option>`;
                                    }

                                    html+=`
                                        <tr>
                                            <td>${o.uuid}</td>
                                            <td>${o.nickName}</td>
                                            <td>${o.sumMoney}</td>
                                            <td>${o.roomCard}</td>
                                            <td>${redCardStr}</td>
                                            <td><b>${o.status==0?'正常':'禁用'}</b></td>
                                            <td>${new Date(o.createTime).Format("yyyy-MM-dd HH:mm:ss")}</td>
                                            <td>
                                                <span class="input-group editStatus">
                                                <select class="form-control">${editStr}</select>
                                                <button data-id="${o.uuid}" class="btn btn-warning updateStatus">确定</button>
                                                </span>
                                            </td>
                                        </tr>
                                        `;
                                }
                                $('#vip #vipTbl tbody').html(html);

                            }
                        }else{
                            $('#vip .total-money').html(0);
                            alert('未查询到数据，请重新输入！');
                        }
                    }
                })
            }
        }else{
            $.ajax({
                url:'/searchVipByTime',
                data:str,
                success:function(data){
                    console.log(data);
                    if(data.length>0){
                        var totalMoney=0;
                        for(var k=0;k<data.length;k++){
                            totalMoney+=parseFloat(data[k].sumMoney);
                        }
                        $('#vip .total-money').html(totalMoney);
                        for(var unfix=data.length-1; unfix>0; unfix--){
                            /*给进度做个记录，比到未确定位置*/
                            for(var i=0; i<unfix;i++){
                                if(parseInt(data[i].sumMoney)<parseInt(data[i+1].sumMoney)){
                                    var temp = data[i];
                                    data.splice(i,1,data[i+1]);
                                    data.splice(i+1,1,temp);
                                }
                            }
                        }
                        $('#vip #vipTbl tbody').html("");
                        var totalpages=1;
                        if(data.length%10==0){
                            totalpages=parseInt(data.length/10);
                        }else{
                            totalpages=parseInt(data.length/10)+1;
                        }

                        var options = {
                            currentPage: 1,
                            totalPages:totalpages,
                            bootstrapMajorVersion: 3,
                            onPageChanged: function(e,oldPage,newPage){
                                var start=(newPage-1)*10;
                                var end=start+parseInt(10);
                                if(end>data.length)end=data.length;
                                rendAccounts(start,end);
                            }
                        };

                        $('#vip-pages').bootstrapPaginator(options);
                        $('#vip .total-number').html(data.length);
                        var initend=10;
                        if(initend>data.length)initend=data.length;
                        rendAccounts(0,initend);

                        function rendAccounts(start,end){
                            for(var i=start,html='';i<end;i++){
                                var o=data[i];
                                var redCardStr=0;
                                if(o.redCard){
                                    redCardStr=o.redCard;
                                }
                                var editStr='';
                                if(o.status==0){
                                    editStr=`<option value="1">标记红名</option><option value="2">禁用</option>`;
                                }else if(o.status==1) {
                                    editStr=`<option value="0">取消红名</option><option value="2">禁用</option>`;
                                }else if(o.status==2) {
                                    editStr=`<option value="0">启用</option>`;
                                }

                                html+=`
                                    <tr>
                                        <td>${o.uuid}</td>
                                        <td>${o.nickName}</td>
                                        <td>${o.sumMoney}</td>
                                        <td>${o.roomCard}</td>
                                        <td>${redCardStr}</td>
                                        <td><b>${o.status==0?'正常':'禁用'}</b></td>
                                        <td>${new Date(o.createTime).Format("yyyy-MM-dd HH:mm:ss")}</td>
                                        <td>
                                            <span class="input-group editStatus">
                                            <select class="form-control">${editStr}</select>
                                            <button data-id="${o.uuid}" class="btn btn-warning updateStatus">确定</button>
                                            </span>
                                        </td>
                                    </tr>
                                    `;
                            }
                            $('#vip #vipTbl tbody').html(html);
                        }
                    }else{
                        $('#vip .total-money').html(0);
                        alert('未查询到数据，请重新输入！');
                    }
                }
            })
        }


    });


    function getPageNum(){
        $.ajax({
            url:'/getPageNum',
            data:'',
            success:function(data){
                console.log(data);
            }
        })
    }
    if(sessionStorage['powerId']==1){
        $('#totalBonus').hide();
    }else{
        $('#detail .agentSearch').hide();
    }
    function getPaylogs(indexPage){
        var starttime=$("#searchDetailForm [name=starttime]").val();
        var endtime=$("#searchDetailForm [name=endtime]").val();
        var uuid=$("#searchDetailForm [name=uuid]").val();
        var managerId=$("#searchDetailForm [name=managerId]").val();
        $.ajax({
            url:'/getPaylogs',
            data:{page:indexPage,starttime:starttime,endtime:endtime,uuid:uuid,managerId:managerId},
            success:function(data){
                console.log(data);
                var paylogs=data.paylogs;
                var totalBonus=data.totalBonus;
                var totalNum=data.totalNum;
                var totalMoney=data.totalMoney;

                $('#totalBonus b').html(totalBonus);
                $('#detail .total-number').html(totalNum);
                $('#detail .total-money').html(totalMoney);
                if(paylogs.length>0){
                    for(var i=0,html='';i<paylogs.length;i++){
                        var o=paylogs[i];
                        html+=`
                <tr>
                    <td>${o.uuid}</td>
                    <td>${o.nickName}</td>
                    <td>${o.money}</td>
                    <td>${o.payTime}</td>
                    <td>${o.bonus||'---'}</td>
                    <td>${o.gameId}</td>
                </tr>
                `
                    }
                    $('#detailTbl tbody').html(html);

                    var totalpages=1;
                    if(totalNum%10==0){
                        totalpages=totalNum/10;
                    }else{
                        totalpages=totalNum/10+1;
                    }
                    var options = {
                        currentPage: indexPage,
                        totalPages:totalpages,
                        bootstrapMajorVersion: 3,
                        onPageChanged: function(e,oldPage,newPage){
                            getPaylogs(newPage);
                        }
                    };

                    $('#detail-pages').bootstrapPaginator(options);
                }else{
                    $('#detailTbl tbody').html('');
                    $('#detail-pages').html('');
                }

            }
        })
    }
    $('#searchDetail').click(function(){
        getPaylogs(1);
    })
});