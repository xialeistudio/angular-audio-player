<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
function ajax($data)
{
	header('Content-Type: application/json;charset=utf-8');
	echo json_encode($data);
	exit;
}