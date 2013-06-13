__author__ = 'Office'
import requests                   #Requests Http Library
from bs4 import BeautifulSoup
import mtk
from datetime import datetime
from datetime import timedelta

from ssl import PROTOCOL_TLSv1
import ssladapter
#from ptserver import AES_Key
#from constants import AES_Key
import Globalvars





def get_program_account_info(key,RP_account):
    url0 = 'http://www.marriott.com/rewards/rewards-program.mi'
    url1 = 'https://www.marriott.com/directLogin.mi'                                    #post
    url2 = 'https://www.marriott.com/ProtectedServlet?returnTo=%2Fdefault.mi'           #get
    url3 = 'https://www.marriott.com/signIn.mi'                                         #get
    url4 = 'https://www.marriott.com/j_security_check'                                  #post
    url5 = 'https://www.marriott.com/ProtectedServlet?returnTo=%2Fdefault.mi'           #get
    url6 = 'https://www.marriott.com/default.mi'                                        #get

# Below is the complete walk thru on how to login to Marriott Rewards.  However, I was able to eliminate most of it. Add back in if there are login problems

    form_data1 = {
            'accountWidgetRequest':'true',
            'returnUrl':'',
            'userID':'',
            'password':'',
            'submitButton':''
        }



    form_data4 = {
            'j_password':'',
            'j_username':'rewardsWebService@f2232076@rmqkr.net',                    #example format
            'userNamePrefix':'rewardsWebService@',
            'visibleUserName':''
        }





    form_data1['userID'] = RP_account['RP_username']
    form_data1['password'] = mtk.decrypt(key, RP_account['RP_password'])

    s = requests.Session()
    s.mount('https://', ssladapter.SSLAdapter(ssl_version = PROTOCOL_TLSv1))
#    r0 = s.get(url0)                                      #Marriot Home Page. Grab any initial cookies and headers
#    #    mtk.write_file(r1.text,'ba1.txt')

#    r1 = s.post(url1, data = form_data1)                    #Login in to Marriott Rewards
#    mtk.write_file(r2.text,'marriottrewards.dng')
#    mtk.display_webpage(r1.text)
#    mtk.display_webpage(r1.text)

#    r2 = s.get(url2)                    #Login in to Marriott Rewards
#    mtk.display_webpage(r2.text)
#    r3 = s.get(url3)                    #Login in to Marriott Rewards
#    mtk.display_webpage(r3.text)

    form_data4['j_password'] = mtk.decrypt(key, RP_account['RP_password'])
    form_data4['j_username'] = form_data4['userNamePrefix'] + RP_account['RP_username']
    form_data4['visibleUserName'] =  RP_account['RP_username']

    r4 = s.post(url4, data = form_data4)                    #Login in to Marriott Rewards
#    mtk.write_file(r2.text,'marriottrewards.dng')
#    mtk.display_webpage(r1.text)
#    mtk.display_webpage(r4.text)

#    r5 = s.get(url5)                    #Login in to Marriott Rewards
#    mtk.display_webpage(r5.text)
#    r6 = s.get(url6)                    #Login in to Marriott Rewards
#    mtk.display_webpage(r6.text)




    return r4.text






def scrape_webpage(html):
    RP_account = dict()

    soup = BeautifulSoup(html,"lxml")
#    mtk.write_file(str(s),'basoup.txt')

    RP_account_info = str(soup.find('div', id='my-account-container'))                            #name & balance

    RP_account['RP_error'] = False                                              #clear any error so we can test again
    if RP_account_info == 'None':                                                       #Bad username, password, or general error from server.
        RP_account['RP_error'] = True
        return RP_account

    RP_last_activity_date = 'None'                                                    #Last Activity date is N/A

    RP_account_info = RP_account_info.replace('\n','')                                   #clean up string for easier searching
    RP_account_info = RP_account_info.replace('\r','')
    RP_account_info = RP_account_info.replace('\t','')

#    s_index = RP_account_num.find('<strong>')
#    e_index = RP_account_num.find('</strong>')
#    RP_account_num =  RP_account_num[s_index+len('<strong>'):e_index]                           #cut out everything between the 2 <strong>
#    RP_account['RP_account_num'] = RP_account_num                                               #account num
#


    RP_account_name = RP_account_info                                                           #get the name out of here
    s_index = RP_account_name.find('<dd>')
    e_index = RP_account_name.find('</dd>')
    RP_account_name =  RP_account_name[s_index+len('<dd>'):e_index]                           #cut out everything between the 2 <dd>
#    RP_account_name = RP_account_name.replace('<h1 class="welcome1" id="welcomeLabel">Welcome to your Executive Club, ','')              #remove first part of tag
#    RP_account_name = RP_account_name.replace('</h1>','')                                                                               #remove second part of tag to leave only name
    RP_account['RP_account_name']= RP_account_name                                                                                      # name is only left

#    RP_account_num = RP_account_num.replace('<td class="detailsStyle"><strong>','')                        #remove first part of tag
#    RP_account_num = RP_account_num.replace('</strong></td>','')                                            #remove second part of tag to leave only name
    RP_account['RP_account_num']= ''                                                           #N/A available from html for now

    RP_balance = RP_account_info                                                                #Balance is in this string
    s_index = RP_balance.find('Balance')
    RP_balance = RP_balance[s_index:]                                                           #chop off everything before balance
    s_index = RP_balance.find('<dd>')                                                      #the balance is in between here
    e_index = RP_balance.find('</dd>')
    RP_balance =  RP_balance[s_index+len('<dd>'):e_index]                           #cut out everything between the 2 <dd>
    RP_balance = RP_balance.replace(' points','')                        #remove first part of tag
    RP_account['RP_balance']= int(RP_balance)                                                       #balance is only left

    now_date_obj = datetime.now()

    if RP_last_activity_date == 'None':                                                            #no transactions or activity
        RP_account['RP_last_activity_date']= 'N/A'
        RP_account['RP_days_remaining']= 'N/A'
        RP_account['RP_expiration_date']= 'Never Expire'
    else:
        RP_last_activity_date = RP_last_activity_date.split()                                   #split out the string.  date is 3rd item
        last_activity_date_obj = datetime.strptime(RP_last_activity_date[2],"%d-%b-%y")          #last activity date object
        RP_account['RP_last_activity_date']= last_activity_date_obj.strftime('%m/%d/%Y')

        exp_date = last_activity_date_obj + timedelta(days=730)                                  #add 2 years from last activity to get expiration date
        RP_account['RP_expiration_date']= exp_date.strftime('%m/%d/%Y')

        days_left = exp_date - now_date_obj                                              #still in date object format
        RP_account['RP_days_remaining']= days_left.days                               #how many days left to expiration


    RP_account['RP_datestamp'] = str(now_date_obj.month) + '/' + str(now_date_obj.day) + '/' + str(now_date_obj.year)
    RP_account['RP_timestamp'] = str(now_date_obj.hour) + ':' + str(now_date_obj.minute) + ':' + str(now_date_obj.second)

    RP_account['RP_name']='Marriott Rewards'                                          #set what program type it is
    RP_account['RP_inactive_time'] = 'Never Expire'                                       #BA program miles expiration rule (miles expire after 24 months of non use)
    RP_account['RP_partner']= 'Marriott Rewards'

    return RP_account






