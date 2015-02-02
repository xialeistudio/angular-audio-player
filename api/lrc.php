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
if (!isset($data['title']))
{
	ajax(array(
			'error' => '歌词加载失败'
	));
}
$pattern = '/(\[.*\])+(.+)?/';
$timePattern = '/(\d{2}):(\d{2})\.(\d{2})/';
$list = explode("\n", $data['lrcContent']);
$lrc = array();
foreach ($list as $row)
{
	preg_match_all($pattern, $row, $texts);
	if(!isset($texts[1][0]))
		continue;
	$time = $texts[1][0];
	$text = $texts[2][0];
	preg_match_all($timePattern, $time, $times);
	$mins = $times[1];
	$secs = $times[2];
	foreach ($mins as $key => $min)
	{
		$_t = $min * 60 + $secs[$key];
		$lrc[] = array(
				'time' => $_t,
				'text' => $text
		);
	}
}
$lrc = array_sort($lrc,'time');
ajax($lrc);