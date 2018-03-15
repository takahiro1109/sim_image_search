
	//
	var default_auto_search = false;
	var default_url = "";
	var default_img_selecter = "";

	function searchImage(src){

		var imgCtx = document.createElement("img");
		// imgCtx.setAttribute("crossOrigin","anonymous");
		imgCtx.onload = callbackLoadImgCtx;
		imgCtx.src = src;
	}
	function callbackLoadImgCtx(event){
		var imgCtx = event.currentTarget;
		var w,h,f;
		w = imgCtx.width;
		h = imgCtx.height;

		if (600 < w) {
			//幅が600より大きい場合
			f = 600 / w;
			w *= f;
			h *= f;
		}
		400 < h && (f = 400 / h, w *= f, h *= f);
		9E4 < w * h && (f = Math.sqrt(9E4 / (w * h)), w *= f, h *= f);
		w = Math.round(w);
		h = Math.round(h);

		var options = getOptions();

		var imgData = null;
		var invarted = false,grayScale = false;

		//オリジナル
		invarted = false;
		grayScale = false;
		imgData = convertImageData(imgCtx,w,h,invarted,grayScale);
		createSearchTab(imgData,imgCtx.width,imgCtx.height,true);

		//反転
		if(options.invarted){
			invarted = true;
			grayScale = false;
			imgData = convertImageData(imgCtx,w,h,invarted,grayScale);
			createSearchTab(imgData,imgCtx.width,imgCtx.height,false);
		}

		//グレースケール
		if(options.gray){			
			invarted = false;
			grayScale = true;
			imgData = convertImageData(imgCtx,w,h,invarted,grayScale);
			createSearchTab(imgData,imgCtx.width,imgCtx.height,false);
		}

		//反転、グレースケール
		if(options.both){
			invarted = true;
			grayScale = true;
			imgData = convertImageData(imgCtx,w,h,invarted,grayScale);
			createSearchTab(imgData,imgCtx.width,imgCtx.height,false);			
		}
	}

	function convertImageData(imgCtx,w,h,invarted,grayScale){

		var id = "canvas";
		var oldCanv = document.getElementById(id);
		if(oldCanv != undefined){
			document.body.removeChild(oldCanv);
		}

		var canvas = document.createElement("canvas");
		canvas.id = id;
		document.body.appendChild(canvas);

		canvas.width = w;
		canvas.height = h;

		var cxt = canvas.getContext("2d");
		cxt.fillStyle = "#ffffff";
		cxt.fillRect(0, 0, w, h);
		//左右反転
		if(invarted === true){
			cxt.transform(-1,0,0,1,w,0);
		}
		cxt.drawImage(imgCtx, 0, 0, w, h);
		//グレースケール
		if(grayScale == true){
			setGrayScale(cxt,canvas);
		}

		return canvas.toDataURL("image/jpeg", .9);
	}
	function setGrayScale(cxt,canvas){
        var src = cxt.getImageData(0, 0, canvas.width, canvas.height);
        var dst = cxt.createImageData(canvas.width, canvas.height);

        for (var i = 0; i < src.data.length; i=i+4) {
            var pixel = (src.data[i] + src.data[i+1] + src.data[i+2]) / 3;
            dst.data[i] = dst.data[i+1] = dst.data[i+2] = pixel;
            dst.data[i+3] = src.data[i+3];
        }
        cxt.putImageData(dst, 0, 0);
	}
	function createSearchTab(imgData,width,height,selected){
		if(void 0 !== imgData){
			var data = imgData.toLowerCase();
			if(0 == data.indexOf("data:image/jpeg;")){
				var pos = imgData.indexOf(",");
				if(-1 != pos && checkImageData(imgData.substring(pos+1))){
					data = createSearchHtml(imgData,width,height);
					var url = "data:text/html;charset=utf-8;base64," + window.btoa(data);

					var tab = chrome.tabs.query({
						active: !0,
						lastFocusedWindow: !0
					}, function(a) {
						chrome.tabs.create({
							url: url,
							selected: selected
						})
					});
				}
			}
		}
	}
	function checkImageData(data){
		var c;
		for (var e = 0, c; c = data[e++];)
			if (!("a" <= c && "z" >= c || "A" <= c && "Z" >= c || "0" <= c && "9" >= c || "+" == c || "/" == c || "." == c || "=" == c)) return !1;
		return !0
	}

	function createSearchHtml(imgData,width,height){
		imgData = imgData.substring(imgData.indexOf(",") + 1).replace(/\+/g, "-").replace(/\//g, "_").replace(/\./g, "=");
		var apiVar = "cr_1_5_2";
		var html = "<html><head><title>" + chrome.i18n.getMessage("extensionName") + '</title></head><body><form id="f" method="POST" action="https://www.google.com/searchbyimage/upload" enctype="multipart/form-data"><input type="hidden" name="image_content" value="' + imgData + '"><input type="hidden" name="filename" value=""><input type="hidden" name="image_url" value=""><input type="hidden" name="sbisrc" value="' + apiVar + '">';
		void 0 !== width && void 0 !== height && (html += '<input type="hidden" name="width" value="' + width + '"><input type="hidden" name="height" value="' + height + '">');
		return html + '</form><script>document.getElementById("f").submit();\x3c/script></body></html>'

	}
	function onClickHandler(info, tab){
		searchImage(info.srcUrl);
	}
	function getDefaultOptions(){
		var defaults = {
			auto:default_auto_search,
			url:default_url,
			img_selecter:default_img_selecter,
			invarted:true,
			gray:true,
			both:true
		}
		return defaults;
	}
	function getOptions(){
		var options = getDefaultOptions();
		if(localStorage.getItem("options")){
			var obj =localStorage.getItem("options");
			options = JSON.parse(obj);
		}
		return options;
	}
	function saveOption(options){
		localStorage.setItem("options",JSON.stringify(options));
	}
	function checkStartUpTab(){
		chrome.tabs.query({active:true,lastFocusedWindow:true},function(tabs){
			if(tabs[0].status == 'complete'){
				execAutoSearch(tabs[0].id);
			}
		});
	}
	function execAutoSearch(tabId){
		var options = getOptions();
		if(options.auto != true){
			return;
		}
		if(options.url.length == 0 || options.img_selecter.length == 0){
			return;
		}			
		chrome.tabs.get(tabId,function(tab){
			var reg = new RegExp(options.url);
			var url = tab.url;
			if(url.match(reg)){
				chrome.tabs.executeScript(tab.id,{code:"window.IMG_SELECTER='"+options.img_selecter+"';"})
				chrome.tabs.executeScript(tab.id,{file:"jquery.js"});
				chrome.tabs.executeScript(tab.id,{file:"content.js"});
			}
		});

	}
	function onStartUp(){
    	chrome.contextMenus.create({
        	type: 'normal',
        	id: 'create_search_image',
        	title: '類似画像検索',
        	contexts:["image"]
    	});		
		chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
			if(changeInfo.status == 'complete'){
				execAutoSearch(tabId);
			}
		});
		chrome.extension.onRequest.addListener(
			function(request,sender,sendRespoinse){
				searchImage(request.src);

		});
		chrome.contextMenus.onClicked.addListener(onClickHandler);

		checkStartUpTab();

	}
	chrome.runtime.onInstalled.addListener(onStartUp);
	chrome.runtime.onStartup.addListener(onStartUp);
//	var img = $("img");
//	if(img.length == 1){
//		var imgSrc = img.attr("src");
//		searchImage(imgSrc);
//	} 