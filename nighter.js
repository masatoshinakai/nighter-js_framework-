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
			root = oya.attachShadow({mode: 'closed'});
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
		let NI=this;
		let wk=new DOMParser().parseFromString(tmpl["TEMPLATE"],"text/html");
		let b=document.body.querySelectorAll("template");
		let h=wk.querySelector("template");
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


//getter , setter の定義
		let wk2=wk1["node"].querySelectorAll("*");
		wk2.forEach((e)=>{if(e.id!=""){
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
}
