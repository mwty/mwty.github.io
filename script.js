'use strict';
const PiD=3.1415926535897932/180.0,
	   DM = 24*60*60*1000,LT = (new Date()).getTimezoneOffset()/(60*24);
let Compact=(y,x=360.0)=>(y%=x)>=0?y:y+x,  //大数のまるめ計算
	 Imod=(y,x=12)=>((y%=x)>=0?y:y+x)|0;

function GL1(Cg) {

 let Dvp,Dvc,Dind,Cdt
	,Dang=[0,0,0,0, 0,0,-2,2, 0,0,2,2, 0,-2,0,2, 0,2,0,2, -2,0,0,2, 2,0,0,2],Cang=7;

	 Dvp = []; Dvc = [];
	 for(let z of [0,1] )
	  for(let y of [0,1] )
		for(let x of [0,1] ) {
		 Dvp.push(x-.5,y-.5,z-.5);
		 Dvc.push(x,y,z,0.95);
		}
	 Dind=[5,4,7,6,2,4,0,5,1,7,3,2,1,0];
	 Cdt= 8;

 let pXYZ = 'pXYX',pMatrix = 'pMatrix',pColor = 'pColor',dXYZ = 'dXYX',lightDirection = 'lightDirection' ,invMatrix = 'invMatrix';

 let shaders = [`
  attribute	vec3 ${pXYZ};
  attribute	vec4 ${pColor};
  attribute	vec4 ${dXYZ};
  uniform	 mat4 ${pMatrix};
  varying	 vec4 vColor;
  varying	 vec4 vPosition;
  void main() {
	vColor = ${pColor};
	gl_Position = vPosition = ${pMatrix} * vec4(${pXYZ}+${dXYZ}.xyz,1.0+${dXYZ}.w);
  }`
  ,`
  #extension GL_OES_standard_derivatives : enable
  precision highp float;

  uniform	vec3 ${lightDirection};
//uniform	mat4 ${invMatrix};
  varying	vec4 vColor;
  varying	vec4 vPosition;
  void main() {
	vec3	dx = dFdx(vPosition.xyz);
	vec3	dy = dFdy(vPosition.xyz);
	vec3	n = normalize(cross(normalize(dx), normalize(dy)));
	vec3	invLight = normalize(//${invMatrix} *vec4(${lightDirection}, 0.0)).xyz;
					 ${lightDirection});
	float	diff = clamp(dot(n, invLight), 0.5, 1.0);
	gl_FragColor = vec4(vColor.rgb * diff, vColor.a);
  }
  `];

	let gl=Cg.getContext("webgl"), gla,gia,Gp,vao;

	try { //拡張機能を有効化する //console.log(gl.getSupportedExtensions());
	 let x,tst=s=>{if(x=gl.getExtension(s))return x; else throw(s+' is not supported');}
	 tst('OES_standard_derivatives');//tst('OES_element_index_uint');
	 gla = tst('OES_vertex_array_object');
	 gia = tst('ANGLE_instanced_arrays');

	 Gp = buildShaderProgram(shaders);
	} catch(e) { alert(e); return; }
	gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);//gl.frontFace(gl.CW);
	gl.clearColor(0.4, 0.4, 0.5, 0.8);

	gla.bindVertexArrayOES(vao = gla.createVertexArrayOES());

	vbf(Dvp,Cdt,pXYZ);
	vbf(Dvc,Cdt,pColor);
	gia.vertexAttribDivisorANGLE(vbf(Dang,Cang,dXYZ), 1); // インスタンスを有効化し除数を指定する
	let draw0 = inbf(Dind,vao);	 //gl.drawArrays(gl.TRIANGLES, 0, Cdt);

	let [lx,ly,lz] = [0, 0, .5],Vscale = 1.0,[Dx,Dy,Dz]=[0,0,0],[Xrotation, Yrotation, Zrotation]= [0,0,0];

	let sutag = tag => gl.getUniformLocation(Gp,tag);

	evn();

	function vbf(_dt,_num,tag) {
	 let buf = gl.createBuffer();
	 gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_dt), gl.STATIC_DRAW);
	 gl.bindBuffer(gl.ARRAY_BUFFER, null); //バッファのバインドを無効化
	 let p= gl.getAttribLocation(Gp,tag);
	 (function trn(){  //VAO では、一度だけ
	  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	  gl.enableVertexAttribArray(p);
	  gl.vertexAttribPointer(p,_dt.length/*個数*/ /_num,gl.FLOAT, false, 0, 0);
	 })();
	 return p;
	}

	function inbf(_dt,_vao){		//IBOを生成する関数
	 let buf = gl.createBuffer();
	 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf); //バッファを生成してバインドする
	 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(_dt), gl.STATIC_DRAW);
	 gla.bindVertexArrayOES(null);	//vao 先に解除
	 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); //バッファのバインドを無効化
	 return a=>{	//インデックスを用いた描画命令
		//if ( !_vao ) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buf); else //IBOをバインドして登録する
	  gla.bindVertexArrayOES(_vao);
	  gia.drawElementsInstancedANGLE(gl.TRIANGLE_STRIP, _dt.length, gl.UNSIGNED_SHORT, 0, Cang);
		//gl.drawElements(gl.TRIANGLE_STRIP, _dt.length /*個数*/, gl.UNSIGNED_SHORT, 0);
	 };
	}

	function evn() {

	let Mes= m=>{
	  switch(m) {
		default:
		 T3.textContent =`<${Vscale.toFixed(3)}>`;
		case 1:
		 Tps.textContent =`${Dx.toFixed(2)}° ${Dy.toFixed(2)}° ${Dz.toFixed(2)}°  `;
		case 0:
		 T4.textContent =`${lx.toFixed(2)} ${ly.toFixed(2)} ${lz.toFixed(2)}  `;
	  }
	};

	 let qq=0,s1=0,x=0,y=0,f=0,m=0;

	 let timer = t=> {
	  if (qq && (Cg.clientWidth > 0) && ( Dx || Dy || Dz )) {
		window.requestAnimationFrame(timer) ; draw1();
	  }
	  else qq = 0;
	 };

	 let e1= e=>{
	 m=1; s1 = e.timeStamp ; x = e.layerX ; y = e.layerY;
	 f = ( Math.abs(x/Cg.width-.5)>.4 )+(Math.abs(y/Cg.height-.5)>.4);
	};

	 Cg.addEventListener("pointerdown",e1,false);
	 //Cg.addEventListener("touchstart",e1,false);
	 Cg.addEventListener("pointerup",e=>m=0,false);
	 //Cg.addEventListener("touchend",e=>m=0,false);

	 let e2= (e,n) => {
	  e.preventDefault();
	  let t = e.timeStamp - s1 ; if (t < 15 ) return;
	  switch (n) {
		default: return;
		case 12: m=2;
		 if ( e.deltaY) Vscale *= e.deltaY>0?1.1:0.9;
		 Dz -= e.deltaX/200;
		 break;
		case 11: m=0;
		 lx = .5 - e.layerX/Cg.width;
		 ly = e.layerY/Cg.height-.5;
		 break;
		case 2 : m=2;
		 Vscale = e.scale ; Dz = -e.rotation/t; Zrotation =  -e.rotation+Dz;
		 break;
		case 1 :
		 let tt = 20.0/ t;
		if (f) {
		 lz = e.layerY/Cg.height-.3;
		 Dz = (x-e.layerX) * tt ; x = e.layerX;
		} else {
		 Dx = (x-e.layerX) * tt ; x = e.layerX;
		 Dy = (y-e.layerY) * tt ; y = e.layerY;
		}
	  }
	 Mes(m);
	  s1 = e.timeStamp ; if (!qq ) draw1(m);
	 };

	 Cg.addEventListener("mousemove",e=>e2(e,e.buttons ? 1 : 11), false);
	 Cg.addEventListener("touchmove",e=>e2(e,f<2 ? e.touches.length:11), false);
	 Cg.addEventListener("dblclick",e=>(qq^=1) && timer(e.timeStamp), false);
	 //Cg.addEventListener("click",e=>{s1=0;e2(e,11);}, false);
	 Cg.addEventListener("wheel",e=>e2(e,12), false);
	 /*Cg.addEventListener( 'resize',e=>{Cg.width = Cg.clientWidth ; Cg.height = Cg.clientHeight ;if (!qq ) draw1(0);}, false );*/

	 let dr=(m,x)=>{Mes(m);draw1(m);},swh=a=>{
	  let ln=Math.min(Cg.clientWidth, Cg.clientHeight);
	  if (ln > 0) dr(3,Cg.width = Cg.height = ln);
	 return ln;
	};

	window.addEventListener('resize', e=>swh(),false);
	T3.onclick =e=>dr(2,(Vscale = 1,[Xrotation,Yrotation,Zrotation]= [-Dx,-Dy,-Dz]));
	T4.onclick =e=>dr(0,[lx,ly,lz] = [0, 0, .5]);
	Tps.onclick =e=>dr(1,[Dx,Dy,Dz]= [0,0,0]);
	swh();
  }

  function draw1(m=1) {

	gl.useProgram(Gp);

	if (m) {
	 Xrotation += Dx ;Yrotation += Dy ; Zrotation += Dz;
					 //シェーダーの行列ユニフォームを設定する。
	 let Mtr = new DOMMatrix();  //アスペクト比と回転
	 Mtr.scaleSelf(Cg.height/Cg.width*Vscale,Vscale ).rotateSelf(Yrotation %= 360.0,Xrotation %= 360.0,Zrotation %= 360.0);
	 gl.uniformMatrix4fv(sutag(pMatrix), false, Mtr.toFloat32Array());
	//gl.uniformMatrix4fv(sutag(invMatrix), false, Mtr.invertSelf().toFloat32Array());
	}
	gl.uniform3fv(sutag(lightDirection), [lx,ly,lz]);

	gl.viewport(0, 0,Cg.width,Cg.height);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	draw0();

  }

  function buildShaderProgram(ss) {
	let s,p = gl.createProgram();
	for(let c of ss ) if (s = compileShader(c)) gl.attachShader(p,s);
	gl.linkProgram(p)
	if (!gl.getProgramParameter(p,gl.LINK_STATUS)) throw("Error linking shader program:"+ gl.getProgramInfoLog(p));
	return p;

	function compileShader(c) {
	 let s,type = (/\Wgl_Position\W/).test(c) ? gl.VERTEX_SHADER :gl.FRAGMENT_SHADER;
	 gl.shaderSource(s=gl.createShader(type),c);
	 gl.compileShader(s);
	 if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:${gl.getShaderInfoLog(s)}`);
	 return s;
	}
  }
}

let Btx;
function textfix0(f) {

  const csmall ="﹐﹑﹒﹔﹕﹖﹗﹘﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ\uff9e\uff9f",
		  cmid  =",、.;:?!–(){}[]#&*+-<>=\\$%@。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン\u3099\u309a";

 let degi=s=>{

  let dg0=c=>(c=/*"⁰¹²³⁴⁵⁶⁷⁸⁹" */"0123456789０１２３４５６７８９〇一二三四五六七八九₀₁₂₃₄₅₆₇₈₉十百千万億兆" .indexOf(c),c<40 ? c%10 : [10,100,1000,10000,1e8,1e12][c-40]);

  let x="",sum=0n,sum0=0n,d0=1n,i=0,j=0;
  for(;i<s.length; i++){
	let d=dg0(s[i]);
	if (d < 0 ) {
	 if ( i> j ) { x+= sum+sum0 ; sum=sum0=0n,d0=1n;}
	  x += s[i] ; j=i+1;
	  continue;
   }
	d = BigInt(d);
	if (d <10n ) sum0 = sum0*10n+d;
	else  {
	 if ( d > d0 ) sum = sum0 ? (sum+sum0)*d: (sum ? sum*d : d);
	 else sum +=  sum0 ? sum0*d :d;
	 d0=d ; sum0=0n;
	}
  }
  return i> j ? x+(sum+sum0) :x;
 };

 let csel=(c,d1,d2,i=d1.indexOf(c))=>i<0 ?c :d2[i];

 let tosmall =s=>[...s.normalize('NFD')].reduce((x,c)=>x+=
	csel((c<'ぁ'||c>'ゖ')?c:String.fromCharCode(c.charCodeAt()+0x60),cmid+"0123456789",csmall+"₀₁₂₃₄₅₆₇₈₉"),"").normalize('NFC');

 let tolow=s=>[...s.normalize('NFD')].reduce((x,c)=>x+=
	(c<'！'||c>'～') ?csel(c,"”’‘\u3000￥・〜"+csmall,"\"'` ¥·~"+cmid):String.fromCharCode(c.charCodeAt()-0xFEE0),"").normalize('NFC');

 let toup=s=>[...s].reduce((x,c)=>x+=
	(c>'~'||c<'!') ?csel(c," ¥·","\u3000￥・"):String.fromCharCode(c.charCodeAt()+0xFEE0),"");

 let sel=s=>{
  switch(s) {
	case "$0" : return degi;
	case "$=" : return tolow;
	case "$<" : return toup;
	case "$>" : return tosmall;
  }
  return s;
 };
  //console.log(degi("123456789億5千5百４tft0123456789０１２３４５６７８９〇一二三四五六七八九₀₁₂₃₄₅₆₇₈₉"),tolow('７５８％￥～（８５８)₀₁₂₃₄₅₆₇₈₉！'),toup('123457ikk~!あいうえおん'),tosmall('123457ikkあいうえおん'));

  let rg,r0,r1,n=-1,txt=Txt,rtb=Rgtb;
  let t1 = Ttr.content,
	set1=a=>{
	 let t= t1.cloneNode(true);
	 t.querySelector('.ins').onclick = e=>rtb.insertBefore(set1(),e.target.parentNode.nextSibling);
	 return t;
	};

  let strg=a=>{
	for (let i=0,l=rg.length- rtb.querySelectorAll('tr').length ; i < l ; i++ )
	  rtb.appendChild(set1());
	let c=rtb.querySelectorAll('.dat');
	rg.forEach((d,i)=>{i*=3;
	 [ c[i].checked , c[i+1].textContent ,c[i+2].textContent ]= d;
	});

  }, gtrg=a=>{
	 let cels=rtb.querySelectorAll('.dat');rg=[];
	 for (let i=0,l=cels.length ; i < l ; ) {
	  let d= [+cels[i++].checked,cels[i++].textContent,cels[i++].textContent];
	  if ( d[1] ) rg.push(d); else cels[i-1].parentNode.remove();
	 }
	 return rg;
	};

  if (typeof(f) == "string" ) {
	rg= [...f.matchAll(/(.+?)\t(.*)/g)].map(a=>[1,a[1],a[2]]);
	f =-2;
  }

  switch (f) {
	case 13: rtb.querySelectorAll('input[type=checkbox]').forEach(a=>a.checked^=1);
	default: return;
	case 10:
	case 11:
	case 12:
	  n = f-10;
	case 1: //console.log(f);
	 gtrg();
	case -2:
	 if (!rg.length) rg =[[1,"[\u2000-\u2007\u3000]","\ \ "],[1,"\\p{Zs}","\ "],[1,"\\u2028","\t"],[1,"[\\t\\p{Zs}]+$",""],[1,"(\\n){3,}","$1$1"],[1,"\\t","   \ "],[1,"\\p{Zs}{4}","\t"],[1,"[\\t ]+([;,])$","$1"]];
	 if( n > -1 ) rg.sort((a,b)=>String(a[n]).localeCompare(b[n]));
	 strg();
	 if (f == 1 ) break;
	  return;
	case 2: rg = [[1,'.+',degi]]; break;
	case 3: rg = [[1,'.+',tolow]]; break;
	case 4: rg = [[1,'.+',toup]]; break;
	case 5: rg = [[1,'[^ぁ-ゖ]+',tosmall]]; break;
	case -1: txt.value= Btx; return;
	case 7: if (localStorage.txdata) txt.value= localStorage.txdata;
			  return;
	case 6: localStorage.txdata = txt.value ;return;
	case 8: localStorage.rxdata = gtrg().map(a=>a.join('\t')).join('\n') ; return;
	case 9: if (localStorage.rxdata) strg(rg= [...localStorage.rxdata.matchAll(/(.+?)\t(.+?)\t(.*)/g)].map(a=>[+a[1],a[2],a[3]]));
			  return;
 }
 let tm=performance.now();
 let m="" ; for(let o of Doc.rgopt) if ( o.checked ) m += o.value ;//console.log(m);

 if ((r0=txt.selectionStart) < (r1=txt.selectionEnd)) {
	txt.setRangeText(rg.reduce((s,d)=>d[0] ? s.replace(RegExp(d[1], m),sel(d[2])):s,txt.value.substring(r0,r1)));
  } else {
	txt.value = rg.reduce((s,d)=>d[0] ? s.replace(RegExp(d[1],m),sel(d[2])):s,txt.value);
	txt.setSelectionRange(r0,r1);
  }
  if ( Doc.beep.checked) beep([/*174,*/285,396,417,528,639,741,852,936][f],.02);
  txt.focus();
  T2.textContent=(performance.now()-tm).toFixed()+'ms';
}

function beep(f,t,ty=0) {
  let  Ctx = new (window.AudioContext || window.webkitAudioContext)(),osc = Ctx.createOscillator();
  //osc.onended = e=>Ctx.close();
  osc.type = ["sine", "square", "sawtooth", "triangle"][ty];
  osc.frequency.setValueAtTime(f, Ctx.currentTime);
  osc.connect(Ctx.destination);
  osc.start();
  osc.stop(t);
}

window.addEventListener('load', e=>{
 let tl = e.timeStamp;

 kimon();

 try { Btx= Data; } catch(e) { Btx= Itex.textContent.replace(/(<\/?)/gm , '$1script');}
 Txt.value=Btx; Txt.onchange=e=>Btx=Txt.value;
 textfix0(Irg.textContent); //Rgtb.onchange = e=>textfix0(0);
 Doc.bt1.forEach(a=>{a.onclick = e=> textfix0(+a.value);a.onpointerover = e=>Txt.focus();});
 Doc.mu1.forEach(a=>a.onchange = e=>{textfix0(+a.value);a.selectedIndex = 0;});

 let hyd=(k,tg)=>{
  let hf=0,hy = e=>(hf^=1,document.querySelectorAll(k).forEach(k=>k.hidden=hf));
  document.querySelector(tg).onclick = hy;
 };
 hyd('#Doc *',"#T1");
 hyd('#Doc1',"#T2");
 //hyd('#Ky,#Km,#Kd',"#Kj");
 hyd('#Birth *',"#Kyu");
 hyd('#Htbl',"#Tim");
 hyd('#wgl',"#sr");

 GL1(glcanvas);

 T1.textContent=`Load ${tl.toFixed(0)}㎳&Init ${(performance.now()-tl).toFixed(0)}㎳`;
},false);

function kimon() {

 let tkn=a=>"甲乙丙丁戊己庚辛壬癸"[Imod(a,10)],
	  tsi=a=>"子丑寅卯辰巳午未申酉戌亥"[Imod(a)],
	  knsi=a=>tkn(a)+tsi(a),
	  t9=a=>["一白","二黒", "三碧","四緑","五黄","六白","七赤","八白","九紫"][Imod(a,9)],
	  t8=(a,b)=>"死景杜傷生休開驚"[Imod([0,5,2,3,-1,7,6,1,4][a-1]+b+4,8)],
	  s8=a=>`${a}·${10-a}型`;

 let td6=a=> ['先勝','友引','先負','仏滅','大安','赤口'][a%6],
	  td24=a=>['春分','清明','穀雨','立夏','小満','芒種','夏至','小暑','大暑','立秋','処暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒','立春','雨水','啓蟄'][a|0];

 let Nk=new Plnet();Nk.sdata(Date.now());

 let setd=(x,t)=>{
  let s = new Date(t-LT*DM).toISOString();
  x.day.value = s.substr(0,10);
  x.time.value = s.substr(11,5);
  return t;
 },getd=x=>{let d=x.day.valueAsNumber;
   return isNaN(d) ? Date.now():d+(x.time.valueAsNumber||0)+LT*DM;
 };
 //let getd1=x=>{let t=+new Date(`${x.day.value.replace(/\-/g,'/')} ${x.time.value||'00:00'}`);return isNaN(t)?Date.now():t;};console.log(getd1(Htbl));

 let ky0=new Plnet(),
	  cel= Htbl.querySelectorAll("td"),tb1=Htbl.querySelectorAll("table")[1],
	  Ff=0,b=0,Bt=Date.now();

 for(let n of [0,1])
  for(let i of [1,0,-1])
	for(let j of [-1,0,1]) {
	 let ad = (i+.033*j)*DM*30.4368483333 ; //console.log(ad);cel[b].textContent=b;
	  cel[b++].onclick = ad ? e => ssyoi(Ff+=ad) : e =>(Bt= Date.now(),ssyoi(Ff=0));
   }
 Htbl.hidden= true;
 ssyoi(0);
 Htbl.day.onchange=Htbl.time.onchange=e=>{Bt=getd(Htbl);ssyoi(Ff=0);};

 function ssyoi(t){
  t = ky0.sdata(setd(Htbl,t+=Bt));
  let d1=(a,m,z)=>{
	let [y,m8,dh,p]=ky0.sd8(m);
	[1,0,3,6,7,8,5,2].forEach((j,i)=>cel[a+j].textContent=`${t8(m8,i)}\n${dh[p+i]}`);
	cel[a+4].textContent=`${a<9?'⍏':'㊟'}${y}年${knsi(y+56)}|${t9(12025-y)}\n${(m+1)%12+1}月${knsi(y*12+m+14)}|${t9(1-y*12-m)}${s8(m8)}\n〜${(new Date(z)).toLocaleString()}`;
  };

  d1(0,ky0.mn,ky0.tut);  //console.log(kno(ky0.tms));
  if (ky0.mn != ky0.kmn) d1(9,ky0.kmn,ky0.kut);
  tb1.hidden = (ky0.mn == ky0.kmn);
 }

 let sn=new Plnet(), tmeis =Tpmi.content;
 [0,1].forEach(i=>Mout.appendChild(tmeis.cloneNode(true)));
 tmeis=Mout.querySelectorAll("section");

 if (localStorage.btime) senmei(setd(Birth,+localStorage.btime));

 Birth.day.onchange=Birth.time.onchange=Birth.sex.onchange=e=>{
  e.preventDefault();senmei(getd(Birth));
 };

 function gdj(t){
  let d=Math.floor(t=t/DM-LT),k=Imod(d+17,60);
  return [k,k*12+Math.round((t-d)*12)];
 }

 function senmei(t){

  const p9=[1,5,3,2,0,7,6,4,8],p8=[1,0,7,2,-1,6,3,4,5],
		  syn = [6,7,3,5,-1,2,4,0,1];

  let bt= sn.sdata(t);//console.log(bt.toLocaleString());
  try {localStorage.btime = t ; } catch(e) {  };
  Birth.sub.value = t ;//console.log(Birth.sub.value,t);
  let sex=Birth.sex.checked,
	  [dk,jk]=gdj(t),d8= dt8[dk],
	  fi = sn.ifin(),d9= Imod((t-sn.sd9)/DM,9);if(fi)d9=8-d9;
  sn.kyureki();

  let mei=(m,N)=> {
   let tmei = tmeis[N],
		 cels= tmei.querySelectorAll(`.ktbl td`),
		 kdt=tmei.querySelectorAll('.kdt'),

		 [y,m8] = sn.sd8(m),
		 y9=Imod(12025-y,9),m9=Imod(1-y*12-m,9);

	let smi1=a=>p9.indexOf(Imod(a,9)),
		 smi=a=>(a = syn[smi1(y9-a)]) >= 0 ? a : (fi ? 6 : 1),
		 mik=smi(m9),snk=smi(d9);

	let ds9=(n,a,b,x)=>{
	 let g4= smi1(4-a);
	 p8.forEach((v,i)=>{
	  let q;
	  if ( i == 4 ) q = t9(a);
	  else {
		q = tky64[syn[i]+1]; q =(x==syn[i]?`{${q}}`:` ${q} `);
		q += `${t9(a+p9[i])}${g4 == i ? '☣' :((8-g4)== i ? '⚡':'  ')}${v>=0 && b >0 ?`<${t8(b,v)}>`:'' }`;
	  }
	  cels[i+n].textContent= q;
	 });
	};

	let dl=[6,10,8,8,10,9,9,10,7][m9],df= (y&1)^sex? -1:1;

	tmei.querySelector('.bt').value =
	  `${N ? `*《恒気法》${"-".repeat(78)}\n` : '\n'}${knsi(y+56)}${t9(y9)}年 ${knsi(y*12+m+14)}${t9(m9)}月<${s8(m8)}> ${knsi(dk)}${t9(d9)}日<${s8(d8)}>〜${fi?"陰":"陽"}遁 ${knsi(jk)}時 ${bt.toLocaleString()} (旧暦)${sn.uru?'閏':''}${sn.kym+1}月${sn.kyd+1}日 ${td6(sn.kym+sn.kyd)}`;

	let k1=ky64[(Imod(y+8)+sn.kym+sn.kyd+2)%8],k2=a=>k1[a].replace(/。/g,"。\n");
	let mes=k=>k.replace(sex?/女の人.+?。/gm:/男の人.+?。/gm,'');
   let f=(mik!=snk),dmi=[`${f?'命\u20e3':''}\n${ksyo[mik][0]}`,mes(`${ksyo[mik].substr(2)}${syn[8-smi1(4-m9)]== mik ? `⚠${ksyo1[mik]}`:''}`),k2(mik)];
	if (f) dmi = [...dmi,`身\u20e3\n${ksyo[snk][0]}`,mes(ksyo[snk].substr(2)),k2(snk)];
   tmei.querySelector('.snk').hidden = !f;
   dmi.forEach((a,i)=>kdt[i].textContent=a);

	ds9(0,m9,m8,mik);ds9(9,d9,d8,snk);

   tmei.querySelector('.dai').value=`大運${dl}年運 ${df>0?'順':'逆'}行\t`;
	let yr=tmei.querySelector('.yr'),yrm=tmei.querySelector('.yrm');
	yr.step = dl;
	yr.value =(Nk.ty-(Nk.tm==0 ||(N ? Nk.kmn:Nk.nm)==11)-y)-dl/2|0;

	let dun=e=>{
	 let dy=+yr.value,dn=dy/dl|0;
	 yrm.textContent = `${dy+1}〜${dy+dl}才`;
	 ds9(18,(m9+df*dn)%9,0,mik);
	};
	yr.onchange=dun;dun();
   tmeis[N].hidden = false;
  };

  mei(sn.mn,0);
  if (sn.mn != sn.kmn) mei(sn.kmn,1);
  else tmeis[1].hidden = true;
 }

 let timer=s=>{
  let f=1,wk=-1,tm=Tim,j1,
  disp=e=>{
   let t=new Date(),w=t.getDay(),[kd,kj]=gdj(+t);
   tm.textContent = t.toLocaleTimeString();
   if (kj != j1) Kj.textContent = knsi(j1= kj)+'時';
   if (wk != w) { wk = w;
	 Tim1.textContent = (f ^= 1)
	 ? t.toLocaleDateString("ja-JP-u-ca-japanese", {era: "short" ,year: 'numeric'/*, month: '2-digit', Tim1: 'numeric' ,weekday: 'narrow'*/})
/* +now.getFullYear() + '/' */ +String.fromCharCode(t.getMonth()+0x32c0,t.getDate()+0x33df) +"㊐㊊㊋㊌㊍㊎㊏"[w] : t.toDateString();
	 Nk.sdata(+t);
	 let m=Nk.mn,[y] = Nk.sd8(m),
	 sy=`${knsi(y+56)}${t9(Imod(12025-y,9))}`,
	 sm =`${knsi(y*12+m+14)}${t9(Imod(1-y*12-m,9))}`;
	 if (m != Nk.kmn ) {
	  let [y1]=Nk.sd8(m=Nk.kmn);
	  sm += `|${knsi(y1*12+m+14)}${t9(Imod(1-y1*12-m,9))}|`;
	  if (y1 != y ) sy += `|${knsi(y1+56)}${t9(Imod(12025-y1,9))}|`;
	 }
	 Ky.textContent= sy+'年';
	 Km.textContent= sm+'月';
	 let fi = sn.ifin(),d9= Imod((t-sn.sd9)/DM,9);if(fi)d9=8-d9;
	 Kd.textContent=`${knsi(kd)}${t9(d9)}日〜${fi?"陰":"陽"}遁`;
	 Kyu.textContent=`${td24(Nk.kyureki())} (旧)${Nk.uru?'閏':''}${Nk.kym+1}月${Nk.kyd+1} 日 ${td6(Nk.kym+Nk.kyd)}`;};
  };
  window.setInterval(disp,1000);disp();
  Tim1.onclick = e=>wk=-1;
 };timer();
}

function Plnet(){

  let JU = jd=>(jd-2440587.5)*DM,
	   dtm = a=>(new Date(a)).toLocaleString(),
	   d0=j=>Math.trunc(j-LT+.5)+LT-.5,
	   _jd,touji,touji1,l24,fin,slam,

  setu=(j,r)=>{
	for (let i=0,d=1; i< 10  && Math.abs(d) > .00001; i++) {
	 d = Compact(r-Sun_Position(j)); if (d >180) d -= 360;
	 j +=d*360/365.24218;
	}
	return j;
  },
  setu24=n=>setu(_jd,Compact(n*15-45)),

  kou12=n=> {
	let d = Compact(slam-270) ;//console.log(l);
	touji=setu(_jd-d*365.24218/360,270);
	touji1 =setu(touji+365.24218,270);
	l24 = (d= (touji1-touji)/12) *.5;
	//return touji+Math.trunc((_jd-touji)/d+1)*d;  //kou24
	let dd=Math.trunc((_jd-touji)/d+.5);
	this.kmn = Imod(dd-2);
	return touji+(dd +.5)*d;
  },
  std9=j=>{let h =Compact(j-LT-10.5,60);return j - (h<30 ? h : h-60) };

  this.sdata = t=>{
   fin = null;
	this.tms = t;_jd=t/DM+2440587.5,slam=Sun_Position(_jd);
	let n = (slam+75)/15&(~1);//Math.trunc ((slam+75)/15)&(~1);
	this.mn= Imod(n/2-1);
	this.kut = JU(kou12());
	this.tut = JU(setu24(n));
	t = new Date(t);
	this.ty = t.getFullYear();
	this.tm = t.getMonth();
	return t;
  };

  this.ifin=a=>{
   if (fin==null) {
	 fin =(_jd < (a=std9(touji)));
	 if (fin) a=std9(setu(touji-182.62109,90));
	 else {
	  let b=std9(setu(touji+182.62109,90));
	  if(_jd >=b && (fin= (_jd < (a=std9(touji1))) )) a=b;
	 }
	 this.sd9=JU(a);
   }
	return fin;
  };

  let saku=j=>{
	let sh =jj=>{
	 for(let i=0,d=1;i<12 && Math.abs(d) >.000001;i++){
	  d=Moon_Position(jj).br; if (d > 29.530589*.5 ) d -= 29.530589;
	  jj -= d;//console.log(d,i);
	 }
	 return d0(jj);
	};
	let jj = sh(j);
	return jj > j ? sh(jj-29.530589) : jj;
  };

  this.kyureki=()=>{
	let j1 = saku(_jd),j2=saku(j1+40);
	this.kyd = _jd-j1|0;

	let r=Sun_Position(j1);
	this.uru =  ( j1 > setu(j1,r-=r%30) && j2 < setu(j1,Compact(r+30)));
	this.kym = Imod(r/30-this.uru+2);//console.log(dtm(this.tms),r/30);
	return slam/15;
  };

  this.sd8=m=>{
	let y = this.ty - ( this.tm == 0 || m == 11 ),
		 d= syoi[Imod(y+2,3)*12+m],
		 p=1,v=d[0][Imod(y+6,5)];
	if (v/10|0) {v%=10 ;p=9;}
	if (v<0) v=this.ifin()?-v:v+10;
	return [y,v,d,p];
  };

  function Sun_Position(jd) {
	let c = (jd-2415021.0)/36525.0, //１９００年基準の世紀数の計算
	 sml  = Compact(280.6824+(36000.769325+7.22222e-4*c)*c),
	 spl  = Compact(281.2206+(1.717697+(4.83333e-4+2.77777e-6*c)*c)*c),
	 //sec  = 0.0167498-(4.258e-5+1.37e-7*c)*c,
	 //sax  = 1.00000129,
	 sma  = (sml-spl)*PiD,
	 smpg = (1.91946-(4.78889e-3+1.44444e-5*c)*c)*Math.sin(sma)+ 2.00939e-2*Math.sin(2*sma);
	return Compact(sml+smpg);
  }

  function Moon_Position(jd,option=0,latitude=0,longitude=135){
/*
option:0 :  視差補正前
		 1 :  視差補正後の値を返す latitude, longitude: 視差補正の場合の観測点位置
*/
	let j=(jd-2378496.0)/36525.0, //１８００年基準の世紀数の計算
	  mpnl = Compact(225.397325+(4069.053805-(1.02869e-2+1.22222e-5*j)*j)*j),
	  mec = 0.05490897,
	  max = 60.2682,
	  momg = Compact(33.272936 -(1934.144694-(2.08028e-3+2.08333e-6*j)*j)*j),
	  minc = 5.1444433,

	  st = 1.2408*Math.sin((1.2949+(413335.4078-(7.2201e-3+0.72305e-5*j)*j)*j)*PiD)
			+0.5958*Math.sin((111.6209+(890534.2514+(6.9838e-3+0.69778e-5*j)*j)*j)*PiD)
			+0.1828*Math.sin((180.40885+(5999.0552-0.0001988*j)*j)*PiD)
			+0.0550*Math.sin((0.88605+(377336.3526-(7.0213e-3+0.72305e-5*j)*j)*j)*PiD)
			+0.0431*Math.sin((111.21205+(854535.1962+(7.1826e-3+0.69778e-5*j)*j)*j)*PiD),
	  h0 = 0.1453*Math.sin((169.1706+(407332.2103+(5.3354e-3+0.53292e-5*j)*j)*j)*PiD),

	  mml = Compact(335.723436+(481267.887361+(3.38888e-3+1.83333e-6*j)*j)*j)+st,
	  mex = Compact(mml-mpnl)*PiD;

	for (let i=0,mma=mex,mtv;i<10;i++) {
	  if (Math.abs(mtv = mex - mec*Math.sin(mex) - mma) < 1e-8) break;
	  mex -= mtv / (1 - mec * Math.cos(mex));
	} //console.log(i);

	let mtt = Math.sqrt((1 + mec)/(1 - mec)) * Math.tan( mex /2),
		 mta = Compact(2 * Math.atan(mtt) /PiD),
		 muu = Compact(mta + mpnl - momg),
		 mmm = Math.atan(Math.cos(minc*PiD) * Math.tan(muu*PiD))/PiD;

	if ( muu >= 270 ) mmm += 360;
	else if ( muu > 90) mmm += 180;

	let mlam = Compact( mmm + momg),
		 mbet = Math.tan(minc * PiD)* Math.sin(mmm * PiD),

		 mtb = Math.atan( mbet )/PiD+ h0,
		 mrr = max *(1-mec*mec)/ ( 1 + mec * Math.cos(mta*PiD));  //1999/07/01 バグ修正
	let slam = Sun_Position(jd),fs=1;

	switch (option) {
	 case 1:
	 let Obl=j=>(j=(j-2451545.0)/36525.0,23.439279444-(0.01301021361+(5.0861e-8+(-5.565e-7+(1.6e-10+1.2056e-11*j)*j)*j)*j)*j);//黄道傾斜角の計算(2000年基準)
	 //let Obl=j=>(j=(j-2415021.0)/36525.0,23.4523-(0.013+0.00000016388*j)*j);//黄道傾斜角の計算
	 let LST=j=>(j-=2415020.0,Compact(18.6461+(24*366.2422/365.2422+3.24E-14*j)*j +longitude/15.0,24.0));

	 fs  = 0.99;
	 let P = Math.sin(Math.asin(1/ mrr )/fs),

		 lt =LST(jd,longitude)*15.0*PiD,clt=Math.cos(lt),
		 la =latitude*PiD,sla=Math.sin(la),cla=Math.cos(la),claslt=cla*Math.sin(lt),
		 ob =Obl(jd)* PiD,so=Math.sin(ob),co=Math.cos(ob),

		 ll =Math.atan2(co*claslt + so*sla,cla*clt)-mlam*PiD,
		 bb =Math.asin(-so*claslt + co*sla),

		 mga = Math.atan (Math.tan(bb)/ Math.cos(ll)),mb=mtb*PiD;//1st

	 mlam+=Math.asin(- P * Math.cos(bb)* Math.sin (ll)/Math.cos(mb))/PiD;
	 mtb +=Math.asin(- P * Math.sin(bb) * Math.sin ( mga - mb)/ Math.sin (mga))/PiD;

	 break;
	default:
	}
	let df = mlam-slam;
	return {
/*
	 ss :Math.asin(0.2725 /(mrr*fs))/PiD,
	 Phase :Math.acos(Math.cos(df*PiD)*Math.cos(mtb*PiD)),
*/
	 br	:Compact(df)*29.530589/360.0,
	 mbet :mtb,
	 mlam :mlam,
	 slam :slam };
  }

}
