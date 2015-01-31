<?php
/**
 * @author xialei <xialeistudio@gmail.com>
 */
require __DIR__ . '/common.php';
if(!isset($_GET['img'])||$_GET['img'] =='img/mp3.png'){
	$img = file_get_contents(__DIR__.'/../img/mp3.png');
}else{
	try{
		$img = Request::get($_GET['img']);
		header('Content-Type:image/jpeg');
		echo $img;
		exit;
	}catch (Exception $e){
		$img = file_get_contents(__DIR__.'/../img/mp3.png');
	}
}
header('Content-Type:image/png');
echo $img;
exit;