<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
require __DIR__ . '/common.php';
if (!isset($_GET['keyword']))
{
	ajax(array(
			'error' => '请输入关键词'
	));
}
$keyword = $_GET['keyword'];
$params = array(
		'query' => $keyword,
		'format' => 'json',
		'method' => 'baidu.ting.search.catalogSug'
);
$data = Request::get('http://tingapi.ting.baidu.com/v1/restserver/ting', $params);
$data = json_decode($data, true);
$need = array();
$common['title'] = '【' . $keyword . '】的搜索结果';
$common['desc'] = '歌曲来源于百度，本站仅供试听。';
$common['date'] = '更新日期：' . date('Y-m-d');
$need['common'] = $common;
$list = array();
foreach ($data['song'] as $row)
{
	$tmp = array(
			'id' => $row['songid'],
			'title' => $row['songname'],
			'author' => $row['artistname']
	);
	$list[] = $tmp;
}
$need['list'] = $list;
ajax($need);