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

$url = 'http://tingapi.ting.baidu.com/v1/restserver/ting';
$params = array(
	'format'=>'json',
		'from'=>'webapp_music',
		'method'=>'baidu.ting.song.downWeb',
		'songid'=>intval($_GET['song_id']),
		'bit'=>'192',
		'_t'=>time()*1000
);

$data = Request::get($url,$params);
$data = json_decode($data,true);

$name = $data['songinfo']['author'].' - '.$data['songinfo']['title'].'.mp3';
foreach($data['bitrate'] as $row){
	if($row['file_bitrate'] == 192){
		$url = $row['file_link'];
		//$tmp = Request::get($url);
		header("Content-type: application/octet-stream"); //返回的文件
		header("Content-Disposition: attachment; filename=".$name);//这里客户端的弹出对话框，对应的文件名
		$fp = fopen($row['file_link'],'rb');
		while(!feof($fp)){
			echo fread($fp,4096);
		}
		exit;
	}
}