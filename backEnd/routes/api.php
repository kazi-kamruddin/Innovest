<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PitchController;
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

// Test Routes
Route::get('/test', [TestController::class, 'getTestHuman'])->middleware('test.middleware');
Route::get('/test/{id}', [TestController::class, 'getTestHumanWithId']);

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/validate-token', [AuthController::class, 'validateJwtToken']);

// Pitches Routes (Protected by auth middleware)


Route::middleware('auth:api')->group(function () {
    Route::post('/pitches', [PitchController::class, 'store']);
    Route::get('/pitches', [PitchController::class, 'index']);
    Route::get('/pitches/{id}', [PitchController::class, 'show']);
    Route::put('/pitches/{id}', [PitchController::class, 'update']);
    Route::delete('/pitches/{id}', [PitchController::class, 'destroy']);
});

