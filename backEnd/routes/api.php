<?php

use App\Http\Controllers\TestController;
use App\Http\Controllers\DummyController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return response()->json(['message' => 'Welcome to my API!']);
});


Route::get('/test', [TestController::class, 'getTestHuman'])->middleware('test.middleware');
Route::get('/test/{id}', [TestController::class, 'getTestHumanWithId']);


Route::get('/notes', [DummyController::class, 'getNotes']);
Route::post('/notes', [DummyController::class, 'createNote']);
