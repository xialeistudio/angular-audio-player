<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
require __DIR__ . '/common.php';
if (!isset($_GET['song_id']))
{
	ajax(array(
			'error' => '缺少参数'
	));
}
$id = intval($_GET['song_id']);
$params = array(
		'songid' => $id,
		'format' => 'json',
		'method' => 'baidu.ting.song.lry',
		'frome' => 'webapp_music'
);
$data = Request::get('http://tingapi.ting.baidu.com/v1/restserver/ting', $params);
$data = json_decode($data, true);
if (isset($data['error_code']) && $data['error_code'] == 22005)
{
	ajax(array(
			'error' => '歌词加载失败'
	));
}
ajax(array(
		'title' => $data['title'],
		'content' => $data['lrcContent']
));