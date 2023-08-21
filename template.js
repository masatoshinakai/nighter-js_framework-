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
	<input type="text" id="hinname" size="30" readonly="readonly" style="font-size:small;">
	<button id="btn1">PUSH</button>
	</div>
	</div>
	<select id="test1" size="1">
		<option value="1">One</option>
		<option value="2">Two</option>
		<option value="3">Three</option>
	</select>
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
/*
	get $HINCD(){
		return this.node.querySelector("#hincd").value;
	}
	set $HINCD(data){
		this.node.querySelector("#hincd").value=data;
	}
	setValue(data){
		this.node.querySelector("#hincd").value=data;
	}
*/
	copyValue(toNode,fromNode){
		toNode.value=ftomNode.value;
	}
	hincd_change(st,hincd){
		let nig=new NIGHTER();
		let sql="";
		hincd=nig.convNumeric(hincd);
		this.node.querySelector("#hincd").value=hincd;
		sql+=" select HINNM from PrintMeijin.dbo.M_SYOHIN where HINCD='"+hincd+"'";

		var kekka=httpresp(null,SEVER,sql,DB,true);
		if(kekka===undefined){
			tmp.getBrotherNode(st,"hinname").value="";
			alert("品番が存在しません");
		}else{
			tmp.getBrotherNode(st,"hinname").value=kekka[0][1];
		}
	}
	
	btn1_click(){
		alert(this.$HINCD);
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
	<div>顧客コード
	<input type="text" id="tokcd" size="10" onChange="alert('顧客');">
	</div>
	<div>
	商品コード
	<input type="text" id="hincd" size="10">
	商品名
	<input type="text" id="hinname" size="40" readonly="readonly">
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
		let sql="";
		sql+=" select HINNM from PrintMeijin.dbo.M_SYOHIN where HINCD='"+hincd+"'";

		var kekka=httpresp(null,SEVER,sql,DB,true);
		if(kekka===undefined){
			tmp.getBrotherNode(st,"hinname").value="";
			alert("品番が存在しません");
		}else{
			tmp.getBrotherNode(st,"hinname").value=kekka[0][1];
		}
	}
	btn1_click(st,btn1){
		alert(btn1);
	}
}

