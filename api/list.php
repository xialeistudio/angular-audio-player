<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
require __DIR__ . '/common.php';
$size = isset($_GET['size']) ? intval($_GET['size']) : 40;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$type = isset($_GET['type']) ? intval($_GET['type']) : 2;
$params = array(
		'type' => $type,
		'size' => $size,
		'offset' => $offset,
		'format' => 'json',
		'method' => 'baidu.ting.billboard.billList'
);
$data = Request::get('http://tingapi.ting.baidu.com/v1/restserver/ting', $params);
$data = json_decode($data, true);
$need = array();
$common['title'] = empty($data['billboard']['name'])?'':$data['billboard']['name'];
$common['desc'] = empty($data['billboard']['comment'])?'该榜单是根据百度音乐平台歌曲每周播放量自动生成的数据榜单，统计范围为百度音乐平台上的全部歌曲，每日更新一次':$data['billboard']['comment'];
$common['date'] = empty($data['billboard']['update_date'])?'':$data['billboard']['update_date'];
$need['common'] = $common;
$list = array();
foreach ($data['song_list'] as $row)
{
	$tmp = array(
			'id' => $row['song_id'],
			'title' => empty($row['title'])?'':$row['title'],
			'author' =>empty($row['author'])?'':$row['author']
	);
	$list[] = $tmp;
}
$need['list'] = $list;
ajax($need);