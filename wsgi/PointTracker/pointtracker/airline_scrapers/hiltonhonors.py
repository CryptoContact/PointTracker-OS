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
    url0 = 'http://hhonors3.hilton.com/en/index.html'
    url1 = 'https://secure3.hilton.com/en/hh/customer/login/index.htm'

    form_data = {
        '_rememberMe':'on',
        'forwardPageURI':'/customer/account/index.htm',
        'loginPageTitle':'Hilton HHonors | A Hotel Rewards Program',
        'password':'',
        'rememberMe':'true',
        'username':''
        }





    form_data['username'] = RP_account['RP_username']
    form_data['password'] = mtk.decrypt(key, RP_account['RP_password'])

    s = requests.Session()
    s.mount('https://', ssladapter.SSLAdapter(ssl_version = PROTOCOL_TLSv1))
#    r1 = s.get(url0)                                      #BA Home Page. Grab any initial cookies and headers
#    #    mtk.write_file(r1.text,'ba1.txt')

    r2 = s.post(url1, data = form_data)                    #Login in to Hilton Honors
#    mtk.write_file(r2.text,'hiltonhonors.dng')

    return r2.text






def scrape_webpage(html):
    RP_account = dict()

    soup = BeautifulSoup(html,"lxml")
#    mtk.write_file(str(s),'basoup.txt')

    RP_account_name_list = soup.find_all('h2')                              #name is 3rd item if the login was correct

    RP_account['RP_error'] = False                                              #clear any error so we can test again
    if not RP_account_name_list:                                                       #Bad username, password, or general error from server.  List is empty
        RP_account['RP_error'] = True
        return RP_account

    RP_account_name = RP_account_name_list[2]                                       #name is 3rd item

    RP_account_num = str(soup.find('span', class_='acct_number'))                     #account #
    RP_balance = str(soup.find('a', class_ = 'Points'))                             #balance

    RP_last_activity_date = 'None'                                                  #Last Activity date (page doesnt supply info at this time.

    RP_account_name = RP_account_name.replace('<h2>','')                            #remove first part of tag
    RP_account_name = RP_account_name.replace('</h2>','')                                                                               #remove second part of tag to leave only name
    RP_account_name = RP_account_name.lower()                                                         #make all lowercase
    RP_account_name = RP_account_name.title()                                                       #name and capitalize first, middle, last
    RP_account['RP_account_name']= RP_account_name                                                                                      # name is only left

    RP_account_num = RP_account_num.replace('<span class="acct_number">','')                        #remove first part of tag
    RP_account_num = RP_account_num.replace('</span>','')                                            #remove second part of tag to leave only name
    RP_account['RP_account_num']= RP_account_num                                                            #account # is only left

    RP_balance = RP_balance.replace('<a class="Points" href="#">','')                        #remove first part of tag
    RP_balance = RP_balance.replace(' Base Points</a>','')                                                     #remove second part of tag to leave only name
    RP_account['RP_balance']= int(RP_balance)                                                       #balance is only left

    now_date_obj = datetime.now()

    if RP_last_activity_date == 'None':                                                            #no transactions or activity
        RP_account['RP_last_activity_date']= 'N/A'
        RP_account['RP_days_remaining']= 'N/A'
        RP_account['RP_expiration_date']= 'N/A'
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

    RP_account['RP_name']='Hilton Honors'                                          #set what program type it is
    RP_account['RP_inactive_time'] = '12 Months'                                       #BA program miles expiration rule (miles expire after 24 months of non use)
    RP_account['RP_partner']= 'Hilton Honors'

    return RP_account






