NIGHTER = class {
	constructor(prm,ele){
		this.ele=ele;
		this.dom={};
		this.shadowOya={};
	}

	ShadowSet(ele,tmpl){
		let NI=this;
		let oya = document.getElementById(ele);
		let root;
/*
		if(oya.shadowRoot===null){
			root = oya.attachShadow({mode: 'open'});
		}else{
			root = oya.shadowRoot;
		}
*/
		if(this.shadowOya[ele]===undefined){
			root = oya.attachShadow({mode: 'open'});
			this.shadowOya[ele]=root;
		}else{
			root = this.shadowOya[ele];
		}
		let clone = document.getElementById(tmpl).content.cloneNode(true);
		let w1=document.createElement("DIV");
		root.appendChild(w1);
		w1.appendChild(clone);
//		let osc=oya.shadowRoot.children;
		let osc=root.children;
		for(let i=0;i<osc.length;i++){
			osc[i].setAttribute("data-DOM","DOM"+parseInt(Math.random()*100000));
		}
//		return {"oya":oya.shadowRoot,"node":w1};
		return {"oya":root,"node":w1};
	}
	import_template(tmpl,prm){
//テンプレート定義とクラス定義を読み込んでbodyにセットする
		const NIGHTERCMD=["【nighter】","【/nighter】"];
		let NI=this;
		let wk=new DOMParser().parseFromString(tmpl["TEMPLATE"],"text/html");
		let iwk=tmpl["TEMPLATE"].indexOf(NIGHTERCMD[0]);
		let b=document.body.querySelectorAll("template");
		let h;
		if(prm["template"]===undefined){
			h=wk.querySelector("template");
		}else{
			let ww=wk.querySelectorAll("template");
			for(let i=0;i<ww.length;i++){
				if(ww[i].id=prm["template"]){
					h=ww[i];
					break;
				}
			}
		}
		if(iwk>-1){
			let swk=tmpl["TEMPLATE"].substring(iwk+NIGHTERCMD[0].length,300).split(NIGHTERCMD[1])[0];
			let hwk=eval("this."+swk.trim()).outerHTML;
			h.innerHTML=hwk;
			
		}

		let bodyTemplate=[];
		b.forEach((s)=>{
			if(bodyTemplate.indexOf(s.id)==-1){
				bodyTemplate.push(s.id)
			}
		});
		if(b.length==0){
			document.body.appendChild(h);
			b=document.body.querySelectorAll("template");
			bodyTemplate.push(h.id)
		}else{
			if(bodyTemplate.indexOf(h.id)==-1){
				document.body.appendChild(h);
			}
		}
		let wk1={};
		let sset=this.ShadowSet(prm["location"],h.id);
		wk1["parent"]=sset["oya"];
		wk1["node"]=sset["node"];
		wk1["id"]=h.id;
		wk1["class"]=new tmpl["CLASS"](prm,wk1["parent"],wk1["node"]);
		wk1["nodelist"]=wk1["parent"].querySelectorAll("[data-dom]");


//$を付けた場合、getter , setterとする。
//$$を付けた場合、nodeを返す。
		let wk2=wk1["node"].querySelectorAll("*");
		wk2.forEach((e)=>{if(e.id!=""){
			wk1["$$"+e.id]=function(){
				return this.node.querySelector("#"+e.id);
			}
			let wk3=this.#nodeType(e);
			if(wk3=="value"){
				wk1["$"+e.id]=function(data){
					if(data===undefined){
						return this.node.querySelector("#"+e.id).value;
					}else{
						this.node.querySelector("#"+e.id).value=data;
					}
				}
			}
			if(wk3=="innerHTML"){
				wk1["$"+e.id]=function(data){
					if(data===undefined){
						return this.node.querySelector("#"+e.id).innerHTML;
					}else{
						this.node.querySelector("#"+e.id).innerHTML=data;
					}
				}
			}
		}});


		for(let i=0;i<wk1["nodelist"].length;i++){
			NI.dom[wk1["nodelist"][i].getAttribute("data-dom")]=wk1["class"];

//全体に掛かるスタイルを定義
			wk1["node"].style=tmpl["STYLE"];

//各要素に掛かるスタイルを定義
//「#要素名」で指定する（このテンプレート内で検索するためその他の修飾は不要）
			let a=tmpl["STYLE"].replaceAll("\n","").replaceAll("\t","").match(/\#.*?\}/g);
			if(a!=null && a.length>0){
				for(let j=0;j<a.length;j++){
					let aEle=a[j].match(/\#(.+)\{/)[1];
					let aStyle=a[j].match(/\{(.+)\}/)[1];
					wk1["node"].querySelector("#"+aEle).style=aStyle;

					tmpl["STYLE"]=tmpl["STYLE"].replace(a[j],"");
				}
			}
//疑似要素実装実験
/*
			let b=tmpl["STYLE"].replaceAll("\n","").replaceAll("\t","").match(/\!.*?\}/g);
			if(b!=null && b.length>0){
				for(let j=0;j<b.length;j++){
					wk1["node"].style+=b[j].replace("!",":");
					tmpl["STYLE"]=tmpl["STYLE"].replace(b[j],"");
				}
			}
*/
		}

//イベント関数を自動的に組み込むロジック(関数名を「要素ID_イベント」にすると自動的に関数に組み込んでくれる)
//引数は(テンプレート情報,この要素の入力）
		let ss=Object.getOwnPropertyNames(wk1["class"]['__proto__']);
		for(let i=0;i<ss.length;i++){
			let w1=ss[i].split("_");
			if(w1.length>1){
				let wk2=wk1["node"].querySelector("#"+w1[0]);
				wk2.addEventListener(w1[1],function(){
					switch(NI.#nodeType(this)){
						case 'value':
							wk1["class"][w1.join("_")](wk2,this.value);
							return;
						case 'innerHTML':
							wk1["class"][w1.join("_")](wk2,this.innerHTML);
							return;
						default:
							wk1["class"][w1.join("_")](wk2,this.value);
					}
				});
			}
		}

		return wk1;

	}

	getParentNode(node){
		let NI=this;
		let rn=node.getRootNode();
		while(node!=rn){
			let nn=node.getAttribute("data-dom");
			if(nn==null){
				node=node.parentNode;
			}else{
				return node;
			}
		}
	}

	getBrotherNode(node,id){
		let NI=this;
		let nod=NI.getParentNode(node);
		return nod.querySelector("#"+id);
	}
	getNode(cls,name){
		let NI=this;
//		return cls["nodelist"][0].querySelector("#"+name);
		return cls.querySelector("#"+name);
	}
	convNumeric(str){
		let NI=this;
		if(str.trim()==""){return -1;}
		let wk=str.replaceAll(/["０","１","２","３","４","５","６","７","８","９"]/g,function(s){return ["０","１","２","３","４","５","６","７","８","９"].indexOf(s);})
		if(isFinite(wk)){return parseInt(wk);}else{return -1;}
	}
	copyNode(fromNode,toNode){
		let NI=this;
		let fromValue="";
		switch(NI.#nodeType(fromNode)){
			case 'value':
				fromValue=fromNode.value;
				return;
			case 'innerHTML':
				fromValue=fromNode.innerHTML;
				return;
			default:
				fromValue=fromNode.value;
		}
		switch(NI.#nodeType(toNode)){
			case 'value':
				toNode.value=fromValue;
				return;
			case 'innerHTML':
				toNode.innerHTML=fromValue;
				return;
			default:
				toNode.value=fromValue;
		}
	}

/*
	defaultSetGet(tmplid){
		if(Array.isArray(tmplid)){
			for(let i=0;i<tmplid.length;i++){
				let wk=tmplid[i]["class"].node.querySelectorAll("*");
				wk.forEach((e)=>{if(e.id!=""){
					let wk1=this.#nodeType(e);
					if(wk1=="value"){
						tmplid[i]["class"]["__proto__"]["$"+e.id]=function(data){
							if(data===undefined){
								return this.node.querySelector("#"+e.id).value;
							}else{
								this.node.querySelector("#"+e.id)=data;
							}
						}
					}
				}});
			}
		}else{
			let wk=tmplid["class"].node.querySelectorAll("*");
			wk.forEach((e)=>{if(e.id!=""){
				let wk1=this.#nodeType(e);
				if(wk1=="value"){
					tmplid["class"]["__proto__"]["$"+e.id]=function(data){
						if(data===undefined){
							return this.node.querySelector("#"+e.id).value;
						}else{
							this.node.querySelector("#"+e.id).value=data;
						}
					}
				}
			}});
		}
	}
*/
	#nodeType(node){
		let NI=this;
		if(node.nodeName=="INPUT"){
			return "value";
		}
		if(node.nodeName=="DIV"){
			return "innerHTML";
		}
		if(node.nodeName=="SELECT"){
			return "value";
		}
		if(node.nodeName=="BUTTON"){
			if(node.value==""){
				return "innerHTML";
			}else{
				return "value";
			}
		}
	}
//****************************************************************************************************
// 表描画クラス
//start
//****************************************************************************************************
	createGrid(prm){
		let NI=this;
		let i,j;
		let RET={};

		let STYLE=prm["STYLE"];
		let dcnt=0;
		let DATA=[];
		if(prm["DATA"]!==undefined){
			DATA=prm["DATA"];
			dcnt=DATA[0].length;
		}
		if(prm["SQL"]!==undefined){
			let sql=prm["SQL"];
			var kekka=httpresp(null,SEVER,sql,DB,true);
//			DATA= kekka;
			for(i=0;i<kekka[0].length;i++){
				DATA[i]=[];
				for(j=0;j<kekka.length;j++){
					DATA[i][j]=kekka[j][i];
				}
			}
			dcnt=DATA[0].length;
		}
		let Ntable=document.createElement("table");
		Ntable.style=" border-collapse: collapse;";
		for(i=0;i<DATA.length;i++){
			let Ntr=document.createElement("tr");
			Ntable.appendChild(Ntr);
			for(j=0;j<dcnt;j++){
				let Ntd=document.createElement("td");
				if(STYLE[i]===undefined){
					if(i==1){
						Ntd.style="width:100px;background-color:lightGray;text-align:center;width:100px;height:30px;border:solid 2px BLUE;";
					}else{
						Ntd.style=STYLE[1][j];
					}
				}else{	
					Ntd.style=STYLE[i][j];
				}
				Ntd.innerText=DATA[i][j];
				Ntr .appendChild(Ntd);
			}
		}
		return Ntable;
	}
//****************************************************************************************************
// 表描画クラス
//end
//****************************************************************************************************
//****************************************************************************************************
// GRAPH描画クラス
//start
//****************************************************************************************************
	params={
		 "seps":1
		,"titles":""
		,"tooltips":"off"
		,"meds_max":100
	}
	makeMeds(oya){
		let e1=document.createElement("div");
		let m1=parseInt(oya.style.height/10);
		
	}
	makeToolTips(wk1){
		let w="<div style=\"text-align:center;font-size:12px;\">";
		w=w+wk1["t"] ;
		w=w+"</div>";
		w=w+"<div style=\"text-align:right;\">";
		w=w+wk1["h"].toLocaleString();
		w=w+"</div>";
		return w ;
	}
	makeTitle(oya,titles){
		let e1=document.createElement("div");
		e1.style="width:100%;height:auto;inset(0);top:-10px;textAlign:center;";
		e1.style="width: 100%;height: auto;position: relative;inset: 0;text-align: center;top:-30px;";
		e1.innerText=titles;
		oya.appendChild(e1);
	}
	makeStyle(h,c,hh,l){
		let wk="";
		wk=wk+"height: " + h + "%;";
		wk=wk+"background-color: "+ c +";";
		wk=wk+"top:calc(100% - " + hh +"%);";
		wk=wk+"left: "+ l +"%;";
		wk=wk+"position: absolute;";
		wk=wk+"inset(0);";
		wk=wk+"word-wrap: break-word;";

		if(this.isDarkColor(c)){
			wk=wk+"color: cyan;";
		}else{
			wk=wk+"color: black;";
		}
		return wk;
	}
	colorCheck(colors,i){
		let COLORTBL=["#23ce2f","#794153","#d499ca","#a86a63","#26487c","#6716b9","#c3134c","#ca6378","#0189bc","#2aff8b","#341d2c","#dbf3c8","#4ed8d8","#f25fb7","#63cf1d","#e345a6","#2b7bef","#8483a6","#1ea8f1","#e0b99a","#5029a1","#01db1f","#89244d","#3b7d5b","#2bb4cf","#366746","#b7a8d2","#74e8f5","#13f96d","#f1e3bc","#7dc284","#56101b","#5c8154","#f6f99b","#dc8ba2","#eab276","#9ee8f0","#1476b0","#175557","#470388","#b22259","#da9e9b","#cce5c6","#cfc96e","#11dfda","#6b574a","#bc56e2","#656b12","#df95f9","#0a2f75","#aaf6c0","#6b9d6f","#b880bc","#773b24","#8f3be7","#65bc7e","#603c0c","#faf5ad","#d99705","#c6b813","#32a7e0","#830842","#1889d3","#f0d6d9","#463fe7","#ac9b05","#08431b","#b13bcf","#56f82d","#47346c","#218c86","#324338","#256676","#fc4dfc","#43c724","#f64453","#d947a6","#19c2b0","#afcf84","#2191df","#80820f","#3db346","#41b159","#d8b636","#bcd9a1","#60cb41","#0be8d7","#ce7bca","#d390b1","#b7ebae","#4825d4","#11e863","#156ed2","#a0e606","#3aa07c","#a667df","#115201","#fe5dbf","#e42269","#145e2c","#d7c85f","#585e5e","#e666b5","#f39f2b","#9e4e42","#7c5507","#d14a4f","#8b93ff","#5945bf","#3579ef","#d6a9a8","#14d42d","#c390e1","#b132fa","#c2580a","#fc5436","#cf8921","#7628de","#b3b501","#6901f0","#20d10d","#6bbcf5","#5b13f9","#3784e7","#c8e0fa","#7bf7e0","#ac8a97","#61a17f"];
		if(colors===undefined || colors==""){
			return COLORTBL[i];
		}else{
			return colors;
		}
	}
	num2parcent(prms,nums){
		let h;
		if(prms["meds_max"]>0){
			h=parseInt((nums*100)/prms["meds_max"]);
		}else{
			h=nums;
		}
		return h;
	}
	makePrms(prms){
		for(let key in this.params){
			if(prms[key]===undefined){
				prms[key]=this.params[key];
			}
		}
		return prms;
	}

	makeBarContent(oya,wk,mostTop,l,i,prms){
		let c=this.colorCheck(wk["c"],i);
		let h=this.num2parcent(prms,wk["h"]);

		mostTop=mostTop+h;
		let e1=document.createElement("div");
		e1.className="barContent";
		e1.style=this.makeStyle(h, c,mostTop,l);
		if(prms["tooltips"]=="on"){
			e1.innerHTML=this.makeToolTips(wk);
		}
		oya.appendChild(e1);
		return {"ele":e1,"mostTop":mostTop};
	}
	makeFrame(oya){
		let e1=document.createElement("div");
		e1.style="position:relative;width:100%;height:calc(100% - 30px);top:30px;left:0px;";
		oya.appendChild(e1);
		return e1;
	}
	makeBarGraph(granpa,wk,prms){
		let oya=this.makeFrame(granpa);
		prms=this.makePrms(prms);
		let wk1cnt=wk.length;
		let p=0;
		let w=parseInt(100/wk1cnt)-prms["seps"];
		for(let i=0;i<wk1cnt;i++){
			let ret=this.makeBarContent(oya,wk[i],0,p,i,prms);
			ret["ele"].style.width=w+"%";
			p=p+w+prms["seps"];
		}
		if(prms["titles"]!=""){
			this.makeTitle(oya,prms["titles"]);
		}
	}
	makeStackBarGraph(granpa,wk,prms){
		let oya=this.makeFrame(granpa);
		prms=this.makePrms(prms);
		let p=0;
		for(let i=0;i<wk.length;i++){
			let mostTop=0;
			let wk1cnt=wk.length;
			let w=parseInt(100/wk1cnt)-prms["seps"];
			for(let j=0;j<wk[i].length;j++){
				let ret=this.makeBarContent(oya,wk[i][j],mostTop,p,j,prms);
				mostTop=ret["mostTop"];
				ret["ele"].style.width=w+"%";
			}
			p=p+w+prms["seps"];
		}
		if(prms["titles"]!=""){
			this.makeTitle(oya,prms["titles"]);
		}
	}

	makeStepBarGraph(granpa,wk,prms){
		let oya=this.makeFrame(granpa);
		prms=this.makePrms(prms);
		let wk1cnt=wk.length;
		let p=0;
		let w=parseInt(100/wk1cnt)-prms["seps"];
		let mostTop=0;
		for(let i=0;i<wk1cnt;i++){
			let ret=this.makeBarContent(oya,wk[i],mostTop,p,i,prms);
			mostTop=ret["mostTop"];
			ret["ele"].style.width=w+"%";
			p=p+w+prms["seps"];
		}
		if(prms["titles"]!=""){
			this.makeTitle(oya,prms["titles"]);
		}
	}
	getRandomColor(){
		return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
	}

	isDarkColor(hex) {
		if (typeof hex !== 'string') throw new Error('HEXカラーコードを文字列で指定してください');
			hex = hex.replace(/^#/, '');
			if (hex.length === 3) {
				hex = hex.split('').map(c => c + c).join('');
			}
			if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
	 			throw new Error('不正なHEXカラーコードです');
			}
			const r = parseInt(hex.substr(0, 2), 16);
			const g = parseInt(hex.substr(2, 2), 16);
			const b = parseInt(hex.substr(4, 2), 16);
	// 輝度計算
			const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
	// 閾値128で判定
			return brightness < 128;
	}
	sql2data(sql,prm){
//prm.... {h:"value",t:"code",c:"color",k:"key"}
		let pos_h=0;
		let pos_t=0;
		let pos_c=0;
		let pos_k=0;
		let RET=[];
		var kekka=httpresp(null,SEVER,sql,DB,true);
		for(let j=0;j<kekka.length;j++){
			if(kekka[j][0]==prm["h"]){pos_h=j;}
			if(kekka[j][0]==prm["t"]){pos_t=j;}
			if(kekka[j][0]==prm["c"]){pos_c=j;}
			if(kekka[j][0]==prm["k"]){pos_k=j;}
		}
		let wk=[];
		let dataMap={};
		let dataMapCnt=0;
		for(let i=1;i<kekka[0].length;i++){
			let wk0=kekka[pos_k][i];
			if(dataMap[wk0]===undefined){
				dataMap[wk0]=dataMapCnt;
				wk[dataMapCnt]=[];
				dataMapCnt=dataMapCnt+1;
			}
		}
		for(let i=1;i<kekka[0].length;i++){
			let wk0=kekka[pos_k][i];
			if(kekka[pos_h][i]=="null"){kekka[pos_h][i]="";}
			if(kekka[pos_t][i]=="null"){kekka[pos_t][i]="";}
			if(kekka[pos_c][i]=="null"){kekka[pos_c][i]="";}
			let wk1={h:kekka[pos_h][i],t:kekka[pos_t][i],c:kekka[pos_c][i]};
			wk[dataMap[wk0]].push(wk1);
		}
		for(let keys in dataMap){
			RET.push(wk[dataMap[keys]]);
		}
		return RET;
		
	}
//****************************************************************************************************
// GRAPH描画クラス
//end
//****************************************************************************************************

}

function httpresp(ele,url,sql,db,winflg,params){
	var ret=[];
	let noDataFlg=false;
	winflg = true;
	if(!winflg){
		var win1=window.open('','','toolbar=no,menubar=no,location=no,status=no,top=200,left=200,width=300,height=50');
		win1.document.write("<center><font size=5>データ検索中です。<br>お待ちください。</font></center>");
	}
	if(params!==undefined){
		if(params["noDataSet"]!==undefined){
			noDataFlg=true;
		}
	}
	var httpReq = new XMLHttpRequest();
	httpReq.abort();
	httpReq.open('POST',url, false);
	if(Object.prototype.toString.call(sql) === '[object Array]'){
		if(sql.length==1){
			httpReq.send('SQL=' + encodeURIComponent(sql[0]) + '&DB=' + encodeURIComponent(db));
		}else{
			var tsql="";
			for(var j=0;j<sql.length;j++){
				tsql+="SQL"+j+"="+encodeURIComponent(sql[j])+"&";
			}
			httpReq.send(tsql + 'DB=' + encodeURIComponent(db));
		}
	}else{
		httpReq.send('SQL=' + encodeURIComponent(sql) + '&DB=' + encodeURIComponent(db));
	}
	var data=httpReq.responseText;
	var stat=httpReq.status;
	if(!winflg){
		if(!win1.closed){
			win1.close();
		}
	}
	if(stat==500){
		return ErrorCord.SERVERERROR;
	}
	if(data==""){
		SP=false;
		return undefined;
	}else{
		if(data.substr(0,1)=="!"){
			alert(data);
			return ErrorCord.SQLERROR;
		}
		var retm=data.split("#,#");
		data="";
		var wk=retm[1];
		if(typeof(wk)=="undefined"){
			if(!noDataFlg){
				return wk;
			}else{
				for(var i=0;i<retm[0].split("#!#").length;i++){
					var retw=[];
					ret[i]=retw;
				}
				var rets=retm[0].split("#!#");
				for(var j=0;j<rets.length;j++){
					ret[j][0]=rets[j];
					ret[j][1]="";
				}
				retm="";
				rets="";
				return ret;
				}
		}else{
			for(var i=0;i<wk.split("#!#").length;i++){
				var retw=[];
				ret[i]=retw;
			}
			for(var i=0;i<retm.length;i++){
				var rets=retm[i].split("#!#");
				for(var j=0;j<rets.length;j++){
					ret[j][i]=rets[j];
				}
			}
			retm="";
			rets="";
			return ret;
		}
	}
}
