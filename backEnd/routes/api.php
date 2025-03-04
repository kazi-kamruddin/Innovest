<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PitchController; 



Route::get('/test', [TestController::class, 'getTestHuman'])->middleware('test.middleware');
Route::get('/test/{id}', [TestController::class, 'getTestHumanWithId']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/validate-token', [AuthController::class, 'validateJwtToken']);

Route::get('/pitches', [PitchController::class, 'getAllPitches']); 
Route::get('/pitches/{id}', [PitchController::class, 'getPitchById']); 


Route::middleware(['customJWT'])->group(function () {
    Route::get('/users/{id}/pitches', [PitchController::class, 'getUserPitches']); 
    Route::post('/pitches', [PitchController::class, 'createPitch']); 
});
  

