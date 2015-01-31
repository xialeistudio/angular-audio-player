/**
 * @author xialei <xialeistudio@gmail.com>
 */
(function() {
	"use strict";
	var ting = angular.module('ting', []);
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
				hot: function(offset, size) {
					var defer = $q.defer();
					$http.get('api/list.php?type=2&size=' + size + '&offset=' + offset, {
						cache: true
					}).success(function(data) {
						defer.resolve(data);
					}).error(function(err) {
						defer.reject(err);
					});
					return defer.promise;
				},
				recent: function(offset, size) {
					var defer = $q.defer();
					$http.get('api/list.php?type=1&size=' + size + '&offset=' + offset, {
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
				}
			}
		}
	]);
	ting.controller('RootController', [
		'MusicService',
		'$rootScope',
		'$http',
		'$scope', function(MusicService, $rootScope, $http, $scope) {
			//加载文案
			$rootScope.$on('body:loading_text', function(e, text) {
				$rootScope.loading_text = text;
			});
			$scope.playing = false;
			$scope.hasPrev = false;
			$scope.hasNext = false;
			$scope.hot = function() {
				$rootScope.loading = true;
				$rootScope.loading_text = '加载热歌榜...';
				var promise = MusicService.hot(0, 40);
				promise.then(function(data) {
					$rootScope.loading = false;
					$scope.billboard = {
						title: '热歌榜',
						desc: data.billboard.comment,
						update_at: data.billboard.update_date,
						list: data.song_list
					};
					$scope.song = $scope.billboard.list[0];
					$http.get('api/song.php?song_id='+$scope.song.song_id).success(function(data){
						$scope.song.link = data.url;
						player.src = data.url;
					});
				}, function(err) {
					$rootScope.loading = false;
					alert('加载热歌榜出错');
				});
			};
			$scope.news = function() {
				$rootScope.loading = true;
				$rootScope.loading_text = '加载新歌榜...';
				var promise = MusicService.recent(0, 40);
				promise.then(function(data) {
					$rootScope.loading = false;
					$scope.billboard = {
						title: '新歌榜',
						desc: data.billboard.comment,
						update_at: data.billboard.update_date,
						list: data.song_list
					};
					$scope.song = $scope.billboard.list[0];
					$http.get('api/song.php?song_id='+$scope.song.song_id).success(function(data){
						$scope.song.link = data.url;
						player.src = data.url;
					});
				}, function(err) {
					$rootScope.loading = false;
					alert('加载新歌榜出错');
				});
			};
			var player = document.getElementById('fr').contentWindow.document.getElementById('audio');
			player.addEventListener('ended', function() {
				$scope.$apply(function() {
					$scope.playing = false;
				});
			}, false);
			$scope.player = {
				volume: player.volume
			};
			$scope.song = {};
			$scope.play = function(item) {
				//计算是否有上一首
				var songid = $scope.song.song_id || $scope.song.songid;
				if (songid!=item.song_id) {
					$scope.song = item;
					var index = $scope.billboard.list.indexOf(item);
					$scope.hasPrev = index > 0;
					$scope.hasNext = index <= $scope.billboard.list.length;
					//根据song_id，查询song信息
					$scope.loading = true;
					$scope.loading_text = '加载歌曲中...';
					$http.get('api/song.php?song_id=' + item.song_id, {
						cache: true
					}).success(function(data) {
						$scope.loading = false;
						if (data.error) {
							alert(data.error);
						}
						else {
							//事件监听
							$scope.song.link = data.url;
							player.src = data.url;
							player.play();
							$scope.playing = true;
							console.log(player.duration);
						}
					});
				}
				else {
					player.play();
					$scope.playing = true;
				}
			};
			$scope.playSearch = function(item) {
				//计算是否有上一首
				var songid = $scope.song.song_id || $scope.song.songid;
				if(songid!=item.songid){
					$scope.song = item;
					$scope.song.author = item.artistname;
					$scope.song.pic_big = 'img/mp3.png';
					var index = $scope.searchList.indexOf(item);
					$scope.hasPrev = index > 0;
					$scope.hasNext = index <= $scope.searchList.length;
					//根据song_id，查询song信息
					$scope.loading = true;
					$scope.loading_text = '加载歌曲中...';
					$http.get('api/song.php?song_id=' + item.songid, {
						cache: true
					}).success(function(data) {
						$scope.loading = false;
						if (data.error) {
							alert(data.error);
						}
						else {
							//事件监听
							$scope.song.link = data.url;
							player.src =  data.url;
							player.play();
							$scope.playing = true;
						}
					});
				}else{
					player.play();
					$scope.playing = true;
				}
			};
			$scope.pause = function() {
				$scope.playing = false;
				player.pause();
			};
			$scope.prev = function() {
				var index = $scope.billboard.list.indexOf($scope.song);
				var song;
				if (index == -1) {
					song = $scope.billboard.list[0];
				}
				else {
					song = $scope.billboard.list[--index];
				}
				$scope.play(song);
			};
			$scope.next = function() {
				var index = $scope.billboard.list.indexOf($scope.song);
				var song;
				if (index == -1) {
					song = $scope.billboard.list[0];
				}
				else {
					song = $scope.billboard.list[++index];
				}
				$scope.play(song);
			};
			$scope.down = function() {
				if (player.volume > 0) {
					player.volume -= 0.1;
					$scope.player.volume = parseFloat($scope.player.volume);
					$scope.player.volume = ($scope.player.volume - 0.1).toFixed(1);
				}
			};
			$scope.up = function() {
				if (player.volume < 1) {
					player.volume += 0.1;
					$scope.player.volume = parseFloat($scope.player.volume);
					$scope.player.volume = ($scope.player.volume + 0.1).toFixed(1);
				}
			};
			$scope.download = function(id) {
				window.open('api/download.php?song_id=' + id);
			};
			$scope.keyword = '';
			$scope.search = function() {
				$scope.loading = true;
				$scope.loading_text = '搜索中...';
				var promise = MusicService.search($scope.keyword);
				promise.then(function(data) {
					$scope.loading = false;
					if (data != null) {
						$scope.searchList = data.song;
					}
					else {
						alert('搜索失败')
					}
				}, function(data) {
					$scope.loading = false;
					alert('查找失败');
				});
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
})
();