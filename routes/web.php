<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'IndexController@index');
Route::get('/ingamedebug','IngameController@debug');

Auth::routes();

//Authentication routes
//Route::get('login','Auth\LoginController@showLoginForm')->name('login');
Route::post('login','Auth\LoginController@login');
Route::get('auth/logout','Auth\LoginController@logout');
Route::post('auth/changeName','Auth\UserController@changeName');
Route::post('auth/changePassword','Auth\UserController@changePassword');
Route::post('auth/removeAccount','Auth\UserController@removeAccount');

// Registration routes
Route::get('auth/register','Auth\RegisterController@getRegister');
Route::post('auth/register','Auth\RegisterController@postRegister');

Route::get('/home', 'HomeController@index')->name('home');


// APIs
Route::get('api/ping','APIController@ping');
Route::get('api/ranking','APIController@ranking');


// Shop
Route::get('shop','ShopController@index');
Route::post('shop/purchase','ShopController@purchase');
Route::get('shop/purchase','ShopController@purchaseIndex');
Route::post('shop/use','ShopController@use');