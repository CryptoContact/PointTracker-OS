//   PointTracker.js
//
//
//
//


var Current_id;
var Current_SA_id;
var Current_RP_id;
var Current_PT_account;
var NO_ERROR = 0;
var LOGIN_ERROR = 1;
var SCRAPER_ERROR = 2;










// Return a Point Tracker object from the server
//
//
function Get_PointTracker_Account () {
    var PT_account = (function () {
        var json = null;
        var _id = $.cookie("PointTracker_Login");
        $.ajax({
            'async': false,
            'data': {'_id':_id},
            'url': 'Get_PointTracker_Account_View',
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
    Current_id = $.cookie("PointTracker_Login");
    Current_PT_account = PT_account;
    return PT_account;
}








function Get_SA_account (PT_account, SA_id) {
    var SA_account;

    for (var sub_account_index=0; sub_account_index < PT_account['PT_sub_accounts'].length;  sub_account_index++) {
        SA_account = PT_account['PT_sub_accounts'][sub_account_index];                                                   // get a sub account
        if (SA_account['SA_id'] == SA_id) {                                                                              // is it the one we want?
            break;
        }
    }
    return SA_account
}




function Get_RP_account (PT_account, SA_id, RP_id) {
    var SA_account;
    var RP_account;

    for (var sub_account_index=0; sub_account_index < PT_account['PT_sub_accounts'].length;  sub_account_index++) {
        SA_account = PT_account['PT_sub_accounts'][sub_account_index];                                                   // get a sub account
        if (SA_account['SA_id'] == SA_id) {                                                                              // is it the one we want?
            break;
        }
    }

    for (var program_account_index=0; program_account_index < SA_account['SA_program_accounts'].length;  program_account_index++) {
        RP_account = SA_account['SA_program_accounts'][program_account_index];                                       // get a reward program account
        if (RP_account['RP_id'] == RP_id) {                                                                          // is it the one we want?
            break;
        }
    }
    return RP_account
}







// Calls server to scrape and update Point Tracker account
// inserts the dynamically created table at "sub_account_table" on the html page
//
function Update_PointTracker_Account() {
    var $Update_PointTracker_Account_List_Tag = '#Update_PointTracker_Account_List_Tag';
    var $Update_PointTracker_Account_Modal = '#Update_PointTracker_Account_Modal';
    var $URP_Modal_Button = '#URP_Modal_Button';

    $($Update_PointTracker_Account_List_Tag).empty();
    $($Update_PointTracker_Account_Modal).modal('show');
    $($URP_Modal_Button).empty();
//    $($URP_Modal_Button).append('<button class="btn btn">OK</button>');

    Create_Update_List();                                                     //Create a list of the all SA_accounts and RP_accounts in PT_account so we can iterate over them using callbacks for browser compatibility
    Display_Update_List_Item();

//    $($Update_PointTracker_Account_List_Tag).append('<br>');
}


//
//
//
function Display_Update_List_Item () {

    var PT_obj = {};
    var RP_account;
    var PT_List_Item;
    var $Update_PointTracker_Account_List_Tag = '#Update_PointTracker_Account_List_Tag';
    var $RP_callback_tag2;
    var $URP_Modal_Tag2 = '#URP_Modal_Tag2';
    var $URP_Modal_Button = '#URP_Modal_Button';

    PT_List_Item = PT_Update_List[PT_Update_List_Index];          //RP_account

    if (PT_List_Item == 'Sub_Account_Name') {                       // if true, then next item is the Sub Account name
        $($Update_PointTracker_Account_List_Tag).append('<br>');
        PT_Update_List_Index++;                                    //skip to name
        $($Update_PointTracker_Account_List_Tag).append("<h4 style='color:#4169e1'>" + PT_Update_List[PT_Update_List_Index] + "</h4>");    // print name
        PT_Update_List_Index++;                                    //skip to RP_account if there is one. or could be 'Sub_Account_Name' header
        if (PT_Update_List[PT_Update_List_Index] == 'Sub_Account_Name') {
            $($Update_PointTracker_Account_List_Tag).append("<h5 id = 'SCROLL_HERE', style='color:#ff0000'>" + 'No Reward Programs' + "</h5>");
            $($URP_Modal_Tag2).stop().animate({ scrollTop: $('#SCROLL_HERE').offset().top}, 1);
            setTimeout(Display_Update_List_Item(),200 );                     // Call function again to get next item in list
            return
        }
    }

    RP_account = PT_Update_List[PT_Update_List_Index];          //RP_account (Process it)

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = RP_account['SA_id'];
    PT_obj['RP_id'] = RP_account['RP_id'];
    PT_obj['RP_callback_tag'] = RP_account['RP_callback_tag'];
    PT_obj['PT_password_encrypted'] = $.cookie("PointTracker_password");

    $($Update_PointTracker_Account_List_Tag).append('<div id=' + RP_account['RP_callback_tag'] + ' style ="text-align:left">' + '<img src="/static/graphics/refresh_animated.gif" alt="airline partner"  height="20" width="20" >' + ' '+ RP_account['RP_name']  + '<br>' + '</div>');

    $RP_callback_tag2 = '#' + RP_account['RP_callback_tag'];
    $($URP_Modal_Tag2).stop().animate({ scrollTop: $($RP_callback_tag2).offset().top}, 500);


    $.ajax({
            'async': true,
            'data': PT_obj,                                                                      // call the correct program scraper thru the view callable by sending it's dictionary
            'url': 'Update_PointTracker_Account_View', //'Get_Reward_Program_View',  // 'Update_PointTracker_Account_View',
            'success': function (RP_account) {                                               // call backback function return new updated program_account
                var $RP_callback_tag = '#' + RP_account['RP_callback_tag'];

                if (RP_account['RP_error'] == NO_ERROR) {              // True if error. False if good
                    $($RP_callback_tag).html('<img src="/static/graphics/green_check_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name'] + '<br>');
                }
                else if (RP_account['RP_error'] == LOGIN_ERROR) {
                    $($RP_callback_tag).html('<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name']+ '<br>');
                }
                else if (RP_account['RP_error'] == SCRAPER_ERROR) {
                    $($RP_callback_tag).html('<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name']+ '<br>');
                }
                PT_Update_List_Index++;                         // Get next item i
                if (PT_Update_List_Index < PT_Update_List.length) {
                    Display_Update_List_Item();                     // Call itself to get next item in list
                }
                else {
                    $($URP_Modal_Button).empty();
                    $($URP_Modal_Button).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                    Display_PointTracker_Account();                 // All the SA_accounts and RP_accounts are updated so refresh whole page
                }
            }
        });
}





// Creates a list of pairs describing the PT_account sub account and program account information
// This must be done so we can iterate over the list one by one so the UI can have more control
//      Format of list:
//                      ['Sub_Account_Name',            ---- Header
//                              -name-,
//                          RP_account,
//                      ['Sub_Account_Name',            ----- Header
//                              -name-,
//                          RP_account,
//                          RP_account,
//                              etc
var PT_Update_List = [];
var PT_Update_List_Index;


function Create_Update_List() {

    var SA_account;
    var RP_account;
    PT_Update_List = [];
    PT_Update_List_Index =0;

    for (var SA_account_index =0; SA_account_index<Current_PT_account['PT_sub_accounts'].length;SA_account_index++) {            // Cycle thru the sub accounts of the master PointTracker Account
        SA_account = Current_PT_account['PT_sub_accounts'][SA_account_index];
        PT_Update_List.push('Sub_Account_Name');                                        // Add the a Header to the list to identify the SA_name is next
        PT_Update_List.push(SA_account['SA_name']);                                    //  Add the actual name to the list

        for (var RP_account_index =0;   RP_account_index < SA_account['SA_program_accounts'].length;  RP_account_index++) {     //Add all the RP_accounts for this SA_account to the list
            RP_account = SA_account['SA_program_accounts'][RP_account_index];                                                   // Current Program Account of the Master PointTracker Account
            RP_account['RP_callback_tag'] = 'RP_row_id_' + SA_account_index.toString()+ '_' + RP_account_index.toString();      // identifier for the callback to find where the account was printed in the html so it can be updated when done.
            PT_Update_List.push(RP_account);                                                                                     //Save the reward program account
        }
    }
}












//  Displays Current Point Tracker object
// inserts the dynamically created table at "sub_account_table"
//
//
function Display_PointTracker_Account  () {

    var PT_account;
    var program_account;
    var sub_account;
    var tablecontents ='';
    var $Update_PointTracker_Account_Button_Tag = '#Update_PointTracker_Account_Button_Tag';

    PT_account = Get_PointTracker_Account();

    $("#Welcome_User_Tag").replaceWith('Welcome, ' + PT_account['PT_account_firstname'] +' '+ PT_account['PT_account_lastname']);   // put new Welcome name there
    $($Update_PointTracker_Account_Button_Tag).empty();

    if (Any_RP_accounts(PT_account)) {
        $($Update_PointTracker_Account_Button_Tag).append('<a href="#Update_PointTracker_Account" onclick = "Update_PointTracker_Account()" class="btn btn-large btn-primary">Update PointTracker Account</a>')
    }

    if (PT_account['PT_sub_accounts'].length == 0) {
        tablecontents += '<br>';
        tablecontents += '<div style="text-align: center">';
        tablecontents += '<img src="static/graphics/No_sub_account_girl.png" alt="No_sub_account_girl">';
        tablecontents += '<div>';
    }

    for (var sub_account_index =0; sub_account_index<PT_account['PT_sub_accounts'].length;sub_account_index++) {

        sub_account = PT_account['PT_sub_accounts'][sub_account_index];
        tablecontents += '<div class="btn-group" style="text-align: left ">';
        tablecontents += '<button class="btn btn-large btn-info">' + sub_account['SA_name'] + '</button>';
        tablecontents += '<button class="btn btn-large btn-info dropdown-toggle" data-toggle="dropdown" href="#">';
        tablecontents += '<span class="caret"></span>';
        tablecontents += '</button>';
        tablecontents += '<ul class="dropdown-menu">';
        tablecontents += '<li><a href="#" id="Add_Reward_Program_Button" onclick = "Add_Reward_Program(this)" data-sa=' + sub_account['SA_id'] + '>Add Reward Program</a></li>';
        tablecontents += '<li><a href="#" id="Delete_Sub_Account_Button" onclick = "Delete_Sub_Account(this)" data-sa=' + sub_account['SA_id']+ '>Delete this Sub Account</a></li>';
        tablecontents += '</ul>';
        tablecontents += '</div>';


        if (PT_account['PT_sub_accounts'].length > 1 && sub_account['SA_program_accounts'].length == 0) {
            tablecontents += '<img src="static/graphics/red_warning_sign_small.png" alt="Warning Sign"  height="30" width="28" >' + '<font color = "#ff0000"> Please add some Reward Programs</font>';
        }



        if (PT_account['PT_sub_accounts'].length == 1 && sub_account['SA_program_accounts'].length == 0) {
            tablecontents += '<br>';
            tablecontents += '<div style="text-align: center">';
            tablecontents += '<img src="static/graphics/welcome_girl.png" alt="Welcome_girl">';
            tablecontents += '<div>';
        } else {
            tablecontents += '<table class="table table-striped table-bordered">';
            tablecontents += "<thead>";
            tablecontents += "<tr>";
            tablecontents += "<th style='min-width: 25px;'></th>";                                                   //Airline logo
            tablecontents += "<th>Program</th>";
            tablecontents += "<th style='min-width: 25px;'></th>";                                            // Partner Alliance Logo
            tablecontents += "<th style='width: 170px;'>Account</th>";
            tablecontents += "<th>Balance</th>";
            tablecontents += "<th>Last Activity</th>";
            tablecontents += "<th>Expiration</th>";
            tablecontents += "<th>Last Updated</th>";
            tablecontents += "<th></th>";
            tablecontents += "</tr>";
            tablecontents += "</thead>";






            tablecontents += "<tbody>";
            for (var program_account_index =0;   program_account_index<sub_account['SA_program_accounts'].length;   program_account_index++) {

                program_account = sub_account['SA_program_accounts'][program_account_index];



                tablecontents += "<tr>";

                tablecontents += "<td>";
                if (program_account['RP_name'] == 'American Airlines') {
                    tablecontents += '<a href = "http://www.aa.com/homePage.do"><img src="static/graphics/american_airlines_logo_small.png" alt="american_airlines logo" align="center" height="25" width="25" ></a>'
                }
                if (program_account['RP_name'] == 'United Airlines') {
                    tablecontents += '<a href = "http://www.united.com/web/en-US/default.aspx?root=1"><img src="static/graphics/united_airlines_logo_small.png" alt="united_airlines logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'Delta Airlines') {
                    tablecontents += '<a href = "http://www.delta.com/"><img src="static/graphics/delta_airlines_logo_small.png" alt="delta_airlines logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'US Airways') {
                    tablecontents += '<a href = "http://www.usairways.com/default.aspx"><img src="static/graphics/us_airways_logo_small.png" alt="us_airways logo" align="center" height="25" width="25" ></a>'
                }
                if (program_account['RP_name'] == 'British Airways') {
                    tablecontents += '<a href = "http://www.britishairways.com/travel/home/public/en_us"><img src="static/graphics/british_airways_logo_small.png" alt="british_airways logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'EVA Air') {
                    tablecontents += '<a href = "http://www.evaair.com/"><img src="static/graphics/eva_air_logo_small.png" alt="eva_air logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'Southwest Airlines') {
                    tablecontents += '<a href = "http://www.southwest.com/"><img src="static/graphics/Southwest_Airlines_logo_small.png" alt="Southwest Airlines logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'Hilton Honors') {
                    tablecontents += '<a href = "http://hhonors3.hilton.com/en/index.html"><img src="static/graphics/hilton_honors_logo_small.png" alt="Hilton Honors logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_name'] == 'Marriott Rewards') {
                    tablecontents += '<a href = "http://www.marriott.com/rewards/rewards-program.mi"><img src="static/graphics/marriott_rewards_logo_small.png" alt="Marriott Rewards logo" align="center" height="25" width="25" ></a>';
                }
                tablecontents += "</td>";



                tablecontents += "<td>"+ program_account['RP_name'];
                tablecontents += "</td>";

                tablecontents += "<td>";
                if (program_account['RP_partner'] == 'One World') {
                    tablecontents += '<a href = "/One_World"><img src="static/graphics/one_world_small.png" alt="One World Logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_partner'] == 'Star Alliance') {
                    tablecontents += '<a href = "/Star_Alliance"><img src="static/graphics/star_alliance_small.png" alt="Star Alliance Logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_partner'] == 'Sky Team') {
                    tablecontents += '<a href = "/Sky_Team"><img src="static/graphics/sky_team_small.png" alt="Sky Team Logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_partner'] == 'Rapid Rewards') {
                    tablecontents += '<a href = "http://www.southwest.com"><img src="static/graphics/rapid_rewards_logo_small.png" alt="Rapid RewardsLogo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_partner'] == 'Hilton Honors') {
                    tablecontents += '<a href = "http://hhonors3.hilton.com/en/index.html"><img src="static/graphics/hilton_honors_logo_small.png" alt="Hilton Honors Logo" align="center" height="25" width="25" ></a>';
                }
                if (program_account['RP_partner'] == 'Marriott Rewards') {
                    tablecontents += '<a href = "http://www.marriott.com/rewards/rewards-program.mi"><img src="static/graphics/marriott_rewards_logo_small.png" alt="Marriott Rewards Logo" align="center" height="25" width="25" ></a>';
                }

                tablecontents += "</td>";




                tablecontents += "<td>"+ program_account['RP_account_name'] + "</br>" + program_account['RP_account_num']   +"</td>";


                tablecontents += '<td style="text-align:right">';
                tablecontents += "<span>" + program_account['RP_balance']  + '<img src="static/graphics/blank_arrow.png" alt="airline partner" align="right" height="20" width="10" >' + "<br>";
                if (program_account['RP_balance_delta'] < 0) {
                    tablecontents += "<span style='color:#ff0000' style='text-align:right'>" + program_account['RP_balance_delta'] + '<img src="static/graphics/down_arrow.png" alt="airline partner" align="right" height="20" width="10" >' + "</span>";
                }
                if (program_account['RP_balance_delta'] > 0) {
                    tablecontents += "<span style='color:#5bb75b' style='text-align:right'>" + program_account['RP_balance_delta'] + '<img src="static/graphics/up_arrow.png" alt="airline partner" align="right" height="20" width="10" >' + "</span>";
                }
                tablecontents += '</td>';


                tablecontents += "<td>"+ program_account['RP_last_activity_date']  +"</td>";
                tablecontents += "<td>"+ program_account['RP_expiration_date'] + "</br>";
                if ((program_account['RP_expiration_date'] != 'Never Expire') && (program_account['RP_expiration_date'] != 'Self Check') && (program_account['RP_days_remaining'] != 'N/A')) {
                    tablecontents += program_account['RP_days_remaining'] + " Days"  +"</td>";
                }


                tablecontents += "<td>"+ program_account['RP_datestamp']  + "</br>";
                tablecontents += program_account['RP_timestamp']+ '</td>';

                tablecontents += "<td>";
    //            tablecontents += '<a href="#Refresh_Reward_Program" onclick = "Refresh_Reward_Program(this)" data-toggle="modal"  class="btn"><i class="icon-refresh icon-black"></i></a>';
    //            tablecontents += '<a href="#Edit_Reward_Program"    onclick = "Edit_Reward_Program(this)" data-toggle="modal"  class="btn"><i class="icon-refresh icon-black"></i></a>';
    //            tablecontents += '<a href="#Delete_Reward_Program"  onclick = "Delete_Reward_Program(this)" data-toggle="modal"  class="btn btn-danger"><i class="icon-trash icon-white"></i></a>';
    //                    tablecontents += '<a href="#" data-sa ="' + sub_account_index + '"' + 'data-pa="' + program_account_index + '"' + 'id="Refresh_Reward_Program_Button"   class="btn"><i class="icon-refresh icon-black"></i></a>';
    //                    tablecontents += '<a href="#" data-sa ="' + sub_account_index + '"' + 'data-pa="' + program_account_index + '"' + 'id="Edit_Reward_Program_Button"   class="btn"><i class="icon-edit icon-black"></i></a>';
    //                    tablecontents += '<a href="#" data-sa ="' + sub_account_index + '"' + 'data-pa="' + program_account_index + '"' + 'id="Delete_Reward_Program_Button"   class="btn btn-danger"><i class="icon-trash icon-white"></i></a>';

                tablecontents += '<a href="#" data-sa ="' + sub_account['SA_id'] + '"' + 'data-pa="' + program_account['RP_id'] + '"' + 'id="Refresh_Reward_Program_Button"   onclick="Refresh_Reward_Program(this)" class="btn"><i class="icon-refresh icon-black"></i></a>';
                tablecontents += '<a href="#" data-sa ="' + sub_account['SA_id'] + '"' + 'data-pa="' + program_account['RP_id'] + '"' + 'id="Edit_Reward_Program_Button"   onclick="Edit_Reward_Program(this)" class="btn"><i class="icon-edit icon-black"></i></a>';
                tablecontents += '<a href="#" data-sa ="' + sub_account['SA_id'] + '"' + 'data-pa="' + program_account['RP_id'] + '"' + 'id="Delete_Reward_Program_Button"  onclick="Delete_Reward_Program(this)" class="btn btn-danger"><i class="icon-trash icon-white"></i></a>';

                tablecontents += "</td>";

                tablecontents += "</tr>";
             }
            tablecontents += "</tr>";
            tablecontents += "</tbody>";
            tablecontents += "</table>";
            tablecontents += "</br>";
        }
     }
    document.getElementById("sub_account_table").innerHTML = tablecontents;
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Any_RP_accounts (PT_account) {
    var answer = false;
    var sub_account;
//    var program_account;

        for (var sub_account_index =0; sub_account_index<PT_account['PT_sub_accounts'].length;sub_account_index++) {
                sub_account = PT_account['PT_sub_accounts'][sub_account_index];
                for (var program_account_index =0;   program_account_index<sub_account['SA_program_accounts'].length;   program_account_index++) {
                    if (sub_account['SA_program_accounts'].length >0 ) {
                        answer = true;
                    }
                }
        }
    return answer;
}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Add a Sub Account
//
function Add_Sub_Account() {
    var $Add_Sub_Account_Modal = "#Add_Sub_Account_Modal";

    $('#Sub_Account_Name').val('');                                               //clear out name in text box

    $($Add_Sub_Account_Modal).modal('show');
    $($Add_Sub_Account_Modal).on('shown', function() {
        $("#Sub_Account_Name").focus();                                           //Bring focus to the Sub account name input field when modal opens
    });
}




// Detect Add Sub Account Modal Button
//      Call Server and add the inputted Sub Account Name to the current PT_account
//
$(document).on("click","#ASA_Confirm_Modal_Button", function Confirm_Sub_Account() {

    var SA_name = $('#Sub_Account_Name').val();                               // Get the inputted name value for the new SA_account
    if (SA_name != '') {                                                      // don't add if user didnt' add a name
             $.ajax({
            'async': true,
            'data': {'SA_name':SA_name,'_id':Current_id},
            'url': 'Add_Sub_Account_View',                                              // Call server to add the sub account
            'success': function () {
                Display_PointTracker_Account();                                         // Refresh screen with sub account
            }
        });
    }
});








/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Delete a Sub Account
//
function Delete_Sub_Account(PT_THIS) {

    Current_SA_id = $(PT_THIS).attr("data-sa");                      // Get sub_account id from the button
    $('#Delete_Sub_Account_Modal').modal('show');                   // Show the "are you sure' modal
}



// Detect Delete Sub Account Modal Button
//
$(document).on("click","#DSA_Delete_Modal_Button", function Confirm_Sub_Account() {

    var PT_obj = {};

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = Current_SA_id;

    $.ajax({
        'async': true,
        'data': PT_obj,
        'url': 'Delete_Sub_Account_View',                            // Call server to delete this sub account
        'success': function () {
             Display_PointTracker_Account();                        //Refresh the page with new information
        }
    });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Adds a Reward Program to the desired sub account.
//
function Add_Reward_Program(PT_THIS) {


    var $Add_Reward_Program_Verify_Tag2 = "#Add_Reward_Program_Verify_Tag2";                // Insert Button modal configuration in html here
    var $Add_Reward_Program_Modal = "#Add_Reward_Program_Modal";

    Current_SA_id = $(PT_THIS).attr("data-sa");                                             // Get sub_account index from html table
//
    $('#ARP_username').val('');                                                             // clear out for new input
    $('#ARP_password').val('');                                                             // clear out for new input
    $('#ARP_normalSelect1').val('American Airlines');                                       // Set default for new input

// Setup Modal Button configuration
    $($Add_Reward_Program_Verify_Tag2).empty();
    $($Add_Reward_Program_Verify_Tag2).append('<button id="ARP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
    $($Add_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');

    $(".ARP_alert").empty();                                                 // Hide any alerts from previous use of Modal

    $($Add_Reward_Program_Modal).modal('show');

    $($Add_Reward_Program_Modal).on('shown', function() {                   // Put focus on Reward Program dropdown menu
        $("#ARP_normalSelect1").focus();
    });
}





// Detect Add Reward Program Account Modal Button
//
$(document).on("click","#ARP_Submit_Modal_Button", function () {

    var hasError = false;
    var PT_obj = {};
    var $username = "#ARP_username";
    var $password = "#ARP_password";
    var $Add_Reward_Program_Verify_Tag1 = "#Add_Reward_Program_Verify_Tag1";                //Insert 'refreshing' animation and program name here in the html
    var $Add_Reward_Program_Verify_Tag2 = "#Add_Reward_Program_Verify_Tag2";                //Insert out Modal button configuration here in html modal

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = Current_SA_id;

    PT_obj['RP_username'] = $($username).val();                                             //get the inputs from the form
    PT_obj['RP_password'] = $($password).val();
    PT_obj['RP_name'] = $("#ARP_normalSelect1").val();
    PT_obj['PT_password_encrypted'] = $.cookie("PointTracker_password");


    $(".ARP_alert").empty();                                                                // clear everything that has class error (.error)
    $($Add_Reward_Program_Verify_Tag1).empty();                                              // also clear out this tag for next response

    if (PT_obj['RP_username'] == '') {
        $($username).after('<span class="ARP_alert"><font color = "#ff0000"> Enter a username</font></span>');
        $($username).focus();
        hasError = true;
    } else if (PT_obj['RP_password'] == '') {
                $($password).after('<span class="ARP_alert"><font color = "#ff0000"> Enter a password</font></span>');
                $($password).focus();
                hasError = true;
            }

    if (hasError == false) {                            // no input errors so let's try adding a Reward Program
        $($username).blur();
        $($password).blur();

    // Start the Refreshing/Verifying Animation
        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center">' + '<img src="/static/graphics/refresh_animated.gif" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');

            $.ajax({
                'async': true,
                'data': PT_obj,                                                           // call the correct program scraper thru the view callable by sending it's dictionary
                'url': 'Add_Reward_Program_View',
                'success': function (RP_account) {                               // callback function return new updated program_account
                    $($Add_Reward_Program_Verify_Tag1).empty();
                    $($Add_Reward_Program_Verify_Tag2).empty();
                    if (RP_account['RP_error'] == NO_ERROR) {              // True if error. False if good
                        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center">' + '<img src="/static/graphics/green_check_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                        $($Add_Reward_Program_Verify_Tag2).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                    }
                    else if (RP_account['RP_error'] == LOGIN_ERROR) {
                        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center; color:#ff0000">Login error. Please verify Program, Username and Password</div>');
                        $($Add_Reward_Program_Verify_Tag2).append('<button id="ARP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
                        $($Add_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
                        return;                             // return early and don't call Display_PointTracker_Account
                    }
                    else if (RP_account['RP_error'] == SCRAPER_ERROR) {
                        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                        $($Add_Reward_Program_Verify_Tag1).append('<div class="ARP_alert" style ="text-align:center; color:#ff0000">Scraping Error. There was a problem getting your data from the website.<br>Please try logging into the website and clear any advisory information and try again here.</div>');
                        $($Add_Reward_Program_Verify_Tag2).append('<button id="ARP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
                        $($Add_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
                        return;
                }
                    Display_PointTracker_Account();                                     // update main page PointTracker Account
                }
            });
    }
});

















/////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Refresh_Reward_Program(PT_THIS) {
    var $Refresh_Reward_Program_Tag2 = '#Refresh_Reward_Program_Tag2';          // Insert Modal button configuration here

    Current_SA_id = $(PT_THIS).attr("data-sa");                      // Get sub account id from html table
    Current_RP_id = $(PT_THIS).attr("data-pa");                      // Get program id from html table

    $(".RRP_alert").empty();                                            // clear everything that has class error (.error)
    $($Refresh_Reward_Program_Tag2).empty();
//    $($Refresh_Reward_Program_Tag2).append('<button class="btn">OK</button>');              //Greyed out 'OK" Button

    $('#Refresh_Reward_Program_Modal').modal('show');
}



// Refreshes a Reward Program on the server
//
$(document).on("click","#Refresh_Reward_Program_Button", function () {

    var $Refresh_Program_List = '#Refresh_Program_list';
    var $Refresh_Reward_Program_Tag1 = '#Refresh_Reward_Program_Tag1';          // Insert 'refreshing' animation and airline program in html here
    var $Refresh_Reward_Program_Tag2 = '#Refresh_Reward_Program_Tag2';          // Insert Modal button configuration here
    var $RRP_row_id = '#RRP_row_id';

    var PT_obj = {};
    var RP_account;
    var SA_account;

//    var RP_id = $(this).attr("data-pa");                      // Get program_account index from html table
//    var SA_id = $(this).attr("data-sa");                      // Get sub_account index from html table

    SA_account = Get_SA_account(Current_PT_account, Current_SA_id);                     // The sub account that we are in
    RP_account = Get_RP_account(Current_PT_account, Current_SA_id, Current_RP_id);              // Get the reward program account

    $($Refresh_Program_List).empty();
    $($Refresh_Program_List).append("<h4 style='color:#4169e1'>" + SA_account['SA_name'] + "</h4>");            //print sub account holders name
    $($Refresh_Program_List).append('<div id="RRP_row_id" style="text-align:left">' + '<img src="/static/graphics/refresh_animated.gif" alt="airline partner"  height="20" width="20" >' + ' '+ RP_account['RP_name'] + '<br>'+ '</div>');

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = Current_SA_id;
    PT_obj['RP_id'] = Current_RP_id;                                //set up object to send to server
    PT_obj['RP_callback_tag'] = '#RRP_row_id';                  //embed the id tag to look for  for the call back function
    PT_obj['PT_password_encrypted'] = $.cookie("PointTracker_password");

    $(".RRP_alert").empty();                                            // clear everything that has class error (.error)
//    $($Refresh_Reward_Program_Tag2).empty();
//    $($Refresh_Reward_Program_Tag2).append('<button class="btn">OK</button>');              // Greyed out 'OK' Button

//    $('#Refresh_Reward_Program_Modal').modal('show');

    $.ajax({
        'async': true,
        'data': PT_obj,                                                                      // call the correct program scraper thru the view callable by sending it's dictionary
        'url': 'Refresh_Reward_Program_View',
        'success': function (RP_account) {                                               // call backback function return new updated program_account
                $($RRP_row_id).empty();
                $($Refresh_Reward_Program_Tag1).empty();
                $($Refresh_Reward_Program_Tag2).empty();
                if (RP_account['RP_error'] == NO_ERROR) {                      // True if error. False if good
                    $($Refresh_Reward_Program_Tag2).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                    $($RRP_row_id).append('<div class="RRP_alert" style ="text-align:left">' + '<img src="/static/graphics/green_check_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name'] + '</div>');
                    Display_PointTracker_Account();
                }
               else if (RP_account['RP_error'] == LOGIN_ERROR) {
                    $($RRP_row_id).append('<div class="RRP_alert" style ="text-align:left">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name'] + '</div>');
                    $($Refresh_Reward_Program_Tag1).append('<div class="RRP_alert" style ="text-align:center; color:#ff0000"">Login error. Please verify Program, Username and Password</div>');
                    $($Refresh_Reward_Program_Tag2).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                }
               else if (RP_account['RP_error'] == SCRAPER_ERROR) {
                    $($RRP_row_id).append('<div class="RRP_alert" style ="text-align:left">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + RP_account['RP_name'] + '</div>');
                    $($Refresh_Reward_Program_Tag1).append('<div class="RRP_alert" style ="text-align:center; color:#ff0000"">Scraping Error. There was a problem getting your data from the website.<br>Please try logging into the website and clear any advisory information and try again here.</div>');
                    $($Refresh_Reward_Program_Tag2).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                }
        }
    });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Calls server to scrape and update a single reward program
//The reward program is updated server side in the Current PointTracker account in the database

//$(document).on("click","#Edit_Reward_Program_Button", function () {
function Edit_Reward_Program (PT_THIS) {
    var $Edit_Reward_Program_Verify_Tag2 = "#Edit_Reward_Program_Verify_Tag2";

    var RP_account;

    Current_RP_id = $(PT_THIS).attr("data-pa");                      // Get program_account index from html table
    Current_SA_id = $(PT_THIS).attr("data-sa");                      // Get sub_account index from html table

    RP_account = Get_RP_account(Current_PT_account,Current_SA_id, Current_RP_id);

    $('#ERP_username').val(RP_account['RP_username']);
    $('#ERP_password').val(RP_account['RP_password']);
    $("#ERP_normalSelect1").val(RP_account['RP_name']);

// Setup Modal Button configuration
    $($Edit_Reward_Program_Verify_Tag2).empty();
    $($Edit_Reward_Program_Verify_Tag2).append('<button id="ERP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
    $($Edit_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');

    $(".ERP_alert").empty();                                            // Hide everything that has class error (.error)
    $('#Edit_Reward_Program_Modal').modal('show');
}




// Detect Edit Reward Program Account Modal Button
//
$(document).on("click","#ERP_Submit_Modal_Button", function () {
//$(document).on("click","#Edit_Reward_Program_Button", function Edit_Reward_Program () {

    var PT_obj = {};
    var $username = "#ERP_username";
    var $password = "#ERP_password";
    var $Edit_Reward_Program_Verify_Tag1 = "#Edit_Reward_Program_Verify_Tag1";  // Insert 'refreshing' animation and airline program in html here
    var $Edit_Reward_Program_Verify_Tag2 = "#Edit_Reward_Program_Verify_Tag2";  // Insert Modal button configuration here

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = Current_SA_id;                                            // Get sub_account index from html table
    PT_obj['RP_id'] = Current_RP_id;                                         // Get program_account index from html table
    PT_obj['RP_callback_tag'] = $Edit_Reward_Program_Verify_Tag1;                  //embed the id tag to look for  for the call back function
    PT_obj['PT_password_encrypted'] = $.cookie("PointTracker_password");

    PT_obj['RP_username'] = $($username).val();
    PT_obj['RP_password'] = $($password).val();
    PT_obj['RP_name'] = $("#ERP_normalSelect1").val();

    $(".ERP_alert").empty();                                            // clear everything that has class error (.error)
    $($Edit_Reward_Program_Verify_Tag1).empty();                          // also clear out this tag for next response

    if (PT_obj['RP_username'] == '') {
        $($username).after('<span class="ERP_alert"><font color = "#ff0000"> Enter a username</font></span>');
        return;               //no username
    }
    if (PT_obj['RP_password'] == '') {
        $($password).after('<span class="ERP_alert"><font color = "#ff0000"> Enter a password</font></span>');
        return;              //no password
    }

   $($Edit_Reward_Program_Verify_Tag2).empty();
   $($Edit_Reward_Program_Verify_Tag2).append('<button id="ERP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
   $($Edit_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');

// Start the Refreshing/Verifying Animation
    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center">' + '<img src="/static/graphics/refresh_animated.gif" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');

        $.ajax({
            'async': true,
            'data': PT_obj,                                                           // call the correct program scraper thru the view callable by sending it's dictionary
            'url': 'Edit_Reward_Program_View',
            'success': function (RP_account) {                               // call backback function return new updated program_account
                $($Edit_Reward_Program_Verify_Tag1).empty();
                $($Edit_Reward_Program_Verify_Tag2).empty();
                if (RP_account['RP_error'] == NO_ERROR) {                      // True if error. False if good
                    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center">' + '<img src="/static/graphics/green_check_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                    $($Edit_Reward_Program_Verify_Tag2).append('<button class="btn btn-info" data-dismiss="modal">OK</button>');
                    Display_PointTracker_Account();                                     // update main page PointTracker Account
                }
                else if (RP_account['RP_error'] == LOGIN_ERROR) {                      // True if error. False if good
                    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center; color:#ff0000"">Login error. Please verify Program, Username and Password</div>');
                    $($Edit_Reward_Program_Verify_Tag2).append('<button id="ERP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
                    $($Edit_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
                }
                else if (RP_account['RP_error'] == SCRAPER_ERROR) {                      // True if error. False if good
                    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center">' + '<img src="/static/graphics/red_x_small.png" alt="airline partner"  height="20" width="20" >'+ ' ' + PT_obj['RP_name'] + '</div>');
                    $($Edit_Reward_Program_Verify_Tag1).append('<div class="ERP_alert" style ="text-align:center; color:#ff0000"">Scraper Error. There was a problem getting your data from the website.<br>Please try logging into website and clear any advisory information and try again here.</div>');
                    $($Edit_Reward_Program_Verify_Tag2).append('<button id="ERP_Submit_Modal_Button" class="btn btn-info">Submit</button>');
                    $($Edit_Reward_Program_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
                }
            }
        });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Delete_Reward_Program(PT_THIS) {

    Current_SA_id = $(PT_THIS).attr("data-sa");                      // Get sub account id from html table
    Current_RP_id = $(PT_THIS).attr("data-pa");                      // Get program id from html table

    $('#Delete_Reward_Program_Modal').modal('show');
}



//Detect Delete Reward Program Account Modal Button
//
$(document).on("click","#DRP_Delete_Modal_Button", function () {

    var PT_obj = {};

    PT_obj['_id'] = Current_id;
    PT_obj['SA_id'] = Current_SA_id;
    PT_obj['RP_id'] = Current_RP_id;

    $.ajax({
        'async': true,
        'data': PT_obj,
        'url': 'Delete_Reward_Program_View',                    // call server to delete the Reward Account
        'success': function () {                               // callback function return new updated program_account
           Display_PointTracker_Account();
        }
    });
});





/////////////////////////////////////////////////////////////////////////////////////////////////////////////







//Changes password to master PointTracker Account
//
function Change_PT_Account_Password() {
    var $Change_PT_Account_Password_Verify_Tag2 = "#Change_PT_Account_Password_Verify_Tag2";                // Insert Button modal configuration in html here
    var $Change_PT_Account_Password_Modal = "#Change_PT_Account_Password_Modal";

    $('#CPT_username').val('');                                                             // clear out for new input
    $('#CPT_password').val('');                                                             // clear out for new input
    $('#CPT_new_password').val('');                                                             // clear out for new input
    $('#CPT_new_password_confirm').val('');                                       // Set default for new input

// Setup Modal Button configuration
    $($Change_PT_Account_Password_Verify_Tag2).empty();
    $($Change_PT_Account_Password_Verify_Tag2).append('<button id="CPT_Submit_Modal_Button" class="btn btn-info">Submit</button>');
    $($Change_PT_Account_Password_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');

    $(".CPT_alert").empty();                                                 // Hide any alerts from previous use of Modal

    $($Change_PT_Account_Password_Modal).modal('show');

    $($Change_PT_Account_Password_Modal).on('shown', function() {                   // Put focus on Reward Program dropdown menu
        $("#CPT_username").focus();
    });
}



// Change PointTracker Account Password
//
$(document).on("click","#CPT_Submit_Modal_Button", function () {

    var PT_obj = {};
    var username;
    var password;
    var new_password;
    var new_password_confirm;
    var new_remember_me;

    var $username = "#CPT_username";
    var $password = "#CPT_password";
    var $new_password = "#CPT_new_password";
    var $new_password_confirm = "#CPT_new_password_confirm";
    var $CPT_alert = '.CPT_alert';

    var $Change_PT_Account_Password_Verify_Tag1 = "#Change_PT_Account_Password_Verify_Tag1";  // Insert 'refreshing' animation and airline program in html here
    var $Change_PT_Account_Password_Verify_Tag2 = "#Change_PT_Account_Password_Verify_Tag2";  // Insert Modal button configuration here

    username = $($username).val();
    password = $($password).val();
    new_password = $($new_password).val();
    new_password_confirm = $($new_password_confirm).val();
    new_remember_me = $.cookie("PointTracker_remember_me");

    $($CPT_alert).empty();                                            // clear everything that has class error (.error)
    $($Change_PT_Account_Password_Verify_Tag1).empty();                          // also clear out this tag for next response

    if (username == ''){
        $($username).focus();
        $($username).after('<span class="CPT_alert"><font color = "#ff0000"> Enter a username</font></span>');
        return;              //no username
    }
    if (password == ''){
        $($password).focus();
        $($password).after('<span class="CPT_alert"><font color = "#ff0000"> Enter a password</font></span>');
        return;              //no old password
    }
    if (new_password == ''){
        $($new_password).focus();
        $($new_password).after('<span class="CPT_alert"><font color = "#ff0000"> Enter new password</font></span>');
        return;              //no new password
    }
    if (new_password.length <  8 || new_password.length > 32) {
        $($new_password).focus();
        $($new_password).after('<span class="CPT_alert"><font color = "#ff0000"> Must be between 8 and 32 chars.</font></span>');
        return;              //New password is wrong size
    }
    if (new_password_confirm == ''){
        $($new_password_confirm).focus();
        $($new_password_confirm).after('<span class="CPT_alert"><font color = "#ff0000"> Enter a password</font></span>');
        return;              //no new_confirm password
    }
    if (new_password != new_password_confirm){
        $($new_password_confirm).focus();
        $($new_password_confirm).after('<span class="CPT_alert"><font color = "#ff0000"> Passwords do not match</font></span>');
        return;              //passwords do not match
    }

    $($CPT_alert).empty();                                            // clear everything that has class error (.error)

    PT_obj['username'] = $($username).val();
    PT_obj['password'] = $($password).val();
    PT_obj['new_password'] = $($new_password).val();
    PT_obj['new_remember_me'] = new_remember_me;
    PT_obj['PT_password_encrypted'] = $.cookie("PointTracker_password");


    $.ajax({
        'async': true,
        'type':'post',
        'data': PT_obj,                                                           // call the correct program scraper thru the view callable by sending it's dictionary
        'url': 'Change_PointTracker_Account_Password_View',
        'success': function (status) {                               // call backback function return new updated program_account
            $($Change_PT_Account_Password_Verify_Tag1).empty();
            $($Change_PT_Account_Password_Verify_Tag2).empty();
            if (status == true) {
                $($Change_PT_Account_Password_Verify_Tag1).append('<div class="CPT_alert" style ="text-align:center; color:#7fba00">Your PointTracker account password has been changed.</div>');
                $($Change_PT_Account_Password_Verify_Tag2).append('<button id="CPT_OK_Button" class="btn btn-info" data-dismiss="modal">OK</button>');
                $('#CPT_OK_Button').focus();
                Get_PointTracker_Account();             //update all global variables
            }
            else {                      // Incorrect username or password
                $($username).focus();
                $($Change_PT_Account_Password_Verify_Tag1).append('<div class="CPT_alert" style ="text-align:center; color:#ff0000">Login error. Incorrect Username and/or Password.</div>');
                $($Change_PT_Account_Password_Verify_Tag2).append('<button id="CPT_Submit_Modal_Button" class="btn btn-info">Submit</button>');
                $($Change_PT_Account_Password_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
            }
        }
    });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Send PointTracker Account
//
function Send_PointTracker_Account() {
    var $SPT_Send_Account_Verify_Tag2 = "#SPT_Send_Account_Verify_Tag2";                // Insert Button modal configuration in html here
    var $Send_Account_Modal = "#Send_Account_Modal";

    $('#SPT_email').val('');                                                             // clear out for new input

// Setup Modal Button configuration
    $($SPT_Send_Account_Verify_Tag2).empty();
    $($SPT_Send_Account_Verify_Tag2).append('<button id="SPT_Submit_Modal_Button" class="btn btn-info">Send</button>');
    $($SPT_Send_Account_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');

    $(".SPT_alert").empty();                                                 // Hide any alerts from previous use of Modal

    $($Send_Account_Modal).modal('show');

    $($Send_Account_Modal).on('shown', function() {                   // Put focus on Reward Program dropdown menu
        $("#SPT_email").focus();
    });
}









// Send PointTracker Account
//
$(document).on("click","#SPT_Submit_Modal_Button", function () {

    var PT_obj = {};
    var email;

    var $email = "#SPT_email";
    var $SPT_alert = '.SPT_alert';

    var $SPT_Send_Account_Verify_Tag1 = "#SPT_Send_Account_Verify_Tag1";  // Insert 'refreshing' animation and airline program in html here
    var $SPT_Send_Account_Verify_Tag2 = "#SPT_Send_Account_Verify_Tag2";  // Insert Modal button configuration here

    email= $($email).val();

    $($SPT_alert).empty();                                            // clear everything that has class error (.error)
    $($SPT_Send_Account_Verify_Tag1).empty();                          // also clear out this tag for next response

    if (email == ''){
        $($email).focus();
//        $($email).after('<span class="SPT_alert"><font color = "#ff0000"> Enter an email address</font></span>');
        $($SPT_Send_Account_Verify_Tag1).append('<div class="SPT_alert" style ="text-align:center; color:#ff0000">Enter an email address</div>');

        return;              //no username
    }

    $($SPT_alert).empty();                                            // clear everything that has class error (.error)

    PT_obj['email'] = $($email).val();
    PT_obj['_id'] = Current_id;

    // Start the Refreshing/Verifying Animation
    $($SPT_Send_Account_Verify_Tag1).append('<div class="SPT_alert" style ="text-align:center">' + '<img src="/static/graphics/refresh_animated.gif" alt="airline partner"  height="20" width="20" >'+ ' ' + 'Sending Email' + '</div>');


    $.ajax({
        'async': true,
        'type':'post',
        'data': PT_obj,                                                           // call the correct program scraper thru the view callable by sending it's dictionary
        'url': 'Send_PointTracker_Account_View',
        'success': function (status) {                               // call backback function return new updated program_account
            $($SPT_Send_Account_Verify_Tag1).empty();
            $($SPT_Send_Account_Verify_Tag2).empty();
            if (status == true) {
                $($SPT_Send_Account_Verify_Tag1).append('<div class="SPT_alert" style ="text-align:center; color:#7fba00">Your email has been sent successfully.</div>');
                $($SPT_Send_Account_Verify_Tag2).append('<button id="SPT_OK_Button" class="btn btn-info" data-dismiss="modal">OK</button>');
                $('#SPT_OK_Button').focus();
            }
            else {                      // Email sending failed for some reason. gmail down? badly formed email address?
                $($email).focus();
                $($SPT_Send_Account_Verify_Tag1).append('<div class="SPT_alert" style ="text-align:center; color:#ff0000">Email error.  Please check format of email and try again.</div>');
                $($SPT_Send_Account_Verify_Tag2).append('<button id="SPT_Submit_Modal_Button" class="btn btn-info">Send</button>');
                $($SPT_Send_Account_Verify_Tag2).append('<button class="btn" data-dismiss="modal">Cancel</button>');
            }
        }
    });
});




function Detect_Mobile_Browser() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}





//Datetime Picker Code

$('#datetimepicker').datetimepicker({
    format: 'MM/dd/yyyy',
    language: 'en'
});


$('#datetimepicker2').datetimepicker({
    format: 'MM/dd/yyyy',
    language: 'en'
});

$(document).ready(function() {
    var $dataConfirmModal = "#dataConfirmModal";
    var $dataConfirmOK = '#dataConfirmOK';

//    $('a[data-confirm]').click(function(ev) {
    $('a[data-confirm]').click(function() {
        var href = $(this).attr('href');
        if (!$($dataConfirmModal).length) {
            $('body').append('<div id="dataConfirmModal" class="modal" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">??</button><h3 id="dataConfirmLabel">Please Confirm</h3></div><div class="modal-body"></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button><a class="btn btn-primary" id="dataConfirmOK">OK</a></div></div>');
        }
        $($dataConfirmModal).find('.modal-body').text($(this).attr('data-confirm'));
        $($dataConfirmOK).attr('href', href);
        $($dataConfirmModal).modal({show:true});
        return false;
    });
});
