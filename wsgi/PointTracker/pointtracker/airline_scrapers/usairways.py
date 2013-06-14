import requests                   #Requests Http Library
from bs4 import BeautifulSoup
import mtk
import ssladapter
from datetime import datetime
from datetime import timedelta
#from ptserver import AES_Key
#from constants import AES_Key
import Globalvars
from Globalvars import NO_ERROR as NO_ERROR
from Globalvars import LOGIN_ERROR as LOGIN_ERROR
from Globalvars import SCRAPER_ERROR as SCRAPER_ERROR

#from ssl import PROTOCOL_SSLv2
from ssl import PROTOCOL_SSLv3
#from ssl import PROTOCOL_SSLv23
#from ssl import PROTOCOL_TLSv1


def get_program_account_info(key, RP_account):
    url1 = 'https://membership.usairways.com/Login.aspx?ReturnUrl=http:%2f%2fwww.usairways.com%2fdefault.aspx'
    url2 = 'https://membership.usairways.com/Login.aspx?ReturnUrl=http%3a%2f%2fmembership.usairways.com%2fManage%2fAccountSummary.aspx'
    url3 = 'https://membership.usairways.com/Manage/YourMiles.aspx'

    form_data = {
        'ctl00_MasterScriptManager_HiddenField':';;AjaxControlToolkit, Version=3.0.20820.12087, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:e73c8192-d501-4fd7-a3b9-5354885de87b:91bd373d',
        '__EVENTTARGET':'ctl00$phMain$loginModule$ctl00$loginForm$Login',
        '__EVENTARGUMENT':'',
        '__VIEWSTATE':'/wEPDwUKMTA5ODg4NzU1NGQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgUFImN0bDAwJHNpdGVTZWFyY2gkaW1hZ2VCdXR0b25TZWFyY2gFM2N0bDAwJHBoTWFpbiRsb2dpbk1vZHVsZSRjdGwwMCRsb2dpbkZvcm0kUmVtZW1iZXJNZQVDY3RsMDAkcGhNYWluJGxvZ2luU2VsZWN0b3IkbG9naW5Qb3BfdXBkYXRlcGFuZWwkbG9naW5QYW5lbCRyYk1lbWJlcgVJY3RsMDAkcGhNYWluJGxvZ2luU2VsZWN0b3IkbG9naW5Qb3BfdXBkYXRlcGFuZWwkbG9naW5QYW5lbCRyYkRpdmlkZW5NaWxlcwVJY3RsMDAkcGhNYWluJGxvZ2luU2VsZWN0b3IkbG9naW5Qb3BfdXBkYXRlcGFuZWwkbG9naW5QYW5lbCRyYkRpdmlkZW5NaWxlc+r/prZpmAiqcIRA+h9aRsENWijv',
        '__EVENTVALIDATION':'/wEWFgLOtMH8CgLCofsTAtjMvdwHAtXknucGAujjiocHAqCH8rsOAu7i9EECgMvD2QsCw5Hg+QkCiqnDoAECk4Tb2gwCi5Gu1gwCib+M/gcC6PH6lgkCgrTrpg0C3d7kqwYCtZOp8ggCtJOp8ggCt5Op8ggCuvyDnAQCiNiTjg8CwLH96wLdkyC525uuAsWbOXbMZRh0tQ41Pg==',
        'ctl00$siteSearch$dummySpq':'',
        'ctl00$siteSearch$spq':'',
        'ctl00$phMain$omnitureDynamicTagChoices$hdnOmnitureJavascriptTags':'',
        'ctl00$phMain$loginModule$ctl00$loginForm$UserName':'',
        'ctl00$phMain$loginModule$ctl00$loginForm$Password':'',
        'ctl00$phMain$loginModule$ctl00$loginForm$RememberMe':'on',
        'ctl00$phMain$loginSelector$loginPop_updatepanel$loginPanel$LoginType':'rbMember',
        'ctl00$phMain$dmUpdatePrompt$dmUpdatePopUp_updatepanel$popOverPanelControl$rdoAcctUpdateOptions':'1',
        }




    form_data2 = {
        '__ASYNCPOST':'true',
        '__EVENTARGUMENT':'',
        '__EVENTTARGET':'ctl00$phMain$yourMileModule$ctl00$btnSubmit',

        '__VIEWSTATE':'',                                                                #fill below
        '__EVENTVALIDATION':'',                                                         # fill below

        'ctl00$MasterScriptManager':'ctl00$phMain$yourMileModule$ctl00$DividendMilesDetailPanel|ctl00$phMain$yourMileModule$ctl00$btnSubmit',

        'ctl00$phMain$OmnitureDynamicTagControl$hdnOmnitureJavascriptTags':'',
        'ctl00$phMain$yourMileModule$ctl00$cardOffer$OfferContainerDetails$EmailMailMeLater$popOverExtenderEmailEntry_updatepanel$emailPanel$txtEmailAddress':'',

        'ctl00$phMain$yourMileModule$ctl00$chkPreferred':'on',
        'ctl00$phMain$yourMileModule$ctl00$chkCarAndHotel':'on',
        'ctl00$phMain$yourMileModule$ctl00$chkOther':'on',
        'ctl00$phMain$yourMileModule$ctl00$chkAir':'on',
        'ctl00$phMain$yourMileModule$ctl00$chkCreditCard':'on',
        'ctl00$phMain$yourMileModule$ctl00$startDate$SelectedDate':'',                               # fill in below. format '1/1/2013',
        'ctl00$phMain$yourMileModule$ctl00$endDate$SelectedDate':'',                                 # fill in below. format '4/30/2013',
        'ctl00$siteSearch$dummySpq':'',
        'ctl00$siteSearch$spq':'',
        'ctl00_MasterScriptManager_HiddenField':';;AjaxControlToolkit, Version=3.0.20820.12087, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:e73c8192-d501-4fd7-a3b9-5354885de87b:91bd373d;',
        }




    headers2 = {

        'Host':'membership.usairways.com',
        'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'X-MicrosoftAjax': 'Delta=true',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Referer': 'https://membership.usairways.com/Manage/YourMiles.aspx',
        'Content-Length': '23028',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        }



    headers3 = {
        'Host':'membership.usairways.com',
        'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language':'en-US,en;q=0.5',
        'Accept-Encoding':'gzip, deflate',
        'X-MicrosoftAjax':'Delta=true',
        'Cache-Control':'no-cache',
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8',
        'Referer':'https://membership.usairways.com/Manage/YourMiles.aspx',
        'Content-Length':'23028',
#        'Cookie':'TLTUID=F5D274924B13819DC6C2B4A40C8D0132; utag_main=_st:1371242531365$ses_id:1371241178681%3Bexp-session; ASP.NET_SessionId=uknokpqwmchuz145chfqhx45; TLTSID=CEBFF652495D35A562C6C199AC46C4DF; s_cc=true; s_ria=flash%2011%7Csilverlight%205.1; s_sq=usaircom%3D%2526pid%253DYourMiles%2526pidt%253D1%2526oid%253Djavascript%25253AWebForm_DoPostBackWithOptions(new%25252520WebForm_PostBackOptions(%252522ctl00%252524phMain%252524yourMileModule%252524%2526ot%253DA; .USAairTicket=010158BCD0BF5237D008FEFF3F37F47528CA2B000A6C0069006E00640061006100620062006F007400AA015500730065007200490044003D00390062003600360032006300610034002D0033003200640030002D0034003200370061002D0061006100350034002D00380036006500310066003300390039003000620034006400260055007300650072004E0061006D0065003D006C0069006E00640061006100620062006F0074002600460069007200730074004E0061006D0065003D004C0049004E004400410026004C006100730074004E0061006D0065003D0054004800410043004B004500520026004D0069006C00650073003D003100300030003000370026005300740061007400750073003D004E006F0072006D0061006C0026004E0075006D006200650072003D004400390036003800450032003000260044004D005F00420045004E00450046004900540053005F004B0045005900260044004D00420065006E00650066006900740073003D00460061006C0073006500012F00FF; .USAairTicket_UC=010158BCD0BF5237D008FEFF3F37F47528CA2B0107440039003600380045003200300000012F00FF; .USAairTicket_Content=name=LINDA THACKER&miles=10007&status=Normal&number=D968E20&hasActiveDMBenefits=False',
        'Connection':'keep-alive',
        'Pragma':'no-cache'
        }








#    AES_Key = '0123456789abcdef'
    form_data['ctl00$phMain$loginModule$ctl00$loginForm$UserName'] = RP_account['RP_username']
#    form_data['ctl00$phMain$loginModule$ctl00$loginForm$Password'] = mtk.decrypt(Globalvars.AES_Key,RP_account['RP_password'])
    form_data['ctl00$phMain$loginModule$ctl00$loginForm$Password'] = mtk.decrypt(key,RP_account['RP_password'])
#    form_data['ctl00$phMain$loginModule$ctl00$loginForm$Password'] = RP_account['RP_password']




    s = requests.Session()
    s.mount('https://', ssladapter.SSLAdapter(ssl_version = PROTOCOL_SSLv3))
    r1 = s.get(url1)                                      #USair Home Page

    r2 = s.post(url2, data = form_data)                    #Login in to usair

    r3 = s.get(url3)                                      #Your Miles page #R3.text contains Name, Account #, Balance only

    soup1 = BeautifulSoup(r3.text,"lxml")                    #this page also has __VIEWSTATE and __EVENTVALIDATION that we need for the next post to get activity history
    __VIEWSTATE = str(soup1.find('input', id="__VIEWSTATE"))                            #name
    s_index = __VIEWSTATE.find('value="')
    __VIEWSTATE = __VIEWSTATE[s_index+len('value="'):-3]                               #take off 'value="' and ending html tag

    __EVENTVALIDATION = str(soup1.find('input', id='__EVENTVALIDATION'))                            #name
    s_index = __EVENTVALIDATION.find('value="')                                 #take off 'value="' and ending html tag
    __EVENTVALIDATION = __EVENTVALIDATION[s_index+len('value="'):-3]


    date_end_str = datetime.now().strftime("%m/%d/%Y")             #get today's date as string
    date_end_obj = datetime.now()                                             #get date/time stamp
    date_start_obj = date_end_obj - timedelta(days=547)             #go back over 18 months to make sure  (18 * 31days = 558 days)
    date_start_str = date_start_obj.strftime("%m/%d/%Y")            # convert to string

    form_data2['__VIEWSTATE'] = __VIEWSTATE                               #setup form data2
    form_data2['__EVENTVALIDATION'] = __EVENTVALIDATION
    form_data2['ctl00$phMain$yourMileModule$ctl00$startDate$SelectedDate'] = date_start_str                 #begin last activity search at this date
    form_data2['ctl00$phMain$yourMileModule$ctl00$endDate$SelectedDate'] = date_end_str                     #end it today. This should search the last 18 months + for any activity

    s.headers = headers3                                    # set headers up for the Post ajax call. They are different for this POST Request
    r4 = s.post(url3,data = form_data2)                    #setup dates, for last activity search STEP 1. This populates the html page with activity dates
    html_page_list = [r3.text,r4.text]

    return html_page_list






def scrape_webpage(html_page_list):

    ODD_LIST_OFFSET = 4

    RP_account = dict()

    soup0 = BeautifulSoup(html_page_list[0],"lxml")                         #This page has name, account, balance
    soup1 = BeautifulSoup(html_page_list[1],"lxml")                         #This page has account activity

    RP_account_name = str(soup0.find('span', id='ctl00_phMain_yourMileModule_ctl00_lblName'))                            #name

    RP_account['RP_error'] = NO_ERROR                                      #clear any error so we can test again
    if RP_account_name == 'None':                                                      #Bad username, password, or general error from server.
        RP_account['RP_error'] = LOGIN_ERROR
        return RP_account

    RP_account_num = str(soup0.find('table', class_='viewmilesinfo'))                                                     #account
    RP_balance = str(soup0.find('a', href='https://membership.usairways.com/Manage/AccountSummary.aspx'))               #balance

    RP_account_name = RP_account_name.replace('<span id="ctl00_phMain_yourMileModule_ctl00_lblName">','')                        #remove first part of tag
    RP_account_name = RP_account_name.replace('</span>','')                                                                  #remove second part of tag to leave only name
    RP_account_name = RP_account_name.lower()
    RP_account_name = RP_account_name.title()
    RP_account['RP_account_name'] = RP_account_name                                                              #capitalize each word

    RP_account_num = RP_account_num.replace('\n','')                                                                        #get rid of new lines
    RP_account_num = RP_account_num.replace('<table class="viewmilesinfo"><tr><td class="viewmilesitems">Dividend Miles number</td><td>','')                        #remove first part of tag
    e_index = RP_account_num.find ('</td>')
    RP_account_num = RP_account_num[:e_index]
    RP_account['RP_account_num']= RP_account_num                                                                                 #account # is only left

    s_index = RP_balance.find ('(')                                                                       #find first paran
    e_index = RP_balance.find (')')                                                                        #rfind 2nd paran
    RP_balance = RP_balance[s_index+1:e_index]                                                                         #Balance is in between.
    RP_balance = RP_balance.replace(',','')
    RP_account['RP_balance'] = int(RP_balance)

    now_date_obj = datetime.now()

    RP_account['RP_datestamp'] = str(now_date_obj.month) + '/' + str(now_date_obj.day) + '/' + str(now_date_obj.year)
    RP_account['RP_timestamp'] = str(now_date_obj.hour) + ':' + str(now_date_obj.minute) + ':' + str(now_date_obj.second)

    #USair formats their activity data with odd and even row classes in html.  We need to search for both and the one with the biggest list will have the last activity on it.

    odd_list = soup1.find_all('td', class_='oddrow')                            #odd row of activity (a list of all of activity in the odd rows)
    even_list = soup1.find_all('td', class_='evenrow')                           #odd row of activity (a list of all of the activity in the even rows)

    if odd_list != []:                                      #We have some activity in the past 18 months
                                                             #The odd_list always has extra items due to the Total row in the html.  We need to offset to just the data we want.
        if len(even_list) == (len(odd_list) - ODD_LIST_OFFSET):                                         #equal list length so the data we want will be in the evenrow (even_list) (the even list will hold that last activity item)
            last_activity_date_tag = str(even_list[len(even_list)- 5])                                     #each item is in a group of 6 <td></td> tags. we want the last group of 6 in list and back out 5 to get the last activity date
            t1 = last_activity_date_tag.replace('<td class="evenrow">','')                                    #remove first part of tag
        else:
            last_activity_date_tag = str(odd_list[len(odd_list)- 5 - ODD_LIST_OFFSET])                          #subtract another 4 because their are 4 extra oddrow items at bottom of table
                                                                                                     #         #each item is in a group of 6 <td></td> tags. we want the last group of 6 in list and back out 5 to get the last activity date
            t1 = last_activity_date_tag.replace('<td class="oddrow">','')                                    #remove first part of tag

        last_activity_date = t1.replace('</td>','')                                                                  #remove second part of tag to leave only date

        now_date_obj = datetime.now()
        last_activity_date_obj = datetime.strptime(last_activity_date,'%m/%d/%y')
        exp_date = last_activity_date_obj + timedelta(days=547)                                     #add 18 months from last activity to get expiration date

        days_left = exp_date - now_date_obj

        RP_account['RP_days_remaining'] =  days_left.days
        RP_account['RP_expiration_date']= exp_date.strftime('%m/%d/%Y')
        RP_account['RP_last_activity_date']= last_activity_date
    else:
        RP_account['RP_last_activity_date']= 'N/A'                                            #
        RP_account['RP_days_remaining'] =  'N/A'
        RP_account['RP_expiration_date']= 'N/A'
        #        RP_account['RP_last_activity_date']=  datetime.now().strftime("%m/%d/%Y")             #get today's date as string


    RP_account['RP_inactive_time'] = '18 Months'
    RP_account['RP_partner']= 'Star Alliance'
    RP_account['RP_name']='US Airways'                                          #set what program type it is

    return RP_account







