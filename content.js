$(function(){

	var img = $(window.IMG_SELECTER);
	if(img.length == 1){
		var imgSrc = img.attr("src");

		chrome.extension.sendRequest({src:imgSrc},function(response){
			
		});
	}else{
		alert("画像が特定できません。");
	} 	
});

