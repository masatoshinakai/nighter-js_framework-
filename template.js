const SEVER = "http://localhost:8080/";	//<--HttpSqlServerの設置先
const DB = "Server=LS230082\\SQLEXPRESS;database=nighterDB";	//<--MS-sqlserverの設置先とDB名


//商品コード入力

const SYOHIN={};

//SYOHIN要素に対するHTML記述
SYOHIN["TEMPLATE"]=`
<template id="syohin">
<!--ここからテンプレートを記述-->
	<style>
	background-color:white;
	border:solid 3px BLUE;
	#hincd{
		background-color:lightblue;
	};
	#hinname{
		background-color:lightgray;
		border:solid 1px RED;
	};
	</style>
	<div>
	<div>商品コード
	<input type="text" id="hincd" size="10">
	</div>
	<div>
	商品名
	<input type="text" id="hinname" size="20" readonly="readonly" style="font-size:small;">
	<button id="btn1">PUSH</button>
	</div>
	</div>
	<select id="test1" size="1">
		<option value="1">One</option>
		<option value="2">Two</option>
		<option value="3">Three</option>
	</select>
	<div id="hinlst"></div>
<!--ここまでテンプレートを記述-->
</template>
`;




//SYOHIN要素に対するスタイル記述
SYOHIN["STYLE"] = `
	background-color:white;
	border:solid 3px red;
	#hincd{
		background-color:lightblue;
	};
	#hinname{
		background-color:lightgray;
		border:solid 1px RED;
	};
}
`;

//SYOHIN要素に対する関数記述
//要素内だけで使用する関数は基本的にここに記載しておく
SYOHIN["CLASS"] = class {	
	constructor(prm,oyaEle,ele){
		this.ele=oyaEle;
		this.node=ele;
	}
	copyValue(toNode,fromNode){
		toNode.value=ftomNode.value;
	}
	hincd_change(st,hincd){
		let nig=new NIGHTER();
		let sql="";
		hincd=nig.convNumeric(hincd);
		this.node.querySelector("#hincd").value=hincd;
		sql+=" select SYOMN from dbo.M_SYOHIN where SYOCD='"+hincd+"'";

		var kekka=httpresp(null,SEVER,sql,DB,true);
		if(kekka===undefined){
			tmp.getBrotherNode(st,"hinname").value="";
			alert("品番が存在しません");
		}else{
			tmp.getBrotherNode(st,"hinname").value=kekka[0][1];
			tmp.getBrotherNode(st,"hinlst").innerHTML="";
			tmp.getBrotherNode(st,"hinlst").appendChild(tmp.createGrid({"STYLE":GridStyle,"SQL":"select SYOCD,SYOMN from dbo.M_SYOHIN where HINCD='" + hincd+"'"}));

		}
		nig=null;
	}
	
	btn1_click(){
		alert("TEST");
	}
	test1_change(st,no){
		alert(no);
	}
}


const TOKUI={};

TOKUI["TEMPLATE"]=`
<template id="tokui">
<!--ここからテンプレートを記述-->
	<div>
	商品コード
	<input type="text" id="hincd" size="10">
	商品名
	<input type="text" id="hinname" size="20" readonly="readonly">
	</div>
	<div>顧客コード
	<input type="text" id="tokcd" size="10" >
	得意先名
	<input type="text" id="tokname" size="20" readonly="readonly">
	</div>
	<div>
	<button id="btn1" value="TEST1">PUSH1</button>
	<button onclick="alert('顧客AFTER2');">PUSH2</button>
	</div>
<!--ここまでテンプレートを記述-->
</template>
`;
TOKUI["STYLE"] = `
	background-color:lightyellow;
	border:solid 3px green;
	font-size:xx-small;
	#hincd{
		background-color:cyan;
	}
	#tokcd{
		background-color:lightgray;
	}
`;
TOKUI["CLASS"] = class {
	constructor(prm,oyaEle,ele){
		this.ele=oyaEle;
		this.node=ele;
	}
/*
	setTokValue(data){
		this.node.querySelector("#tokcd").value=data;
	}
	setSyoValue(data){
		this.node.querySelector("#hincd").value=data;
	}
*/
	hincd_change(st,hincd){
		let nig=new NIGHTER();
		let sql="";
		hincd=nig.convNumeric(hincd);
		this.node.querySelector("#hincd").value=hincd;
		sql+=" select SYOMN from dbo.M_SYOHIN where SYOCD='"+hincd+"'";

		var kekka=httpresp(null,SEVER,sql,DB,true);
		if(kekka===undefined){
			tmp.getBrotherNode(st,"hinname").value="";
			alert("品番が存在しません");
		}else{
			tmp.getBrotherNode(st,"hinname").value=kekka[0][1];
		}
		nig=null;
	}
	tokcd_change(st,tokcd){
		let nig=new NIGHTER();
		let sql="";
		tokcd=nig.convNumeric(tokcd);
		this.node.querySelector("#tokcd").value=tokcd;
		sql+=" select TOKMN from dbo.M_TOKUI where TOKCD='"+tokcd+"'";

		var kekka=httpresp(null,SEVER,sql,DB,true);
		if(kekka===undefined){
			tmp.getBrotherNode(st,"tokname").value="";
			alert("得意先が存在しません");
		}else{
			tmp.getBrotherNode(st,"tokname").value=kekka[0][1];
		}
		nig=null;
	}
	btn1_click(st,btn1){
		alert(btn1);
	}
}

//表作成

const SYOHIN_GRID={};
const GridStyle=[[
				"border:solid 2px BLACK;width:100px;background-color:lightGray;text-align:center;"
				,"border:solid 2px BLACK;width:150px;background-color:lightGray;text-align:center;"
			]
			,[
				"border:solid 2px BLACK;text-align:right;"
				,"border:solid 2px BLACK;text-align:left;"
			]];
const GridData=[["COL1","COL2","COL3"],[12,"aaa",456],[112,"bbb",1456],[212,"ccc",2456]];


//SYOHIN_GRID要素に対するHTML記述
SYOHIN_GRID["TEMPLATE"]=`
<template id="syohin_grid">
<!--ここからテンプレートを記述-->
	【nighter】
//		createGrid({"STYLE":GridStyle,"DATA":GridData});
		createGrid({"STYLE":GridStyle,"SQL":"select SYOCD,SYOMN from dbo.M_SYOHIN"});
	【/nighter】
</template>
<!--ここまでテンプレートを記述-->
`;


//SYOHIN_GRID要素に対するスタイル記述
SYOHIN_GRID["STYLE"] = `
	background-color:white;
	border:solid 1px GREEN;
`;

//SYOHIN要素に対する関数記述
//要素内だけで使用する関数は基本的にここに記載しておく
SYOHIN_GRID["CLASS"] = class {	
	constructor(prm,oyaEle,ele){
		this.ele=oyaEle;
		this.node=ele;
	}
	copyValue(toNode,fromNode){
		toNode.value=ftomNode.value;
	}
}


