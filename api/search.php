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
ajax($data);