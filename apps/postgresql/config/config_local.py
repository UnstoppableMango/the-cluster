import os

CONFIG_DATABASE_URI = os.environ['CONFIG_DATABASE_URI']

# I'll figure this out later
# MASTER_PASSWORD_REQUIRED = True
# AUTHENTICATION_SOURCES = ['oauth2', 'internal']
# OAUTH2_AUTO_CREATE_USER = True
# OAUTH2_CONFIG = [
#     {
#         'OAUTH2_NAME': 'keycloak',
#         'OAUTH2_DISPLAY_NAME': 'THECLUSTER',
#         'OAUTH2_CLIENT_ID': os.environ['OAUTH2_CLIENT_ID'],
#         'OAUTH2_CLIENT_SECRET': os.environ['OAUTH2_CLIENT_SECRET'],
#         'OAUTH2_TOKEN_URL': os.environ['OAUTH2_TOKEN_URL'],
#         'OAUTH2_AUTHORIZATION_URL': os.environ['OAUTH2_AUTHORIZATION_URL'],
#         'OAUTH2_API_BASE_URL': os.environ['OAUTH2_API_BASE_URL'],
#         'OAUTH2_USERINFO_ENDPOINT': os.environ['OAUTH2_USERINFO_ENDPOINT'],
#         'OAUTH2_ICON': 'fa-github',
#         'OAUTH2_BUTTON_COLOR': '#181A18',
#     }
# ]
