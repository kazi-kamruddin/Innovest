<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PitchController; 
use App\Http\Controllers\InvestorInfoController;
use App\Http\Controllers\UserInfoController;
use App\Http\Controllers\DummyController;
use App\Http\Controllers\MessageController;


Route::get('/test', [TestController::class, 'getTestHuman'])->middleware('test.middleware');
Route::get('/test/{id}', [TestController::class, 'getTestHumanWithId']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/validate-token', [AuthController::class, 'validateJwtToken']);

Route::get('/pitches', [PitchController::class, 'getAllPitches']); 
Route::get('/pitches/{id}', [PitchController::class, 'getPitchById']); 

Route::get('/profile/{userId}', [UserInfoController::class, 'getUserInfo']); 

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
    //Route::get('/profile/{userId}', [UserInfoController::class, 'getUserInfo']);   
    
    Route::get('/auth-check', [DummyController::class, 'authCheck']);

    Route::get('/conversations', [MessageController::class, 'getConversations']);
    Route::post('/conversations/start', [MessageController::class, 'startConversation']);
    Route::get('/conversations/{id}', [MessageController::class, 'getMessages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'sendMessage']);
});
  

