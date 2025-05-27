<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PitchController; 
use App\Http\Controllers\InvestorInfoController;
use App\Http\Controllers\UserInfoController;



Route::get('/test', [TestController::class, 'getTestHuman'])->middleware('test.middleware');
Route::get('/test/{id}', [TestController::class, 'getTestHumanWithId']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/validate-token', [AuthController::class, 'validateJwtToken']);


Route::get('/pitches', [PitchController::class, 'getAllPitches']); 
Route::get('/pitches/{id}', [PitchController::class, 'getPitchById']); 

Route::get('/investor-list', [InvestorInfoController::class, 'getInvestorList']); 

//Route::delete('/pitches/{id}', [PitchController::class, 'destroy']);


Route::middleware(['customJWT'])->group(function () {
    Route::get('/users/{id}/pitches', [PitchController::class, 'getUserPitches']); 
    Route::post('/pitches', [PitchController::class, 'createPitch']); 
    Route::delete('/users/{userId}/pitches/{pitchId}', [PitchController::class, 'destroy']);
    Route::put('/users/{userId}/pitches/{pitchId}', [PitchController::class, 'update']);


    Route::post('/investor-info', [InvestorInfoController::class, 'store']); 
    Route::get('/investor-info/{userId}', [InvestorInfoController::class, 'getInvestorInfo']); 

    Route::post('/profile/{userId}/edit-profile', [UserInfoController::class, 'store']);  
    Route::get('/profile/{userId}', [UserInfoController::class, 'getUserInfo']);    
});
  

