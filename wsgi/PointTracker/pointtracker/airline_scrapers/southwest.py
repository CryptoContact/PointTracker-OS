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
    url0 = 'http://www.southwest.com'
    url1 = 'https://www.southwest.com/flight/login?loginEntryPoint=RIGHT_NAV'

    ###################### make sure the below url works for everybody
    url2 = 'http://www.southwest.com/account/rapidrewards/rewards-activity?ss=0&disc=sdc%3A1371157501.405000%3AITmFA6VzTLipGBuYrJQ6iQ%402D8368B45DE35E2B2DD6EC246FA9B06D9458AA5B'

    form_data = {
                '_rememberMe':'on',
                'credential':'',                                  #username
                'disc':'',
                'formToken':'',
                'loginButton.x':'33',
                'loginButton.y':'13',
                'password':'',                                       #password
                'returnUrl':'/',
                'ss':'0',
        }





    form_data['credential'] = RP_account['RP_username']
    form_data['password'] = mtk.decrypt(key, RP_account['RP_password'])

    s = requests.Session()
    s.mount('https://', ssladapter.SSLAdapter(ssl_version = PROTOCOL_TLSv1))
    r1 = s.get(url0)                                      #Southwest Home Page. Grab any initial cookies and headers
#    #    mtk.write_file(r1.text,'ba1.txt')

    r1 = s.post(url1, data = form_data)                    #Login in to Southwest
#    mtk.write_file(r1.text,'hiltonhonors.dng')

    r2 = s.get(url2)                                      #Southwest Home Page. Grab any initial cookies and headers

#    mtk.display_webpage(r2.text)
    return r2.text






def scrape_webpage(html):
    RP_account = dict()

    soup = BeautifulSoup(html,"lxml")
#    mtk.write_file(str(s),'basoup.txt')

    RP_account_name_list = soup.find_all('h3')                           #name in in 2nd element

    RP_account['RP_error'] = False                                              #clear any error so we can test again
    if RP_account_name_list == 'None':                                                       #Bad username, password, or general error from server.
        RP_account['RP_error'] = True
        return RP_account

    RP_account_name = str(RP_account_name_list[1])                                           #name is in here
    RP_account_num = str(soup.find('div', id='account_bar_rr_number'))                     #account #
    RP_balance = str(soup.find('div', class_ = 'availablePointsNumber'))                          #balance
    RP_last_activity_date = str(soup.find('td', class_ ='postingDate'))                          #Last Activity date

    RP_account_name = RP_account_name.replace('<h3><strong><!--mp_trans_disable_start -->','')              #remove first part of tag
    e_index = RP_account_name.find('<!--')
    RP_account_name = RP_account_name[:e_index-2]           #get name and chop off the "'s" as in John Smith's
    RP_account['RP_account_name']= RP_account_name                                                                                      # name is only left

    RP_account_num = RP_account_num.replace('\n','')
    RP_account_num = RP_account_num.replace(' ','')
    RP_account_num = RP_account_num.replace('<divid="account_bar_rr_number">R.R.#','')                        #remove first part of tag
    RP_account_num = RP_account_num.replace('</div>','')                                            #remove second part of tag to leave only name
    RP_account['RP_account_num']= RP_account_num                                                            #account # is only left

    RP_balance = RP_balance.replace('\n','')
    RP_balance = RP_balance.replace(' ','')
    RP_balance = RP_balance.replace('<divclass="availablePointsNumber">','')                        #remove first part of tag
    RP_balance = RP_balance.replace('</div>','')                                                     #remove second part of tag to leave only name
    RP_balance = RP_balance.replace(',','')
    RP_account['RP_balance']= int(RP_balance)                                                       #balance is only left

    now_date_obj = datetime.now()

    if RP_last_activity_date == 'None':                                                            #no transactions or activity
        RP_account['RP_last_activity_date']= 'N/A'
        RP_account['RP_days_remaining']= 'N/A'
        RP_account['RP_expiration_date']= 'N/A'
    else:
        RP_last_activity_date = RP_last_activity_date.replace('<td class="postingDate">','')
        RP_last_activity_date = RP_last_activity_date.replace('</td>','')
        last_activity_date_obj = datetime.strptime(RP_last_activity_date,"%m/%d/%Y")          #last activity date object
        RP_account['RP_last_activity_date']= last_activity_date_obj.strftime('%m/%d/%Y')

        exp_date = last_activity_date_obj + timedelta(days=730)                                  #add 2 years from last activity to get expiration date
        RP_account['RP_expiration_date']= exp_date.strftime('%m/%d/%Y')

        days_left = exp_date - now_date_obj                                              #still in date object format
        RP_account['RP_days_remaining']= days_left.days                               #how many days left to expiration


    RP_account['RP_datestamp'] = str(now_date_obj.month) + '/' + str(now_date_obj.day) + '/' + str(now_date_obj.year)
    RP_account['RP_timestamp'] = str(now_date_obj.hour) + ':' + str(now_date_obj.minute) + ':' + str(now_date_obj.second)

    RP_account['RP_name']='Southwest Airlines'                                          #set what program type it is
    RP_account['RP_inactive_time'] = '24 Months'                                       #BA program miles expiration rule (miles expire after 24 months of non use)
    RP_account['RP_partner']= 'Rapid Rewards'

    return RP_account






