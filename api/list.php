<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
require __DIR__ . '/common.php';
$types = array(
		'hot' => 2,
		'new' => 1
);
$size = isset($_GET['size']) ? intval($_GET['size']) : 40;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$type = isset($_GET['type']) && in_array($_GET['type'], $types) ? intval($_GET['type']) : 1;
$params = array(
		'type' => $type,
		'size' => $size,
		'offset' => $offset,
		'format' => 'json',
		'method' => 'baidu.ting.billboard.billList'
);

$data = Request::get('http://tingapi.ting.baidu.com/v1/restserver/ting',$params);

$data = json_decode($data,true);
ajax($data);