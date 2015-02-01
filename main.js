/**
 * @author xialei <xialeistudio@gmail.com>
 */
(function() {
	"use strict";
	var ting = angular.module('ting', [
		'ngSanitize'
	]);
	ting.run(function() {
		if (navigator.appVersion.indexOf('MSIE') != -1) {
			document.write('本程序不支持IE浏览器。');
		}
	});
	ting.factory('RequestInjector', [
		'$rootScope', function($rootScope) {
			return {
				request: function(config) {
					$rootScope.loading = true;
					return config;
				},
				response: function(response) {
					$rootScope.loading = false;
					return response;
				}
			};
		}
	]);
	ting.factory('MusicService', [
		'$http', '$q', function($http, $q) {
			return {
				list: function(type, offset, size) {
					var defer = $q.defer();
					$http.get('api/list.php?type=' + type + '&size=' + size + '&offset=' + offset, {
						cache: true
					}).success(function(data) {
						defer.resolve(data);
					}).error(function(err) {
						defer.reject(err);
					});
					return defer.promise;
				},
				search: function(keyword) {
					var defer = $q.defer();
					$http.get('api/search.php?keyword=' + keyword).success(function(data) {
						defer.resolve(data);
					}).error(function(err) {
						defer.reject(err);
					});
					return defer.promise;
				},
				base: function(id) {
					var defer = $q.defer();
					$http.get('api/song.php?song_id=' + id, {
						cache: true
					}).success(function(data) {
						if (data.error) {
							defer.reject(data.error);
						}
						else {
							defer.resolve(data);
						}
					}).error(function(err) {
						defer.reject('加载出错');
					});
					return defer.promise;
				},
				lrc: function(song_id) {
					var defer = $q.defer();
					$http.get('api/lrc.php?song_id=' + song_id, {
						cache: true
					}).success(function(data) {
						if (data.error) {
							defer.reject(data.error);
						}
						else {
							defer.resolve(data);
						}
					}).error(function(err) {
						defer.reject('加载歌词出错');
					});
					return defer.promise;
				}
			}
		}
	]);
	ting.controller('RootController', [
		'MusicService',
		'$rootScope',
		'$http',
		'$scope', '$timeout', function(MusicService, $rootScope, $http, $scope, $timeout) {
			//加载文字
			$rootScope.$on('loading', function(e, text) {
				$scope.loading = true;
				$scope.loading_text = text;
			});
			$scope.ios = navigator.appVersion.indexOf('iPhone') != -1;
			$scope.playing = false;
			$scope.hasPrev = false;
			$scope.hasNext = false;
			$scope.playMode = 1;//默认播放全部
			$scope.$watch('playMode', function(newVal, oldVal) {
				if (newVal) {
					$scope.toastMsg('列表循环');
				}
				else {
					$scope.toastMsg('单曲循环');
				}
			});
			$scope.keyword = '';
			$scope.song = {};
			$scope.toast = '';
			$scope.toastMsg = function(msg) {
				$scope.toast = msg;
				$timeout(function() {
					$scope.toast = '';
				}, 1500);
			};
			var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
			//禁止歌词的touch事件
			//事件监听
			window.addEventListener('resize', function() {
				$scope.$apply(function() {
					$scope.progressWidth = document.querySelector('.xl-progress-bar').clientWidth;
				});
			}, false);
			audio.addEventListener('play', function() {
				$scope.$apply(function() {
					$scope.playing = true;
				});
			}, false);
			audio.addEventListener('pause', function() {
				$scope.$apply(function() {
					$scope.playing = false;
				});
			}, false);
			audio.addEventListener('ended', function() {
				if ($scope.playMode == 1) {
					if ($scope.hasNext) {
						$scope.next();
					}
					else {
						$scope.load($scope.list[0]);
					}
				}
				else {
					$scope.load($scope.song, true);
				}
			}, false);
			$scope.progressWidth = document.querySelector('.xl-progress-bar').clientWidth;
			$scope.progress = 0;
			audio.addEventListener('timeupdate', function(e) {
				var time = parseInt(e.target.currentTime);
				var lines = document.querySelectorAll('[data-timeline]');
				var top = 0;
				var _thisHeight = 0;
				var nextLine = {
					i: 0,
					time: 0
				};
				for (var i in lines) {
					var line = lines[i];
					if (line.dataset != undefined) {
						var timeline = parseInt(line.dataset.timeline);
						if (timeline == time) {
							_thisHeight = line.clientHeight;
							line.className = "now";
							//获取下一句歌词
							nextLine.i = parseInt(i) + 1;
							try {
								nextLine.time = lines[nextLine.i].dataset.timeline;
							}
							catch (e) {
							}
							if (nextLine.time > 0) {
								var interval = nextLine.time - timeline;
								(function(k) {
									setTimeout(function() {
										lines[k].className = "";
									}, interval * 1000);
								})(i);
							}
							document.querySelector('.lrc>.content').style.marginTop = -(top - _thisHeight) + 'px';
						}
						else if (timeline < time) {
							top += line.clientHeight;
						}
					}
				}
				$scope.$apply(function() {
					$scope.song.currentTime = e.target.currentTime;
					$scope.progress = $scope.song.currentTime / $scope.song.time;
				});
			}, false);
			$scope.lrcSlow = function() {
				var _list = document.querySelectorAll('.lrc>.content>div');
				if (_list.length > 0) {
					for (var i in _list) {
						if (_list[i].dataset != undefined) {
							_list[i].dataset.timeline = parseInt(_list[i].dataset.timeline) - 1;
						}
					}
					$scope.toastMsg('歌词调快1s');
				}
			};
			$scope.lrcFast = function() {
				var _list = document.querySelectorAll('.lrc>.content>div');
				if (_list.length > 0) {
					for (var i in _list) {
						if (_list[i].dataset != undefined) {
							_list[i].dataset.timeline = parseInt(_list[i].dataset.timeline) + 1;
						}
					}
					$scope.toastMsg('歌词调慢1s');
				}
			};
			/**
			 * 设置将要播放的歌曲
			 * @param item
			 * @param force
			 */
			$scope.load = function(item, force) {
				//清除歌词高亮
				var _ls = document.querySelectorAll('.lrc>.content>div');
				if (_ls.length > 0) {
					for (var i in _ls) {
						if (_ls[i].className != undefined) {
							_ls[i].className = '';
						}
					}
				}
				if ((force != undefined && force) || item.id != $scope.song.id) {
					//加载歌词，歌曲图片，作者，歌曲名称，
					$scope.$emit('loading', '加载【' + item.title + '】');
					var promise = MusicService.base(item.id);
					promise.then(function(data) {
						$scope.song = item;
						$scope.loading = false;
						$scope.song.img = data.img;
						$scope.song.author = data.author;
						$scope.song.title = data.title;
						$scope.song.time = data.time;
						$scope.song.currentTime = 0;
						$scope.song.src = data.audio;
						audio.src = data.audio;
						//计算上一首，下一首
						var _index = $scope.list.indexOf(item);
						var _maxIndex = $scope.list.length - 1;
						$scope.hasPrev = _index > 0;
						$scope.hasNext = _index < _maxIndex;
						//加载歌词
						$scope.l_prev = '加载歌词中...';
						var lrc = MusicService.lrc($scope.song.id);
						var html = '';
						lrc.then(function(data) {
							var list = data.content.split("\n");
							for (var i in list) {
								var line = list[i];
								var min = parseInt(line.substr(1, 2));
								var sec = parseInt(line.substr(4, 2));
								var t = min * 60 + sec;
								var str = line.substring(10, line.length);
								html += '<div data-timeline="' + t + '">' + str + '</div>';
							}
							$scope.song.lrc = html;
						}, function(err) {
							$scope.song.lrc = err;
						});
						//
						audio.play();
					}, function(err) {
						$scope.loading = false;
						alert('加载歌曲出错');
					});
				}
				else {
					audio.play();
				}
			};
			//播放歌曲
			$scope.play = function() {
				audio.play();
			};
			//暂停
			$scope.pause = function() {
				audio.pause();
			};
			/**
			 * 热歌榜
			 */
			$scope.loadList = function(type) {
				$scope.$emit('loading', '加载热歌榜...');
				var promise = MusicService.list(type, 0, 40);
				promise.then(function(data) {
					$scope.loading = false;
					if (data.common.title.length > 0) {
						$scope.common = data.common;
					}
					else {
						var _t = $scope.common.title;
						$scope.common = data.common;
						$scope.common.title = _t;
					}
					$scope.list = data.list;
					//设置预播歌曲
					$scope.load($scope.list[0]);
				}, function(err) {
					$scope.loading = false;
					alert('加载热歌榜出错');
				});
			};
			/**
			 * 搜索
			 */
			$scope.search = function() {
				$scope.$emit('loading', '搜索【' + $scope.keyword + '】');
				var promise = MusicService.search($scope.keyword);
				promise.then(function(data) {
					$scope.loading = false;
					if (data != null && !data.error) {
						$scope.loading = false;
						$scope.common = data.common;
						$scope.list = data.list;
					}
					else {
						alert('没有找到相关结果');
					}
				}, function(data) {
					$scope.loading = false;
					alert('没有找到相关结果');
				});
			};
			$scope.prev = function() {
				$scope.toastMsg('上一首');
				var _index = $scope.list.indexOf($scope.song);
				$scope.load($scope.list[--_index]);
			};
			$scope.next = function() {
				$scope.toastMsg('下一首');
				var _index = $scope.list.indexOf($scope.song);
				$scope.load($scope.list[++_index]);
			};
		}
	]);
	ting.directive('xlToggle', [
		function() {
			return {
				restrict: 'EA',
				link: function(scope, ele, attrs) {
					var target = attrs.xlToggle;
					if (target != undefined) {
						var dom = angular.element(document.querySelector(target));
						ele.bind('click', function() {
							dom.toggleClass('active');
						});
					}
				}
			};
		}
	]);
	ting.directive('xlProgressBar', [
		function() {
			return {
				link: function(scope, ele, attrs) {
					var audio = document.getElementById('fr').contentWindow.document.getElementById('audio');
					ele.bind('click', function(e) {
						var rect = ele[0].getBoundingClientRect(); //进度条rect
						var _beginX = rect.left;//进度条X坐标
						var x = e.x;//点击点坐标
						var percent = (x - _beginX) / rect.width;//百分比
						percent = percent > 1 ? 1 : percent;
						var time = scope.song.time;
						var played = time * percent;
						audio.currentTime = played;
						scope.song.currentTime = played;
					});
				}
			}
		}
	]);
	ting.filter('formattime', [
		function() {
			return function(input) {
				input = parseInt(input);
				var min = 0;
				var sec = 0;
				if (input > 60) {
					min = parseInt(input / 60);
					sec = input - 60 * min;
					min = min >= 10 ? min : '0' + min;
					sec = sec >= 10 ? sec : '0' + sec;
				}
				else {
					min = '00';
					sec = input >= 10 ? input : '0' + input;
				}
				return min + ':' + sec;
			}
		}
	]);
	ting.filter('html', [
		'$sce', function($sce) {
			return function(input) {
				return $sce.trustAsHtml(input);
			}
		}
	]);
})
();