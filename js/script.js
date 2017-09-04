(function(){
	"use strict";
	var Util = (function(){
		var prefix = "html5_reader_"
		var StorageGetter = function(key){
			return localStorage.getItem(prefix + key);
		}
		var StorageSetter = function(key, val){
			return localStorage.setItem(prefix + key, val);
		}
		var getBSONP = function(url, callback){
			return $.jsonp({
				url: url,
				cache: true,
				callback: "duokan_fiction_chapter",
				success: function(result){
					var data = $.base64.decode(result);
					var json = decodeURIComponent(escape(data));
					callback(json);
				}
			})
		}
		return {
			StorageGetter: StorageGetter,
			StorageSetter: StorageSetter,
			getBSONP: getBSONP
		}
	})();
	
	function main(){
		//TODO 整个项目的入口函数
		//用于绑定事件
		var Win = $(window);
		var Doc = $(document);
		var RootContainer = $("#fiction_container");
		var Screen = Doc.body;
		//是否夜间模式
		var NightMode = false;
		//初始化字体大小
		var initFontSize;
		//Dom节点获取
		var Dom = {
			top_nav: $("#top_nav"),
			bottom_nav: $(".bottom_nav"),
			font_container: $(".font_container"),
			font_button: $("#font_button"),
			bk_container: $("#bk_container")
		}
	
		
		//从缓存中读取的信息进行展示
		var ModuleFontSwitch = (function(){
			//字体和背景的颜色表
			var colorArr = [
				{ value: "#f7eee5", name: "米白", font: "" },
				{ value: "#e9dfc7", name: "纸张", font: "", id: "font_normal" },
				{ value: "#a4a4a4", name: "浅灰", font: ""},
				{ value: "#cdefce", name: "护眼", font: ""},
				{ value: "#283548", name: "灰蓝", font: "#7685a2", bottomcolor: "#fff" },
				{ value: "#0f1410", name: "夜间", font: "#4e534f", bottomcolor: "rgba(255,255,255,0.7)", id: "font_night" }
			];
			var tool_bar = Util.StorageGetter("toolbar_background_color");
			var bottomcolor = Util.StorageGetter("bottom_color");
			var color = Util.StorageGetter('background_color');
			var font = Util.StorageGetter('font_color');
			var bkCurColor = Util.StorageGetter('background_color');
			var fontColor = Util.StorageGetter('font_color');
			
			for(var i=0; i<colorArr.length; i++){
				var display = "none";
				if(bkCurColor == colorArr[i].value){
					display = "";
				}
				Dom.bk_container.append('<div class="bk-container" id="' + colorArr[i].id + '" data-font="' + colorArr[i].font + '"  data-bottomcolor="' + colorArr[i].bottomcolor + '" data-color="' + colorArr[i].value + '" style="background-color:' + colorArr[i].value + '"><div class="bk-container-current" style="display:' + display + '"></div><span style="display:none">' + colorArr[i].name + '</span></div>');
			}
			if(bottomcolor){
				$("#bottom_tool_bar_ul").find("li").css("color", bottomcolor);
			}
			if(color){
				$("body").css("background-color", color);
			}
			if(font){
				$(".m-read-content").css("color", font);
			}
			
			//夜间模式
			if(fontColor == "#4e534f"){
				NightMode = true;
				$("#day_icon").show();
				$("#night_icon").hide();
				$("#bottom_tool_bar_ul").css("opacity", "0.6");
			}
					
			//初始化字体大小
			initFontSize = Util.StorageGetter("font_size");
			initFontSize = parseInt(initFontSize);
			if(!initFontSize){
				initFontSize = 14;
			}
			RootContainer.css("font-size", initFontSize);
			
		})();
		
		//页面中的零散交互事件处理
		var EventHanlder = (function() {
			//TODO 交互的事件绑定
			$("#action_mid").click(function(){
				//触碰显示或隐藏上下边栏，用click事件可以兼容pc端操作
				if(Dom.top_nav.css("display") == "none"){
					Dom.bottom_nav.show();
					Dom.top_nav.show();
				} else {
					Dom.bottom_nav.hide();
					Dom.top_nav.hide();
					Dom.font_container.hide();
					Dom.font_button.removeClass("current");
				}
			});
			
			Win.scroll(function(){
				//滚动时，隐藏上下边栏
				Dom.bottom_nav.hide();
				Dom.top_nav.hide();
				Dom.font_container.hide();
				Dom.font_button.removeClass("current");
			});
			
			$("#night_button").click(function(){
				//触发背景切换的事件
				if(NightMode){
					$("#day_icon").hide();
					$("#night_icon").show();
					$("#font_normal").trigger("click");	//触发背景为纸张的点击事件
					NightMode = false;
				} else {
					$("#day_icon").show();
					$("#night_icon").hide();
					$("#font_night").trigger("click");	//触发背景为夜间的点击事件
					NightMode = true;
				}
			});
			
			Dom.font_button.click(function(){
				//点击字体按钮，显示或隐藏操作面板
				if(Dom.font_container.css("display") == "none"){
					Dom.font_container.show();
					Dom.font_button.addClass("current");
				} else {
					Dom.font_container.hide();
					Dom.font_button.removeClass("current");
				}
			});
			
			$("#large_font").click(function(){
				//放大字体
				if(initFontSize > 20){
					return;
				}
				initFontSize += 1;
				RootContainer.css("font-size", initFontSize);
				Util.StorageSetter("font_size", initFontSize);
			});
			
			$("#small_font").click(function(){
				//缩小字体
				if(initFontSize < 12){
					return;
				}
				initFontSize -= 1;
				RootContainer.css("font-size", initFontSize);
				Util.StorageSetter("font_size", initFontSize);
			});
			
			Dom.bk_container.delegate(".bk-container", "click", function(){
				//触发背景色的改变
				var color = $(this).data("color");
				var font = $(this).data("font");
				var bottomcolor = $(this).data("bottomcolor");
				var tool_bar = font;
				Dom.bk_container.find(".bk-container-current").hide();
				$(this).find(".bk-container-current").show();
				if(!font){
					font = "#000";
				}
				if(!tool_bar){
					tool_bar = "#fbfcfc";
				}
				if(bottomcolor && bottomcolor != "undefined"){
					$('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
				} else {
					$("#bottom_tool_bar_ul").find("li").css("color", "#a9a9a9");
				}
				$("body").css("background-color", color);
				$(".m-read-content").css("color", font);
				
				Util.StorageSetter("toolbar_background_color", tool_bar);
				Util.StorageSetter("bottom_color", bottomcolor);
				Util.StorageSetter("background_color", color);
				Util.StorageSetter("font_color", font);
				
				var fontColor = Util.StorageGetter("font_color");
				//夜间模式
				if(fontColor == "#4e534f"){
					NightMode = true;
					$("#day_icon").show();
					$("#night_icon").hide();
					$("#bottom_tool_bar_ul").css("opacity", "0.6");
				} else {
					NightMode = false;
					$("#day_icon").hide();
					$("#night_icon").show();
					$("#bottom_tool_bar_ul").css("opacity", "0.9");
				}
			});
			
			$("#prev_button").click(function(){
				//上翻页
				readerModel.prevChapter(function(data){
					readerUI(data);
				});
				$("body").prop("scrollTop", "0");
			});
			
			$("#next_button").click(function(){
				//下翻页
				readerModel.nextChapter(function(data){
					readerUI(data);
				});
				$("body").prop("scrollTop", "0");
			})
		})();
		
		var readerModel = ReaderModel();
		var readerUI = ReaderBaseFrame(RootContainer);
		readerModel.init(function(data){
			readerUI(data)
		});
	}
	
	/*数据层*/
	function ReaderModel(){
		//TODO 实现和阅读器相关的数据交互的方法
		var Chapter_id;
		var ChapterTotal; //总的章节数
		
		var init = function(UIcallback){
			if(Util.StorageGetter("last_chapter")){
				Chapter_id = Util.StorageGetter("last_chapter");
			}
			getFictionInfoPromise().then(function(d){
				return getCurChapterContentPromise();	//必须返回promise对象，才能执行then操作
			}).then(function(data){
				//TODO 渲染页面
				debugger;
				UIcallback && UIcallback(data)
			});
		};
		
		/*promise版本*/
		var getFictionInfoPromise = function(){
			//获取章节信息
			return new Promise(function(resolve, reject){
				$.get("data/chapter.json", function(data){
					if(data.result == 0){
						if(!Chapter_id){
							Chapter_id = data.chapters[1].chapter_id;
						}
						ChapterTotal = data.chapters.length;
						resolve(data);
					} else {
						reject();
					}
				}, "json");
			});
		};
		
		/*promise版本*/
		var getCurChapterContentPromise = function(){
			//获取章节的内容
			return new Promise(function(resolve, reject){
				$.get("data/data" + Chapter_id + ".json", function(data){
					if(data.result == 0){
						var _url = data.jsonp;
						Util.getBSONP(_url, function(data){
							resolve(data);
						})
					} else {
						reject();
					}
				}, "json");
			});
		}; 	
		
		var prevChapter = function(UIcallback){
			//上翻页，获取上一章内容
			Chapter_id = parseInt(Chapter_id, 10);
			if(Chapter_id == 1){
				return;
			}
			Chapter_id = Chapter_id - 1;
			getCurChapterContentPromise().then(function(data){
				UIcallback && UIcallback(data);
			});
			Util.StorageSetter("last_chapter", Chapter_id);
		};
		var nextChapter = function(UIcallback){
			//下翻页,获取下一章内容
			Chapter_id = parseInt(Chapter_id, 10);
			if(Chapter_id == 4){
				return;
			}
			Chapter_id = Chapter_id + 1;
			getCurChapterContentPromise().then(function(data){
				UIcallback && UIcallback(data);
			});
			Util.StorageSetter("last_chapter", Chapter_id);
		}
		return {
			init: init,
			prevChapter: prevChapter,
			nextChapter: nextChapter
		}
	}
	
	/*UI层*/
	function ReaderBaseFrame(container){
		//TODO 渲染基本的UI结构
		function parseChapterData(jsonData){
			var jsonObj = JSON.parse(jsonData);
			var html = "<h4>" + jsonObj.t + "</h4>";
			for(var i=0; i<jsonObj.p.length; i++){
				html += "<p>" + jsonObj.p[i] + "</p>";
			}
			return html;
		}
		return function(data){
			container.html(parseChapterData(data));
		}
	}
	
	$("document").ready(function(){
		main();
	})
	
})();
