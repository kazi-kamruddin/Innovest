<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTimestampsToInvestorInfoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('investor_info', function (Blueprint $table) {
            $table->timestamps();  
        });
    }

    public function down()
    {
        Schema::table('investor_info', function (Blueprint $table) {
            $table->dropTimestamps();  
        });
    }
}
