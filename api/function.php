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

/**
 * 二维数组排序
 * @param $array
 * @param $keys
 * @param string $type
 * @return array|string
 */
function array_sort($array, $keys, $type = 'asc')
{
	if (!isset($array) || !is_array($array) || empty($array))
	{
		return '';
	}
	if (!isset($keys) || trim($keys) == '')
	{
		return '';
	}
	if (!isset($type) || $type == '' || !in_array(strtolower($type), array('asc', 'desc')))
	{
		return '';
	}
	$keysvalue = array();
	foreach ($array as $key => $val)
	{
		$val[$keys] = str_replace('-', '', $val[$keys]);
		$val[$keys] = str_replace(' ', '', $val[$keys]);
		$val[$keys] = str_replace(':', '', $val[$keys]);
		$keysvalue[] = $val[$keys];
	}
	asort($keysvalue); //key值排序
	reset($keysvalue); //指针重新指向数组第一个
	foreach ($keysvalue as $key => $vals)
	{
		$keysort[] = $key;
	}
	$keysvalue = array();
	$count = count($keysort);
	if (strtolower($type) != 'asc')
	{
		for ($i = $count - 1; $i >= 0; $i--)
		{
			$keysvalue[] = $array[$keysort[$i]];
		}
	}
	else
	{
		for ($i = 0; $i < $count; $i++)
		{
			$keysvalue[] = $array[$keysort[$i]];
		}
	}
	return $keysvalue;
}