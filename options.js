$(function(){
	function loadOption(){

		var bg =  chrome.extension.getBackgroundPage();
		var options = bg.getOptions();
		$("input#chk_auto").prop("checked",options.auto);
		$("input#txt_url").val(options.url);
		$("input#txt_img_selecter").val(options.img_selecter);
		$("input#chk_invarted").prop("checked",options.invarted);
		$("input#chk_gray").prop("checked",options.gray);
		$("input#chk_both").prop("checked",options.both);
	}
	function saveOption(e){
		var bg =  chrome.extension.getBackgroundPage();
		var options = bg.getOptions();

		options.auto = $("input#chk_auto").prop("checked");
		options.url = $("input#txt_url").val();
		options.img_selecter = $("input#txt_img_selecter").val();
		options.invarted = $("input#chk_invarted").prop("checked");
		options.gray = $("input#chk_gray").prop("checked");
		options.both = $("input#chk_both").prop("checked");

		bg.saveOption(options);
		
		window.close();		

	}
	function resetOption(){
		var bg =  chrome.extension.getBackgroundPage();
		var options = bg.getDefaultOptions();
		$("input#chk_auto").prop("checked",options.auto);
		$("input#txt_url").val(options.url);
		$("input#txt_img_selecter").val(options.img_selecter);
		$("input#chk_invarted").prop("checked",options.invarted);
		$("input#chk_gray").prop("checked",options.gray);
		$("input#chk_both").prop("checked",options.both);

	}
	$("button#save").click(saveOption);
	$("button#reset").click(resetOption);

	loadOption();
});